
import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface ArticleCardProps {
    article: Article;
}

const FallbackImage = ({ category }: { category: string }) => (
    <div 
        className="w-full h-48 flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
    >
        <span className="text-white font-semibold font-serif capitalize text-lg tracking-wider">{category}</span>
    </div>
);

export const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <Link to={`/article/${article.id}`} className="block">
                {article.image ? (
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-48 object-cover group-hover:opacity-90 transition-opacity"
                        loading="lazy"
                    />
                ) : (
                    <FallbackImage category={article.category} />
                )}
            </Link>
            <div className="p-4 flex flex-col flex-grow">
                <p className="text-sm font-semibold text-brand-blue uppercase mb-1 capitalize">{article.category}</p>
                <h3 className="text-lg font-bold font-serif mb-2 flex-grow">
                    <Link to={`/article/${article.id}`} className="hover:text-brand-red dark:hover:text-yellow-400 transition-colors">
                        {article.title}
                    </Link>
                </h3>
                {article.url && !article.url.startsWith('#') && (
                    <a 
                        href={article.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-gray-500 dark:text-gray-400 hover:underline mb-2"
                        onClick={(e) => e.stopPropagation()}
                    >
                       Read original at {article.source} &rarr;
                    </a>
                )}
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 border-t border-gray-200 dark:border-gray-700">
                    <p className="mt-1">{new Date(article.published).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
            </div>
        </div>
    );
};
