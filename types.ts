export type Category =
    'canada' |
    'indigenous' |
    'politics' |
    'business' |
    'technology' |
    'sports' |
    'health' |
    'science' |
    'entertainment' |
    'world' |
    'social' |
    'local' |
    'general';

export interface Article {
    id: string;
    title: string;
    description: string;
    url: string;
    source: string;
    image: string | null;
    published: string;
    location: string;
    category: Category;
    author?: string;
    fetched_at: string;
    city?: string;
    province?: string;
    country?: string;
    clusterKey?: string;
}

export interface Weather {
    temperature: number;
    condition: string;
    icon: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
    location: string;
}
