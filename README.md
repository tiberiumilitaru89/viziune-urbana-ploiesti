# Viziune Urbană Ploiești

Platformă web civică și administrativă construită cu Next.js 16 (App Router), React 19, Tailwind CSS v4 și Supabase.

## Structură

- `A/` — aplicația principală Next.js (Root Directory configurat în Vercel)

## Scripturi (în `A/`)

```bash
cd A
npm install
npm run dev          # server local pe portul 3005
npm run gatekeeper   # TypeScript (tsc --noEmit), ESLint și teste de securitate
npm run build        # build de producție Next.js
```

## Producție

- URL: https://www.viziuneurbanaploiesti.ro
- Health checks: `/api/healthz`, `/api/readyz`
