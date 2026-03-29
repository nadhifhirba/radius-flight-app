# Radius — Agent Readiness Guide

Radius is a **vanilla JS + Python serverless** flight discovery app deployed on Vercel.
No framework, no build tool for JS — Tailwind is pre-built via CLI.

## Architecture

```
/
├── index.html          — Single-page app, all UI
├── app.js              — Core JS: search, rendering, map, history
├── styles.css          — Custom CSS (grain, cards, animations)
├── tailwind.css        — Pre-built Tailwind utilities (generated, do not edit)
├── input.css           — Tailwind entry point (source for build)
├── js/
│   ├── supabase-client.js  — Supabase client init (guarded)
│   ├── auth.js             — Google OAuth + session management
│   └── search-sync.js      — Persists searches to Supabase
├── api/
│   ├── search.py       — Python serverless: fan-out to 21 destinations via fli library
│   ├── subscribe.js    — Email capture → Resend API
│   └── config.js       — Injects Supabase env vars as window globals
├── vercel.json         — Vercel config: build command, security headers, function settings
├── requirements.txt    — Python deps: flights (fli library)
└── supabase-schema.sql — DB schema (run manually in Supabase SQL editor)
```

## Key Constraints

- **No Node.js framework** — Express/Amadeus deps in package.json are legacy, unused. Vercel functions are in `/api/`.
- **Python runtime** — `api/search.py` uses Vercel's auto-detected Python runtime. No `runtime` field needed in vercel.json.
- **Tailwind build** — Run `npm run build` to regenerate `tailwind.css` after editing HTML/JS class names.
- **Supabase is optional** — Auth and search sync gracefully degrade if env vars are not set.
- **No API keys in code** — `RESEND_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY` come from Vercel env vars only.

## Flight Data

`api/search.py` uses the `fli` Python library (`pip install flights`) which reverse-engineers Google Flights.
- No API key required
- Searches 21 destinations in parallel (ThreadPoolExecutor, max_workers=8)
- USD prices converted to IDR at ×16000
- Results sorted cheapest-first

## Affiliate Links

- **Indonesian routes** (DPS, SUB, KNO, LBJ, LOP, JOG, BPN, PLM, MDC, UPG, YIA) → Traveloka deeplinks
- **International routes** → Kiwi.com with `ref=nhadesign`
- Both wired in `app.js` `renderResults()` function

## Environment Variables (Vercel)

| Variable | Required | Used by |
|---|---|---|
| `RESEND_API_KEY` | For email | api/subscribe.js |
| `RESEND_AUDIENCE_ID` | Optional | api/subscribe.js |
| `SUPABASE_URL` | Optional | api/config.js → frontend |
| `SUPABASE_ANON_KEY` | Optional | api/config.js → frontend |

## Common Tasks

**Rebuild Tailwind CSS:** `npm run build`

**Add a new destination:** Edit `DESTINATIONS` list in `api/search.py` + add mapping in `app.js` `DESTINATION_DB`.

**Change affiliate link format:** Edit `renderResults()` in `app.js` around line 436.

**Update email template:** Edit `api/subscribe.js` `htmlContent` string.
