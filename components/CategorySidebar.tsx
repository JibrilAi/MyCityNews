import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import type { Category } from '../types';

const ChevronDownIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
);

export const CategorySidebar: React.FC = () => {
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const { categoryName } = useParams<{ categoryName?: string }>();
    const activeCategory = categoryName ? decodeURIComponent(categoryName) : null;

    const renderCategoryLinks = () => (
        <nav className="flex flex-col space-y-1">
            {CATEGORIES.map((category: Category) => (
                <Link
                    key={category}
                    to={`/category/${encodeURIComponent(category)}`}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                        block px-4 py-2 text-sm font-medium rounded-md capitalize transition-colors
                        ${activeCategory === category
                            ? 'bg-brand-blue text-white'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }
                    `}
                >
                    {category}
                </Link>
            ))}
        </nav>
    );

    return (
        <>
            {/* Mobile Collapsible Button */}
            <div className="lg:hidden mb-6">
                <button
                    onClick={() => setIsMobileOpen(!isMobileOpen)}
                    className="w-full flex justify-between items-center px-4 py-3 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-sm text-left font-semibold"
                    aria-expanded={isMobileOpen}
                    aria-controls="mobile-category-list"
                >
                    <span>{activeCategory ? <span className="capitalize">{activeCategory}</span> : 'Browse Categories'}</span>
                    <ChevronDownIcon />
                </button>
                {isMobileOpen && (
                    <div id="mobile-category-list" className="mt-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-lg p-2">
                        {renderCategoryLinks()}
                    </div>
                )}
            </div>

            {/* Desktop Static Sidebar */}
            <div className="hidden lg:block sticky top-24">
                <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
                    <h3 className="text-lg font-bold font-serif mb-4 pb-2 border-b-2 border-gray-300 dark:border-gray-600">Categories</h3>
                    {renderCategoryLinks()}
                </div>
            </div>
        </>
    );
};
