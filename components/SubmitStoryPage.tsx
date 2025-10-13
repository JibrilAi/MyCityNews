import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import type { Article, Category } from '../types';
import { CATEGORIES } from '../constants';

interface SubmitStoryPageProps {
  onAddArticle: (articleData: { title: string; description: string; author: string; category: Category }) => void;
}

export const SubmitStoryPage: React.FC<SubmitStoryPageProps> = ({ onAddArticle }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState<Category>('local');
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (title.trim() && description.trim()) {
            onAddArticle({
                title: title.trim(),
                description: description.trim(),
                author: author.trim() || 'Community Contributor',
                category: category,
            });
            navigate('/');
        }
    };

    const isFormValid = title.trim() && description.trim();
    
    // Exclude 'general' category as it's for AI-fetched news
    const userSelectableCategories = CATEGORIES.filter(c => c !== 'general');

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
            <div className="border-b-4 border-brand-blue pb-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-bold font-serif">Submit Your Story</h1>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Share what's happening in your community. Your submission will be reviewed by our editors.</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label htmlFor="story-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Story Title
                    </label>
                    <input
                        type="text"
                        id="story-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        placeholder="e.g., Local Park Gets a New Playground"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="story-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Category
                    </label>
                    <select
                        id="story-category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value as Category)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        required
                    >
                        {userSelectableCategories.map(cat => (
                            <option key={cat} value={cat} className="capitalize">{cat}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="story-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Story
                    </label>
                    <textarea
                        id="story-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        placeholder="Describe the event or story in detail..."
                        required
                    ></textarea>
                </div>
                 <div>
                    <label htmlFor="author-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Your Name (Optional)
                    </label>
                    <input
                        type="text"
                        id="author-name"
                        value={author}
                        onChange={(e) => setAuthor(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                        placeholder="Let us know who to credit for the story"
                    />
                </div>
                <div className="flex items-center justify-end space-x-4 pt-4 border-t dark:border-gray-700">
                    <Link to="/" className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors">
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={!isFormValid}
                        className="px-6 py-2 bg-brand-red text-white font-bold rounded-md hover:bg-red-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Submit Story
                    </button>
                </div>
            </form>
        </div>
    );
};