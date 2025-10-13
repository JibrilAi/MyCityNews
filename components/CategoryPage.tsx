import React from 'react';
import type { Article, Category } from '../types';
import { ArticleCard } from './ArticleCard';
import { Link } from 'react-router-dom';
import { CategorySidebar } from './CategorySidebar';

interface CategoryPageProps {
    category: Category;
    articles: Article[];
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ category, articles }) => {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
            <aside className="lg:col-span-1">
                <CategorySidebar />
            </aside>
            <main className="lg:col-span-4">
                <div className="border-b-4 border-brand-blue pb-2 mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold font-serif capitalize">{category}</h1>
                </div>
                
                {articles.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {articles.map(article => (
                            <ArticleCard key={article.id} article={article} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <h2 className="text-2xl font-semibold mb-2">No articles found in this category.</h2>
                        <p className="text-gray-600 dark:text-gray-400">Check back later for more stories.</p>
                        <Link to="/" className="mt-4 inline-block bg-brand-blue text-white font-bold py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                            Go to Homepage
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
};