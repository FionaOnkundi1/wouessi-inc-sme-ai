# Wouessi Backend

TypeScript Express API for the voice-first SME website generator.

## What It Does

- Creates conversation sessions.
- Stores frontend checklist answers or a one-shot conversation transcript.
- Extracts structured business data using Adrian's Groq prompt/schema contract.
- Selects a website template and style tokens.
- Regenerates editable website sections without exposing AI credentials to the browser.
- Generates frontend-compatible site JSON for Fiona's React renderer.
- Saves preview/published websites in PostgreSQL with Prisma.
- Assigns authenticated drafts to Clerk users and protects anonymous drafts with expiring claim tokens.
- Persists generated-site edits so drafts can be restored after refresh.

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

Clerk keys are optional for anonymous generation. Set `CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` to enable account ownership and draft claiming.

## Main Endpoints

```txt
GET  /api/health
POST /api/sessions
POST /api/sessions/:sessionId/answers
POST /api/extract-business-data
POST /api/generate-site
POST /api/generate-seo
POST /api/regenerate-section
POST /api/sites/:siteId/publish
POST /api/sites/:siteId/unpublish
GET  /api/public/sites/:slug
GET  /api/sites/:siteId
PATCH /api/sites/:siteId
POST /api/sites/:siteId/claim
```

Private draft requests use either a Clerk bearer token or the one-time anonymous token returned during creation:

```txt
Authorization: Bearer CLERK_SESSION_TOKEN
X-Wouessi-Claim-Token: ANONYMOUS_CLAIM_TOKEN
```

Publishing and unpublishing require the signed-in owner. The public site endpoint requires no authentication and returns only the stable snapshot created during the most recent publish action. Later draft edits remain private until the owner republishes.

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
  -H "X-Wouessi-Claim-Token: PASTE_CLAIM_TOKEN" \
  -d '{"sessionId":"PASTE_SESSION_ID"}'
```

Use the returned `siteId`:

```bash
curl -X POST http://localhost:4000/api/sites/PASTE_SITE_ID/publish \
  -H "Authorization: Bearer CLERK_SESSION_TOKEN"
```
