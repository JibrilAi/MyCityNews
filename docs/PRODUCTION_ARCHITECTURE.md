# MyCityNews production aggregation architecture

## Purpose

MyCityNews should operate as a news-discovery and local-information platform, not as a browser-side AI demo. The production data path is:

1. Approved source registry
2. Server-side RSS/Atom ingestion
3. Normalization and deduplication
4. Category and location metadata
5. PostgreSQL/Supabase persistence
6. Public read-only API
7. React discovery interface
8. Original-source links for aggregated journalism

## Trust and editorial rules

- Do not generate photorealistic images that could be mistaken for documentary news photography.
- Use feed-provided or explicitly licensed imagery only. If no permitted image exists, use a neutral category fallback.
- Store and display the original canonical URL and publication source for every aggregated story.
- Do not republish full third-party articles unless MyCityNews has the necessary rights.
- Preserve source timestamps and avoid presenting generated timestamps as publication times.
- Community submissions require moderation before publication.
- Political stories are categorized and surfaced using the same source and recency rules as other categories. The platform should not generate endorsements, candidate rankings, or partisan editorial scoring.

## Data model

### sources

The source registry contains one row per feed. It records the publisher, feed URL, default category, location metadata, refresh cadence, image policy, and last fetch result.

### articles

Normalized article records. canonical_url is unique and provides the first deduplication layer. title_hash supports exact normalized-title matching. cluster_key is a deterministic first-pass grouping key for related coverage.

### ingestion_runs

Operational audit table for scheduled ingestion. Every run records source count, article counts, completion state, and source-level errors.

## Ingestion

supabase/functions/ingest-news/index.ts:

- accepts only authenticated scheduler requests using INGEST_CRON_SECRET
- fetches active RSS/Atom feeds server-side
- strips HTML from excerpts
- removes common tracking parameters from article URLs
- preserves feed-provided images
- never generates news photography
- classifies general feeds using deterministic keyword rules
- upserts on canonical_url
- records source errors without stopping the entire run

The first migration seeds only feeds verified against an official publisher feed directory. Additional sources should be added only after their current feed endpoints and reuse terms are checked.

## Frontend

The React application reads published rows through Supabase REST using a publishable key. This key is intended for browser use and is protected by row-level security.

The previous Gemini API key injection is removed. No service-role key, ingestion secret, or generative-model secret may be shipped to browser code.

If Supabase is not configured, the app can use articles.json only as an explicit development fallback.

## Scheduling

.github/workflows/ingest-news.yml runs every 10 minutes and can also be invoked manually.

Required GitHub repository secrets:

- SUPABASE_FUNCTION_URL, for example https://<project-ref>.supabase.co/functions/v1/ingest-news
- INGEST_CRON_SECRET, the same random secret configured in the Supabase Edge Function environment

## Deployment sequence

1. Create a dedicated Supabase project for MyCityNews.
2. Apply supabase/migrations/202610020001_news_aggregator.sql.
3. Deploy ingest-news with JWT verification disabled because the function uses its own scheduler secret.
4. Configure INGEST_CRON_SECRET in Supabase.
5. Add the two GitHub Actions secrets.
6. Add frontend deployment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_PUBLISHABLE_KEY
7. Run the ingestion workflow manually.
8. Verify rows in sources, articles, and ingestion_runs.
9. Deploy the frontend.
10. Expand the source registry in controlled batches.

## Next production increments

### Source expansion

Add Canadian national, provincial, municipal, business, technology, sports, arts, university, transit, emergency, and public-agency feeds. Verify each endpoint and its reuse terms before enabling it.

### Better story clustering

Replace the deterministic cluster_key with semantic similarity generated server-side. Keep publisher stories separate in storage, but show users a single event cluster with multiple original sources.

### Trending

Add event analytics and calculate trending from transparent signals such as recency, unique clicks, source diversity, and local relevance. Do not label a section "Popular" until the ranking is based on actual measurements.

### Newsroom administration

Build authenticated tools for:

- source enable/disable
- source health
- article hide/review
- homepage pinning
- cluster merge/split
- community-submission moderation
- ingestion run monitoring

### Local-information layer

Extend the source registry beyond publishers to municipal releases, transit alerts, emergency notices, universities, sports organizations, public meetings, local events, and other verified civic sources.
