# Wouessi Frontend

React + Vite frontend for the Wouessi voice website generator.

## Run

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

Copy `frontend/.env.example` to `frontend/.env` for frontend-only variables:

```env
VITE_API_URL=http://localhost:4000
```

If the backend is unavailable, initial website generation can fall back to local demo data. Speech transcription and editable-section regeneration require the Express backend.

AI provider credentials must never be added to frontend environment variables. The frontend sends AI-assisted requests to the Express API through `VITE_API_URL`.
