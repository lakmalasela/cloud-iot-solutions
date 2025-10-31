# Telemetry Ingestor (minimal NestJS)

A minimal IoT Telemetry Ingestor built with NestJS + TypeScript.

Features
- POST /api/v1/telemetry (single or array) -> stores to MongoDB, caches latest per device in Redis
- Alerts to ALERT_WEBHOOK_URL when temperature>50 or humidity>90 (dedup 60s)
- GET /api/v1/devices/:deviceId/latest (Redis first, Mongo fallback)
- GET /api/v1/sites/:siteId/summary?from=ISO&to=ISO -> aggregation
- /health checks Mongo & Redis
- Simple Bearer auth for ingest via INGEST_TOKEN
- DTO validation, payload size limit, structured logs
  
---
## Setup

1. Copy `.env.example` to `.env` and set values:

```dotenv
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.xstks4a.mongodb.net/iotdb?retryWrites=true&w=majority
REDIS_URL=redis://localhost:6379
ALERT_WEBHOOK_URL=https://webhook.site/<your-uuid>
INGEST_TOKEN=secret123
PORT=3000

Install dependencies:

npm install
# or if you encounter issues
npm install --force

Run in development mode:

npm run start:dev


## Redis

Latest telemetry per device is cached in Redis.

- **Connection string:** `REDIS_URL` in `.env`  
- **Default:** `redis://localhost:6379`  

### Run Redis with Docker
docker run -d --name redis -p 6379:6379 redis:alpine


WebHook Site Info
- webhook site url : https://webhook.site/#!/view/36f4a8c6-000d-4d28-83fa-a156ec8ebcd4/286d5a9d-0346-4746-b3e7-22f19a29695e/1

<img width="1917" height="961" alt="image" src="https://github.com/user-attachments/assets/f6f69958-3061-45a3-a5f4-cbf9f56e9152" />



AI usage notes
- Used AI to scaffold the structure and suggest tests.
- Used AI to how to use WEBHOOK site.
- Reviewed and edited AI suggestions for security (added token guard, payload size checks).


API Examples

Send Telemetry Data

Single Telemetry Item:

curl -X POST http://localhost:3000/api/v1/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret123" \
  -d "{\"deviceId\":\"sensor-001\",\"siteId\":\"site-A\",\"ts\":\"2025-10-31T17:00:00.000Z\",\"metrics\":{\"temperature\":25.5,\"humidity\":60}}"


Multiple Telemetry Items (Array):

curl -X POST http://localhost:3000/api/v1/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret123" \
  -d "[{\"deviceId\":\"sensor-001\",\"siteId\":\"site-A\",\"ts\":\"2025-10-31T17:00:00.000Z\",\"metrics\":{\"temperature\":25.5,\"humidity\":60}},{\"deviceId\":\"sensor-002\",\"siteId\":\"site-A\",\"ts\":\"2025-10-31T17:01:00.000Z\",\"metrics\":{\"temperature\":55,\"humidity\":95}}]"


Test Alert Triggering (temperature > 50 or humidity > 90):

curl -X POST http://localhost:3000/api/v1/telemetry \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer secret123" \
  -d "[{\"deviceId\":\"sensor-003\",\"siteId\":\"site-B\",\"ts\":\"2025-10-31T17:05:00.000Z\",\"metrics\":{\"temperature\":75,\"humidity\":95}}]"


Query Data
Get Latest Telemetry for Device:

curl http://localhost:3000/api/v1/devices/sensor-001/latest


Get Site Summary:
curl "http://localhost:3000/api/v1/sites/site-A/summary?from=2025-10-31T00:00:00Z&to=2025-10-31T23:59:59Z"


  
