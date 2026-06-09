# Merchant CMS

Nuxt 4 dashboard for KMRS admins and merchants.

## Current Scope

- login against the real `core-api`
- merchant self-registration against `POST /auth/register`
- cookie-backed access and refresh token session state
- automatic one-time API retry after token refresh on `401`
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
|  |  `- shops/
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
- `/register`
- `/dashboard`
- `/users`
- `/audit-logs`
- `/subscription`
- `/shops`
- `/shops/:shopId`
- `/shops/:shopId/catalog`

## Auth and State

- auth state is managed in Pinia
- access token cookie: `kmrs_access_token`
- refresh token cookie: `kmrs_refresh_token`
- selected shop cookie: `kmrs_selected_shop_id`
- the app initializes the session through `GET /auth/me`
- protected API calls retry once after a successful refresh on `401`
- logout clears cached Nuxt async data for the previous session
- login and register pages include show/hide password controls

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

- `nika@example.com` / `secret123`

Admin demo accounts are seeded by `apps/core-api/prisma/seed.ts`.

## Recent Updates

- added `/register` for merchant self-service account creation
- added automatic API refresh-and-retry handling through the shared API client
- removed duplicate dashboard auth bootstrap requests
- made async data keys session-aware to reduce stale data after account switching
- added local shop-access guards for `/shops/:shopId` and `/shops/:shopId/catalog`
- fixed sidebar dropdown groups so users can toggle them manually
- added show/hide password toggles to login and register forms

## Notes

- middleware files enforce guest-only and authenticated route access
- shop detail and catalog pages redirect back to `/shops` when the selected user cannot access the route shop
- there is currently no dedicated `lint` or `test` script in this app
