
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
    published: string; // ISO 8601 format
    location: string;
    category: Category;
    author?: string;
    fetched_at: string;
}

// FIX: Define and export the Weather type to resolve the import error in WeatherWidget.tsx.
export interface Weather {
    temperature: number;
    condition: string;
    icon: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'snowy';
    location: string;
}