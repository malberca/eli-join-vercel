import { NextResponse } from 'next/server'

import {
  errorResponse,
  findActiveJoinLink,
  type JoinLink,
} from '@/lib/joinLink'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

function toConsorcio(edificios: JoinLink['edificios']) {
  const edificio = Array.isArray(edificios) ? edificios[0] : edificios

  return {
    address: edificio?.direccion ?? null,
    name: edificio?.nombre ?? 'Consorcio',
  }
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ token: string }> },
) {
  const { token } = await context.params

  if (!token) {
    return errorResponse('INVALID_TOKEN', 400)
  }

  const result = await findActiveJoinLink(token)

  if ('response' in result) {
    return result.response
  }

  const { joinLink } = result

  const { data: units, error } = await supabaseAdmin
    .from('unidades')
    .select('id, numero, piso')
    .eq('organization_id', joinLink.organization_id)
    .eq('edificio_id', joinLink.edificio_id)
    .order('piso', { ascending: true })
    .order('numero', { ascending: true })

  if (error) {
    return errorResponse('INTERNAL_ERROR', 500)
  }

  const { data: relationshipTypes, error: relationshipTypesError } =
    await supabaseAdmin
      .from('resident_relationship_types')
      .select('code, label')
      .eq('active', true)
      .order('sort_order', { ascending: true })

  if (relationshipTypesError) {
    return errorResponse('INTERNAL_ERROR', 500)
  }

  return NextResponse.json({
    consorcio: toConsorcio(joinLink.edificios),
    relationships:
      relationshipTypes?.map(type => ({
        label: type.label,
        value: type.code,
      })) ?? [],
    units: units?.map(unit => ({ id: unit.id, label: unit.numero })) ?? [],
  })
}
