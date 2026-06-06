# KMRS App Monorepo

KMRS is a pnpm workspace for a digital menu platform. The repo contains:

- `apps/core-api`: NestJS API with Prisma, auth, permissions, uploads, and public menu endpoints
- `apps/customer-web`: Next.js public menu frontend
- `apps/merchant-cms`: Nuxt 4 admin and merchant dashboard
- `packages/*`: shared API client, types, and workspace packages

## Workspace Layout
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

## Project Structure

```text
kmrs-app/
|- apps/
|  |- core-api/
|  |  |- prisma/
|  |  |- src/
|  |  |  |- common/
|  |  |  |- config/
|  |  |  |- database/
|  |  |  `- modules/
|  |  `- test/
|  |- customer-web/
|  |  |- app/
|  |  |- components/
|  |  |- lib/
|  |  `- public/
|  `- merchant-cms/
|     |- app/
|     |  |- assets/
|     |  |- composables/
|     |  |- constants/
|     |  |- layouts/
|     |  |- middleware/
|     |  |- pages/
|     |  `- stores/
|     `- public/
|- packages/
|  |- api-client/
|  |- config/
|  |- types/
|  |- ui/
|  `- utils/
|- docker-compose.yml
|- package.json
|- pnpm-workspace.yaml
`- turbo.json
```

## Requirements

- Node.js 20+
- pnpm 9
- Docker

## Quick Start

1. Install dependencies.

```sh
pnpm install
```

2. Start local infrastructure.

```sh
docker-compose up -d
```

This starts:

- PostgreSQL on `localhost:5432`
- Redis on `localhost:6379`

3. Create local env files.

```powershell
Copy-Item apps/core-api/.env.example apps/core-api/.env.local
Copy-Item apps/customer-web/.env.example apps/customer-web/.env.local
Copy-Item apps/merchant-cms/.env.example apps/merchant-cms/.env.local
```

Recommended local values:

- `apps/core-api/.env.local`
  - set `PORT=3333`
  - set `CORS_ORIGINS="http://localhost:3000,http://localhost:4200"`
- `apps/customer-web/.env.local`
  - set `BASE_URL=http://localhost:3333`
  - set `PUBLIC_MENU_BASE_URL=http://localhost:4200`
- `apps/merchant-cms/.env.local`
  - set `NUXT_PUBLIC_API_BASE="http://localhost:3333"`

4. Prepare the backend database.

```sh
pnpm --filter core-api prisma:generate
pnpm --filter core-api prisma:migrate:dev
pnpm --filter core-api prisma:seed
```

5. Run the apps.

Recommended separate commands:

```sh
pnpm --filter core-api dev
pnpm --filter merchant-cms dev -- --port 3000
pnpm --filter customer-web dev -- --port 4200
```

You can also run the full workspace:

```sh
pnpm dev
```

Note:

- `turbo run dev` does not assign ports for you.
- `customer-web` and `merchant-cms` both default to port `3000`, so running them together requires explicit port overrides.

## Local URLs

With the recommended setup above:

- `core-api`: `http://localhost:3333`
- Swagger docs: `http://localhost:3333/docs`
- `merchant-cms`: `http://localhost:3000`
- `customer-web`: `http://localhost:4200`

## Workspace Commands

From the repo root:

```sh
pnpm build
pnpm lint
pnpm check-types
pnpm test
pnpm format
```

App-specific examples:

```sh
pnpm --filter core-api dev
pnpm --filter core-api test
pnpm --filter customer-web dev
pnpm --filter customer-web check-types
pnpm --filter merchant-cms dev
pnpm --filter merchant-cms typecheck
```

## Apps

### `apps/core-api`

NestJS backend for:

- JWT auth with refresh tokens
- user hierarchy and permission checks
- shops, categories, products, subscriptions, and QR codes
- audit logs
- DigitalOcean Spaces image upload/remove endpoints
- public menu APIs
- English and Khmer localization

Important routes:

- `POST /auth/login`
- `GET /auth/me`
- `GET /plans`
- `GET /shops`
- `GET /shops/:shopId/categories`
- `GET /shops/:shopId/products`
- `GET /shops/:shopId/qrcodes`
- `GET /audit-logs`
- `POST /uploads/images`
- `POST /uploads/images/multiple`
- `GET /menu/:slug`
- `GET /menu/:slug/products/:productId`
- `POST /menu/:slug/qr-scan`

See [apps/core-api/README.md](apps/core-api/README.md).

### `apps/customer-web`

Next.js frontend for the public menu experience:

- landing page explaining slug-based menu routes
- shop menu page at `/:slug`
- product detail page at `/:slug/products/:productId`
- category filtering and search
- Khmer / English UI copy
- QR scan tracking through `?source=qr`

See [apps/customer-web/README.md](apps/customer-web/README.md).

### `apps/merchant-cms`

Nuxt dashboard for admins and merchants:

- login with real API auth
- cookie-backed access and refresh tokens
- role-based admin vs merchant routing
- permission-aware navigation
- shop selection for merchant users
- account management and audit logs for admins
- shop, category, product, QR code, and subscription views for merchants

See [apps/merchant-cms/README.md](apps/merchant-cms/README.md).

## Shared Packages

- `@kmrs-app/api-client`: typed API client used by the frontend apps
- `@kmrs-app/types`: shared request and response types
- `@kmrs-app/config`: placeholder package for shared config
- `@kmrs-app/ui`: placeholder package for shared UI
- `@kmrs-app/utils`: placeholder package for shared helpers

## Environment Notes

### Core API env loading

`apps/core-api` loads:

- `.env.local` or `apps/core-api/.env.local` when `NODE_ENV` is not `production`
- `.env.production` or `apps/core-api/.env.production` when `NODE_ENV=production`

The API requires:

- `DATABASE_URL`
- `PORT`
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `CORS_ORIGINS`
- `PUBLIC_MENU_BASE_URL`
- `DO_SPACES_ENDPOINT`
- `DO_SPACES_REGION`
- `DO_SPACES_BUCKET`
- `DO_SPACES_KEY`
- `DO_SPACES_SECRET`
- `DO_SPACES_PUBLIC_URL`

### Frontend env notes

- `customer-web` requires `BASE_URL` in production. In non-production it falls back to `http://localhost:3333`.
- `merchant-cms` reads `NUXT_PUBLIC_API_BASE` and defaults to `http://localhost:3333`.

## Seed Data

The backend seed creates demo plans, users, subscriptions, shops, categories, products, and QR codes.

Demo credentials:

- `merchant@example.com` / `secret123`
- `bistro@example.com` / `secret123`
- `admin@example.com` / `secret123`
- `staff@example.com` / `secret123`

Demo public menus:

- `/sunrise-cafe`
- `/moonlight-bistro`

## Known Constraints

- `apps/core-api/.env.example` still defaults to `PORT=3000`; change it in your local env if you want the documented `3333` setup.
- `apps/customer-web/.env.example` should be copied into `.env.local` and adjusted to a full API origin such as `http://localhost:3333`.
- `merchant-cms` currently has no dedicated `lint` or `test` script.
- Upload endpoints now accept `folder=prod` or `folder=uat`.

## Safety Notes

- Do not commit real secrets.
- Rotate seeded credentials before non-local use.
- Review CORS, JWT secrets, and Spaces credentials before deployment.
