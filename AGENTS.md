<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Convenciones del equipo

Las hace cumplir ESLint (`eslint.config.mjs`), el hook de pre-commit y el CI: si una no se cumple, el commit o el PR fallan. Esta lista explica el porqué.

| Convención                                                    | Regla                                                          |
| ------------------------------------------------------------- | -------------------------------------------------------------- |
| `function` en lugar de arrow cuando tiene más de un statement | `no-restricted-syntax` + `prefer-arrow/prefer-arrow-functions` |
| `type` en lugar de `interface`                                | `@typescript-eslint/consistent-type-definitions`               |
| `T[]` en lugar de `Array<T>`                                  | `@typescript-eslint/array-type`                                |
| `unknown` en lugar de `any`                                   | `@typescript-eslint/no-explicit-any`                           |
| Sin tipos de retorno explícitos salvo que hagan falta         | `no-restricted-syntax`                                         |
| Exports inline; no exportar lo que no se usa afuera           | `no-restricted-syntax` + `knip`                                |
| Desde 3 parámetros, un objeto                                 | `max-params`                                                   |
| `camelCase` en variables, funciones y nombres de archivo      | `camelcase` + `check-file/filename-naming-convention`          |
| `filter`/`map`/`reduce` en lugar de loops                     | `no-restricted-syntax`                                         |

Una excepción se marca con `// eslint-disable-next-line <regla> -- motivo`. Sin el motivo, también falla.

Antes de dar un cambio por terminado: `pnpm lint`, `pnpm format:check`, `pnpm deps:check` y `pnpm exec tsc --noEmit`.
