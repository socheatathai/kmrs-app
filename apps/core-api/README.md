# Core API

NestJS API for KMRS, backed by Prisma and PostgreSQL.

## Overview

- Framework: NestJS
- Database access: Prisma + PostgreSQL
- Auth model: JWT bearer auth enabled globally by default
- Public routes: `POST /auth/register`, `POST /auth/login`, `GET /plans`, `GET /menu/:slug`
- Docs: `/docs`
- Localization: `Accept-Language` header with `en` and `km`

## Required Environment

Use `.env.local` for local development and `.env.production` for production.
Set `NODE_ENV=production` when you want the app and Prisma to load `.env.production`.

Local development:

```sh
Copy-Item .env.example .env.local
```

Required variables:

- `DATABASE_URL`
- `PORT`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `PUBLIC_MENU_BASE_URL`
- `CORS_ORIGINS`
- `DO_SPACES_ENDPOINT`
- `DO_SPACES_REGION`
- `DO_SPACES_BUCKET`
- `DO_SPACES_KEY`
- `DO_SPACES_SECRET`
- `DO_SPACES_PUBLIC_URL`

## Image Uploads

Authenticated users can upload product and shop images with:

```sh
curl -X POST "http://localhost:3000/uploads/images?folder=products" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "file=@./menu-item.webp"
```

The endpoint accepts multipart field `file`, allows `jpg`, `jpeg`, `png`, and `webp`, and rejects files over 5MB. The API stores binary data in DigitalOcean Spaces and returns only object metadata:

```json
{
  "success": true,
  "data": {
    "url": "https://kmrs-assets.sgp1.digitaloceanspaces.com/products/menu-item-uuid.webp",
    "key": "products/menu-item-uuid.webp"
  }
}
```

Nuxt merchant CMS usage:

```ts
const client = useApiClient()

const uploadProductImage = async (file: File) => {
  const uploaded = await client.uploadImage(file, 'products')

  form.imageUrl = uploaded.url
  form.imageKey = uploaded.key
}
```

## Commands

```sh
pnpm dev
pnpm build
pnpm lint
pnpm check-types
pnpm test
pnpm test:e2e
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:seed
pnpm prisma:studio
```

## Project Structure

```text
src/
├─ app.module.ts
├─ main.ts
├─ auth/
├─ categories/
├─ common/
│  ├─ context/
│  ├─ decorators/
│  ├─ filters/
│  ├─ guards/
│  ├─ i18n/
│  ├─ interceptors/
│  ├─ services/
│  └─ types/
├─ plans/
├─ prisma/
├─ products/
├─ public/
├─ qr-codes/
├─ shops/
└─ subscriptions/

prisma/
├─ migrations/
├─ schema.prisma
└─ seed.ts
```

## Module Responsibilities

- `auth`: registration, login, JWT strategy, current-user profile
- `subscriptions`: merchant plan subscription lifecycle and current subscription lookup
- `shops`: merchant-owned shop management
- `categories`: category management under a shop
- `products`: product management under a shop
- `uploads`: authenticated image upload to DigitalOcean Spaces
- `qr-codes`: QR generation and QR resource management
- `public`: public menu read endpoint by shop slug
- `common/context`: request-scoped context from headers
- `common/i18n`: locale loading and translation lookup
- `common/services/plan-limit.service.ts`: quota enforcement across shops, products, and QR codes
- `prisma`: Prisma client bootstrap and database access

## Security and Localization

- JWT auth is applied globally through the app guard
- Use `@Public()` only for endpoints that must bypass auth
- Protected endpoints require `Authorization: Bearer <token>`
- Login is rate-limited
- `helmet` is enabled
- CORS is restricted by `CORS_ORIGINS`
- sensitive fields such as `password` are stripped from plain-object responses
- Error messages are resolved from `Accept-Language`
- Example header: `Accept-Language: km`

## API Flow

1. `POST /auth/register`
2. `POST /auth/login`
3. `GET /plans`
4. `POST /subscriptions`
5. `GET /subscriptions/current`
6. `POST /shops`
7. `PATCH /shops/:shopId`
8. `POST /shops/:shopId/categories`
9. `PATCH /shops/:shopId/categories/:categoryId`
10. `POST /shops/:shopId/products`
11. `PATCH /shops/:shopId/products/:productId`
12. `POST /shops/:shopId/qrcodes`
13. `PATCH /shops/:shopId/qrcodes/:qrCodeId`
14. `GET /menu/:slug`

## Demo Seed Data

- `merchant@example.com` / `secret123`
- `bistro@example.com` / `secret123`
- `admin@example.com` / `secret123`
- Demo shop slugs: `sunrise-cafe`, `moonlight-bistro`
- Public menus: `/menu/sunrise-cafe`, `/menu/moonlight-bistro`

## Implemented Modules

- JWT auth with register, login, and current-user profile
- Request-scoped i18n using JSON locale files and `Accept-Language`
- Plan listing
- Merchant subscription creation, lookup, current-state lookup, and cancellation
- Shop CRUD-style management with plan limit enforcement
- Category CRUD-style management
- Product CRUD-style management with account-level plan limit enforcement
- Authenticated image uploads backed by DigitalOcean Spaces
- QR code CRUD-style management with account-level plan limit enforcement
- Shared plan limit enforcement service
- Public digital menu endpoint by shop slug
- Security hardening with validation, throttling, `helmet`, CORS allowlisting, and response sanitization
