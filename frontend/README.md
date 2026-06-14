# Wouessi Frontend

React + Vite frontend for the Wouessi voice website generator.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

Copy `frontend/.env.example` to `frontend/.env.local` for frontend-only variables:

```env
VITE_API_URL=http://localhost:4000
VITE_CLERK_PUBLISHABLE_KEY=
```

If the backend is unavailable, initial website generation can fall back to local demo data. Speech transcription and editable-section regeneration require the Express backend.

The Clerk publishable key is optional; without it the app remains usable anonymously but account saving is disabled. AI provider credentials and Clerk secret keys must never be added to frontend environment variables. The frontend sends AI-assisted requests to the Express API through `VITE_API_URL`.

Generated drafts use a `?draft=<siteId>` URL. Section edits are saved through the backend and restored from PostgreSQL when that URL is refreshed. Anonymous drafts require their session claim token; owned drafts require the signed-in Clerk user.
