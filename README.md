# FixItNow 🔧 — Home Service Platform Backend

TypeScript + Express + PostgreSQL + Prisma backend for the FixItNow assignment.

## 1. Install

```bash
npm install
```

## 2. Configure environment

Copy `.env.example` to `.env` (already done for you) and fill in real values:

```
DATABASE_URL      → your Postgres connection string
JWT_ACCESS_SECRET  / JWT_REFRESH_SECRET → any random strings
STRIPE_SECRET_KEY / STRIPE_WEBHOOK_SECRET → from your Stripe dashboard (test mode)
```

## 3. Generate Prisma Client & run migrations

```bash
npm run prisma:generate
npm run prisma:migrate
```

## 4. Seed the database

```bash
npm run seed
```

Creates:
- Admin → `fixitnow_admin@gmail.com` / `adminpassword123`
- Categories → Plumbing, Electrical, Cleaning

## 5. Run the dev server

```bash
npm run dev
```

Server runs at `http://localhost:5000`.

## 6. (Optional) Forward Stripe webhooks locally

```bash
npm run stripe:webhook
```

## Testing the full flow (Postman/Thunder Client)

1. `POST /api/auth/register` → create a `TECHNICIAN`, `CUSTOMER` or `ADMIN` user
2. `POST /api/auth/login` → get JWT for each
3. As technician: `POST` a `TechnicianProfile` isn't exposed yet — see **Known gaps** below; you can create one directly via `prisma studio` (`npm run prisma:studio`) for quick testing, or add the endpoint.
4. `POST /api/services` (as technician, needs a TechnicianProfile) → creates a service under a category
5. `POST /api/bookings` (as customer) → `REQUESTED`
6. `PATCH /api/bookings/:id/status` (as technician) → `ACCEPTED`
7. `POST /api/payments/create` (as customer) → returns `clientSecret`
8. Trigger `stripe trigger payment_intent.succeeded` (with webhook forwarding running) → booking flips to `PAID`
9. Mark `IN_PROGRESS` / `COMPLETED` → not yet exposed (see gaps)
10. `POST /api/reviews` (as customer, booking must be `COMPLETED`)

## Known gaps (not yet built — add these next)

- `TechnicianProfile` create/update + availability endpoints
- Booking status transitions for `IN_PROGRESS` / `COMPLETED` (currently only `ACCEPTED`/`DECLINED` via technician)
- Admin module: ban/unban users, view all bookings, list all categories
- Swagger/Postman collection (mandatory requirement #1)
- Refresh-token flow

## Folder structure

```
prisma/schema/       → Prisma schema split by model
src/config/          → env config
src/lib/              → prisma client, stripe client
src/errors/           → AppError
src/middlewares/      → auth, validateRequest, globalErrorHandler, notFound
src/utils/            → catchAsync, sendResponse, jwtHelper, validators (plain-TS validation, no schema library)
src/modules/          → auth, booking, payment, category, service, review
src/app.ts            → express app + route mounting
src/server.ts         → entry point
src/seed.ts           → db seed script
```
