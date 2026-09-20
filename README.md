# RR GROUP — Digital Technology & Business Solutions

> Premium e-commerce + business platform for RR GROUP — web development, ERP, CRM, digital marketing, and a full-featured store with Firebase backend.

**Live Stack:** Next.js 16 (Turbopack) + React 19 · Express 4 + Firebase Admin (Firestore, Auth, Storage) · Razorpay / Stripe · pnpm

---

## Features

### Storefront (Public)
- **Home** — hero, services, testimonials, FAQs, CTAs (live from Firestore, `force-dynamic`)
- **Services / Portfolio / Blog / Careers / Contact** — all wired to `GET /api/public/*` with mock fallback
- **Shop** — products, categories, search, product detail, cart, wishlist, checkout (Razorpay), orders, invoices
- **Auth** — Firebase Client SDK → `POST /api/auth/firebase-login` (idToken exchange) with bcrypt REST fallback; httpOnly cookie session
- **Chatbot** — `POST /api/chat/chat` with tool calling, live product suggestions

### Customer Dashboard (`/dashboard`)
- Profile, addresses, orders, invoices, payments, support tickets, notifications — all isolated per-user (Firestore rules + server checks)

### Admin — Classic (`/admin`) & Separate Command Center (`/admin-panel`)
Both `StaffGuard` protected (`SUPER_ADMIN`/`ADMIN`/`MANAGER`/`STAFF`).

**Classic Admin** (`app/admin/*`, 22 routes):
- *Overview:* Dashboard (revenue, orders, customers, products, pending, low stock, open tickets + 5 live recent lists), Audit Logs
- *Project Track:* Portfolio, Services, Jobs, Applications
- *Commerce:* Products, Categories, Orders, Payments, Invoices, Coupons
- *Audience:* Users, Leads, Newsletter
- *Support:* Tickets, Queries (contact inquiries), Reviews
- *Content:* Blog, FAQs, Testimonials
- *Business:* ERP (departments/employees), Marketing (campaigns)
- *System:* Notifications, Settings

**Separate Admin Panel** (`app/admin-panel/*`) — dark isolated layout, single-page command center with tabbed tracking (Overview, Orders, Queries, Applications, Leads, Tickets, Products, Users, Content) and global search. Accessible at `/admin-panel` (staff only).

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 16.3.3 (Turbopack), React 19, TypeScript 5.7, Tailwind 4, shadcn, Base UI, Motion, `firebase` (client) |
| Backend | Express 4, TypeScript 5.6, Firebase Admin 14 (Firestore + Auth), `tsx`, `zod`, `jsonwebtoken`, `bcryptjs` |
| Payments | Razorpay 2.9, Stripe 17 (webhooks via `express.raw`) |
| Auth | Firebase Auth (client) + custom session JWT in httpOnly cookie (`rr_session`), Firestore `sessions/{sha256}` |
| Lint/Type | `typescript-eslint` + `eslint-plugin-react-hooks` + `@next/eslint-plugin-next`, `tsc --noEmit` |

---

## Project Structure

```
E:\rr-group\
├─ backend/
│  ├─ src/
│  │  ├─ config/ (env, firebase, payment)
│  │  ├─ controllers/ (customer, admin-*, ecommerce, content, etc.)
│  │  ├─ routes/ (auth, catalog, ecommerce, admin, public, webhooks, customer, chatbot)
│  │  ├─ services/ (db/firestore, ecommerce/*, payment/*, auth/*, ai/*)
│  │  ├─ middlewares/ (auth, rbac, rate-limit, error)
│  │  └─ server.ts
│  ├─ scripts/seed.ts          # Firestore + Firebase Auth seed
│  └─ .env / .env.example
├─ frontend/
│  ├─ app/
│  │  ├─ (public)/ (page, services, portfolio, blog, careers, contact, [...slug])
│  │  ├─ (store)/shop/ (products, categories, cart, wishlist, checkout, search)
│  │  ├─ dashboard/ (profile, orders, invoices, support, addresses)
│  │  ├─ admin/ (22 routes) + admin-panel/ (separate)
│  │  └─ layout.tsx (AuthProvider + StoreProvider)
│  ├─ components/ (site, store, admin, auth, ui)
│  ├─ lib/ (api, api-types, firebase, services/*, whatsapp, payments)
│  ├─ services/firebase.ts    # client SDK wrappers
│  └─ public/ (rrlogo.jpeg, icon.png, products/*)
├─ firestore.rules
└─ .gitignore
```

---

## Prerequisites

- Node 20+, pnpm 9+ (`npm i -g pnpm`)
- Firebase project `rr-group-ae152` (or your own)
- Service account JSON for backend (Project Settings → Service accounts → Generate new private key)
- Razorpay test keys (optional, for checkout)

---

## Environment

### Backend — `backend/.env`
Copy `backend/.env.example` → `backend/.env` and set:

```ini
NODE_ENV=development
PORT=5000
BACKEND_URL=http://localhost:5000
FRONTEND_URL=http://localhost:3000

# Firebase Admin — one of:
FIREBASE_SERVICE_ACCOUNT_PATH="C:/path/to/service-account.json"  # forward slashes!
# or
FIREBASE_PROJECT_ID=rr-group-ae152
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-...@rr-group-ae152.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n..."

JWT_SECRET=change-to-32+chars
SESSION_COOKIE_NAME=rr_session
ACCESS_TOKEN_MAX_AGE=86400

RAZORPAY_KEY_ID=rzp_test_xxx
RAZORPAY_KEY_SECRET=xxx
RAZORPAY_WEBHOOK_SECRET=xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
```

### Frontend — `frontend/.env.local`
Copy `frontend/.env.example` → `frontend/.env.local`:

```ini
BACKEND_URL=http://localhost:5000
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=rr-group-ae152.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=rr-group-ae152
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=rr-group-ae152.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=650084475521
NEXT_PUBLIC_FIREBASE_APP_ID=1:650084475521:web:7761fc423e0fd55e386380
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxx
NEXT_PUBLIC_WHATSAPP_NUMBER=919938844331
```

`NEXT_PUBLIC_FIREBASE_*` is obtained by creating a Web App in the Firebase console (or via `firebase.googleapis.com/v1beta1/projects/.../webApps` — this repo’s `scripts/create-firebase-web-app.mjs` does it with the service account).

---

## Getting Started

```bash
# 1. Install
pnpm install
# or from repo root:
pnpm --filter rr-group-backend install
pnpm --filter my-project install

# 2. Backend
cd backend
pnpm dev          # tsx watch src/server.ts → http://localhost:5000
# In another terminal:
pnpm seed         # seed Firestore + Auth (admin/manager/staff/customer, 13 products, orders, etc.)

# 3. Frontend
cd frontend
pnpm dev          # next dev (Turbopack) → http://localhost:3000
```

**Seeded accounts** (`Password@123`):
- `admin@rrgroup.example` — `SUPER_ADMIN` → `/admin` + `/admin-panel`
- `manager@rrgroup.example` — `MANAGER`
- `staff@rrgroup.example` — `STAFF`
- `customer@rrgroup.example` — `CUSTOMER` → `/dashboard`

---

## Available Scripts

| Dir | Command | Description |
|-----|---------|-------------|
| `backend` | `pnpm dev` | `tsx watch src/server.ts` |
| `backend` | `pnpm build` | `tsc && tsc-alias` → `dist/` |
| `backend` | `pnpm start` | `node dist/server.js` |
| `backend` | `pnpm seed` | `tsx scripts/seed.ts` |
| `backend` | `pnpm lint` | `eslint src` (0 errors) |
| `frontend` | `pnpm dev` | `next dev` |
| `frontend` | `pnpm build` | `next build` (42 routes) |
| `frontend` | `pnpm lint` | `eslint .` (0 errors, 33 warnings) |
| `frontend` | `pnpm start` | `next start` |

---

## API

All frontend calls go to same-origin `/api/*` and are proxied by `next.config.mjs:9` (`BACKEND_URL ?? http://localhost:5000`).

- `POST /api/auth/register` — creates Firebase Auth user + `users/{uid}` + `customers/{uid}`
- `POST /api/auth/login` — bcrypt → `Set-Cookie: rr_session`
- `POST /api/auth/firebase-login` — `verifyIdToken(idToken)` → session
- `GET /api/public/*` — services, blog, faqs, testimonials, portfolio, jobs
- `GET /api/catalog/products` — paginated, with `_count`
- `POST /api/cart` / `GET /api/wishlist` — server-synced when authenticated
- `POST /api/checkout` → Razorpay order → `verify` → webhook (`express.raw` at `/api/webhooks/razorpay|stripe`)
- `GET /api/admin/*` — all guarded by `requireStaff` + `requirePermission`

---

## Deployment

### Render (recommended — Blueprint)

A `render.yaml` at the repo root deploys both services:

1. Push this repo to GitHub (already at `https://github.com/Shlolk/RR-group-`).
2. In Render → **New → Blueprint**, paste that repo URL and follow the wizard.
3. Set the `sync: false` env vars once in the dashboard (see below) — Blueprint syncs will never overwrite them.

**Backend (`rr-group-backend`)** — set:
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (inline service-account values; the private key keeps `\n` escaped as `\\n`), or `GOOGLE_APPLICATION_CREDENTIALS`
- `JWT_SECRET` (long random string), `BACKEND_URL` (e.g. `https://rr-group-backend.onrender.com`), `FRONTEND_URL` (the frontend URL, CORS)
- Optional: `RAZORPAY_*`, `STRIPE_*`, `AI_API_KEY`, `EMAIL_API_KEY`/`SMTP_*`

**Frontend (`rr-group-frontend`)** — set:
- `NEXT_PUBLIC_FIREBASE_*` (client config values from the Firebase console web app)
- `NEXT_PUBLIC_RAZORPAY_KEY_ID`, `NEXT_PUBLIC_WHATSAPP_NUMBER`
- `BACKEND_URL` is filled automatically via `fromService` in the Blueprint.

The frontend proxies `/api/*` → `BACKEND_URL` server-side (`next.config.mjs`), and cookies stay same-origin, so no extra CORS config is needed beyond `FRONTEND_URL` on the backend.

> **Free tier:** Render spins the free instances down after ~15 min of inactivity (cold starts take ~50s). Paid tier keeps them hot.
> The backend `dist/` build uses `tsc-alias` (`pnpm build` = `tsc && tsc-alias`) because TypeScript doesn't rewrite the `@/*` path aliases itself — do not change `startCommand` to a plain `tsc` build.

### Docker (alternative to the Blueprint)

`backend/Dockerfile` and `frontend/Dockerfile` build production images (multi-stage, prod-only deps). Either deploy them from Render's **New → Docker** flow or point the Blueprint services at them. Image run commands: backend `node dist/server.js` (port 10000), frontend `next start` (port 3000).

### Vercel (frontend only)

Set `BACKEND_URL` to your API origin, and all `NEXT_PUBLIC_*` vars.

### Backend on any Node host

Set `FIREBASE_SERVICE_ACCOUNT_PATH` to a secret file path or inline `FIREBASE_PRIVATE_KEY` (escaped `\n`), `JWT_SECRET`, and `FRONTEND_URL` (CORS).

### Firestore Rules

`firestore.rules` enforces `request.auth.uid == resource.data.userId` for customer collections — deploy with `firebase deploy --only firestore:rules`.

---

## License

Private — RR GROUP.
