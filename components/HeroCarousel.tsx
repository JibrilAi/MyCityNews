import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import type { Article } from '../types';

interface HeroCarouselProps {
    articles: Article[];
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ articles }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // FIX: When the articles prop changes (e.g., due to location filtering),
    // the currentIndex could become out of bounds. This effect resets the
    // index to 0 to prevent a crash when trying to access an invalid index.
    useEffect(() => {
        if (currentIndex >= articles.length) {
            setCurrentIndex(0);
        }
    }, [articles]);

    const nextSlide = useCallback(() => {
        if (articles.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex + 1) % articles.length);
    }, [articles.length]);

    const prevSlide = () => {
        if (articles.length === 0) return;
        setCurrentIndex((prevIndex) => (prevIndex - 1 + articles.length) % articles.length);
    };

    useEffect(() => {
        if (articles.length > 1) {
            const timer = setInterval(nextSlide, 5000);
            return () => clearInterval(timer);
        }
    }, [articles.length, nextSlide]);

    if (articles.length === 0) {
        return (
             <div className="relative w-full h-80 md:h-[500px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No top stories available for this location.</p>
             </div>
        );
    }
    
    const activeArticle = articles[currentIndex];

    // FIX: After the index is reset by the effect, it's possible activeArticle is not yet 
    // updated for this render pass. This guard prevents rendering with a stale, invalid article.
    if (!activeArticle) {
        return (
             <div className="relative w-full h-80 md:h-[500px] bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Loading stories...</p>
             </div>
        );
    }


    return (
        <div className="relative w-full h-80 md:h-[500px] rounded-lg overflow-hidden shadow-2xl">
            {articles.map((article, index) => (
                 <div
                    key={article.id}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img 
                        src={article.image || `https://picsum.photos/seed/${article.id}/1200/800`} 
                        alt={article.title} 
                        className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                </div>
            ))}

            <div className="absolute bottom-0 left-0 p-4 md:p-8 text-white w-full md:w-3/4 lg:w-2/3">
                <span className="bg-brand-red text-white text-xs font-bold uppercase px-2 py-1 rounded mb-2 inline-block capitalize">{activeArticle.category}</span>
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold font-serif leading-tight mb-2 md:mb-4">
                    <Link to={`/article/${activeArticle.id}`} className="hover:underline">
                        {activeArticle.title}
                    </Link>
                </h1>
                <p className="hidden md:block text-gray-200">{activeArticle.description}</p>
            </div>
            
            {articles.length > 1 && (
                <>
                    <button onClick={prevSlide} className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white transition-colors" aria-label="Previous slide">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={nextSlide} className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 p-2 rounded-full text-white transition-colors" aria-label="Next slide">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
                        {articles.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setCurrentIndex(index)}
                                className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-colors ${index === currentIndex ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                                aria-label={`Go to slide ${index + 1}`}
                            ></button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};