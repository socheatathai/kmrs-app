#!/bin/bash

set -e

echo "================================="
echo "Deploying KMRS Production API"
echo "================================="

git checkout main
git pull origin main

pnpm install --filter core-api...

pnpm --filter core-api build

pm2 restart core-api-prod --update-env

pm2 save

echo ""
echo "✅ Production deployment completed"
