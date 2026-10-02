import { createHash } from 'crypto'
import { NextResponse } from 'next/server'

import { supabaseAdmin } from '@/lib/supabaseAdmin'

type Edificio = {
  direccion: string | null
  id: string
  nombre: string
}

export type JoinLink = {
  edificio_id: string
  edificios: Edificio | Edificio[] | null
  expires_at: string | null
  id: string
  organization_id: string
  status: string
}

export const errorResponse = (code: string, status: number) =>
  NextResponse.json({ code }, { status })

const hashToken = (token: string) =>
  createHash('sha256').update(token).digest('hex')

const isExpired = (expiresAt: string | null) =>
  expiresAt !== null && new Date(expiresAt).getTime() <= Date.now()

// Devuelve el link si está activo y vigente, o la respuesta de error para la ruta.
export async function findActiveJoinLink(token: string) {
  const { data: joinLink, error } = await supabaseAdmin
    .from('resident_join_links')
    .select(
      'id, organization_id, edificio_id, status, expires_at, edificios ( id, nombre, direccion )',
    )
    .eq('token_hash', hashToken(token))
    .maybeSingle<JoinLink>()

  if (error) {
    return { response: errorResponse('INTERNAL_ERROR', 500) }
  }

  if (!joinLink) {
    return { response: errorResponse('INVALID_TOKEN', 404) }
  }

  if (joinLink.status !== 'active' || isExpired(joinLink.expires_at)) {
    return { response: errorResponse('TOKEN_INACTIVE', 410) }
  }

  return { joinLink }
}
