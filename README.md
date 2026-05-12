# Wouessi Inc. — Voice-First SME Website Generator

AI-powered website generator prototype for small businesses.

Users describe their business through voice or text, and the platform automatically extracts business information, selects a website design style, and generates a website preview.

---

# Project Overview

This project is a capstone prototype focused on simplifying website creation for SMEs through conversational AI.

Core flow:

```text
Speak or type
        ↓
Speech-to-text / conversation capture
        ↓
AI business information extraction
        ↓
Structured JSON generation
        ↓
AI template + style selection
        ↓
Website template generation
        ↓
Preview and publishing
```

---

# Tech Stack

## Frontend
- React / Next.js

## Backend
- Node.js

## AI / LLM
- Groq API
- Llama 3.3 70B

## Data
- JSON-based structured extraction

---

# AI Extraction System

The AI extraction system converts business conversations into structured JSON data for website generation.

Example input:

```text
I sell handmade candles in Melbourne. My customers are people buying gifts or home decoration.
```

Example output:

```json
{
  "businessName": "Melbourne Candle Studio",
  "businessType": "Handmade Candles",
  "productsOrServices": "Handmade Candles",
  "location": "Melbourne",
  "targetCustomers": "People buying gifts or home decoration",
  "uniqueSellingPoint": "Handmade by the owner",
  "websiteVibe": "warm",
  "extraFeatures": "",
  "tagline": "Illuminate your space with love and care",
  "shortDescription": "Handmade candles crafted with love and care, perfect for gifting or decorating your home.",
  "contactHint": "",
  "missingFields": [
    "phone number",
    "email address"
  ],
  "confidence": "medium"
}
```

---

# AI Template Selection System

The AI template selection system decides:
- which website template should be used
- color palette
- typography style
- layout emphasis

based on the extracted business information.

Example output:

```json
{
  "selectedTemplate": "warm-template",
  "colorPalette": "warm-earth",
  "fontPairing": "friendly-rounded",
  "sectionEmphasis": "product-focused",
  "reason": "Handmade candles with a warm brand vibe fit a friendly visual style."
}
```

---

# AI Features

- Prompt-engineered structured extraction
- JSON schema validation
- Website vibe inference
- Marketing tagline generation
- Business description generation
- Missing information detection
- Confidence scoring
- AI-driven template selection
- AI-driven styling decisions
- Automated AI testing pipeline

---

# Project Structure

```text
/backend
  /ai
    client.js
    extractBusinessData.js
    templateSelection.js
    promptTemplate.js
    runTests.js
    runTemplateTest.js
    schema.js
    testInputs.json

/docs
  ai-output-schema.md
  extraction-prompt.md
  test-cases.md
```

---

# Environment Setup

## 1. Install dependencies

```bash
npm install
```

---

## 2. Create environment file

Create:

```text
.env
```

Add:

```env
GROQ_API_KEY=your_api_key_here
```

---

# How To Run

## Run AI extraction tests

```bash
npm run test:ai
```

This tests:
- AI extraction
- JSON validation
- business information generation
- missing field handling

---

## Run template selection tests

```bash
npm run test:template
```

This tests:
- AI template selection
- AI styling decisions
- design token generation

---

# AI Architecture

## Layer 1 — Extraction

```text
Conversation
        ↓
AI extraction
        ↓
Structured business JSON
```

---

## Layer 2 — Design Intelligence

```text
Business JSON
        ↓
AI template/style selection
        ↓
Design tokens
```

---

# Team Roles

## Engineer 1
Frontend UI and microphone integration

## Engineer 2
Backend APIs and orchestration

## Engineer 3
AI prompts, extraction pipeline, template selection pipeline, schema validation, structured outputs

## Engineer 4
Website templates and frontend rendering

## Engineer 5
Integration testing and QA

---

# Current Status

- AI extraction pipeline completed
- Real LLM integration completed
- Structured JSON validation completed
- Automated testing completed
- Prompt engineering completed
- AI template selection pipeline completed

---

# Future Improvements

- Retry handling for malformed JSON
- Multi-provider AI failover
- SEO generation expansion
- AI chatbot integration
- Multi-page website generation
- Advanced template personalization
- Dynamic section generation