# Akshay Pragyaan JEE Tracker

A focused, offline-first study dashboard for tracking JEE preparation across Physics, Chemistry, Mathematics, and mock tests. The app combines seeded syllabus data, lecture completion tracking, exam countdowns, pace calculations, themeable dashboards, and local test-analysis records in a modern React/Vite interface.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Application Data Model](#application-data-model)
- [Themes](#themes)
- [Testing and Quality Checks](#testing-and-quality-checks)
- [Deployment](#deployment)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)

## Overview

Akshay Pragyaan JEE Tracker is a browser-based preparation tracker built for students who want a single place to monitor syllabus progress, upcoming examination timelines, study pace, and test performance. Data is stored locally in IndexedDB through Dexie, so the app remains useful without a backend service and can preserve progress in the same browser profile.

The default seed data includes chapter and lecture metadata for:

- Physics
- Chemistry, including Physical, Inorganic, and Organic domains
- Mathematics

The corrected Pragyaan seed contains **97 Physics lectures, 98 Chemistry lectures, and 100 Mathematics lectures (295 total)**.

- JEE Main Session 1, JEE Main Session 2, JEE Advanced, and Phase 1 target dates
- App preferences such as theory plan start date, average Maths lecture duration, preferred Chemistry playback speed, and active visual theme

## Key Features

### Study Progress Tracking

- Track every seeded chapter by subject.
- Mark individual lectures complete or incomplete.
- View aggregate completion statistics across the full study plan.
- Compare completed lectures against remaining work to understand study velocity.
- Compare linear planned theory coverage against actual lecture completion.
- Project the theory completion date from the pace achieved since the configured start date.

### Exam Countdown and Pace Planning

- Live dashboard countdowns for configured exam and phase deadlines.
- Pace calculations that estimate how quickly remaining lectures must be completed.
- Planned-versus-actual lecture gap, actual lectures/day, required lectures/day, and projected finish date.
- Editable theory plan start date paired with the Phase 1 syllabus deadline.
- Editable exam configuration from the settings area.

### Test Records and Analysis

- Store mock tests, subject tests, chapter tests, PYQ papers, and other assessment records.
- Record marks, maximum marks, percentile, rank, source, subjects, and analysis status.
- Attach PDF files to test records for local reference.
- Keep analysis notes alongside test metadata.

### Offline-First Local Storage

- Uses IndexedDB via Dexie for persistent client-side data.
- Seeds the local database idempotently on first launch.
- Includes fallback handling for environments where browser storage is unavailable, such as some private browsing modes.

### Themeable Interface

The UI supports multiple dashboard and layout themes through a theme registry. Current theme modules include:

- NERV Terminal
- Urban Wild
- Expedition Editorial
- Ultralight Hex
- Wanderlust Japan
- Duotone Folio

## Tech Stack

| Area | Technology |
| --- | --- |
| Framework | React 19 |
| Build Tool | Vite 6 |
| Language | TypeScript |
| Routing | React Router DOM 7 |
| Local Database | Dexie / IndexedDB |
| Styling | Tailwind CSS 4 |
| UI / Icons | Lucide React, Recharts, Motion |
| Testing | Vitest, Testing Library, jsdom, fake-indexeddb |
| Deployment Config | Vercel |

## Project Structure

```text
.
├── src/
│   ├── App.tsx                    # App initialization, routing, and database bootstrapping
│   ├── components/                # Dashboard, subject, tests, settings, layout, and shared UI
│   ├── context/                   # Theme provider and theme state
│   ├── data/                      # Data-access helpers and theme JSON
│   ├── db/                        # Dexie schema, seed logic, and seed datasets
│   ├── hooks/                     # Database query hooks
│   ├── themes/                    # Pluggable visual themes and theme registry
│   ├── utils/                     # Calculation helpers and tests
│   ├── types.ts                   # Shared TypeScript data contracts
│   ├── main.tsx                   # React entry point
│   └── index.css                  # Global styles
├── .env.example                   # Environment variable template
├── package.json                   # Scripts and dependencies
├── vite.config.ts                 # Vite and Tailwind configuration
├── vitest.config.ts               # Test configuration
└── vercel.json                    # Vercel deployment configuration
```

## Getting Started

### Prerequisites

- Node.js 20 or newer is recommended.
- npm, which is included with Node.js.
- A modern browser with IndexedDB enabled.

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd Personal_JEE_app
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a local environment file:

   ```bash
   cp .env.example .env.local
   ```

4. Update `.env.local` with your local values if you use Gemini-related functionality.

5. Start the development server:

   ```bash
   npm run dev
   ```

6. Open the app in your browser:

   ```text
   http://localhost:3000
   ```

## Environment Variables

The app includes an environment template in `.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `GEMINI_API_KEY` | Optional for core tracking flows | Gemini API key for AI-related functionality. AI Studio may inject this automatically from user secrets. |
| `APP_URL` | Optional locally | Public hosted URL used for self-referential links, callbacks, or API endpoints in hosted environments. |

> Keep real secrets in `.env.local` or your hosting provider's secret manager. Do not commit production credentials.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Starts the Vite dev server on `0.0.0.0:3000`. |
| `npm run build` | Builds the production bundle into `dist/`. |
| `npm run preview` | Serves the production build locally for previewing. |
| `npm run lint` | Runs TypeScript type checking with `tsc --noEmit`. |
| `npm run test` | Runs the Vitest test suite. |
| `npm run clean` | Removes generated `dist` and `server.js` files. |

## Application Data Model

The local Dexie database is named `AkshayPragyaanTracker` and contains these tables:

- `chapters` — seeded syllabus chapters and lecture totals
- `lectures` — per-lecture completion state and timestamps
- `tests` — test records, scores, ranks, percentiles, analysis notes, and subjects
- `pdfAttachments` — locally stored PDF blobs attached to tests
- `examConfig` — singleton record for exam dates and phase targets
- `appSettings` — singleton record for the theory plan start date, app preferences, and active theme

Because the data lives in IndexedDB, each browser profile has its own copy of progress data. Clearing browser site data will remove local progress unless you export or otherwise back it up first.

## Themes

Themes are registered in `src/themes/themeRegistry.ts` and provide interchangeable implementations for navigation, dashboard composition, chapter lists, and test lists. To add a new theme:

1. Create a new folder under `src/themes/`.
2. Implement the same exported shape used by existing theme modules.
3. Register the theme ID in `src/themes/themeRegistry.ts`.
4. Add any settings UI support required to select the new theme.

## Testing and Quality Checks

Run the full local validation set before opening a pull request:

```bash
npm run lint
npm run test
npm run build
```

The test setup uses Vitest with jsdom and fake IndexedDB so database seeding and calculations can be checked in a browser-like test environment.

## Deployment

This project is configured for static web deployment. A typical production deployment flow is:

1. Install dependencies with `npm install` or `npm ci`.
2. Build the app with `npm run build`.
3. Deploy the generated `dist/` directory.

The repository includes `vercel.json`, so it can be deployed to Vercel with the standard Vite build output. If you deploy elsewhere, configure the platform to serve `dist/` and route unknown paths back to `index.html` for client-side routing.

## Troubleshooting

### The app shows a storage warning

IndexedDB may be unavailable in some private/incognito browser modes or restricted environments. Try a normal browser profile, allow site storage, or disable extensions that block browser storage.

### Progress disappeared

Progress is stored locally per browser profile. It can be lost if you clear site data, switch browsers, use a different profile, or reset IndexedDB for the site.

### Development server is not reachable

The dev server binds to `0.0.0.0` on port `3000`. If that port is already in use, stop the conflicting process or adjust the Vite command in `package.json`.

### Type or test failures after dependency updates

Run a clean install and re-run checks:

```bash
rm -rf node_modules package-lock.json
npm install
npm run lint
npm run test
```

## Contributing

1. Create a feature branch from the current mainline branch.
2. Keep changes focused and documented.
3. Add or update tests for behavior changes.
4. Run `npm run lint`, `npm run test`, and `npm run build` before submitting.
5. Include screenshots for visible UI changes.

## License

No license file is currently included. Add a license before distributing or accepting external contributions.
