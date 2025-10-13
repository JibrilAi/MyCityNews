import React, { useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import type { Article } from '../types';
import { ArticleCard } from './ArticleCard';

interface SearchResultsProps {
    articles: Article[];
}

export const SearchResults: React.FC<SearchResultsProps> = ({ articles }) => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');

    const filteredArticles = useMemo(() => {
        if (!query) return [];
        const lowercasedQuery = query.toLowerCase();
        return articles.filter(article =>
            article.title.toLowerCase().includes(lowercasedQuery) ||
            article.description.toLowerCase().includes(lowercasedQuery)
        );
    }, [articles, query]);

    return (
        <div>
            <div className="border-b-4 border-brand-blue pb-2 mb-8">
                <h1 className="text-3xl md:text-4xl font-bold font-serif">
                    {query ? `Search Results for "${query}"` : 'Search Articles'}
                </h1>
            </div>

            {query && (
                <p className="mb-8 text-gray-600 dark:text-gray-400">
                    Found {filteredArticles.length} matching articles.
                </p>
            )}

            {query ? (
                filteredArticles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredArticles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold mb-2">No Articles Found</h2>
                        <p className="text-gray-600 dark:text-gray-400">Your search for "{query}" did not return any results. Please try different keywords.</p>
                        <Link to="/" className="mt-6 inline-block bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                            Back to Homepage
                        </Link>
                    </div>
                )
            ) : (
                 <div className="text-center py-16">
                    <h2 className="text-2xl font-semibold mb-2">What Are You Looking For?</h2>
                    <p className="text-gray-600 dark:text-gray-400">Use the search bar at the top of the page to find articles by keyword.</p>
                </div>
            )}
        </div>
    );
};