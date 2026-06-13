# Wouessi SME AI

Voice-first small business website generator with a React frontend and a TypeScript/Express backend.

## Runtime Architecture

```txt
frontend/   React + Vite generator, guided conversation, preview, and editor UI
backend/    Express API, Prisma persistence, speech transcription, and all AI requests
templates/  Static HTML design references only; not used by the running application
docs/       Product, AI contract, test-case, and template-reference documentation
tools/      One-off design helper tools; not used by the running application
```

All AI provider calls and credentials belong in the backend. The frontend calls the Express API through `VITE_API_URL`.

## Local Setup

Install dependencies:

```bash
npm ci --prefix frontend
npm ci --prefix backend
```

Create local environment files:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Set `DATABASE_URL` in `backend/.env`. `GROQ_API_KEY` is optional for local fallback behavior.

Prepare Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Run the applications in separate terminals:

```bash
npm run dev:frontend
npm run dev:backend
```

The frontend runs at `http://localhost:5173` and the API runs at `http://localhost:4000`.

## Build And Test

```bash
npm run build:frontend
npm run build:backend
npm run test:backend
```

## Runtime Notes

- Initial generation uses backend extraction and site-generation endpoints, with a local frontend fallback if the backend is unavailable.
- Speech transcription and editable-section regeneration require the backend.
- Generated websites are stored as structured JSON for the React renderer.
- The current publish endpoint marks a database record as published; real public-page rendering is not yet implemented.

## Reference Templates

The files in `templates/` are historical static HTML prototypes used as visual references. They are not populated, served, or published by the current runtime. See `docs/template-system/README.md` for the archived design contract.

## Environment Variables

Frontend:

```env
VITE_API_URL=http://localhost:4000
```

Backend:

```env
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:4000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/wouessi_backend?schema=public
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
```

Never commit real `.env` files or API credentials.
