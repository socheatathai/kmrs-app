# Customer Web

Next.js app for the customer-facing KMRS experience.

## Commands

```sh
pnpm dev
pnpm build
pnpm lint
pnpm check-types
```

Default local URL: `http://localhost:3000`

## Notes

- The workspace root is pinned in `next.config.ts` to avoid incorrect monorepo root inference.
- Local development falls back to `http://localhost:3333` when `BASE_URL` is unset.
- Production deployments must set `BASE_URL` to the deployed `core-api` origin.
