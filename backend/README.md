# Wouessi Backend

TypeScript Express API for the voice-first SME website generator.

## What It Does

- Creates conversation sessions.
- Stores frontend checklist answers or a one-shot conversation transcript.
- Extracts structured business data using Adrian's Groq prompt/schema contract.
- Selects a website template and style tokens.
- Generates frontend-compatible site JSON for Fiona's React renderer.
- Saves preview/published websites in PostgreSQL with Prisma.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

The API runs at `http://localhost:4000`.

If `GROQ_API_KEY` is empty, the backend uses deterministic fallback extraction and template selection so the demo flow still works locally.

## Main Endpoints

```txt
GET  /api/health
POST /api/sessions
POST /api/sessions/:sessionId/answers
POST /api/extract-business-data
POST /api/generate-site
POST /api/generate-seo
POST /api/publish-site
GET  /api/sites/:siteId
```

## Example Flow

```bash
curl -X POST http://localhost:4000/api/sessions
```

```bash
curl -X POST http://localhost:4000/api/extract-business-data \
  -H "Content-Type: application/json" \
  -d '{"conversationText":"I sell handmade soy candles in Melbourne, about 50 units per week."}'
```

Use the returned `sessionId`:

```bash
curl -X POST http://localhost:4000/api/generate-site \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"PASTE_SESSION_ID"}'
```

Use the returned `siteId`:

```bash
curl -X POST http://localhost:4000/api/publish-site \
  -H "Content-Type: application/json" \
  -d '{"siteId":"PASTE_SITE_ID"}'
```
