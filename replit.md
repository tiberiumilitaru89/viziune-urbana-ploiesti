# Viziune Urbană Ploiești

Site public pentru Asociația Viziune Urbană Ploiești, care prezintă reabilitarea subsolurilor de bloc și colectează cereri pentru evaluări gratuite.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/viziune-urbana/src/App.tsx` — experiența one-page și formularul public
- `artifacts/viziune-urbana/src/index.css` — tema vizuală, fonturi, animații și responsive
- `lib/api-spec/openapi.yaml` — contractul API sursă
- `lib/db/src/schema/audit-requests.ts` — modelul solicitărilor de audit
- `artifacts/api-server/src/routes/audit-requests.ts` — endpointurile formularului și sumarului

## Architecture decisions

- Formularul public este validat cu schema generată din OpenAPI înainte de inserarea în PostgreSQL.
- Site-ul este o singură pagină cu navigare prin ancore pentru ca informația importantă să fie accesibilă rapid pe mobil.
- Statistica afișată public folosește doar numărul agregat de solicitări, fără expunerea datelor personale.

## Product

- Prezintă misiunea ONG-ului și transformarea subsolurilor degradate în infrastructură sigură.
- Explică serviciile integrate și diferența dintre problemele existente și beneficiile reabilitării.
- Permite trimiterea unei cereri de evaluare gratuită și afișează confirmare la succes.
- Include întrebări frecvente, impact agregat și navigare responsive.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- După modificarea `lib/api-spec/openapi.yaml`, rulează codegen înainte de typecheck.
- Workflow-ul web are nevoie de `PORT` și `BASE_PATH`, furnizate automat de workflow-ul artifactului.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
