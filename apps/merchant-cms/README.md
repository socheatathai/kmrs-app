# Merchant CMS

Nuxt 4 dashboard for KMRS admins and merchants.

## Current Scope

- login against the real `core-api`
- cookie-backed access and refresh token session state
- role-based admin vs merchant mode
- permission-aware navigation and route guards
- shop selection for merchant users
- admin account management
- admin audit log listing
- merchant shop, category, product, QR code, and subscription screens

## Environment

Create a local env file:

```powershell
Copy-Item .env.example .env.local
```

Recommended local values:

```env
NUXT_PUBLIC_API_BASE="http://localhost:3333"
NUXT_PUBLIC_APP_NAME="Merchant CMS"
```

Notes:

- `NUXT_PUBLIC_API_BASE` should point to the `core-api` origin.
- if unset, the app falls back to `http://localhost:3333`.

## Commands

```sh
pnpm dev
pnpm build
pnpm generate
pnpm preview
pnpm typecheck
```

Recommended local run:

```sh
pnpm dev -- --port 3000
```

## Project Structure

```text
apps/merchant-cms/
|- app/
|  |- assets/
|  |  `- css/
|  |- composables/
|  |- constants/
|  |- layouts/
|  |- middleware/
|  |- pages/
|  |  |- admin/
|  |  `- merchant/
|  |- stores/
|  `- app.vue
|- public/
|- .env.example
|- nuxt.config.ts
`- package.json
```

## Main Routes

Shared:

- `/`
- `/login`
- `/dashboard`
- `/settings`
- `/products`
- `/users`

Admin:

- `/admin/dashboard`
- `/admin/accounts`
- `/admin/accounts/create`
- `/admin/accounts/:userId`
- `/admin/audit-logs`
- `/admin/settings`

Merchant:

- `/merchant/dashboard`
- `/merchant/subscription`
- `/merchant/settings`
- `/merchant/shops`
- `/merchant/shops/:shopId/settings`
- `/merchant/shops/:shopId/categories`
- `/merchant/shops/:shopId/products`
- `/merchant/shops/:shopId/qrcodes`

## Auth and State

- auth state is managed in Pinia
- access token cookie: `kmrs_access_token`
- refresh token cookie: `kmrs_refresh_token`
- selected shop cookie: `kmrs_selected_shop_id`
- the app refreshes the session if `GET /auth/me` returns `401`

## API Usage

The app uses `@kmrs-app/api-client` for:

- auth
- shops
- categories
- products
- QR codes
- subscriptions
- users
- audit logs
- uploads

## Demo Login

The login page is prefilled for local development with:

- `merchant@example.com` / `secret123`

Admin demo accounts are seeded by `apps/core-api/prisma/seed.ts`.

## Notes

- middleware files enforce auth, admin-only, merchant-only, and permission-based route access
- `app/pages/dashboard.vue`, `app/pages/settings.vue`, `app/pages/products/index.vue`, and `app/pages/users/index.vue` act as compatibility redirects
- there is currently no dedicated `lint` or `test` script in this app
