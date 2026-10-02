import React from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface ArticleCardProps {
    article: Article;
    variant?: 'standard' | 'featured';
}

const FallbackImage = ({ category, heightClass }: { category: string; heightClass: string }) => (
    <div
        className={`${heightClass} flex w-full items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900`}
    >
        <span className="font-serif text-lg font-semibold capitalize tracking-wider text-white">
            {category}
        </span>
    </div>
);

function formatPublished(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';

    return date.toLocaleString('en-CA', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export const ArticleCard: React.FC<ArticleCardProps> = ({ article, variant = 'standard' }) => {
    const isFeatured = variant === 'featured';
    const imageHeight = isFeatured ? 'h-64 md:h-80' : 'h-44';
    const titleSize = isFeatured ? 'text-2xl md:text-3xl' : 'text-lg';

    return (
        <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <Link to={`/article/${article.id}`} className="block overflow-hidden">
                {article.image ? (
                    <img
                        src={article.image}
                        alt=""
                        className={`${imageHeight} w-full object-cover transition duration-300 group-hover:scale-[1.02]`}
                        loading="lazy"
                    />
                ) : (
                    <FallbackImage category={article.category} heightClass={imageHeight} />
                )}
            </Link>

            <div className="flex flex-grow flex-col p-4">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold uppercase tracking-wide text-brand-blue dark:text-blue-300">
                        {article.category}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400">
                        {formatPublished(article.published)}
                    </span>
                </div>

                <h3 className={`${titleSize} flex-grow font-serif font-bold leading-tight`}>
                    <Link
                        to={`/article/${article.id}`}
                        className="transition-colors hover:text-brand-red dark:hover:text-yellow-300"
                    >
                        {article.title}
                    </Link>
                </h3>

                {isFeatured && article.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {article.description}
                    </p>
                )}

                <div className="mt-4 border-t border-gray-200 pt-3 text-xs text-gray-500 dark:border-gray-700 dark:text-gray-400">
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {article.source}
                    </span>
                </div>
            </div>
        </article>
    );
};
