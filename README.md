# Topo Athletic Shoe Finder

An interactive quiz-based shoe recommendation tool for [Topo Athletic](https://topoathletic.com). Answer 6 quick questions and get matched with the ideal Topo shoe for your feet and goals.

**Live:** [toposhoefinder.mikegrowsgreens.com](https://toposhoefinder.mikegrowsgreens.com)

## Screenshots

### Landing Page
![Landing Page](docs/screenshots/landing.png)

### Quiz
![Quiz - Activity Selection](docs/screenshots/quiz.png)

### Results
![Results - Top Matches](docs/screenshots/results.png)

## Features

- **Branched quiz (3–6 questions)** — the first question hard-gates by intent (road / trail / hike / everyday / recovery); each branch asks only relevant follow-ups (casual buyers never see pace or pronation questions)
- **Filter-then-rank matching engine** — activity gates eliminate, weighted scoring ranks within the surviving pool, a diversity rule keeps the top 3 genuinely different, and waterproof resolves as a *variant* of the winning model (never a competing result)
- **20-model catalog** (base models with nested WP variants) verified against live topoathletic.com PDPs
- **Honest result cards** — answer-echoing "why" reasons plus a "skip it if" note per shoe
- **Path-enumeration test suite** — every possible answer combination is asserted for unique models, no category bleed, and deterministic results (`npm test`)
- **Mobile-friendly** full-screen quiz with smooth navigation
- **Real product images** from Topo Athletic

## Tech Stack

- **Framework:** Next.js 14.2 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 3.4
- **State Management:** Zustand
- **Deployment:** DigitalOcean, Caddy, PM2

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
  finder/
    [step]/page.tsx    # Quiz step pages (dynamic routing)
    results/page.tsx   # Results page with matched shoes
  page.tsx             # Landing page
components/
  ResultCard.tsx       # Shoe result card component
data/
  catalog.json         # Full 20-shoe catalog with specs
  images.json          # Image path mappings
lib/
  matching-engine.ts   # Scoring algorithm
  questions.ts         # Quiz question definitions
  store.ts             # Zustand state management
scripts/
  update-catalog.ts    # Auto-update scraper for catalog maintenance
```

## Build & Deploy

```bash
npm run build
```
