#!/bin/bash

set -Eeuo pipefail

case "${1:-}" in
  uat)
    BRANCH="uat"
    PM2_NAME="core-api-uat"
    API_PORT="3334"
    ;;
  prod)
    BRANCH="main"
    PM2_NAME="core-api-prod"
    API_PORT="3333"
    ;;
  *)
    echo "Usage: ./build.sh [uat|prod]"
    exit 1
    ;;
esac

echo "================================="
echo "Deploying: $1"
echo "Branch: $BRANCH"
echo "PM2: $PM2_NAME"
echo "API port: $API_PORT"
echo "================================="

export NODE_COMPILE_CACHE="/tmp/kmrs-node-compile-cache/$PM2_NAME"

if find . -path ./.git -prune -o -user root -print -quit | grep -q .; then
  echo "Root-owned files found inside this repo."
  echo "Run: sudo chown -R $(id -un):$(id -gn) $(pwd)"
  exit 1
fi

git checkout "$BRANCH"
git pull origin "$BRANCH"

CI=true pnpm install --frozen-lockfile

pnpm --filter core-api prisma:migrate:deploy
pnpm --filter core-api build

pm2 restart "$PM2_NAME" --update-env

curl --fail --silent --show-error "http://localhost:$API_PORT/docs" > /dev/null

pm2 save

echo ""
echo "Deployment completed successfully"
