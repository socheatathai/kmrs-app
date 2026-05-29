# Customer Web

Next.js app for the public KMRS menu experience.

## Current Scope

- landing page describing slug-based routes
- menu page at `/:slug`
- product detail page at `/:slug/products/:productId`
- server-side fetches from `core-api`
- category filtering and search
- Khmer / English UI copy
- QR scan tracking when the page is opened with `?source=qr`

## Environment

Create a local env file:

```powershell
Copy-Item .env.example .env.local
```

Recommended local values:

```env
BASE_URL=http://localhost:3333
PUBLIC_MENU_BASE_URL=http://localhost:4200
```

Notes:

- `BASE_URL` must point to the `core-api` origin.
- in non-production, the app falls back to `http://localhost:3333` if `BASE_URL` is unset
- in production, `BASE_URL` is required

## Commands

```sh
pnpm dev
pnpm build
pnpm start
pnpm lint
pnpm check-types
```

Recommended local run:

```sh
pnpm dev -- --port 4200
```

## Project Structure

```text
apps/customer-web/
|- app/
|  |- [slug]/
|  |  `- products/
|  |     `- [productId]/
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
`- package.json
```

## Routes

- `/`
- `/:slug`
- `/:slug/products/:productId`

Example:

- `/sunrise-cafe`
- `/sunrise-cafe/products/<product-id>`

## API Usage

The app reads from public API endpoints:

- `GET /menu/:slug`
- `GET /menu/:slug/categories`
- `GET /menu/:slug/products`
- `GET /menu/:slug/products/:productId`
- `POST /menu/:slug/qr-scan`

Implementation notes:

- API responses are validated with `zod`
- fetches use `cache: "no-store"`
- `404` responses are converted into Next.js `notFound()`
- React Query is used on the client for QR scan tracking

## Local URL

If started with the recommended port:

- `http://localhost:4200`

## Notes

- `next.config.ts` pins the Turbopack root to the workspace root.
- remote images are allowed from both `http` and `https` hosts through `images.remotePatterns`.
