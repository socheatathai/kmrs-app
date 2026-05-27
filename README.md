# KMRS App Monorepo

KMRS is a monorepo for a digital menu platform. It includes:

- `apps/core-api`: NestJS + Prisma backend
- `apps/customer-web`: Next.js public menu frontend
- `apps/merchant-cms`: Nuxt 4 admin and merchant dashboard
- `packages/*`: shared workspace code

The workspace is managed with `pnpm` and Turbo.

## Workspace

```text
kmrs-app/
|- apps/
|  |- core-api/
|  |- customer-web/
|  `- merchant-cms/
|- packages/
|  |- api-client/
|  |- config/
|  |- types/
|  |- ui/
|  `- utils/
|- docker-compose.yml
|- pnpm-workspace.yaml
`- turbo.json
```

## Requirements

- Node.js 20+
- pnpm 9
- Docker

## Quick Start

1. Install workspace dependencies.

```sh
pnpm install
```

2. Start local infrastructure.

```sh
docker-compose up -d
```

This starts:

- PostgreSQL 16 on `localhost:5432`
- Redis 7 on `localhost:6379`

3. Create local env files.

```powershell
Copy-Item apps/core-api/.env.example apps/core-api/.env
Copy-Item apps/customer-web/.env.example apps/customer-web/.env
Copy-Item apps/merchant-cms/.env.example apps/merchant-cms/.env
```

4. Prepare the backend database.

```sh
pnpm --filter core-api prisma:generate
pnpm --filter core-api prisma:migrate:dev
pnpm --filter core-api prisma:seed
```

5. Run the apps.

Run all dev servers:

```sh
pnpm dev
```

Or run them individually:

```sh
pnpm --filter core-api dev
pnpm --filter customer-web dev
pnpm --filter merchant-cms dev
```

## Default Local URLs

- `core-api`: `http://localhost:3333`
- Swagger docs: `http://localhost:3333/docs`
- `merchant-cms`: `http://localhost:3000`
- `customer-web`: `http://localhost:4200`

Note:

- `apps/core-api/.env.example` still shows `PORT=3000`, but the current local setup uses `3333`.
- `apps/merchant-cms/.env.example` already points to `http://localhost:3333`.
- `apps/customer-web/.env.example` expects `BASE_URL=http://localhost:3333`.

## Common Commands

Workspace:

```sh
pnpm build
pnpm lint
pnpm check-types
pnpm test
pnpm format
```

Backend:

```sh
pnpm --filter core-api prisma:generate
pnpm --filter core-api prisma:migrate:dev
pnpm --filter core-api prisma:seed
pnpm --filter core-api prisma:studio
```

## Project Structure

### `apps/core-api`

NestJS backend for auth, permissions, admin management, merchant resources, subscriptions, public menu APIs, and audit logging.

```text
apps/core-api/
|- prisma/
|  |- migrations/
|  |- schema.prisma
|  `- seed.ts
|- src/
|  |- common/
|  |- config/
|  |- database/
|  |- modules/
|  |  |- audit-logs/
|  |  |- auth/
|  |  |- categories/
|  |  |- plans/
|  |  |- products/
|  |  |- public/
|  |  |- qr-codes/
|  |  |- shops/
|  |  |- subscriptions/
|  |  |- uploads/
|  |  `- users/
|  |- app.module.ts
|  `- main.ts
|- .env.example
|- package.json
`- README.md
```

Current backend scope:

- JWT access token + refresh token auth
- `ValidationPipe` request validation
- bcrypt password hashing
- rate limiting with `@nestjs/throttler`
- `helmet` and CORS allowlisting
- user hierarchy with `level`
- string-based permissions for MVP
- admin user management
- audit log listing
- plans and subscriptions
- shops, categories, products, and QR codes
- image upload and image removal endpoints backed by DigitalOcean Spaces
- public menu endpoints by shop slug
- QR scan tracking endpoint
- English and Khmer localization

Main modules and routes:

- `auth`
  - `POST /auth/register`
  - `POST /auth/login`
  - `GET /auth/me`
  - `POST /auth/refresh`
  - `POST /auth/logout`
- `plans`
  - `GET /plans`
- `subscriptions`
  - `POST /subscriptions`
  - `GET /subscriptions/me`
  - `GET /subscriptions/current`
  - `PATCH /subscriptions/:subscriptionId/cancel`
- `shops`
  - `GET /shops`
  - `POST /shops`
  - `GET /shops/:shopId`
  - `PATCH /shops/:shopId`
  - `DELETE /shops/:shopId`
- `categories`
  - `GET /shops/:shopId/categories`
  - `POST /shops/:shopId/categories`
  - `PATCH /shops/:shopId/categories/:categoryId`
  - `DELETE /shops/:shopId/categories/:categoryId`
- `products`
  - `GET /shops/:shopId/products`
  - `POST /shops/:shopId/products`
  - `PATCH /shops/:shopId/products/:productId`
  - `DELETE /shops/:shopId/products/:productId`
- `qr-codes`
  - `GET /shops/:shopId/qrcodes`
  - `POST /shops/:shopId/qrcodes`
  - `PATCH /shops/:shopId/qrcodes/:qrCodeId`
  - `DELETE /shops/:shopId/qrcodes/:qrCodeId`
- `users`
  - `GET /users`
  - `POST /users`
  - `GET /users/:userId`
  - `PATCH /users/:userId`
  - `DELETE /users/:userId`
- `uploads`
  - `GET /uploads/images?key=products/example.webp`
  - `POST /uploads/images`
  - `POST /uploads/images/multiple`
  - `DELETE /uploads/images?key=products/example.webp`
- `audit-logs`
  - `GET /audit-logs`
- `public`
  - `GET /menu/:slug`
  - `GET /menu/:slug/categories`
  - `GET /menu/:slug/products`
  - `GET /menu/:slug/products/:productId`
  - `POST /menu/:slug/qr-scan`

### `apps/customer-web`

Next.js public menu frontend for customer-facing menu browsing.

```text
apps/customer-web/
|- app/
|  |- [slug]/
|  |  |- loading.tsx
|  |  |- page.tsx
|  |  `- products/
|  |     `- [productId]/
|  |        |- loading.tsx
|  |        `- page.tsx
|  |- globals.css
|  |- layout.tsx
|  |- page.tsx
|  `- providers.tsx
|- components/
|  `- menu/
|- lib/
|  |- api.ts
|  |- i18n.ts
|  |- store/
|  `- types.ts
|- public/
|- .env.example
|- next.config.ts
|- package.json
`- README.md
```

Current customer web scope:

- public menu page at `/:slug`
- public product detail page at `/:slug/products/:productId`
- category filter tabs
- product search
- Khmer / English copy
- QR landing support through `?source=qr`
- loading skeletons and empty states

The app reads public data from `core-api` using:

- `GET /menu/:slug`
- `GET /menu/:slug/categories`
- `GET /menu/:slug/products`
- `GET /menu/:slug/products/:productId`
- `POST /menu/:slug/qr-scan`

Local env:

```env
BASE_URL=http://localhost:3333
PUBLIC_MENU_BASE_URL=http://localhost:4200
```

### `apps/merchant-cms`

Nuxt 4 dashboard for both platform admins and merchants. The app now uses real auth against `core-api` and switches between admin and merchant modes based on the authenticated profile.

```text
apps/merchant-cms/
|- app/
|  |- assets/
|  |  `- css/
|  |     `- main.css
|  |- composables/
|  |  |- useApi.ts
|  |  |- useApiClient.ts
|  |  |- usePermissions.ts
|  |  |- useSelectedShop.ts
|  |  `- useSession.ts
|  |- constants/
|  |  `- user-access.ts
|  |- layouts/
|  |  `- dashboard.vue
|  |- middleware/
|  |  |- admin.ts
|  |  |- auth.ts
|  |  `- merchant.ts
|  |- pages/
|  |  |- index.vue
|  |  |- login.vue
|  |  |- dashboard.vue
|  |  |- settings.vue
|  |  |- products/index.vue
|  |  |- users/index.vue
|  |  |- admin/
|  |  |  |- dashboard.vue
|  |  |  |- settings.vue
|  |  |  |- accounts/
|  |  |  |  |- create.vue
|  |  |  |  |- index.vue
|  |  |  |  `- [userId].vue
|  |  |  `- audit-logs/index.vue
|  |  `- merchant/
|  |     |- dashboard.vue
|  |     |- settings.vue
|  |     |- subscription.vue
|  |     `- shops/
|  |        |- index.vue
|  |        `- [shopId]/
|  |           |- categories.vue
|  |           |- products.vue
|  |           |- qrcodes.vue
|  |           `- settings.vue
|  |- stores/
|  |  |- auth.ts
|  |  |- session.ts
|  |  `- shop.ts
|  `- app.vue
|- public/
|- .env.example
|- nuxt.config.ts
|- package.json
`- tsconfig.json
```

Current merchant CMS scope:

- real login with `POST /auth/login`
- profile initialization with `GET /auth/me`
- access token and refresh token session handling
- permission-based sidebar
- admin mode and merchant mode
- shop selection for merchant users
- admin account management
- admin audit log list
- merchant shop, category, product, QR code, and subscription pages

Important note:

- `app/pages/dashboard.vue`, `app/pages/settings.vue`, `app/pages/products/index.vue`, and `app/pages/users/index.vue` are compatibility routes that redirect to the new admin or merchant pages.

Local env:

```env
NUXT_PUBLIC_API_BASE="http://localhost:3333"
NUXT_PUBLIC_APP_NAME="Merchant CMS"
```

### `packages`

Shared workspace packages:

- `@kmrs-app/api-client`
  - typed HTTP client for `core-api`
  - supports auth, shops, categories, products, QR codes, subscriptions, users, and audit logs
- `@kmrs-app/types`
  - shared DTO and response types for auth, shops, subscriptions, users, and audit logs
- `@kmrs-app/config`
  - workspace package placeholder for shared config
- `@kmrs-app/ui`
  - workspace package placeholder for shared UI
- `@kmrs-app/utils`
  - workspace package placeholder for shared helpers

## Database Model

`core-api` currently models:

- `User`
- `Shop`
- `ShopMember`
- `Plan`
- `Subscription`
- `Category`
- `Product`
- `QrCode`
- `AuditLog`

Permission model:

- `role`: coarse identity such as `SUPER_ADMIN`, `MERCHANT_OWNER`, `STAFF`
- `level`: hierarchy control
  - `1` = highest
  - `2` = middle
  - `3` = lowest
- `permissions: String[]`: feature-level access

Current hierarchy rules:

- level 1 can manage level 2 and level 3
- level 2 can manage level 3
- level 3 cannot manage users

## Environment Files

### `apps/core-api/.env.example`

```env
DATABASE_URL="postgresql://kmrs_user:kmrs_password@localhost:5432/kmrs_dev"
PORT=3000
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_REFRESH_EXPIRES_IN="30d"
THROTTLE_TTL_MS=60000
THROTTLE_LIMIT=120
AUTH_LOGIN_THROTTLE_TTL_MS=60000
AUTH_LOGIN_THROTTLE_LIMIT=5
PUBLIC_MENU_BASE_URL="https://kmrs.app"
DO_SPACES_PUBLIC_URL="https://your-cdn.example.com"
DO_SPACES_ENDPOINT="https://sgp1.digitaloceanspaces.com"
DO_SPACES_REGION="sgp1"
DO_SPACES_BUCKET="your-bucket-name"
DO_SPACES_KEY="your-spaces-key"
DO_SPACES_SECRET="your-spaces-secret"
CORS_ORIGINS="http://localhost:3000,http://localhost:3001"
NODE_ENV="development"
```

### `apps/customer-web/.env.example`

```env
BASE_URL=http://localhost:3333
PUBLIC_MENU_BASE_URL=http://localhost:4200
```

### `apps/merchant-cms/.env.example`

```env
NUXT_PUBLIC_API_BASE="http://localhost:3333"
NUXT_PUBLIC_APP_NAME="Merchant CMS"
```

## Seed Data

The backend seed creates:

- demo plans
- demo users
- demo subscriptions
- demo shops
- demo shop members
- demo categories
- demo products
- demo QR codes

Demo credentials:

- `merchant@example.com` / `secret123`
- `bistro@example.com` / `secret123`
- `admin@example.com` / `secret123`
- `staff@example.com` / `secret123`

Demo public menus:

- `/sunrise-cafe`
- `/moonlight-bistro`

Matching public API endpoints:

- `/menu/sunrise-cafe`
- `/menu/moonlight-bistro`

## Known Notes

- Prisma migrations must be applied before using the latest auth and user-management code.
- If login starts returning `429`, the auth login throttler has been hit. Wait for the throttle window or adjust the local env values.
- `prisma db seed` is not wired through `prisma.config.ts` yet. Use `pnpm --filter core-api prisma:seed`.
- Redis is started by Docker, but the current backend code path in this repo does not yet document active Redis-backed features at the root level.
- Upload endpoints require the DigitalOcean Spaces environment variables in `apps/core-api/.env`.

## Tech Stack

- Turbo for workspace task orchestration
- pnpm workspaces for package management
- NestJS + Prisma + PostgreSQL for `core-api`
- Next.js for `customer-web`
- Nuxt 4 + Pinia for `merchant-cms`

## Safety Notes

- Do not commit real secrets to `.env` files.
- Rotate seeded credentials before any non-local usage.
- Review CORS, JWT secrets, and throttle values before deploying.
