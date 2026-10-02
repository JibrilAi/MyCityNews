# MyCityNews.ca

MyCityNews is being converted from a browser-side AI demo into a server-backed news aggregation and local-information platform.

## Current production foundation

- React 19 + TypeScript + Vite frontend
- Supabase/Postgres schema for sources, articles, and ingestion audit runs
- Server-side RSS/Atom ingestion through a Supabase Edge Function
- Browser-safe read access through Supabase row-level security
- Scheduled 10-minute ingestion through GitHub Actions
- Canonical-URL deduplication
- normalized-title hashes and first-pass cluster keys
- location and category metadata
- source-first article pages that send users to the original publisher
- no client-side Gemini key
- no AI-generated news photography

See docs/PRODUCTION_ARCHITECTURE.md for the architecture and rollout sequence.

## Run the frontend locally

Prerequisite: Node.js 22 or later.

1. Install dependencies with npm install.
2. Copy .env.example to .env.local.
3. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.
4. Start the app with npm run dev.

If Supabase is not configured, the frontend uses articles.json as development-only fallback data and labels the feed accordingly.

## Supabase setup

Create a dedicated MyCityNews Supabase project, then:

1. Apply supabase/migrations/202610020001_news_aggregator.sql.
2. Deploy supabase/functions/ingest-news.
3. Configure a strong random INGEST_CRON_SECRET.
4. Keep the service-role key server-side only.
5. Set the frontend's publishable key and project URL in the deployment environment.

The Edge Function has verify_jwt = false because scheduler requests use the separate INGEST_CRON_SECRET. The function itself uses the server-side Supabase service-role credential.

## GitHub Actions setup

Add repository secrets:

- SUPABASE_FUNCTION_URL
- INGEST_CRON_SECRET

Then run the Ingest news workflow manually once before relying on the schedule.

## Source policy

Only add a feed after verifying its current endpoint and applicable reuse terms. For aggregated third-party journalism, MyCityNews should store and show source-provided metadata/excerpts, preserve the original source, and link readers to the publisher rather than reproduce the full article without permission.
