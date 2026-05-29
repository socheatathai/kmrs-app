# KMRS Production Deployment Checklist

## Production Server

* Provider: DigitalOcean
* API Domain: https://api.kmrs.tech
* Frontend: Vercel
* Database: PostgreSQL (localhost)
* Process Manager: PM2
* Reverse Proxy: Nginx

---

# Backend Deployment Flow

## 1. Push code from local

```bash
git add .
git commit -m "feat: update message"
git push
```

---

## 2. SSH into production server

```bash
ssh root@178.128.17.189
```

---

## 3. Go to production project

```bash
cd ~/kmrs-app-prod
```

---

## 4. Pull latest code

```bash
git pull
```

---

## 5. Install dependencies

```bash
pnpm install --network-concurrency=1 --child-concurrency=1
```

---

## 6. Build backend

```bash
pnpm --filter core-api build
```

---

## 7. Run database migration

```bash
cd apps/core-api
pnpm prisma migrate deploy
pnpm prisma generate
```

---

## 8. Restart API

```bash
pm2 restart core-api-prod
pm2 save
```

---

## 9. Verify API status

```bash
pm2 status
pm2 logs core-api-prod --lines 50
```

---

## 10. Test production API

```bash
curl https://api.kmrs.tech/docs
```

---

# Database Backup

## Create backup

```bash
pg_dump -U kmrs_user -h localhost kmrs_db > ~/db-backups/kmrs_db_$(date +%F).sql
```

## Verify backup

```bash
ls -lh ~/db-backups
```

---

# Database Restore

```bash
psql -U kmrs_user -h localhost kmrs_db < ~/db-backups/FILENAME.sql
```

---

# PM2 Commands

## Status

```bash
pm2 status
```

## Logs

```bash
pm2 logs core-api-prod
```

## Monitor

```bash
pm2 monit
```

---

# Nginx Commands

## Test config

```bash
nginx -t
```

## Restart nginx

```bash
systemctl restart nginx
```

---

# Important Rules

* Never push `.env` to GitHub
* Always backup database before risky migrations
* Always test `/docs` after deployment
* Do not modify production server structure frequently
* Keep infrastructure simple until scaling is required
