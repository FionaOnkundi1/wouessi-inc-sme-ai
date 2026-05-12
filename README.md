# Wouessi Inc. — Voice-First SME Website Generator

AI-powered website generator prototype for small businesses.

Users describe their business through voice or text, and the platform automatically extracts business information and generates a website preview.

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

# AI Features

- Prompt-engineered structured extraction
- JSON schema validation
- Website vibe inference
- Marketing tagline generation
- Business description generation
- Missing information detection
- Confidence scoring
- Automated AI testing pipeline

---

# Project Structure

```text
/backend
  /ai
    client.js
    extractBusinessData.js
    promptTemplate.js
    runTests.js
    schema.js
    testInputs.json

/docs
  ai-output-schema.md
  extraction-prompt.md
  test-cases.md
```

---

# Environment Setup

## Install dependencies

```bash
npm install
```

## Create environment file

Create:

```text
.env
```

Add:

```env
GROQ_API_KEY=your_api_key_here
```

---

# Run AI Tests

```bash
npm run test:ai
```

This runs all AI extraction test cases and validates structured outputs.

---

# Team Roles

## Engineer 1
Frontend UI and microphone integration

## Engineer 2
Backend APIs and orchestration

## Engineer 3
AI prompts, extraction pipeline, schema validation, structured outputs

## Engineer 4
Website generation and SEO integration

## Engineer 5
Integration testing and QA

---

# Current Status

- AI extraction pipeline completed
- Real LLM integration completed
- Structured JSON validation completed
- Automated testing completed
- Prompt engineering completed

---

# Future Improvements

- Retry handling for malformed JSON
- Multi-provider AI failover
- SEO generation expansion
- AI chatbot integration
- Multi-page website generation
- Advanced template personalization