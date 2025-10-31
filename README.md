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

Quick start
1. Copy `.env.example` to `.env` and set values (MONGO_URI, REDIS_URL, ALERT_WEBHOOK_URL).
2. Install deps:
   ```
   npm install
   ```
3. Run in dev:
   ```
   npm run start:dev
   ```
4. Tests (not exhaustive):
   ```
   npm run test
   ```
   <img width="1917" height="961" alt="image" src="https://github.com/user-attachments/assets/b85dc9d2-638e-4554-847b-0bf1f09c1809" />


AI usage notes
- Used AI to scaffold the NestJS controller/service structure and suggest tests.
- Used AI to draft DTO validation decorators and aggregation query.
- Reviewed and edited AI suggestions for security (added token guard, payload size checks).
