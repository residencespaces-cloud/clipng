# ClipNG — Vercel Serverless

Everything runs in this Next.js app (no separate backend server).

## Stack
- Next.js App Router + Route Handlers (`/api/*`)
- Prisma + PostgreSQL (Neon recommended)
- JWT auth (`jose` + refresh tokens)
- Paystack (wallet top-ups + clipper payouts)
- Resend (transactional email)
- Vercel Cron (daily campaign maintenance)

## Local setup

1. Create a free Neon DB and copy the connection string.
2. Copy env files:

```bash
cp .env.example .env
cp .env.local.example .env.local
```

Set `DATABASE_URL` in `.env` and matching vars locally / on Vercel.

3. Migrate + seed + run:

```bash
npx prisma migrate deploy
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

1. Connect the repo to Vercel
2. Set env vars from `.env.example` (especially `DATABASE_URL`, JWT secrets, Paystack, `CRON_SECRET`, `RESEND_API_KEY`)
3. Build command: `prisma generate && next build` (already in `package.json`)
4. After first deploy, run migrations against Neon: `npx prisma migrate deploy`
5. Configure Paystack webhook → `https://your-domain/api/webhooks/paystack`

## Production smoke test

- [ ] `GET /api/health` returns `database: connected`
- [ ] Funder tops up wallet via Paystack test card
- [ ] Funder creates campaign (wallet debited, campaign appears in My Campaigns)
- [ ] Clipper joins campaign, submits clip URL
- [ ] Admin approves → verifies views → triggers payout
- [ ] Landing page shows live campaigns from `/api/campaigns/public`

## Tests

```bash
npm test
```
