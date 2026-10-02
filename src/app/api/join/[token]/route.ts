import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabase-admin'

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params

  if (!token) {
    return NextResponse.json({ code: 'INVALID_TOKEN' }, { status: 400 })
  }

  const tokenHash = hashToken(token)

  const { data: joinLink, error: joinError } = await supabaseAdmin
    .from('resident_join_links')
    .select(
      `
      id,
      organization_id,
      edificio_id,
      status,
      expires_at,
      edificios (
        id,
        nombre,
        direccion
      )
    `,
    )
    .eq('token_hash', tokenHash)
    .maybeSingle()

  if (joinError) {
    console.error('join lookup failed', joinError)

    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  if (!joinLink) {
    return NextResponse.json({ code: 'INVALID_TOKEN' }, { status: 404 })
  }

  if (joinLink.status !== 'active') {
    return NextResponse.json({ code: 'TOKEN_INACTIVE' }, { status: 410 })
  }

  if (
    joinLink.expires_at &&
    new Date(joinLink.expires_at).getTime() <= Date.now()
  ) {
    return NextResponse.json({ code: 'TOKEN_INACTIVE' }, { status: 410 })
  }

  const { data: units, error: unitsError } = await supabaseAdmin
    .from('unidades')
    .select('id, numero, piso')
    .eq('organization_id', joinLink.organization_id)
    .eq('edificio_id', joinLink.edificio_id)
    .order('piso', { ascending: true })
    .order('numero', { ascending: true })

  if (unitsError) {
    console.error('units lookup failed', unitsError)

    return NextResponse.json({ code: 'INTERNAL_ERROR' }, { status: 500 })
  }

  const edificio = Array.isArray(joinLink.edificios)
    ? joinLink.edificios[0]
    : joinLink.edificios

  return NextResponse.json({
    consorcio: {
      name: edificio?.nombre ?? 'Consorcio',
      address: edificio?.direccion ?? null,
    },
    units:
      units?.map(unit => ({
        id: unit.id,
        label: unit.numero,
      })) ?? [],
  })
}
