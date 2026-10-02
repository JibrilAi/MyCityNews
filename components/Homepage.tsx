import React from 'react';
import { Link } from 'react-router-dom';
import type { Article, Category } from '../types';
import { ArticleCard } from './ArticleCard';

interface HomepageProps {
    articles: Article[];
    location: string;
    isLive: boolean;
}

interface NewsSectionProps {
    title: string;
    articles: Article[];
    category?: Category;
    featuredFirst?: boolean;
}

const NewsSection: React.FC<NewsSectionProps> = ({
    title,
    articles,
    category,
    featuredFirst = false,
}) => {
    if (articles.length === 0) return null;

    const sectionArticles = articles.slice(0, 8);
    const first = sectionArticles[0];
    const remainder = featuredFirst ? sectionArticles.slice(1) : sectionArticles;

    return (
        <section>
            <div className="mb-5 flex items-end justify-between border-b border-gray-300 pb-3 dark:border-gray-700">
                <h2 className="font-serif text-2xl font-bold md:text-3xl">{title}</h2>
                {category && (
                    <Link
                        to={`/category/${encodeURIComponent(category)}`}
                        className="text-sm font-semibold text-brand-blue hover:underline dark:text-blue-300"
                    >
                        View all
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
                {featuredFirst && first && (
                    <div className="md:col-span-2 xl:col-span-2">
                        <ArticleCard article={first} variant="featured" />
                    </div>
                )}

                {remainder.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                ))}
            </div>
        </section>
    );
};

export const Homepage: React.FC<HomepageProps> = ({ articles, location, isLive }) => {
    const sorted = [...articles].sort(
        (a, b) => new Date(b.published).getTime() - new Date(a.published).getTime(),
    );

    const localStories = sorted.filter((article) => {
        const normalizedLocation = location.toLowerCase();
        return [article.location, article.city, article.province]
            .filter(Boolean)
            .some((value) => value!.toLowerCase() === normalizedLocation);
    });

    const categorySections: Array<{ title: string; category: Category }> = [
        { title: 'Canada', category: 'canada' },
        { title: 'Politics', category: 'politics' },
        { title: 'Business', category: 'business' },
        { title: 'Technology', category: 'technology' },
        { title: 'Sports', category: 'sports' },
        { title: 'Entertainment', category: 'entertainment' },
        { title: 'Health', category: 'health' },
        { title: 'Science', category: 'science' },
        { title: 'World', category: 'world' },
    ];

    if (sorted.length === 0) {
        return (
            <div className="rounded-xl bg-white p-12 text-center shadow-sm dark:bg-gray-800">
                <h1 className="font-serif text-3xl font-bold">No stories are available yet.</h1>
                <p className="mt-3 text-gray-600 dark:text-gray-400">
                    The source registry may still be waiting for its first ingestion run.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-12">
            <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="mb-1 text-xs font-bold uppercase tracking-[0.2em] text-brand-red">
                            MyCityNews
                        </p>
                        <h1 className="font-serif text-3xl font-bold md:text-4xl">
                            What is happening in {location}
                        </h1>
                        <p className="mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
                            Local, Canadian and global stories from original publishers, organized in one place.
                        </p>
                    </div>

                    <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {isLive ? 'Live aggregated feed' : 'Development data'}
                    </div>
                </div>
            </section>

            <NewsSection title="Top Stories" articles={sorted.slice(0, 8)} featuredFirst />

            {localStories.length > 0 && (
                <NewsSection title={`${location} Right Now`} articles={localStories} featuredFirst />
            )}

            <NewsSection title="The Latest" articles={sorted.slice(0, 8)} />

            {categorySections.map(({ title, category }) => {
                const sectionArticles = sorted.filter((article) => article.category === category);
                return (
                    <NewsSection
                        key={category}
                        title={title}
                        articles={sectionArticles}
                        category={category}
                        featuredFirst
                    />
                );
            })}

            <section className="rounded-xl bg-gray-100 p-8 text-center dark:bg-gray-800">
                <h2 className="font-serif text-2xl font-bold">Original reporting stays with the publisher.</h2>
                <p className="mx-auto mt-2 max-w-2xl text-gray-600 dark:text-gray-400">
                    MyCityNews summarizes and organizes source-provided feed information, then links readers to the original publication.
                </p>
            </section>
        </div>
    );
};
