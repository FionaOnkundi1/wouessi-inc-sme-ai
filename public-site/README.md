# Wouessi Public Site Renderer

Next.js App Router application for read-only published websites.

The renderer fetches only the backend public snapshot endpoint:

```txt
GET /api/public/sites/:slug
```

Draft content, editing controls, Clerk authentication, and private APIs are not used by this application.

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open a published slug at:

```txt
http://localhost:3000/sites/:slug
```

## Environment

```env
API_BASE_URL=http://localhost:4000
PUBLIC_SITE_BASE_URL=http://localhost:3000
```

## Verification

```bash
npm run test
npm run build
```

Published contact pages show verified contact details. The contact-form area is explicitly marked unavailable and does not display a fake success state.
