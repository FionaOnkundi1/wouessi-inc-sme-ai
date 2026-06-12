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

If the backend is unavailable, the app falls back to local demo generation.
