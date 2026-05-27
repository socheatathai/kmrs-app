# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build

# Runtime stage
FROM node:20-alpine

WORKDIR /app

RUN npm install -g pnpm

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./

RUN pnpm install --prod --frozen-lockfile

COPY --from=builder /app/apps/core-api/dist ./dist
COPY --from=builder /app/apps/core-api/prisma ./prisma

EXPOSE 3000

CMD ["node", "dist/main"]
