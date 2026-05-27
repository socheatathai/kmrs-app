# Docker Setup

This project includes Docker support for local development and production deployment.

## Prerequisites

- Docker
- Docker Compose

## Getting Started with Docker

### Start Development Environment

```bash
docker-compose up -d
```

This will start:
- **PostgreSQL 16** on `localhost:5432`
- **Redis 7** on `localhost:6379`

### Stop Services

```bash
docker-compose down
```

### View Logs

```bash
docker-compose logs -f postgres
docker-compose logs -f redis
```

### Connect to PostgreSQL

```bash
docker exec -it kmrs-postgres psql -U kmrs_user -d kmrs_dev
```

### Build Core API Docker Image

```bash
docker build -t kmrs-core-api:latest .
```

### Run Core API Container

```bash
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://kmrs_user:kmrs_password@postgres:5432/kmrs_dev" \
  -e PORT=3000 \
  -e JWT_SECRET="your-secret-key" \
  -e NODE_ENV="production" \
  kmrs-core-api:latest
```

### Production Deployment

Create a `docker-compose.prod.yml` with production-specific settings (stronger passwords, proper secrets, etc.) and deploy using:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Port Already in Use

If port 5432 or 6379 is already in use, modify the port mapping in `docker-compose.yml`:

```yaml
ports:
  - "5433:5432"  # Changed to 5433
  - "6380:6379"  # Changed to 6380
```

### Database Connection Issues

Ensure the database is healthy before starting the API:

```bash
docker-compose ps
```

Wait for `STATUS` to show "healthy" before connecting.

### Clean Everything

To remove volumes and start fresh:

```bash
docker-compose down -v
```
