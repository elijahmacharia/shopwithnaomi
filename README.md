# SHOP WITH NÁOMÉ

Household shop for Nairobi: a public store, an employee sales screen, and an owner office.

Customers shop without an account. Employees record cash, M-Pesa, other, and credit payments by hand. The owner manages stock, profit, expenses, approvals, and online orders. M-Pesa is recorded manually. There is no payment API.

## Stack

Next.js, React, TypeScript, Tailwind CSS, PostgreSQL, and Prisma.

## Setup

```bash
npm ci
cp .env.example .env
npx prisma migrate deploy
npm run db:seed
npm run dev
```

The app runs at http://127.0.0.1:3000.

PostgreSQL must be running and `DATABASE_URL` must point at it. Local development can use:

`postgresql://shop:shop@localhost:5432/shopwithnaome`

## Development sign-in

These passwords come from `SEED_OWNER_PASSWORD` and `SEED_EMPLOYEE_PASSWORD`. The example values are for development only.

| Role | Email | Password | Page |
| --- | --- | --- | --- |
| Owner | owner@example.com | owner-dev-pass | /admin/login |
| Employee | employee@example.com | employee-dev-pass | /employee/login |

The public shop does not link to these pages.

## Checks

```bash
npm test
npm run typecheck
npm run lint
npm run build
```

## WhatsApp

Set `NEXT_PUBLIC_WHATSAPP_NUMBER` or the WhatsApp number in owner settings. Checkout and the single floating button both use that number.

## Deploy on Vercel

The shop needs a hosted Postgres database. Vercel cannot use `localhost`.

In the Vercel project, open Settings, then Environment Variables, and add:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Hosted Postgres URL, port 5432, ending in `?sslmode=require&connection_limit=1` |
| `SESSION_SECRET` | A long random string, at least 16 characters |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Shop WhatsApp number, digits only |

Supabase works. Use the direct connection string, not the pooler, for this version. Redeploy after saving the variables. The Vercel build creates the tables when `DATABASE_URL` points at that database.

Load the sample shop once, from your computer, with the same `DATABASE_URL`:

```bash
npx prisma migrate deploy
npm run db:seed
```

Run the seed only on an empty database. It replaces existing shop data.

## Payments later

Sales call one completion flow. Cash, M-Pesa, and other payments store the amount an employee typed. A future M-Pesa API can sit beside that flow without rewriting stock or receipts.
