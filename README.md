# VideoHub MVP

A full-stack MVP video platform inspired by YouTube.

## Stack
- Backend: NestJS (TypeScript)
- DB: PostgreSQL + Prisma
- Cache/Queue: Redis + BullMQ
- Storage: MinIO (S3-compatible)
- Transcoding: FFmpeg worker
- Frontend: Next.js + Tailwind

## Repository Structure
```
backend/               NestJS API
  prisma/              Prisma schema, migrations, seed
  src/                 API modules
  test/                E2E tests
worker/                BullMQ + FFmpeg transcoder
frontend/              Next.js UI
```

## Local Setup
1. Copy env file and update if needed:
   ```bash
   cp .env.example .env
   ```
2. Start services:
   ```bash
   docker compose up --build
   ```
3. Run migrations + seed:
   ```bash
   docker compose exec backend npx prisma migrate deploy
   docker compose exec backend npx prisma db seed
   ```

## Architecture Overview
1. Client uploads a video via `POST /videos/upload` (multipart).
2. Backend stores the original in S3 (MinIO), creates a DB record, and enqueues a BullMQ job.
3. Worker downloads the source, transcodes 360p/720p, generates a thumbnail, uploads to S3, and updates assets in Postgres.
4. Feed endpoint mixes trending videos (24h views) with personalized tag history (last 72h). If unauthenticated, only trending data is returned.

## API Samples
### Register
```bash
curl -X POST http://localhost:4000/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@videohub.local","password":"password123","displayName":"Demo"}'
```

### Login
```bash
curl -X POST http://localhost:4000/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"demo@videohub.local","password":"password123"}'
```

### Upload
```bash
curl -X POST http://localhost:4000/videos/upload \
  -H "Authorization: Bearer <ACCESS_TOKEN>" \
  -F "title=My First Video" \
  -F "description=Hello VideoHub" \
  -F "tags=[\"intro\",\"demo\"]" \
  -F "visibility=PUBLIC" \
  -F "file=@/path/to/video.mp4"
```

### Feed
```bash
curl http://localhost:4000/feed/recommended
```

## Key Endpoints
- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /users/me`, `PATCH /users/me`, `GET /users/:id`
- `POST /videos/upload`, `GET /videos/:id`, `GET /videos/:id/comments`, `POST /videos/:id/comments`, `POST /videos/:id/like`
- `GET /feed/recommended`

## Tests
```bash
docker compose exec backend npm run test:e2e
```

## Frontend Usage
- Home: http://localhost:3000
- Upload: http://localhost:3000/upload
- Watch: http://localhost:3000/watch/<videoId>
- Channel: http://localhost:3000/channel/<userId>

## Verify Upload Flow
1. Register + login in UI; access token stored in localStorage.
2. Open `/upload`, choose a file, submit.
3. Watch logs from the worker for FFmpeg processing.
4. Open `/watch/<videoId>` to stream.
