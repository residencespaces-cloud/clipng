# ClipNG API

NestJS + PostgreSQL backend for ClipNG.

## Quick start

```bash
cd backend
cp .env.example .env
docker compose up -d
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev
```

API base: `http://localhost:4000/api`

## Demo accounts (after seed)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@clipng.ng | password123 |
| Funder | funder@clipng.ng | password123 |
| Clipper | clipper@clipng.ng | password123 |

## Modules

- `auth` — signup/login/refresh/me
- `wallets` — balance, transactions, top-up initiation
- `campaigns` — create, list, join
- `submissions` — clip submission, earnings
- `admin` — review workflow, payouts, audit logs
- `webhooks` — Paystack webhook ingestion
- `notifications` — queued email notifications
- `storage` — local upload stub (swap for R2/S3)
- `jobs` — campaign expiry, notification processing, webhook reconciliation
