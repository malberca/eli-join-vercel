import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase-admin'

const RELATIONSHIP_TYPES = [
  'OWNER',
  'TENANT',
  'FAMILY',
  'COHABITANT',
  'OTHER',
] as const

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

const normalizeEmail = (email: string) => email.trim().toLowerCase()

const validEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

export async function POST(
  request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params

  if (!token) {
    return NextResponse.json({ code: 'INVALID_TOKEN' }, { status: 400 })
  }

  let body: {
    firstName?: string
    lastName?: string
    email?: string
    phone?: string
    unitId?: string
    relationshipType?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const firstName = body.firstName?.trim()
  const lastName = body.lastName?.trim()
  const email = normalizeEmail(body.email ?? '')
  const phone = body.phone?.trim() || null
  const unitId = body.unitId
  const relationshipType = body.relationshipType

  if (
    !firstName ||
    !lastName ||
    !validEmail(email) ||
    !unitId ||
    !relationshipType ||
    !RELATIONSHIP_TYPES.includes(
      relationshipType as (typeof RELATIONSHIP_TYPES)[number],
    )
  ) {
    return NextResponse.json({ code: 'VALIDATION_ERROR' }, { status: 400 })
  }

  const tokenHash = hashToken(token)

  const { data: joinLink, error: joinError } = await supabaseAdmin
    .from('resident_join_links')
    .select('id, organization_id, edificio_id, status, expires_at')
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (joinError) {
    console.error('join lookup failed', joinError)

    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  if (!joinLink) {
    return NextResponse.json({ code: 'INVALID_TOKEN' }, { status: 404 })
  }

  if (
    joinLink.status !== 'active' ||
    (joinLink.expires_at &&
      new Date(joinLink.expires_at).getTime() <= Date.now())
  ) {
    return NextResponse.json({ code: 'TOKEN_INACTIVE' }, { status: 410 })
  }

  const { data: unit, error: unitError } = await supabaseAdmin
    .from('unidades')
    .select('id')
    .eq('id', unitId)
    .eq('organization_id', joinLink.organization_id)
    .eq('edificio_id', joinLink.edificio_id)
    .maybeSingle()

  if (unitError) {
    console.error('unit lookup failed', unitError)

    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  if (!unit) {
    return NextResponse.json({ code: 'UNIT_NOT_FOUND' }, { status: 404 })
  }

  const { count: activeResidents, error: countError } = await supabaseAdmin
    .from('resident_unit_links')
    .select('id', { count: 'exact', head: true })
    .eq('unidad_id', unitId)
    .eq('organization_id', joinLink.organization_id)
    .eq('active', true)

  if (countError) {
    console.error('resident count failed', countError)

    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  if ((activeResidents ?? 0) >= 5) {
    return NextResponse.json({ code: 'UNIT_LIMIT_REACHED' }, { status: 409 })
  }

  const { data: existingRequest, error: existingError } = await supabaseAdmin
    .from('resident_onboarding_requests')
    .select('id')
    .eq('organization_id', joinLink.organization_id)
    .eq('edificio_id', joinLink.edificio_id)
    .eq('unidad_id', unitId)
    .eq('email', email)
    .eq('status', 'PENDING_VERIFICATION')
    .maybeSingle()

  if (existingError) {
    console.error('pending request lookup failed', existingError)

    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  if (existingRequest) {
    return NextResponse.json({ code: 'ALREADY_PENDING' }, { status: 409 })
  }

  const { error: insertError } = await supabaseAdmin
    .from('resident_onboarding_requests')
    .insert({
      join_link_id: joinLink.id,
      organization_id: joinLink.organization_id,
      edificio_id: joinLink.edificio_id,
      unidad_id: unitId,
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      relationship_type: relationshipType,
      status: 'PENDING_VERIFICATION',
    })

  if (insertError) {
    console.error('request insert failed', insertError)

    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  return NextResponse.json({ status: 'PENDING_VERIFICATION' }, { status: 201 })
}
