# Frontend ↔ API Integration Map

| Frontend file | API endpoints |
|---------------|---------------|
| `features/auth/Login.tsx` | `POST /auth/login`, `GET /auth/me` |
| `features/auth/Signup.tsx` | `POST /auth/signup/clipper`, `POST /auth/signup/funder` |
| `features/funder/FunderDashboard.tsx` | `GET /wallet`, `POST /campaigns`, `POST /wallet/topups/initiate` |
| `features/funder/FunderBilling.tsx` | `GET /wallet/transactions` |
| `features/clipper/ClipperDashboard.tsx` | `GET /campaigns/live`, `POST /campaigns/:id/join`, `POST /submissions` |
| `features/clipper/ClipperEarnings.tsx` | `GET /earnings/me`, `GET /submissions/me` |
| `features/admin/AdminPanel.tsx` | `GET /admin/submissions/pending`, `POST approve/reject/verify-views`, `POST /admin/payouts/:id/trigger` |
| `lib/api/client.ts` | Shared typed API client with JWT refresh |

Landing pages still use `mock-data.ts` for marketing previews until a public campaigns endpoint is added.
