#!/bin/bash

set -e

echo "================================="
echo "Deploying KMRS UAT API"
echo "================================="

git checkout uat
git pull origin uat

pnpm install --filter core-api...

pnpm --filter core-api build

pm2 restart core-api-uat --update-env

pm2 save

echo ""
echo "✅ UAT deployment completed"
