# Core API

NestJS API for KMRS, backed by Prisma and PostgreSQL.

## What It Does

- JWT auth with refresh tokens
- user hierarchy and permission-based access control
- shops, categories, products, subscriptions, and QR codes
- audit logs
- public menu endpoints by shop slug
- image upload and removal through DigitalOcean Spaces
- English and Khmer localization
- Swagger docs at `/docs`

## Environment

The app loads env files through `ConfigModule`:

- non-production: `.env.local` or `apps/core-api/.env.local`
- production: `.env.production` or `apps/core-api/.env.production`

Create a local env file:

```powershell
Copy-Item .env.example .env.local
```

Minimum required values:

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

Recommended local values:

```env
PORT=3333
CORS_ORIGINS="http://localhost:3000,http://localhost:4200"
PUBLIC_MENU_BASE_URL="http://localhost:4200"
```

## Commands

```sh
pnpm dev
pnpm build
pnpm check-types
pnpm lint
pnpm test
pnpm test:e2e
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:seed
pnpm prisma:studio
```

## Project Structure

```text
apps/core-api/
|- prisma/
|  |- migrations/
|  |- schema.prisma
|  `- seed.ts
|- src/
|  |- common/
|  |  |- auth/
|  |  |- context/
|  |  |- decorators/
|  |  |- filters/
|  |  |- guards/
|  |  |- i18n/
|  |  |- interceptors/
|  |  |- pipes/
|  |  `- services/
|  |- config/
|  |- database/
|  |  `- prisma/
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
|- test/
|- .env.example
`- package.json
```

## Main Routes

Auth:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/refresh`
- `POST /auth/logout`

Catalog and merchant resources:

- `GET /shops`
- `POST /shops`
- `GET /shops/:shopId`
- `PATCH /shops/:shopId`
- `DELETE /shops/:shopId`
- `GET /shops/:shopId/categories`
- `POST /shops/:shopId/categories`
- `PATCH /shops/:shopId/categories/:categoryId`
- `DELETE /shops/:shopId/categories/:categoryId`
- `GET /shops/:shopId/products`
- `POST /shops/:shopId/products`
- `PATCH /shops/:shopId/products/:productId`
- `DELETE /shops/:shopId/products/:productId`
- `GET /shops/:shopId/qrcodes`
- `POST /shops/:shopId/qrcodes`
- `PATCH /shops/:shopId/qrcodes/:qrCodeId`
- `DELETE /shops/:shopId/qrcodes/:qrCodeId`

Plans, subscriptions, users, and logs:

- `GET /plans`
- `POST /subscriptions`
- `GET /subscriptions/me`
- `GET /subscriptions/current`
- `PATCH /subscriptions/:subscriptionId/cancel`
- `GET /users`
- `POST /users`
- `GET /users/:userId`
- `PATCH /users/:userId`
- `DELETE /users/:userId`
- `GET /audit-logs`

Uploads and public menu:

- `GET /uploads/images?key=prod/example.webp`
- `POST /uploads/images`
- `POST /uploads/images/multiple`
- `DELETE /uploads/images?key=prod/example.webp`
- `GET /menu/:slug`
- `GET /menu/:slug/categories`
- `GET /menu/:slug/products`
- `GET /menu/:slug/products/:productId`
- `POST /menu/:slug/qr-scan`

## Image Uploads

Authenticated users can upload images into the `prod` or `uat` folders in DigitalOcean Spaces.

Single upload:

```sh
curl -X POST "http://localhost:3333/uploads/images?folder=prod" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "file=@./menu-item.webp"
```

Multiple upload:

```sh
curl -X POST "http://localhost:3333/uploads/images/multiple?folder=uat" \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "files=@./image-1.webp" \
  -F "files=@./image-2.webp"
```

Upload rules:

- field name `file` for single upload
- field name `files` for multiple upload
- allowed types: `jpg`, `jpeg`, `png`, `webp`
- max size: 5 MB per file
- multiple upload limit: 10 files

Example response:

```json
{
  "success": true,
  "data": {
    "url": "https://kmrs-assets.sgp1.digitaloceanspaces.com/prod/menu-item-uuid.webp",
    "key": "prod/menu-item-uuid.webp"
  }
}
```

## Local Development Flow

1. Start PostgreSQL and Redis from the repo root with `docker-compose up -d`.
2. Create `apps/core-api/.env.local`.
3. Run `pnpm prisma:generate`.
4. Run `pnpm prisma:migrate:dev`.
5. Run `pnpm prisma:seed`.
6. Start the API with `pnpm dev`.
7. Open Swagger at `http://localhost:3333/docs` if `PORT=3333`.

## Demo Seed Data

- `nika@example.com` / `secret123`
- `bistro@example.com` / `secret123`
- `admin@example.com` / `secret123`
- `staff@example.com` / `secret123`

## Notes

- The app reads `PORT` from env and logs the Swagger URL at startup.
- CORS is driven by the comma-separated `CORS_ORIGINS` env var.
- Upload requests fail at startup if Spaces configuration is incomplete.
