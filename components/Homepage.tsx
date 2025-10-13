
import React from 'react';
import type { Article, Weather } from '../types';
import { HeroCarousel } from './HeroCarousel';
import { ArticleCard } from './ArticleCard';
import { Link } from 'react-router-dom';
import { CategorySidebar } from './CategorySidebar';

interface HomepageProps {
    articles: Article[];
    weather: Weather | null;
}

const BreakingNewsBanner: React.FC = () => (
    <div className="bg-brand-red text-white p-3 rounded-lg my-6 text-center animate-pulse">
        <span className="font-bold mr-2">BREAKING:</span>
        <span>City council announces major transit expansion plan. More details to follow.</span>
    </div>
);

const CommunitySubmissions: React.FC = () => (
    <section>
        <div className="flex justify-between items-center border-b-4 border-brand-blue pb-2 mb-6">
            <h2 className="text-2xl md:text-3xl font-bold font-serif">Community Submissions</h2>
        </div>
        <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h3 className="text-xl font-bold font-serif mb-2">News By You</h3>
                    <p className="text-gray-600 dark:text-gray-400">See a story unfolding? Share it with your neighbours.</p>
                </div>
                <Link to="/submit" className="bg-brand-red text-white text-center font-bold py-3 px-6 rounded-md hover:bg-red-700 transition-colors flex-shrink-0">
                    Submit Your Story
                </Link>
            </div>
            <ul className="space-y-3 mt-6 border-t dark:border-gray-700 pt-4">
                <li><Link to="#" className="font-semibold hover:text-brand-blue dark:hover:text-yellow-400 transition-colors">Local park cleanup huge success, says organizer</Link></li>
                <li><Link to="#" className="font-semibold hover:text-brand-blue dark:hover:text-yellow-400 transition-colors">Photo: Sunset over the Don Valley Parkway</Link></li>
                <li><Link to="#" className="font-semibold hover:text-brand-blue dark:hover:text-yellow-400 transition-colors">High school bake sale raises $2,000 for charity</Link></li>
            </ul>
        </div>
    </section>
);

const NewsletterSignup: React.FC = () => (
     <section className="bg-blue-50 dark:bg-gray-800 p-8 rounded-lg my-8">
        <div className="text-center">
            <h3 className="text-2xl font-bold font-serif mb-2">Get Daily Updates</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">The latest news from your city, sent straight to your inbox every morning.</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <input type="email" placeholder="[Email Input]" className="flex-grow px-4 py-2 border rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue"/>
                <button type="submit" className="bg-brand-red text-white font-bold py-2 px-6 rounded-md hover:bg-red-700 transition-colors">
                    Subscribe
                </button>
            </form>
        </div>
    </section>
);

export const Homepage: React.FC<HomepageProps> = ({ articles, weather }) => {
    const heroArticles = articles.slice(0, 4);
    const latestNews = articles.slice(0, 6);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
            <aside className="lg:col-span-1">
                <CategorySidebar />
            </aside>
            <main className="lg:col-span-4">
                 <div className="space-y-10 md:space-y-12">
                    <HeroCarousel articles={heroArticles} />
                    <BreakingNewsBanner />

                    <section>
                        <div className="flex justify-between items-center border-b-4 border-brand-blue pb-2 mb-6">
                            <h2 className="text-2xl md:text-3xl font-bold font-serif">Latest News</h2>
                            <span className="text-sm font-semibold text-gray-500">Top in {weather?.location || 'Your City'}</span>
                        </div>
                        {latestNews.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {latestNews.map(article => (
                                    <ArticleCard key={article.id} article={article} />
                                ))}
                            </div>
                        ) : (
                             <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                <h3 className="text-xl font-semibold">No news articles available.</h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-2">Please check back later or try changing your location.</p>
                            </div>
                        )}
                    </section>
                    
                    <CommunitySubmissions />
                    <NewsletterSignup />
                </div>
            </main>
        </div>
    );
};
