import type { Article, Category } from '../types';

export type NewsBackendMode = 'supabase' | 'static-fallback';

export interface NewsLoadResult {
    articles: Article[];
    mode: NewsBackendMode;
    warning?: string;
}

interface SupabaseArticleRow {
    id: string;
    title: string;
    description: string | null;
    canonical_url: string;
    source_name: string;
    image_url: string | null;
    published_at: string;
    fetched_at: string;
    category: string;
    location: string | null;
    city: string | null;
    province: string | null;
    country: string | null;
    author: string | null;
    cluster_key: string | null;
}

const VALID_CATEGORIES = new Set<Category>([
    'canada',
    'indigenous',
    'politics',
    'business',
    'technology',
    'sports',
    'health',
    'science',
    'entertainment',
    'world',
    'social',
    'local',
    'general',
]);

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.replace(/\/$/, '');
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

function normalizeCategory(value: string): Category {
    const normalized = value.toLowerCase() as Category;
    return VALID_CATEGORIES.has(normalized) ? normalized : 'general';
}

function mapRow(row: SupabaseArticleRow): Article {
    return {
        id: row.id,
        title: row.title,
        description: row.description || '',
        url: row.canonical_url,
        source: row.source_name,
        image: row.image_url,
        published: row.published_at,
        fetched_at: row.fetched_at,
        location: row.location || row.city || row.province || row.country || 'Canada',
        category: normalizeCategory(row.category),
        author: row.author || undefined,
        city: row.city || undefined,
        province: row.province || undefined,
        country: row.country || undefined,
        clusterKey: row.cluster_key || undefined,
    };
}

async function fetchSupabaseArticles(): Promise<Article[] | null> {
    if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
        return null;
    }

    const query = new URLSearchParams({
        select: 'id,title,description,canonical_url,source_name,image_url,published_at,fetched_at,category,location,city,province,country,author,cluster_key',
        status: 'eq.published',
        order: 'published_at.desc',
        limit: '250',
    });

    const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?${query.toString()}`, {
        headers: {
            apikey: SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
            Accept: 'application/json',
        },
    });

    if (!response.ok) {
        const detail = await response.text();
        throw new Error(`Supabase news request failed (${response.status}): ${detail.slice(0, 200)}`);
    }

    const rows = await response.json() as SupabaseArticleRow[];
    return rows.map(mapRow);
}

async function fetchStaticFallback(): Promise<Article[]> {
    const response = await fetch('/articles.json', { cache: 'no-store' });
    if (!response.ok) {
        throw new Error(`Static fallback request failed (${response.status}).`);
    }

    const data = await response.json();
    return Array.isArray(data.articles) ? data.articles : [];
}

export async function loadNewsArticles(): Promise<NewsLoadResult> {
    try {
        const liveArticles = await fetchSupabaseArticles();
        if (liveArticles) {
            return {
                articles: liveArticles,
                mode: 'supabase',
            };
        }
    } catch (error) {
        console.error('Live news backend failed. Falling back to local demo data.', error);
        const fallback = await fetchStaticFallback();
        return {
            articles: fallback,
            mode: 'static-fallback',
            warning: 'Live news is temporarily unavailable. Showing local demo data.',
        };
    }

    return {
        articles: await fetchStaticFallback(),
        mode: 'static-fallback',
        warning: 'Live news backend is not configured. Showing local demo data.',
    };
}
