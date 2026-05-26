# AI Extraction Test Cases

## Purpose

These test cases check whether the AI can extract clean business data from natural speech or typed answers.

---

## Test Case 1 — Clear input

### Input
I sell handmade candles in Melbourne. My customers are people buying gifts or home decoration. Everything is handmade by me. I want the website to feel warm and friendly.

### Expected Result
- businessName: Melbourne Handmade Candles
- businessType: Handmade candle business
- productsOrServices: Handmade candles
- location: Melbourne
- targetCustomers: Gift buyers and home decoration customers
- uniqueSellingPoint: Handmade personally
- websiteVibe: warm
- confidence: high

---

## Test Case 2 — Missing business name

### Input
I do mobile car washing around Sydney. I help busy car owners who do not have time to clean their cars. I want a modern website.

### Expected Result
- businessName: Suggested placeholder name
- businessType: Mobile car washing service
- productsOrServices: Mobile car washing
- location: Sydney
- websiteVibe: modern
- missingFields should include businessName
- confidence: medium

---

## Test Case 3 — Very short input

### Input
I sell cakes in Brisbane.

### Expected Result
- businessType: Cake business or bakery
- productsOrServices: Cakes
- location: Brisbane
- missingFields should include targetCustomers and uniqueSellingPoint
- confidence: low or medium

---

## Test Case 4 — Messy natural speech

### Input
Um yeah so basically I do like cleaning, mostly houses, sometimes small offices, around Melbourne, and I guess people book me because I’m flexible and cheaper than big companies.

### Expected Result
- businessType: Cleaning service
- productsOrServices: House and small office cleaning
- location: Melbourne
- targetCustomers: Homeowners and small office clients
- uniqueSellingPoint: Flexible and affordable service
- confidence: high

---

## Test Case 5 — Multiple services

### Input
I run a beauty business in Perth. I do lashes, brows, makeup, and basic skincare treatments. My customers are young women preparing for events.

### Expected Result
- businessType: Beauty service
- productsOrServices: Lashes, brows, makeup, and skincare treatments
- location: Perth
- targetCustomers: Young women preparing for events
- websiteVibe: inferred as modern or warm
- confidence: high

---

## Test Case 6 — No location

### Input
My business sells handmade jewellery for birthdays, weddings, and special gifts. I want the site to look elegant and minimal.

### Expected Result
- businessType: Handmade jewellery business
- productsOrServices: Handmade jewellery
- targetCustomers: People buying birthday, wedding, and special occasion gifts
- websiteVibe: minimal
- missingFields should include location
- confidence: medium

---

## Test Case 7 — Extra feature request

### Input
I’m a personal trainer in Adelaide. I help beginners lose weight and build confidence. Please include before and after photos and a contact form.

### Expected Result
- businessType: Personal training service
- location: Adelaide
- targetCustomers: Beginners who want to lose weight and build confidence
- extraFeatures: Before and after photos, contact form
- websiteVibe: inferred as bold or professional
- confidence: high

---

## Test Case 8 — Unclear business

### Input
I just want a website for my thing. It is kind of online and local. Make it look nice.

### Expected Result
- missingFields should include businessType, productsOrServices, location, targetCustomers
- confidence: low