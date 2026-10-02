import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HashRouter, Link, Route, Routes, useParams } from 'react-router-dom';
import type { Article, Category } from './types';

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Homepage } from './components/Homepage';
import { ArticlePage } from './components/ArticlePage';
import { CategoryPage } from './components/CategoryPage';
import { Spinner } from './components/Spinner';
import { SearchResults } from './components/SearchResults';
import { PullToRefreshContainer } from './components/PullToRefreshContainer';
import { NotificationBanner } from './components/NotificationBanner';
import { loadNewsArticles, type NewsBackendMode } from './services/newsService';

const App: React.FC = () => {
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [location, setLocation] = useState<string>('Toronto');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [notification, setNotification] = useState<string | null>(null);
    const [backendMode, setBackendMode] = useState<NewsBackendMode>('static-fallback');
    const hasShownFallbackNotice = useRef(false);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const loadNews = useCallback(async (showLoading = false) => {
        if (showLoading) setIsLoading(true);
        setError(null);

        try {
            const result = await loadNewsArticles();
            setAllArticles(result.articles);
            setBackendMode(result.mode);

            if (result.warning && !hasShownFallbackNotice.current) {
                hasShownFallbackNotice.current = true;
                setNotification(result.warning);
                setTimeout(() => setNotification(null), 6000);
            }
        } catch (loadError) {
            console.error('Failed to load news.', loadError);
            setError('MyCityNews could not load news content. Please try again shortly.');
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadNews(true);
        const intervalId = window.setInterval(() => loadNews(false), 5 * 60 * 1000);
        return () => window.clearInterval(intervalId);
    }, [loadNews]);

    useEffect(() => {
        const normalizedLocation = location.trim().toLowerCase();

        if (normalizedLocation === 'canada' || normalizedLocation === 'world') {
            setFilteredArticles(allArticles);
            return;
        }

        const locationSpecificArticles = allArticles.filter((article) => {
            const candidates = [
                article.location,
                article.city,
                article.province,
                article.country,
            ]
                .filter(Boolean)
                .map((value) => value!.toLowerCase());

            return candidates.includes(normalizedLocation);
        });

        setFilteredArticles(locationSpecificArticles.length > 0 ? locationSpecificArticles : allArticles);
    }, [location, allArticles]);

    const ArticleWrapper = () => {
        const { id } = useParams();
        const article = allArticles.find((item) => item.id.toString() === id);

        if (!article) {
            return (
                <div className="text-center py-10">
                    Article not found.{' '}
                    <Link to="/" className="text-brand-blue hover:underline">
                        Go back home
                    </Link>
                </div>
            );
        }

        const relatedArticles = allArticles
            .filter((item) => item.category === article.category && item.id !== article.id)
            .slice(0, 3);

        const sourceArticles = allArticles
            .filter((item) => item.source === article.source && item.id !== article.id)
            .slice(0, 3);

        return (
            <ArticlePage
                article={article}
                relatedArticles={relatedArticles}
                sourceArticles={sourceArticles}
            />
        );
    };

    const CategoryWrapper = () => {
        const { categoryName } = useParams();
        const decodedCategoryName = decodeURIComponent(categoryName || '');
        const categoryArticles = allArticles.filter(
            (article) => article.category.toLowerCase() === decodedCategoryName.toLowerCase(),
        );

        return (
            <CategoryPage
                category={decodedCategoryName as Category}
                articles={categoryArticles}
            />
        );
    };

    return (
        <HashRouter>
            <div className="flex min-h-screen flex-col">
                <Header
                    isDarkMode={isDarkMode}
                    setIsDarkMode={setIsDarkMode}
                    location={location}
                    setLocation={setLocation}
                />

                <main className="container mx-auto flex-grow px-4 py-6 sm:px-6 md:py-8 lg:px-8">
                    <NotificationBanner message={notification} onClose={() => setNotification(null)} />

                    {isLoading && !allArticles.length ? (
                        <div className="flex h-96 items-center justify-center">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="rounded-md border-l-4 border-red-500 bg-red-100 p-4 text-red-700" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <Routes>
                            <Route
                                path="/"
                                element={
                                    <PullToRefreshContainer onRefresh={() => loadNews(false)}>
                                        <Homepage
                                            articles={filteredArticles}
                                            location={location}
                                            isLive={backendMode === 'supabase'}
                                        />
                                    </PullToRefreshContainer>
                                }
                            />
                            <Route path="/article/:id" element={<ArticleWrapper />} />
                            <Route
                                path="/category/:categoryName"
                                element={
                                    <PullToRefreshContainer onRefresh={() => loadNews(false)}>
                                        <CategoryWrapper />
                                    </PullToRefreshContainer>
                                }
                            />
                            <Route path="/search" element={<SearchResults articles={allArticles} />} />
                        </Routes>
                    )}
                </main>

                <Footer />
            </div>
        </HashRouter>
    );
};

export default App;
