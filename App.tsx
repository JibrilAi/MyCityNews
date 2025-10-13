import React, { useState, useEffect, useCallback, useRef } from 'react';
import { HashRouter, Routes, Route, useParams, Link } from 'react-router-dom';
import type { Article, Category, Weather } from './types';
import { CATEGORIES } from './constants';
import { GoogleGenAI } from "@google/genai";

import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { Homepage } from './components/Homepage';
import { ArticlePage } from './components/ArticlePage';
import { CategoryPage } from './components/CategoryPage';
import { Spinner } from './components/Spinner';
import { SearchResults } from './components/SearchResults';
import { PullToRefreshContainer } from './components/PullToRefreshContainer';
import { NotificationBanner } from './components/NotificationBanner';
import { SubmitStoryPage } from './components/SubmitStoryPage';

const App: React.FC = () => {
    const [allArticles, setAllArticles] = useState<Article[]>([]);
    const [filteredArticles, setFilteredArticles] = useState<Article[]>([]);
    const [location, setLocation] = useState<string>('Toronto');
    const [weather, setWeather] = useState<Weather | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
    const [notification, setNotification] = useState<string | null>(null);

    const aiRef = useRef<GoogleGenAI | null>(null);
    const allArticlesRef = useRef<Article[]>(allArticles);
    const isFetchingNewsRef = useRef(false);
    const isGeneratingImagesRef = useRef(false);

    useEffect(() => {
        allArticlesRef.current = allArticles;
    }, [allArticles]);

    useEffect(() => {
        aiRef.current = new GoogleGenAI({ apiKey: process.env.API_KEY });
    }, []);

    useEffect(() => {
        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [isDarkMode]);

    const generateImagesForArticles = useCallback(async (articlesToProcess: Article[]) => {
        if (isGeneratingImagesRef.current) {
            console.log("Image generation already in progress. Skipping.");
            return;
        }

        const ai = aiRef.current;
        if (!ai || articlesToProcess.length === 0) return;

        const articlesNeedingImages = articlesToProcess.filter(
            article => !article.image || article.image.includes('placehold.co') || article.image.includes('picsum.photos')
        );

        if (articlesNeedingImages.length === 0) return;
        
        isGeneratingImagesRef.current = true;
        console.log(`Starting image generation for ${articlesNeedingImages.length} articles.`);
        
        const generatedImagesMap = new Map<string, string>();

        for (const article of articlesNeedingImages) {
            try {
                const prompt = `A visually appealing and relevant image for a news article with the title "${article.title}" and summary: "${article.description}". The image should be in a modern photorealistic style, suitable for a news website header. Do not include any text or logos in the image.`;
                
                const response = await ai.models.generateImages({
                    model: 'imagen-4.0-generate-001',
                    prompt: prompt,
                    config: {
                        numberOfImages: 1,
                        outputMimeType: 'image/jpeg',
                        aspectRatio: '16:9',
                    },
                });

                if (response.generatedImages && response.generatedImages.length > 0) {
                    const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                    const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
                    generatedImagesMap.set(article.id, imageUrl);
                }
            } catch (err: any) {
                console.error(`Failed to generate image for article "${article.title}":`, err);
                if (err && typeof err.message === 'string' && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'))) {
                    console.warn("Rate limit hit during image generation. Aborting for now.");
                    setNotification("Image service is busy. Some images may not load.");
                    setTimeout(() => setNotification(null), 5000);
                    break; 
                }
            }
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        
        if (generatedImagesMap.size > 0) {
            setAllArticles(currentArticles =>
                currentArticles.map(art => {
                    const newImage = generatedImagesMap.get(art.id);
                    return newImage ? { ...art, image: newImage } : art;
                })
            );
        }
        isGeneratingImagesRef.current = false;
        console.log("Image generation process finished.");
    }, []);
    
    const fetchNewsContent = useCallback(async () => {
        if (allArticles.length === 0) {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch('/articles.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                const initialArticles = data.articles || [];
                setAllArticles(initialArticles);
                generateImagesForArticles(initialArticles);
            } catch (err) {
                console.error("Error fetching articles.json:", err);
                setError("Failed to load initial news content. Please ensure 'articles.json' is available.");
                setAllArticles([]);
            } finally {
                setIsLoading(false);
            }
        }
    }, [allArticles.length, generateImagesForArticles]);

    const fetchAndMergeLiveNews = useCallback(async () => {
        if (isFetchingNewsRef.current) {
            console.log("Already fetching news, skipping this request.");
            setNotification("Already checking for the latest news...");
            setTimeout(() => setNotification(null), 3000);
            return;
        }

        isFetchingNewsRef.current = true;
        console.log("Attempting to fetch and categorize live news...");
        setNotification(null);
        try {
            const ai = aiRef.current;
            if (!ai) {
                console.error("AI client not initialized.");
                return;
            }
            const recentTitles = allArticlesRef.current.slice(0, 10).map(a => a.title);
            
            const validCategories = CATEGORIES.filter(c => c !== 'general' && c !== 'local');

            const prompt = `You are a news aggregation AI. Your task is to find 4 recent, diverse, top news stories from Canada.
            Existing article titles to avoid if possible: ${JSON.stringify(recentTitles)}.
            For each story, you must provide:
            1. title: The headline of the article.
            2. description: A detailed, single-paragraph summary.
            3. url: The direct URL to the original article.
            4. source: The name of the news publication (e.g., "CBC News").
            5. category: The most appropriate category from this list: ${JSON.stringify(validCategories)}.
    
            Your response MUST be a single, valid JSON array of objects inside a markdown code block. Do not include any other text, explanation, or commentary outside of the markdown block.
            The JSON structure must be:
            [{ "title": string, "description": string, "url": string, "source": string, "category": string }]`;

            console.log("Generating categorized content with search tool...");
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    tools: [{ googleSearch: {} }],
                },
            });

            const responseText = response.text;
            console.log("Raw AI Response:", responseText);

            const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
            if (!jsonMatch || !jsonMatch[1]) {
                console.error("Could not find a JSON markdown block in the response.");
                setNotification("Received an invalid format from the news service.");
                setTimeout(() => setNotification(null), 5000);
                return;
            }

            const jsonString = jsonMatch[1];
            console.log("Extracted JSON String:", jsonString);

            let parsedArticles;
            try {
                parsedArticles = JSON.parse(jsonString);
            } catch (jsonError) {
                console.error("Failed to parse extracted JSON string. String was:", jsonString, "Error:", jsonError);
                setNotification("Failed to process news data.");
                setTimeout(() => setNotification(null), 5000);
                return;
            }

            if (Array.isArray(parsedArticles)) {
                const validCategoriesSet = new Set(CATEGORIES);
                const mappedArticles: Article[] = parsedArticles.map((item: any, index: number) => {
                    const seed = `gen-${Date.now()}-${index}`;
                    
                    const articleCategory = (item.category && validCategoriesSet.has(item.category.toLowerCase()))
                        ? item.category.toLowerCase() as Category
                        : 'general' as Category;

                    if (item.category && !validCategoriesSet.has(item.category.toLowerCase())) {
                        console.warn(`Received invalid category '${item.category}', falling back to 'general'.`);
                    }
                    
                    return {
                        id: seed,
                        title: item.title || 'Untitled',
                        description: item.description || 'No description available.',
                        url: item.url || `#${seed}`,
                        source: item.source || 'Unknown Source',
                        image: null,
                        published: new Date().toISOString(),
                        location: 'Canada',
                        category: articleCategory,
                        author: 'AI News Desk',
                        fetched_at: new Date().toISOString(),
                    }
                });
                console.log("Mapped Articles (with categories):", mappedArticles);

                const newArticles = mappedArticles.filter(article => 
                    article.title && article.title !== 'Untitled' && 
                    article.description && article.description !== 'No description available.' &&
                    (article.url.startsWith('http://') || article.url.startsWith('https://'))
                );
                console.log("Filtered Articles (passed quality control):", newArticles);

                if (newArticles.length === 0) {
                    console.log("No new articles passed the quality control filter.");
                    setNotification("Checked for new stories, but you're already up to date.");
                    setTimeout(() => setNotification(null), 5000);
                    return;
                }

                setAllArticles(prevArticles => {
                    const existingArticleUrls = new Set(prevArticles.map(a => a.url));
                    const uniqueNewArticles = newArticles.filter(a => !existingArticleUrls.has(a.url));
                    console.log("Unique New Articles (after de-duplication):", uniqueNewArticles);
                    
                    if (uniqueNewArticles.length > 0) {
                        const message = `Successfully added ${uniqueNewArticles.length} new stories.`;
                        console.log(message);
                        setNotification(message);
                        setTimeout(() => setNotification(null), 5000);
                        generateImagesForArticles(uniqueNewArticles);
                        return [...uniqueNewArticles, ...prevArticles];
                    } else {
                        const message = "Checked for new stories, but you're already up to date.";
                        console.log(message);
                        setNotification(message);
                        setTimeout(() => setNotification(null), 5000);
                        return prevArticles;
                    }
                });
            } else {
                 console.error("Parsed data is not an array. Data:", parsedArticles);
                 setNotification("Received malformed news data from the news service.");
                 setTimeout(() => setNotification(null), 5000);
            }
        } catch (err: any) {
            console.error("A critical error occurred while fetching live news:", err);
            let errorMessage = "A network error occurred while fetching news.";
            if (err && typeof err.message === 'string' && (err.message.includes('429') || err.message.includes('RESOURCE_EXHAUSTED'))) {
                errorMessage = "News service is currently busy. Please try again later.";
            }
            setNotification(errorMessage);
            setTimeout(() => setNotification(null), 5000);
        } finally {
            isFetchingNewsRef.current = false;
        }
    }, [generateImagesForArticles]);


    useEffect(() => {
        fetchNewsContent();
    }, [fetchNewsContent]);

    useEffect(() => {
        const initialFetchTimeout = setTimeout(() => {
            fetchAndMergeLiveNews();
        }, 20000);
        const intervalId = setInterval(fetchAndMergeLiveNews, 10 * 60 * 1000);
        return () => {
            clearTimeout(initialFetchTimeout);
            clearInterval(intervalId);
        };
    }, [fetchAndMergeLiveNews]);

    useEffect(() => {
        if (location === 'Canada' || location === 'World') {
            setFilteredArticles(allArticles);
        } else {
            const locationSpecificArticles = allArticles.filter(
                article => article.location.toLowerCase() === location.toLowerCase()
            );
            setFilteredArticles(locationSpecificArticles.length > 0 ? locationSpecificArticles : allArticles);
        }
    }, [location, allArticles]);

    useEffect(() => {
        const fetchWeatherData = () => {
            const mockWeather: Weather = {
                temperature: 18,
                condition: 'Partly Cloudy',
                icon: 'cloudy',
                location: location
            };
            setWeather(mockWeather);
        };
        fetchWeatherData();
    }, [location]);

    const handleAddArticle = (newArticleData: { title: string; description: string; author: string; category: Category }) => {
        const newArticle: Article = {
            ...newArticleData,
            id: `user-gen-${Date.now()}`,
            published: new Date().toISOString(),
            fetched_at: new Date().toISOString(),
            url: '#',
            source: 'Community Submission',
            image: null,
            location: location,
        };
        setAllArticles(prevArticles => [newArticle, ...prevArticles]);
        generateImagesForArticles([newArticle]);
        setNotification("Your story has been submitted successfully! Generating a cover image...");
        setTimeout(() => setNotification(null), 5000);
    };

    const ArticleWrapper = () => {
        const { id } = useParams();
        const article = allArticles.find(a => a.id.toString() === id);
        if (!article) return <div className="text-center py-10">Article not found. <Link to="/" className="text-brand-blue hover:underline">Go back home</Link></div>;
        const relatedArticles = allArticles.filter(a => a.category === article.category && a.id !== article.id).slice(0, 3);
        const sourceArticles = allArticles.filter(a => a.source === article.source && a.id !== article.id).slice(0, 3);
        return <ArticlePage article={article} relatedArticles={relatedArticles} sourceArticles={sourceArticles} />;
    };

    const CategoryWrapper = () => {
        const { categoryName } = useParams();
        const decodedCategoryName = decodeURIComponent(categoryName || '');
        const categoryArticles = allArticles.filter(a => a.category.toLowerCase() === decodedCategoryName.toLowerCase());
        return <CategoryPage category={decodedCategoryName as Category} articles={categoryArticles} />;
    };

    const handleRefresh = async () => {
        await fetchAndMergeLiveNews();
    };

    return (
        <HashRouter>
            <div className="flex flex-col min-h-screen">
                <Header 
                    isDarkMode={isDarkMode} 
                    setIsDarkMode={setIsDarkMode} 
                    location={location}
                    setLocation={setLocation}
                />
                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
                    <NotificationBanner message={notification} onClose={() => setNotification(null)} />
                    {isLoading && !allArticles.length ? (
                        <div className="flex justify-center items-center h-96">
                            <Spinner />
                        </div>
                    ) : error ? (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    ) : (
                        <Routes>
                            <Route path="/" element={
                                <PullToRefreshContainer onRefresh={handleRefresh}>
                                    <Homepage articles={filteredArticles} weather={weather} />
                                </PullToRefreshContainer>
                            } />
                            <Route path="/article/:id" element={<ArticleWrapper />} />
                            <Route path="/category/:categoryName" element={
                                <PullToRefreshContainer onRefresh={handleRefresh}>
                                     <CategoryWrapper />
                                </PullToRefreshContainer>
                            } />
                            <Route path="/search" element={<SearchResults articles={allArticles} />} />
                            <Route path="/submit" element={<SubmitStoryPage onAddArticle={handleAddArticle} />} />
                        </Routes>
                    )}
                </main>
                <Footer />
            </div>
        </HashRouter>
    );
};

export default App;