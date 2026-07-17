# ClipNG — Vercel Serverless

Everything runs in this Next.js app (no separate Nest server required).

## Stack
- Next.js App Router + Route Handlers (`/api/*`)
- Prisma + PostgreSQL (use free Neon)
- JWT auth (`jose` + refresh tokens)
- Vercel Cron for campaign expiry / notifications

## Local setup

1. Create a free Neon DB and copy the connection string.
2. Env files:

```bash
cp .env.example .env
cp .env.local.example .env.local
```

Set `DATABASE_URL` in `.env` (Prisma) and the same vars in Vercel.

3. Migrate + seed + run:

```bash
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Demo accounts (after seed)
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clipng.ng | password123 |
| Funder | funder@clipng.ng | password123 |
| Clipper | clipper@clipng.ng | password123 |

## Vercel deploy
1. Connect the repo
2. Set env: `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `NEXT_PUBLIC_API_URL=/api`, `CRON_SECRET`
3. Build command: `prisma generate && next build` (already in `package.json`)
4. After first deploy, run migrations from your machine against Neon:
   `npx prisma migrate deploy`

The old `backend/` Nest folder is legacy reference only — not needed for Vercel.
