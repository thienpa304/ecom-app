# Ecom App — Catalog + Admin (no payment)

Monorepo: public storefront + separate admin. Mock data by default; Supabase-ready.

## Structure

```
apps/web      → Storefront  http://localhost:3000
apps/admin    → Admin       http://localhost:3001  (password: admin123)
packages/shared → Types, Zod, seed
supabase/     → SQL migration + seed
```

## Quick start

```bash
cd D:\demo\ecom-app
pnpm install
cp .env.example apps/web/.env.local   # optional if missing
cp .env.example apps/admin/.env.local

pnpm dev:web    # catalog
pnpm dev:admin  # admin
# or both: pnpm dev
```

Admin login password: `ADMIN_PASSWORD` (default `admin123`).

## Features

- **Web:** listing filters (brand/price), sort, product detail, CTA call/Zalo/lead form — no cart/checkout
- **Admin:** cookie auth, CRUD products/brands/categories, leads list, publish toggle
- **Shared:** Dekton-style seed (~15 products)

## Live (Vercel Hobby)

| App | URL |
|-----|-----|
| Storefront | https://ecom-app-beta-eight.vercel.app |
| Admin | https://ecom-app-admin-omega.vercel.app (password `admin123`) |
| GitHub | https://github.com/thienpa304/ecom-app |

## Deploy (free)

| App | Host |
|-----|------|
| web + admin | Vercel Hobby (2 projects, root `apps/web` / `apps/admin`) |
| DB / Auth / Storage | Supabase Free |
| Images (optional) | Cloudflare R2 |

Set `NEXT_PUBLIC_USE_MOCK=false` and Supabase env vars when ready. Change `ADMIN_PASSWORD` in Vercel env for production.
