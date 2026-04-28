# Wouessi — Voice-First Website Generator (MVP Demo)

Speak a one-sentence business description → AI extracts structured data → instant storefront.

## Quick start — no API key needed

```bash
# 1. Install dependencies
npm install

# 2. Add your Anthropic API key
cp .env.example .env
# Open .env and replace the placeholder with your key

# 3. Run the dev server
npm run dev
```

Then open http://localhost:5173 in your browser.

## Project structure

```
src/
  components/
    InputScreen.jsx       # Screen 1 — mic button, text input, example chips
    InputScreen.module.css
    ProcessingScreen.jsx  # Screen 2 — animated 4-step pipeline
    ProcessingScreen.module.css
    GeneratedSite.jsx     # Screen 3 — full rendered storefront + SEO preview
    GeneratedSite.module.css
  services/
    aiService.js          # Anthropic API call — extracts business JSON from text
    speechService.js      # Web Speech API wrapper
  data/
    examples.js           # 4 preset demo businesses (offline fast path)
  App.jsx                 # Orchestrates screens and pipeline state
  App.module.css
  index.css               # Global reset and CSS variables
main.jsx                  # React entry point
```

## How the pipeline works

1. **Voice / Text input** — user speaks or types a business description
2. **AI extraction** — `aiService.js` sends the text to Claude (`claude-sonnet-4-20250514`)
   and gets back structured JSON: name, tagline, products, SEO metadata, etc.
3. **Site generation** — `GeneratedSite.jsx` renders the storefront from the JSON
4. **SEO preview** — Google-style meta title/description displayed below the site

## API key setup

The demo calls the Anthropic API directly from the browser (using the
`anthropic-dangerous-direct-browser-access` header). This is fine for a local
demo but **in production the API call should be proxied through your backend**
so the key is never exposed client-side.

## Next steps (Weeks 3–8)

- Replace `speechService.js` with a server-side Whisper call for accent tolerance
- Add chatbot widget to the generated site (Week 6)
- Expand SEO output and add meta tag injection (Week 5)
- Add template variation selector (storefront / service / portfolio)
- Persist generated sites to a database

## Tech stack

- React 18 + Vite
- CSS Modules
- Anthropic Claude API (claude-sonnet-4)
- Web Speech API (browser-native, no extra dependency)
