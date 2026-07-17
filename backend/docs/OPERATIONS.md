# ClipNG Production Operations

## Observability
- Structured JSON logs from NestJS (`main.ts` can add pino/winston)
- Health check: `GET /api/health`
- Monitor Paystack webhook processing table (`payment_webhooks.processed`)

## Idempotency
- Wallet top-ups keyed by Paystack `reference` (unique on `wallet_ledger_entries.reference`)
- Webhook events deduplicated by `payment_webhooks.reference`

## Background jobs (`JobsService`)
- **Hourly**: expire campaigns past `endDate`
- **Every 5 min**: process pending email notifications
- **Daily 1 AM**: flag unprocessed webhooks for reconciliation

## Fraud controls
- Server-side URL validation (`submission-proof.ts`)
- Unique `postUrl` constraint on submissions
- Admin audit log for all review and payout actions

## Payout runbook
1. Admin verifies views → submission moves to `views_verified`
2. Admin triggers payout → `payout_items.status = triggered`
3. Paystack transfer webhook updates to `paid` (future integration)
4. Failed payouts: retry with new `paystackRef`, log in `failureReason`

## Storage
- Local dev: `STORAGE_LOCAL_PATH=./uploads`
- Production: swap `StorageService` for R2/S3 signed URLs

## Backups
- Daily PostgreSQL snapshots
- Retain `audit_logs` and `wallet_ledger_entries` for 7 years (financial compliance)

## Environment secrets
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `PAYSTACK_SECRET_KEY`, `PAYSTACK_WEBHOOK_SECRET`
- `DATABASE_URL`
