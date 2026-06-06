#!/bin/bash

set -e

case "$1" in
  uat)
    BRANCH="uat"
    PM2_NAME="core-api-uat"
    ;;
  prod)
    BRANCH="main"
    PM2_NAME="core-api-prod"
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
echo "================================="

git checkout $BRANCH
git pull origin $BRANCH

pnpm install --filter core-api...

pnpm --filter core-api prisma migrate deploy

pnpm --filter core-api build

pm2 restart $PM2_NAME --update-env

pm2 save

echo ""
echo "✅ Deployment completed successfully"
