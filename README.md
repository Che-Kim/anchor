# Anchor

A wellness-minded daily planner with an AI jellyfish companion (default name
**Jelli**, renameable). Anchor plans your day, lifts it when it drags, and helps
you write it down at the end.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) + React 19 + TypeScript |
| Styling | Tailwind CSS v4 (CSS-first `@theme`), Fraunces + Inter |
| Client state | Zustand (+ `persist` for the companion's name) |
| Drag & drop | `@dnd-kit/core` + `/sortable` (pointer + keyboard sensors) |
| Data | Prisma 7 + Postgres via `@prisma/adapter-pg` |
| AI | Anthropic Claude (`claude-opus-5`) via `@anthropic-ai/sdk` |

## Routes

| Route | State |
|---|---|
| `/` | Landing — "Ready to Sail?" + the three core cards |
| `/plan` | **Built.** Split-screen planner (see below) |
| `/boost` | **Built.** Context-aware de-stress hub + mood check-in |
| `/record` | **Built.** Solo journal + companion chat-to-diary |

## Plan My Day

**Left — inputs.** Task form (name, duration, difficulty, deadline via a
scroll-snap wheel picker) and a 7-day × 30-minute availability grid you paint by
click-dragging.

**Right — generation.** A ranked priority list (drag the grip to overrule the
AI's order), then `Confirm schedule` packs tasks into the painted hours,
auto-inserting a breather after hard tasks. The jellyfish floats in afterwards
with contextual advice.

Scheduling logic lives in `src/lib/planEngine.ts` — `rankTasks` is the
rule-based stand-in for the Claude call, and `buildSchedule` does the slot
packing. Swapping in the model means replacing the scoring step; the packing
and the UI stay as they are.

## Boost My Day

Reads real context — scheduled focus hours and hard-task count from the plan
store, latest stress level from `CheckIn`, diary activity from `DiaryEntry` —
and scores it into a light / balanced / heavy reading. The jellyfish narrates
what it looked at and why, then picks activities to match: short breathing
work on heavy days, longer outdoor options on light ones.

Indoor activities open a guided session — paced-breathing patterns drive an
animated ring synced to inhale/hold/exhale; everything else gets a timer.
Setting `YOUTUBE_API_KEY` makes cards fetch and embed a real guided video;
without it they fall back to opening a YouTube search.

## Record My Day

**Solo mode** — date picker plus a rich-text editor (bold/italic/underline,
lists, headings), saved per day.

**Companion mode** — chat with the jellyfish, then `End session` runs the
transcript through `messages.parse()` with a Zod schema to produce
`{ mood, highlights, entry }`, saved as that day's entry. Entries are keyed by
local calendar day and upserted, so either mode writes to the same record.

Without `ANTHROPIC_API_KEY` both routes fall back to scripted replies and a
literal transcript summary, so the whole flow is exercisable offline.

## Environment

| Variable | Required | Effect if unset |
|---|---|---|
| `DATABASE_URL` | yes | App throws on first query. Postgres connection string. |
| `ANTHROPIC_API_KEY` | no | Companion falls back to scripted replies and a literal summary |
| `YOUTUBE_API_KEY` | no | Activity cards link to YouTube search instead of embedding |
| `COMPANION_DAILY_LIMIT` | no | Defaults to 25 model calls per visitor per day |

## Getting started

```bash
npm install
createdb anchor_dev                                        # or use a hosted Postgres
echo 'DATABASE_URL="postgresql://localhost:5432/anchor_dev"' >> .env
npm run db:migrate
npm run dev
```

## Deploying

Built for Vercel + a serverless Postgres (Neon or Supabase free tier). SQLite
is not an option here: serverless filesystems are read-only and discarded
between invocations.

1. Create a Postgres database and copy its **direct** (non-pooled) connection
   string — Prisma migrations need the direct URL.
2. Import the repo into Vercel and set `DATABASE_URL`, plus
   `ANTHROPIC_API_KEY` and `YOUTUBE_API_KEY` if you want the live integrations.
3. Deploy. `postinstall` runs `prisma generate` and the build runs
   `prisma migrate deploy`, so the schema applies itself on first deploy.

### Two things that matter on a public deploy

**Visitors don't share data.** There are no accounts, so an anonymous
`anchor_vid` cookie scopes every read and write. Without it a public demo
would show one person's journal to the next visitor. Every response path sets
the cookie — including error and fallback paths, since a dropped cookie costs
the visitor their entries.

**Visitors can't drain the API budget.** `ANTHROPIC_API_KEY` on a public
deployment is spendable by anyone who opens the link, so each visitor gets
`COMPANION_DAILY_LIMIT` model calls per day, counted in Postgres. Set a
monthly spend cap in the Anthropic console as a second line of defence.

### Restoring the pre-Postgres data

```bash
SEED_VISITOR_ID=<anchor_vid cookie> node scripts/import-backup.mjs
```

Reads `prisma/backup/*.json`. Find the cookie in DevTools → Application →
Cookies after loading the app once.

## Status

- [x] Landing page + jellyfish companion (animated SVG, nameable, persisted)
- [x] Plan My Day: task form, wheel deadline picker, availability painting
- [x] Drag-to-reorder priority list, generated timetable, floating companion
- [x] Boost My Day: context reading, guided sessions, YouTube integration
- [x] Record My Day: solo rich-text journal + chat-to-diary pipeline
- [x] Plan state persisted (Zustand) so Boost can read schedule density
- [x] Retired the `/today` and `/checkin` prototypes; check-in folded into Boost
- [ ] Replace `rankTasks` heuristics with a Claude call
- [ ] Real local-events API for outdoor cards (currently map search links)
