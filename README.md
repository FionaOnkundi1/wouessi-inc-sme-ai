# Wouessi SME AI

Voice-first small business website generator with a React frontend and a TypeScript/Express backend.

## Runtime Architecture

```txt
frontend/   React + Vite generator, guided conversation, preview, and editor UI
backend/    Express API, Prisma persistence, speech transcription, and all AI requests
public-site/ Next.js read-only renderer for published website snapshots
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
npm ci --prefix public-site
```

Create local environment files:

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
cp public-site/.env.example public-site/.env.local
```

Set `DATABASE_URL` in `backend/.env`. `GROQ_API_KEY` is optional for local fallback behavior. Clerk keys are optional for anonymous generation but required to save drafts to an account.

Prepare Prisma:

```bash
npm run prisma:generate
npm run prisma:migrate
```

Run the applications in separate terminals:

```bash
npm run dev:frontend
npm run dev:backend
npm run dev:public-site
```

The frontend runs at `http://localhost:5173`, the API at `http://localhost:4000`, and published websites at `http://localhost:3000/sites/:slug`.

## Build And Test

```bash
npm run build:frontend
npm run build:backend
npm run build:public-site
npm run test:backend
npm run test:public-site
```

## Runtime Notes

- Initial generation uses backend extraction and site-generation endpoints, with a local frontend fallback if the backend is unavailable.
- Speech transcription and editable-section regeneration require the backend.
- Generated websites are stored as structured JSON for the React renderer.
- Generated-site edits are persisted through the backend and restored from draft URLs after refresh.
- The current publish endpoint marks a database record as published; real public-page rendering is not yet implemented.

## Reference Templates

The files in `templates/` are historical static HTML prototypes used as visual references. They are not populated, served, or published by the current runtime. See `docs/template-system/README.md` for the archived design contract.

## Environment Variables

Frontend (`frontend/.env.local`):

```env
VITE_API_URL=http://localhost:4000
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

Backend:

```env
NODE_ENV=development
PORT=4000
FRONTEND_ORIGIN=http://localhost:5173
PUBLIC_BASE_URL=http://localhost:4000
PUBLIC_SITE_BASE_URL=http://localhost:3000
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/wouessi?schema=public
GROQ_API_KEY=
GROQ_MODEL=llama-3.3-70b-versatile
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

`VITE_CLERK_PUBLISHABLE_KEY` and `CLERK_PUBLISHABLE_KEY` must refer to the same Clerk application. Never expose `CLERK_SECRET_KEY` to the frontend or commit real `.env` files and API credentials.

The tracked `.env.example` files contain placeholders only. Put real credentials in ignored local `.env` files or the deployment platform's encrypted environment-variable settings.

## Credential Safety

If a credential is accidentally committed or shared:

1. Revoke or rotate it immediately with the provider.
2. Update the replacement only in ignored local environment files and deployment secrets.
3. Remove the exposed value from tracked documentation and source files.
4. Run a tracked-file secret scan before committing.

Removing a credential from the latest Git commit does not invalidate copies in earlier history. Rotation is required; do not rely on rewriting Git history.
