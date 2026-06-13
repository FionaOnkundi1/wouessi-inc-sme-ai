# Release Notes

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

### Known Bugs And Limitations

- Generated section edits are stored only in browser memory and are lost after refresh.
- Publishing marks a website record as published but does not render a real public website page.
- The generated-site contact form displays a success state but does not send a message.
- The application has no authentication, owner accounts, or dashboard.
- Private draft ownership and access control are not implemented.
- Initial frontend generation can silently use local demo fallback data when the backend is unavailable.
- Some generated-site fallback content includes generic products, metrics, testimonials, or prices that have not been confirmed by the business owner.
- Static HTML templates are not connected to the React runtime.
- The frontend build reports a Vite CommonJS API deprecation warning.
- The backend dependency tree reports that Multer 1.x is deprecated.
- A clean backend install currently reports six dependency vulnerabilities: three moderate, two high, and one critical. Dependency upgrades require a separately reviewed maintenance change.

### Deferred Features

- Authentication and website ownership.
- Persistent generated-site editing.
- User dashboard for drafts and published sites.
- Real public website rendering and SEO-friendly Wouessi URLs.
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
