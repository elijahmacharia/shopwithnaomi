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

PostgreSQL must be running. Local development uses the same address for `DATABASE_URL` and `DIRECT_URL`:

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

## Put the database on Supabase

1. In Supabase, create a project and save the database password.
2. Open Connect, then ORMs, then Prisma. Copy the two pooler strings. The username looks like `postgres.abcdefghijklmnop`.
3. Use the transaction pooler (port 6543) as `DATABASE_URL`. Add `?pgbouncer=true&connection_limit=1&sslmode=require`.
4. Use the session pooler (port 5432) as `DIRECT_URL`. Add `?sslmode=require`.
5. If the password contains `@`, `#`, or other URL symbols, encode them first. `@` becomes `%40`.

The direct host `db.PROJECT.supabase.co` is often IPv6-only, so Vercel should use the pooler hosts above.

In the Vercel project, open Settings, then Environment Variables, and add:

| Name | Value |
| --- | --- |
| `DATABASE_URL` | Supabase transaction pooler, port 6543 |
| `DIRECT_URL` | Supabase session pooler, port 5432 |
| `SESSION_SECRET` | A long random string, at least 16 characters |
| `NEXT_PUBLIC_WHATSAPP_NUMBER` | Shop WhatsApp number, digits only |

Redeploy after saving the variables. The Vercel build creates the tables when `DIRECT_URL` points at Supabase.

Load the sample shop once, from your computer, with those same two variables:

```bash
npx prisma migrate deploy
npm run db:seed
```

Run the seed only on an empty database. It replaces existing shop data. Change the owner and employee passwords after the first sign-in.

## Payments later

Sales call one completion flow. Cash, M-Pesa, and other payments store the amount an employee typed. A future M-Pesa API can sit beside that flow without rewriting stock or receipts.
