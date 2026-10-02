create extension if not exists pgcrypto;

create table if not exists public.sources (
    id uuid primary key default gen_random_uuid(),
    publisher text not null,
    name text not null,
    homepage_url text,
    feed_url text not null unique,
    feed_type text not null default 'rss' check (feed_type in ('rss', 'atom')),
    active boolean not null default true,
    default_category text not null default 'general' check (
        default_category in (
            'canada', 'indigenous', 'politics', 'business', 'technology', 'sports',
            'health', 'science', 'entertainment', 'world', 'social', 'local', 'general'
        )
    ),
    default_location text,
    country text,
    province text,
    city text,
    refresh_minutes integer not null default 10 check (refresh_minutes between 5 and 1440),
    image_policy text not null default 'feed_only' check (image_policy in ('feed_only', 'licensed', 'none')),
    rights_notes text,
    last_fetched_at timestamptz,
    last_error text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.articles (
    id uuid primary key default gen_random_uuid(),
    source_id uuid references public.sources(id) on delete set null,
    source_name text not null,
    feed_guid text,
    title text not null,
    normalized_title text not null,
    title_hash text not null,
    description text not null default '',
    canonical_url text not null unique,
    image_url text,
    published_at timestamptz not null,
    fetched_at timestamptz not null default now(),
    category text not null default 'general' check (
        category in (
            'canada', 'indigenous', 'politics', 'business', 'technology', 'sports',
            'health', 'science', 'entertainment', 'world', 'social', 'local', 'general'
        )
    ),
    location text,
    country text,
    province text,
    city text,
    author text,
    cluster_key text,
    status text not null default 'published' check (status in ('published', 'hidden', 'review')),
    is_original boolean not null default false,
    metadata jsonb not null default '{}'::jsonb,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.ingestion_runs (
    id uuid primary key default gen_random_uuid(),
    status text not null default 'running' check (status in ('running', 'completed', 'completed_with_errors', 'failed')),
    started_at timestamptz not null default now(),
    finished_at timestamptz,
    sources_attempted integer not null default 0,
    articles_seen integer not null default 0,
    articles_inserted integer not null default 0,
    articles_skipped integer not null default 0,
    errors jsonb not null default '[]'::jsonb
);

create index if not exists articles_published_at_idx on public.articles (published_at desc);
create index if not exists articles_category_published_idx on public.articles (category, published_at desc);
create index if not exists articles_city_published_idx on public.articles (city, published_at desc);
create index if not exists articles_cluster_key_idx on public.articles (cluster_key);
create index if not exists articles_title_hash_idx on public.articles (title_hash);
create index if not exists sources_active_idx on public.sources (active) where active = true;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
    new.updated_at = now();
    return new;
end;
$$;

drop trigger if exists set_sources_updated_at on public.sources;
create trigger set_sources_updated_at
before update on public.sources
for each row execute function public.set_updated_at();

drop trigger if exists set_articles_updated_at on public.articles;
create trigger set_articles_updated_at
before update on public.articles
for each row execute function public.set_updated_at();

alter table public.sources enable row level security;
alter table public.articles enable row level security;
alter table public.ingestion_runs enable row level security;

drop policy if exists "Published articles are publicly readable" on public.articles;
create policy "Published articles are publicly readable"
on public.articles
for select
to anon, authenticated
using (status = 'published');

revoke all on public.sources from anon, authenticated;
revoke all on public.ingestion_runs from anon, authenticated;
revoke insert, update, delete on public.articles from anon, authenticated;
grant select on public.articles to anon, authenticated;

-- Verified against Global News' official RSS directory:
-- https://globalnews.ca/pages/feeds/
insert into public.sources (
    publisher, name, homepage_url, feed_url, default_category, default_location,
    country, province, city, image_policy, rights_notes
)
values
    (
        'Global News', 'Main', 'https://globalnews.ca/', 'https://globalnews.ca/feed/',
        'general', 'Canada', 'Canada', null, null, 'feed_only',
        'Official RSS feed. Display feed-provided metadata/excerpts and link to the original story.'
    ),
    (
        'Global News', 'Toronto', 'https://globalnews.ca/toronto/', 'https://globalnews.ca/toronto/feed/',
        'local', 'Toronto', 'Canada', 'Ontario', 'Toronto', 'feed_only',
        'Official regional RSS feed. Display feed-provided metadata/excerpts and link to the original story.'
    ),
    (
        'Global News', 'Canada', 'https://globalnews.ca/canada/', 'https://globalnews.ca/canada/feed/',
        'canada', 'Canada', 'Canada', null, null, 'feed_only',
        'Official section RSS feed. Display feed-provided metadata/excerpts and link to the original story.'
    ),
    (
        'Global News', 'Politics', 'https://globalnews.ca/politics/', 'https://globalnews.ca/politics/feed/',
        'politics', 'Canada', 'Canada', null, null, 'feed_only',
        'Official section RSS feed. Display feed-provided metadata/excerpts and link to the original story.'
    ),
    (
        'Global News', 'Money', 'https://globalnews.ca/money/', 'https://globalnews.ca/money/feed/',
        'business', 'Canada', 'Canada', null, null, 'feed_only',
        'Official section RSS feed. Display feed-provided metadata/excerpts and link to the original story.'
    ),
    (
        'Global News', 'Health', 'https://globalnews.ca/health/', 'https://globalnews.ca/health/feed/',
        'health', 'Canada', 'Canada', null, null, 'feed_only',
        'Official section RSS feed. Display feed-provided metadata/excerpts and link to the original story.'
    ),
    (
        'Global News', 'Entertainment', 'https://globalnews.ca/entertainment/', 'https://globalnews.ca/entertainment/feed/',
        'entertainment', 'Canada', 'Canada', null, null, 'feed_only',
        'Official section RSS feed. Display feed-provided metadata/excerpts and link to the original story.'
    ),
    (
        'Global News', 'Sports', 'https://globalnews.ca/sports/', 'https://globalnews.ca/sports/feed/',
        'sports', 'Canada', 'Canada', null, null, 'feed_only',
        'Official section RSS feed. Display feed-provided metadata/excerpts and link to the original story.'
    )
on conflict (feed_url) do nothing;
