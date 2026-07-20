# Ecom Catalog Implementation Plan

> **For agentic workers:** Implement by owned paths only. No payment/checkout.

**Goal:** Product catalog storefront (like ketnoitieudung category page) + separate admin. No payment. CTA = call / Zalo / leave phone lead.

**Architecture:** pnpm monorepo — `apps/web` (public), `apps/admin` (auth CRUD), `packages/shared` (types), `supabase/` (SQL). Mock data layer so apps run without Supabase keys; env switches to Supabase when configured.

**Tech Stack:** Next.js 15 App Router, TypeScript, Tailwind CSS, shadcn-style UI, Supabase JS client (optional), Zod.

## Owned paths (parallel-safe)

| Agent | Owns | Must not touch |
|-------|------|----------------|
| A shared | `packages/shared/**`, `supabase/**` | `apps/**` |
| B web | `apps/web/**` | `apps/admin/**`, `packages/**` |
| C admin | `apps/admin/**` | `apps/web/**`, `packages/**` |
| Parent | root `package.json`, `pnpm-workspace.yaml`, `README.md`, `.gitignore`, `.env.example` | — |

## Features

### Storefront (`apps/web`)
- Home + category/brand listing page with sidebar filters (brand, price)
- Sort (price asc/desc), page size
- Product cards: image, name, model, specs, price/sale, discount %, sold, stock
- Product detail page
- CTA: phone, Zalo link, lead form (no cart checkout)
- Vietnamese UI labels

### Admin (`apps/admin`)
- Login page (demo: password gate via `ADMIN_PASSWORD` env; ready for Supabase Auth)
- Dashboard counts
- CRUD: categories, brands, products, images (URL-based for mock)
- Publish / unpublish products
- View leads

### Shared
- Zod schemas + TS types: Category, Brand, Product, ProductImage, Lead
- Constants (stock status, sort options)

### Supabase
- Migration SQL + RLS: public read published products; authenticated admin write
- Seed SQL with Dekton-like sample products

## Data source strategy
- `NEXT_PUBLIC_USE_MOCK=true` (default): in-memory/JSON seed in each app importing from `@ecom/shared` seed
- When `NEXT_PUBLIC_SUPABASE_URL` + key set and mock false: use Supabase client

## Done criteria
- `pnpm install` works at root
- `pnpm --filter web dev` shows catalog with filters
- `pnpm --filter admin dev` shows admin CRUD with mock data
- README with run instructions
