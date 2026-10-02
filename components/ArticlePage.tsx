import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';
import { ArticleCard } from './ArticleCard';

const BackIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
);

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const PauseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

interface ArticlePageProps {
    article: Article;
    relatedArticles: Article[];
    sourceArticles: Article[];
}

export const ArticlePage: React.FC<ArticlePageProps> = ({
    article,
    relatedArticles,
    sourceArticles,
}) => {
    const [isAudioPlaying, setIsAudioPlaying] = useState(false);
    const [isAudioPaused, setIsAudioPaused] = useState(false);

    useEffect(() => {
        const schema = {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            name: article.title,
            description: article.description,
            datePublished: article.published,
            dateModified: article.fetched_at,
            url: window.location.href,
            isBasedOn: article.url,
            publisher: {
                '@type': 'Organization',
                name: 'MyCityNews.ca',
                url: 'https://mycitynews.ca',
            },
        };

        const scriptId = 'article-schema';
        let script = document.getElementById(scriptId) as HTMLScriptElement | null;

        if (!script) {
            script = document.createElement('script');
            script.type = 'application/ld+json';
            script.id = scriptId;
            document.head.appendChild(script);
        }

        script.textContent = JSON.stringify(schema);

        return () => {
            const scriptToRemove = document.getElementById(scriptId);
            if (scriptToRemove) document.head.removeChild(scriptToRemove);
        };
    }, [article]);

    useEffect(() => {
        return () => {
            if (window.speechSynthesis.speaking) {
                window.speechSynthesis.cancel();
            }
        };
    }, []);

    const handleListenClick = () => {
        if (isAudioPlaying) {
            window.speechSynthesis.pause();
            setIsAudioPlaying(false);
            setIsAudioPaused(true);
            return;
        }

        if (isAudioPaused) {
            window.speechSynthesis.resume();
            setIsAudioPlaying(true);
            setIsAudioPaused(false);
            return;
        }

        const textToSpeak = `${article.title}. ${article.description}`;
        const utterance = new SpeechSynthesisUtterance(textToSpeak);

        utterance.onstart = () => {
            setIsAudioPlaying(true);
            setIsAudioPaused(false);
        };

        utterance.onend = () => {
            setIsAudioPlaying(false);
            setIsAudioPaused(false);
        };

        utterance.onerror = () => {
            setIsAudioPlaying(false);
            setIsAudioPaused(false);
        };

        window.speechSynthesis.cancel();
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-5 flex items-center text-sm text-gray-500 dark:text-gray-400">
                <Link to="/" className="inline-flex items-center hover:underline">
                    <BackIcon /> Back
                </Link>
                <span className="mx-2">&gt;</span>
                <Link to={`/category/${encodeURIComponent(article.category)}`} className="capitalize hover:underline">
                    {article.category}
                </Link>
            </div>

            <article className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                {article.image && (
                    <img
                        src={article.image}
                        alt=""
                        className="max-h-[520px] w-full object-cover"
                    />
                )}

                <div className="p-6 md:p-10">
                    <div className="mb-4 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-bold uppercase tracking-wide text-brand-blue dark:text-blue-300">
                            {article.category}
                        </span>
                        <span>{article.source}</span>
                        <span>
                            {new Date(article.published).toLocaleString('en-CA', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                            })}
                        </span>
                    </div>

                    <h1 className="font-serif text-4xl font-bold leading-tight text-gray-900 dark:text-white md:text-5xl">
                        {article.title}
                    </h1>

                    {article.author && (
                        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                            By {article.author}
                        </p>
                    )}

                    <div className="mt-6">
                        <button
                            onClick={handleListenClick}
                            className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2 text-sm font-semibold hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                            {isAudioPlaying ? <PauseIcon /> : <PlayIcon />}
                            {isAudioPlaying ? 'Pause summary' : (isAudioPaused ? 'Resume summary' : 'Listen to summary')}
                        </button>
                    </div>

                    <section className="mt-8 border-t border-gray-200 pt-8 dark:border-gray-700">
                        <h2 className="font-serif text-2xl font-bold">Summary</h2>
                        <p className="mt-4 text-lg leading-8 text-gray-700 dark:text-gray-300">
                            {article.description || 'The source feed did not provide a summary for this story.'}
                        </p>
                    </section>

                    <section className="mt-8 rounded-lg bg-gray-100 p-5 dark:bg-gray-900">
                        <p className="text-sm leading-6 text-gray-600 dark:text-gray-400">
                            This is an aggregated story. MyCityNews preserves the original publisher and links readers to the source rather than reproducing the full article.
                        </p>

                        <a
                            href={article.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-4 inline-flex rounded-md bg-brand-red px-6 py-3 font-bold text-white transition-colors hover:bg-red-700"
                        >
                            Read the full story at {article.source}
                        </a>
                    </section>
                </div>
            </article>

            {relatedArticles.length > 0 && (
                <section className="mt-12 border-t border-gray-300 pt-8 dark:border-gray-700">
                    <h2 className="mb-6 font-serif text-2xl font-bold md:text-3xl">Related coverage</h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {relatedArticles.map((related) => (
                            <ArticleCard key={related.id} article={related} />
                        ))}
                    </div>
                </section>
            )}

            {sourceArticles.length > 0 && (
                <section className="mt-12 border-t border-gray-300 pt-8 dark:border-gray-700">
                    <h2 className="mb-6 font-serif text-2xl font-bold md:text-3xl">
                        More from {article.source}
                    </h2>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                        {sourceArticles.map((sourceArticle) => (
                            <ArticleCard key={sourceArticle.id} article={sourceArticle} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
};
