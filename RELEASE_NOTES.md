# Release Notes

## Phase 3 Real Public Website Publishing

### Completed Features

- Added signed-in owner publishing and unpublishing with stable published snapshots.
- Added a public read-only API that exposes published snapshots only.
- Added a Next.js App Router application for real public website pages at stable slug URLs.
- Added page-specific titles, descriptions, keywords, canonical URLs, and Open Graph metadata.
- Matched published website templates, colours, typography, and responsive layouts to the editor preview.
- Added editor controls to publish, republish, unpublish, open live websites, and copy public links.
- Added dashboard links for opening published websites.
- Kept later draft edits private until the owner explicitly republishes.
- Kept contact forms demo-only with explicit no-delivery messaging and no fake success behavior.

### Security And Ownership

- Publishing and unpublishing require the signed-in website owner.
- Public routes do not expose draft identifiers, private draft content, claim tokens, or owner details.
- Unpublished and legacy published records without snapshots return not found.
- Real credentials remain excluded from tracked files.

### Current Limitations

- Published websites require the backend API and Next.js public renderer to be running.
- Contact forms do not send messages and clearly direct visitors to verified contact details.
- Custom domains, deployment automation, payments, analytics, multilingual support, and AI-generated images remain deferred.

### Verification

```bash
npm run build:frontend
npm run build:backend
npm run build:public-site
npm run test:backend
npm run test:public-site
```

## Phase 3 Security Cleanup

This maintenance change prepares the application for public publishing without changing runtime behaviour.

### Security Fixes

- Replaced tracked environment credential examples with explicit non-secret placeholders.
- Documented that real credentials belong only in ignored local environment files or encrypted deployment settings.
- Added the required revoke-and-rotate procedure for accidentally exposed credentials.
- Confirmed that only safe `.env.example` files are tracked.

### Required Operator Action

- Revoke and rotate any Clerk secret that was previously committed or shared.
- Store the replacement only in local or deployment environment variables.
- Confirm Clerk sign-in and draft ownership using the replacement secret before deployment.

## Phase 1 Stabilisation

This release stabilises the existing capstone application without adding Phase 2 product features.

### Completed Features

- Voice or text business-description input.
- Guided follow-up questions with speech and text answers.
- Backend speech transcription through Groq Whisper.
- Structured business-data extraction with validated fallback behavior.
- AI-assisted template and style selection.
- Generated multi-page React website preview.
- Editable website sections with AI requests routed through Express.
- PostgreSQL and Prisma storage for sessions, businesses, and generated website records.
- Preview and publish-status API endpoints.

### Phase 1 Fixes

- Aligned the `competitorReference` field across the AI schema, fallback extraction, API persistence mapping, Prisma model, migration, and tests.
- Restored a passing backend TypeScript production build.
- Made backend installation generate the Prisma client so clean test runs initialise correctly.
- Moved editable-section AI calls, prompts, response validation, retry handling, and fallback behavior out of the browser and into Express.
- Removed the duplicate legacy `backend/ai/` implementation.
- Removed the archived frontend ZIP from active source control.
- Marked static HTML templates as design references rather than runtime code.
- Documented frontend/backend environment boundaries and required variables.

### Historical Phase 1 Bugs And Limitations

- The items below describe the Phase 1 baseline. Authentication, persistent editing, dashboards, and public rendering were completed in later phases.
- At the Phase 1 baseline, the generated-site contact form displayed a fake success state. Phase 3 now marks it as demo-only.
- Initial frontend generation can silently use local demo fallback data when the backend is unavailable.
- Some generated-site fallback content includes generic products, metrics, testimonials, or prices that have not been confirmed by the business owner.
- Static HTML templates are not connected to the React runtime.
- The frontend build reports a Vite CommonJS API deprecation warning.
- The backend dependency tree reports that Multer 1.x is deprecated.
- A clean backend install currently reports six dependency vulnerabilities: three moderate, two high, and one critical. Dependency upgrades require a separately reviewed maintenance change.

### Historical Phase 1 Deferred Features

- Real contact-form delivery.
- Payments and subscriptions.
- Custom domains.
- Analytics.
- Multilingual support.
- AI-generated images.
- Enterprise infrastructure and advanced monitoring.

### Verification

Phase 1 requires the following commands to pass:

```bash
npm run build:frontend
npm run build:backend
npm run test:backend
```

Real `.env` files and API keys must remain untracked. Only `.env.example` files with placeholder values belong in source control.
