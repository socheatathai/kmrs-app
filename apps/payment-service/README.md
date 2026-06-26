# Payment Service

Spring Boot internal service for KMRS payment records.

## Run

```powershell
cd apps/payment-service
mvn spring-boot:run
```

Default local URL:

```text
http://localhost:8083
```

Health check:

```text
GET /actuator/health
```

All non-health endpoints require:

```text
X-Internal-Service-Token: change-me-local-token
```

Configure with:

```env
PORT=8083
DATABASE_URL=jdbc:postgresql://localhost:55432/kmrs_dev?currentSchema=payment
DATABASE_USERNAME=kmrs_user
DATABASE_PASSWORD=kmrs_password
INTERNAL_SERVICE_TOKEN=change-me-local-token
```
