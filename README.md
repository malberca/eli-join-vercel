# ELI Join

Onboarding de residentes de ELI. El vecino llega con un link o un QR del consorcio (`/[token]`), completa sus datos, elige su unidad y deja una solicitud pendiente. La administración la aprueba desde ELI Desk.

## Cómo funciona

- `src/app/[token]/page.tsx` muestra el formulario (`src/components/join-onboarding.tsx`).
- `GET /api/join/[token]` valida el link y devuelve el consorcio y sus unidades.
- `POST /api/join/[token]/submit` valida los datos y crea la solicitud en estado `PENDING_VERIFICATION`.

El esquema y las migraciones de la base están en [eli-database-platform](https://github.com/manoconsultora/eli-database-platform).

## Requisitos

- Node 24 (`.nvmrc`)
- pnpm 11 (`packageManager` en `package.json`)

## Desarrollo

```sh
pnpm install   # también activa los hooks de git
pnpm dev
```

## Verificación

```sh
pnpm lint
pnpm format:check
pnpm deps:check
pnpm typecheck
```

El hook de pre-commit corre ESLint y Prettier sobre los archivos del commit. Commitlint exige Conventional Commits. El CI corre los mismos comandos en cada PR.

Las convenciones del equipo están en `AGENTS.md`.
