<div align="center">

# Market Muse AI — Multi‑Agent Marketing Workspace

An all‑in‑one React + Vite app that hosts a marketplace of AI marketing agents with beautiful, inline‑styled UIs, live demo videos, and webhook‑based automations.

</div>

## Overview

Market Muse AI provides a dashboard where users can preview agents via autoplay videos and then launch purpose‑built tools for SEO analysis, WhatsApp broadcasting, call‑recording sentiment decoding, and social content planning. Authentication and basic profile data are powered by Supabase. Each agent page interacts with external automation webhooks.

## Key Features

- Agent marketplace dashboard with glassmorphism UI and autoplay intro videos
- Supabase authentication with token display and reactive profile updates
- Per‑agent, inline‑styled React pages (no external CSS files required)
- Robust webhook integrations with loading states, cancel/timeout handling, and error messaging
- SEOrix exports full SEO report to printable/downloadable PDF (dark theme preserved)
- WhatsPulse supports CSV upload and simulated live send counter
- EchoMind uploads raw audio (mp3/wav/m4a) via FormData, no conversions
- SociaPlan generates a full weekly social calendar from structured inputs

## Tech Stack

- React 18 + Vite
- Supabase JS SDK (auth + profiles)
- Lucide React icons
- Inline CSS (JS style objects) + light custom animations
- Router: `react-router-dom`

## Project Structure

```
MarketMuseAI/
├─ public/
│  ├─ logo.png
│  └─ vite.svg
├─ src/
│  ├─ App.jsx                # Routes
│  ├─ DashboardPage.jsx      # Marketplace + video modal + navigation
│  ├─ SEOrixPage.jsx         # SEO analysis + PDF export + 10‑min timeout
│  ├─ WhatsPulsePage.jsx     # WhatsApp broadcast CSV upload + webhook
│  ├─ EchoMindPage.jsx       # Audio sentiment/tone analysis via webhook
│  ├─ SociaPlanPage.jsx      # Weekly social media calendar generator
│  ├─ LoginPage.jsx          # Supabase login
│  ├─ main.jsx, index.css, App.css
│  └─ ...
├─ supabaseClient.js         # Reads Vite env vars and creates client
├─ index.html
├─ package.json
├─ vite.config.js
├─ eslint.config.js
├─ postcss.config.js
└─ README.md
```

## Environment Variables

Create a `.env.local` file in the project root and set Supabase credentials:

```
VITE_SUPABASE_URL=https://<your-project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

These are consumed in `supabaseClient.js` via `import.meta.env`.

## Getting Started

Prerequisites:
- Node.js 18+ (recommended)
- npm (or yarn/pnpm)

Install dependencies:

```bash
npm install
```

Start the dev server:

```bash
npm run dev
```

Notes:
- Vite will choose a free port automatically (e.g., 5173 → 5174/5175 if busy).
- If you use Tailwind later, configure the `content` option to remove warnings.

Build for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

## App Routes

- `/` — Dashboard (agent marketplace, profile tokens, video modal)
- `/login` — Supabase auth page
- `/seorix` — SEOrix (SEO audit + PDF export)
- `/whatspulse` — WhatsPulse (WhatsApp broadcast)
- `/echomind` — EchoMind (audio sentiment/tone)
- `/sociaplan` — SociaPlan (weekly social calendar)
- `/leadgen` — LeadGen (intro + future flow)
- `/advisor` — AdVisor (ad optimizer)

## Agent Details & Webhooks

All webhooks are hosted on Automata (n8n) endpoint(s). Ensure CORS is configured to allow your dev/prod origins.

### 1) SEOrix — SEO Analyzer

- Route: `/seorix`
- Webhook: `POST https://glowing-g79w8.crab.containers.automata.host/webhook/seo`
- Payload: `{ "website_url": "https://example.com" }`
- Behavior: Starts job, polls/waits (up to 10 minutes). Displays rich report with scores, keywords, meta, technical issues. Export/print full PDF with dark theme preserved.

### 2) WhatsPulse — WhatsApp Broadcast

- Route: `/whatspulse`
- Webhook: `POST https://glowing-g79w8.crab.containers.automata.host/webhook/whatsappauto`
- Payload (JSON):
	```json
	{
		"offer_title": "Black Friday Sale",
		"message_content": "Hi {{Name}}, enjoy 50% off!",
		"customer_csv": "Name,PhoneNumber\nAlex,+11234567890\n..."
	}
	```
- Notes: CSV is sent as plain text; UI simulates live sending progress using contact count.

### 3) EchoMind — Call Recording Analysis

- Route: `/echomind`
- Webhook: `POST https://glowing-g79w8.crab.containers.automata.host/webhook/audioanlayze`
- Payload: `FormData` with the raw file.
	```js
	const fd = new FormData();
	fd.append('file', file); // .mp3, .wav, .m4a (no conversion)
	```
- Output: Sentiment, primary emotion, tone, confidence + insights.

### 4) SociaPlan — Weekly Content Calendar

- Route: `/sociaplan`
- Webhook: `POST https://glowing-g79w8.crab.containers.automata.host/webhook/socialcalendar`
- Payload (JSON):
	```json
	{
		"business_type": "Restaurant",
		"target_audience": "Young professionals 25-35",
		"content_themes": "Promos, BTS, Tips, Stories",
		"post_frequency": "daily"
	}
	```
- Output: 7‑day plan with platforms, times, captions, and hashtags.

## Dashboard Video Modal

- Agents include an intro video shown in a modal before navigation to the agent page.
- Supports both direct MP4 sources and Cloudinary Player iframes.
- Configured to autoplay; note that some browsers may block unmuted autoplay. Users can click to unmute/play as needed.

## Authentication & Profiles

- Supabase handles session and profile retrieval (`profiles` table).
- `tokens_remaining` is displayed in the navbar.
- Session reactivity via `onAuthStateChange` and realtime channel subscription for profile updates.

## Troubleshooting

- Ports 5173/5174/5175 already in use
	- Vite automatically increments to the next available port.

- Tailwind CSS warning: missing `content` option
	- If you are not using Tailwind yet, you can ignore it. If you enable Tailwind, add `content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"]` to your Tailwind config.

- Webhook timeout or CORS errors
	- Ensure your automation host allows your origin; SEOrix waits up to 10 minutes before timing out.

- PDF export looks different than on screen
	- SEOrix applies print‑specific styles to preserve dark theme and colors.

- Supabase 401/keys not working
	- Verify `.env.local` values match your project; restart `npm run dev` after changes.

## Scripts

```bash
# Install deps
npm install

# Start dev server
npm run dev

# Lint (if configured)
npm run lint

# Build for production
npm run build

# Preview production build
npm run preview
```

## Security & Secrets

- Do not commit real Supabase service keys. Use the anon public key for frontend.
- Treat webhook URLs as semi‑public in a frontend app; apply server‑side validations/rate limits in your automation backend.

## Roadmap (Ideas)

- Add persistent job history per user (Supabase tables)
- Downloadable CSV/JSON for agent outputs
- More agents (ad copy A/B tests, image generation, keyword clustering)
- Role‑based access and usage quotas

---

Made with ❤️ using React + Vite. PRs and suggestions are welcome.