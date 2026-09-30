# Viziune Urbană Ploiești — rulare independentă de Replit

Acest proiect poate fi rulat local sau pe un server VPS folosind Node.js,
pnpm și PostgreSQL. Configurația de mai jos folosește PostgreSQL în Docker și
stocare locală pentru fotografii.

## Cerințe

- Node.js 20+;
- pnpm 9+;
- Docker și Docker Compose (doar pentru PostgreSQL);
- Git sau un program de dezarhivare.

## Instalare

```bash
cp .env.example .env
```

Deschide `.env` și schimbă cel puțin:

- `ADMIN_PASSWORD`;
- `SESSION_SECRET`;
- `ADMIN_EMAIL`.

Pornește PostgreSQL:

```bash
docker compose up -d postgres
```

Instalează pachetele și aplică schema:

```bash
pnpm install
pnpm --filter @workspace/db push
```

Pornește aplicația:

```bash
bash scripts/portable-dev.sh
```

Site-ul va fi disponibil la `http://localhost:5173`, iar API-ul la
`http://localhost:8080`.

Panoul admin este la:

```text
http://localhost:5173/admin
```

## Imagini

În configurația portabilă, imaginile încărcate din admin sunt salvate în:

```text
data/uploads/
```

Acest director nu trebuie șters și trebuie inclus în backup. Pentru producție,
poate fi mutat pe un disc persistent sau înlocuit cu S3, Cloudflare R2 ori
Google Cloud Storage.

## Build pentru producție

```bash
pnpm --filter @workspace/viziune-urbana run build
pnpm --filter @workspace/api-server run build
```

Frontend-ul compilat se găsește în:

```text
artifacts/viziune-urbana/dist/public/
```

API-ul compilat se găsește în:

```text
artifacts/api-server/dist/
```

În producție se recomandă:

```text
Nginx/Caddy
  ├── /      → frontend dist/public
  └── /api  → API Express pe portul 8080
```

Activează HTTPS și setează `NODE_ENV=production`. Pentru mai multe instanțe
API, înlocuiește MemoryStore-ul implicit al sesiunilor cu un store persistent
PostgreSQL sau Redis.

## Replit

Compatibilitatea Replit rămâne disponibilă. Dacă `STORAGE_PROVIDER` nu este
`local`, aplicația folosește implementarea Object Storage existentă pentru
Replit.