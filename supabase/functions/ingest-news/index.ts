import { createClient } from 'npm:@supabase/supabase-js@2.47.10';
import { XMLParser } from 'npm:fast-xml-parser@4.5.0';

type Category =
    | 'canada'
    | 'indigenous'
    | 'politics'
    | 'business'
    | 'technology'
    | 'sports'
    | 'health'
    | 'science'
    | 'entertainment'
    | 'world'
    | 'social'
    | 'local'
    | 'general';

interface SourceRow {
    id: string;
    publisher: string;
    name: string;
    feed_url: string;
    homepage_url: string | null;
    default_category: Category;
    default_location: string | null;
    country: string | null;
    province: string | null;
    city: string | null;
}

interface NormalizedFeedItem {
    title: string;
    description: string;
    canonicalUrl: string;
    imageUrl: string | null;
    author: string | null;
    publishedAt: string;
    feedGuid: string | null;
}

const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    textNodeName: '#text',
    cdataPropName: '#cdata',
    trimValues: true,
    processEntities: false,
});

const STOP_WORDS = new Set([
    'about', 'after', 'again', 'against', 'also', 'been', 'before', 'being', 'between',
    'could', 'from', 'have', 'into', 'more', 'most', 'over', 'said', 'says', 'than',
    'that', 'their', 'there', 'these', 'they', 'this', 'those', 'through', 'under',
    'what', 'when', 'where', 'which', 'while', 'with', 'would', 'your', 'canada',
    'canadian', 'news',
]);

const TRACKING_PARAMS = new Set([
    'fbclid',
    'gclid',
    'mc_cid',
    'mc_eid',
    'cmpid',
    'utm_campaign',
    'utm_content',
    'utm_medium',
    'utm_source',
    'utm_term',
]);

function asArray<T>(value: T | T[] | undefined | null): T[] {
    if (value == null) return [];
    return Array.isArray(value) ? value : [value];
}

function textValue(value: unknown): string {
    if (typeof value === 'string' || typeof value === 'number') return String(value).trim();
    if (!value || typeof value !== 'object') return '';

    const record = value as Record<string, unknown>;
    const direct = record['#text'] ?? record['#cdata'];
    return direct == null ? '' : String(direct).trim();
}

function stripHtml(value: string): string {
    return value
        .replace(/<script[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[\s\S]*?<\/style>/gi, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function canonicalizeUrl(rawUrl: string): string | null {
    try {
        const url = new URL(rawUrl.trim());
        if (!['http:', 'https:'].includes(url.protocol)) return null;

        for (const key of Array.from(url.searchParams.keys())) {
            if (key.toLowerCase().startsWith('utm_') || TRACKING_PARAMS.has(key.toLowerCase())) {
                url.searchParams.delete(key);
            }
        }

        url.hash = '';
        return url.toString();
    } catch {
        return null;
    }
}

function extractLink(item: Record<string, unknown>): string {
    const link = item.link;

    if (typeof link === 'string') return link.trim();

    for (const candidate of asArray(link as Record<string, unknown> | Record<string, unknown>[] | undefined)) {
        if (!candidate || typeof candidate !== 'object') continue;
        const href = candidate['@_href'];
        const rel = candidate['@_rel'];
        if (typeof href === 'string' && (!rel || rel === 'alternate')) return href;
    }

    return textValue(item.guid);
}

function extractImage(item: Record<string, unknown>, rawDescription: string): string | null {
    const candidates = [
        ...asArray(item['media:content'] as Record<string, unknown> | Record<string, unknown>[] | undefined),
        ...asArray(item['media:thumbnail'] as Record<string, unknown> | Record<string, unknown>[] | undefined),
        ...asArray(item.enclosure as Record<string, unknown> | Record<string, unknown>[] | undefined),
    ];

    for (const candidate of candidates) {
        if (!candidate || typeof candidate !== 'object') continue;
        const url = candidate['@_url'];
        const type = candidate['@_type'];
        if (typeof url === 'string' && (!type || String(type).startsWith('image/'))) {
            return canonicalizeUrl(url) ?? url;
        }
    }

    const match = rawDescription.match(/<img[^>]+src=["']([^"']+)["']/i);
    return match?.[1] ? (canonicalizeUrl(match[1]) ?? match[1]) : null;
}

function normalizeDate(raw: unknown): string {
    const value = textValue(raw);
    if (!value) return new Date().toISOString();

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

function inferCategory(text: string, fallback: Category): Category {
    if (fallback !== 'general') return fallback;

    const haystack = text.toLowerCase();
    const rules: Array<[Category, string[]]> = [
        ['politics', ['election', 'parliament', 'minister', 'premier', 'mayor', 'government', 'legislation']],
        ['business', ['market', 'business', 'bank', 'economy', 'company', 'housing', 'real estate', 'trade']],
        ['technology', ['technology', 'software', 'artificial intelligence', ' ai ', 'startup', 'cyber', 'app']],
        ['sports', ['nhl', 'nba', 'mlb', 'soccer', 'hockey', 'football', 'sports', 'game', 'season']],
        ['health', ['health', 'hospital', 'doctor', 'disease', 'medical', 'public health']],
        ['science', ['science', 'research', 'space', 'climate', 'study', 'scientist']],
        ['entertainment', ['film', 'movie', 'music', 'actor', 'celebrity', 'television', 'festival']],
        ['world', ['united states', 'u.s.', 'europe', 'asia', 'middle east', 'world']],
        ['indigenous', ['first nations', 'indigenous', 'inuit', 'métis', 'metis']],
    ];

    for (const [category, keywords] of rules) {
        if (keywords.some((keyword) => haystack.includes(keyword))) {
            return category;
        }
    }

    return fallback;
}

function clusterKey(title: string): string {
    const tokens = title
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .split(/\s+/)
        .filter((token) => token.length >= 4 && !STOP_WORDS.has(token));

    return Array.from(new Set(tokens)).sort().slice(0, 10).join('|');
}

async function sha256(value: string): Promise<string> {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest))
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
}

function parseFeed(xml: string): NormalizedFeedItem[] {
    const parsed = parser.parse(xml) as Record<string, any>;
    const rssItems = asArray(parsed?.rss?.channel?.item);
    const atomItems = asArray(parsed?.feed?.entry);
    const items = rssItems.length > 0 ? rssItems : atomItems;

    return items.slice(0, 40).flatMap((raw: Record<string, unknown>) => {
        const title = textValue(raw.title);
        const rawDescription =
            textValue(raw.description) ||
            textValue(raw.summary) ||
            textValue(raw['content:encoded']) ||
            textValue(raw.content);

        const canonicalUrl = canonicalizeUrl(extractLink(raw));

        if (!title || !canonicalUrl) return [];

        return [{
            title,
            description: stripHtml(rawDescription).slice(0, 1500),
            canonicalUrl,
            imageUrl: extractImage(raw, rawDescription),
            author:
                textValue(raw.author) ||
                textValue(raw['dc:creator']) ||
                null,
            publishedAt: normalizeDate(raw.pubDate ?? raw.published ?? raw.updated ?? raw['dc:date']),
            feedGuid: textValue(raw.guid ?? raw.id) || null,
        }];
    });
}

Deno.serve(async (request) => {
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'content-type': 'application/json' },
        });
    }

    const expectedSecret = Deno.env.get('INGEST_CRON_SECRET');
    const suppliedSecret = request.headers.get('authorization');

    if (!expectedSecret) {
        return new Response(JSON.stringify({ error: 'INGEST_CRON_SECRET is not configured.' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }

    if (suppliedSecret !== `Bearer ${expectedSecret}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
            status: 401,
            headers: { 'content-type': 'application/json' },
        });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceRoleKey) {
        return new Response(JSON.stringify({ error: 'Supabase service credentials are unavailable.' }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { persistSession: false, autoRefreshToken: false },
    });

    const runStart = new Date().toISOString();
    const { data: run, error: runError } = await supabase
        .from('ingestion_runs')
        .insert({ status: 'running', started_at: runStart })
        .select('id')
        .single();

    if (runError || !run) {
        return new Response(JSON.stringify({ error: `Could not create ingestion run: ${runError?.message}` }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }

    let sourcesAttempted = 0;
    let articlesSeen = 0;
    let articlesInserted = 0;
    let articlesSkipped = 0;
    const errors: Array<{ source: string; message: string }> = [];

    const { data: sources, error: sourceError } = await supabase
        .from('sources')
        .select('id,publisher,name,feed_url,homepage_url,default_category,default_location,country,province,city')
        .eq('active', true)
        .order('publisher')
        .order('name');

    if (sourceError) {
        await supabase
            .from('ingestion_runs')
            .update({
                status: 'failed',
                finished_at: new Date().toISOString(),
                errors: [{ source: 'system', message: sourceError.message }],
            })
            .eq('id', run.id);

        return new Response(JSON.stringify({ error: sourceError.message }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
        });
    }

    for (const source of (sources || []) as SourceRow[]) {
        sourcesAttempted += 1;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 15000);

            const response = await fetch(source.feed_url, {
                headers: {
                    'user-agent': 'MyCityNews/1.0 (+https://mycitynews.ca)',
                    accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.1',
                },
                signal: controller.signal,
            }).finally(() => clearTimeout(timeout));

            if (!response.ok) {
                throw new Error(`Feed returned HTTP ${response.status}`);
            }

            const xml = await response.text();
            const items = parseFeed(xml);
            articlesSeen += items.length;

            if (items.length === 0) {
                throw new Error('Feed contained no parseable items.');
            }

            const rows = await Promise.all(items.map(async (item) => {
                const category = inferCategory(`${item.title} ${item.description}`, source.default_category);
                const normalizedTitle = stripHtml(item.title).toLowerCase().replace(/\s+/g, ' ').trim();

                return {
                    source_id: source.id,
                    source_name: source.publisher,
                    feed_guid: item.feedGuid,
                    title: item.title,
                    normalized_title: normalizedTitle,
                    title_hash: await sha256(normalizedTitle),
                    description: item.description,
                    canonical_url: item.canonicalUrl,
                    image_url: item.imageUrl,
                    published_at: item.publishedAt,
                    fetched_at: new Date().toISOString(),
                    category,
                    location: source.default_location || source.city || source.province || source.country || 'Canada',
                    country: source.country,
                    province: source.province,
                    city: source.city,
                    author: item.author,
                    cluster_key: clusterKey(item.title) || null,
                    status: 'published',
                    is_original: false,
                    metadata: {
                        feed_url: source.feed_url,
                        source_homepage: source.homepage_url,
                    },
                };
            }));

            const { data: inserted, error: insertError } = await supabase
                .from('articles')
                .upsert(rows, {
                    onConflict: 'canonical_url',
                    ignoreDuplicates: true,
                })
                .select('id');

            if (insertError) throw insertError;

            const insertedCount = inserted?.length || 0;
            articlesInserted += insertedCount;
            articlesSkipped += Math.max(0, items.length - insertedCount);

            await supabase
                .from('sources')
                .update({
                    last_fetched_at: new Date().toISOString(),
                    last_error: null,
                })
                .eq('id', source.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : String(error);
            errors.push({ source: `${source.publisher} / ${source.name}`, message });

            await supabase
                .from('sources')
                .update({
                    last_fetched_at: new Date().toISOString(),
                    last_error: message.slice(0, 1000),
                })
                .eq('id', source.id);
        }
    }

    const status = errors.length === 0 ? 'completed' : (articlesInserted > 0 ? 'completed_with_errors' : 'failed');

    await supabase
        .from('ingestion_runs')
        .update({
            status,
            finished_at: new Date().toISOString(),
            sources_attempted: sourcesAttempted,
            articles_seen: articlesSeen,
            articles_inserted: articlesInserted,
            articles_skipped: articlesSkipped,
            errors,
        })
        .eq('id', run.id);

    return new Response(JSON.stringify({
        run_id: run.id,
        status,
        sources_attempted: sourcesAttempted,
        articles_seen: articlesSeen,
        articles_inserted: articlesInserted,
        articles_skipped: articlesSkipped,
        errors,
    }), {
        status: errors.length > 0 && articlesInserted === 0 ? 502 : 200,
        headers: { 'content-type': 'application/json' },
    });
});
