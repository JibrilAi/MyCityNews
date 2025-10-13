
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { CATEGORIES, APP_NAME } from '../constants';
import { LocationModal } from './LocationModal';

const SunIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const MoonIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
);

const SearchIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
);

const MapPinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const MenuIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

interface HeaderProps {
    isDarkMode: boolean;
    setIsDarkMode: (value: boolean) => void;
    location: string;
    setLocation: (location: string) => void;
}

const SearchInput: React.FC<{ isMobile?: boolean, onSearch?: () => void }> = ({ isMobile, onSearch }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const location = useLocation();

    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);
    
    useEffect(() => {
        setInputValue(query);
    }, [query]);
    
    useEffect(() => {
        const timer = setTimeout(() => {
            if (inputValue.trim() !== query) {
                if (inputValue.trim()) {
                    navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
                } else if (location.pathname === '/search') {
                    navigate('/');
                }
            }
        }, 300);
        
        return () => clearTimeout(timer);
    }, [inputValue, query, location.pathname, navigate]);

    const baseClasses = "border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-blue dark:bg-gray-700 dark:border-gray-600";
    const mobileClasses = "w-full pl-10 pr-3 py-2 text-base";
    const desktopClasses = "pl-8 pr-3 py-1 text-sm";
    
    return (
        <form className="relative w-full" onSubmit={(e) => { e.preventDefault(); onSearch?.(); }}>
            <input 
                type="search" 
                placeholder="Search articles..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className={`${baseClasses} ${isMobile ? mobileClasses : desktopClasses}`}
            />
            <div className={`absolute inset-y-0 left-0 flex items-center pointer-events-none ${isMobile ? 'pl-3' : 'pl-3'}`}>
                <SearchIcon />
            </div>
        </form>
    );
};

export const Header: React.FC<HeaderProps> = ({ isDarkMode, setIsDarkMode, location, setLocation }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
    
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);


    return (
        <>
            <header className="bg-white dark:bg-gray-800 shadow-md sticky top-0 z-50">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Top Bar */}
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4 py-2 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center flex-wrap justify-center sm:justify-start gap-x-2">
                             <div className="flex items-center">
                                <MapPinIcon />
                                <span className="text-sm font-medium">{location}, ON</span>
                            </div>
                            <button onClick={() => setIsLocationModalOpen(true)} className="text-sm text-brand-blue hover:underline">[Change Location]</button>
                        </div>
                        <div className="flex items-center space-x-4 flex-shrink-0">
                             <Link to="/submit" className="hidden md:block bg-brand-red text-white font-bold py-1 px-3 rounded-full text-sm hover:bg-red-700 transition-colors">
                                Submit Your Story
                            </Link>
                            <div className="hidden md:block">
                                <SearchInput />
                            </div>
                            <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-gray-600 dark:text-gray-300 hover:text-brand-blue dark:hover:text-yellow-400 transition-colors">
                                {isDarkMode ? <SunIcon /> : <MoonIcon />}
                            </button>
                        </div>
                    </div>

                    {/* Main Header */}
                    <div className="flex justify-between items-center py-4">
                        <div className="md:hidden">
                            <button onClick={() => setIsMenuOpen(true)} className="text-gray-600 dark:text-gray-300">
                                <MenuIcon/>
                            </button>
                        </div>
                        <div className="text-2xl md:text-3xl font-bold font-serif">
                            <Link to="/" className="text-brand-blue hover:text-brand-red transition-colors">{APP_NAME}</Link>
                        </div>
                        <div className="hidden md:flex items-center space-x-4">
                            {CATEGORIES.map(category => (
                                <Link key={category} to={`/category/${encodeURIComponent(category)}`} className="font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-white transition-colors pb-1 border-b-2 border-transparent hover:border-brand-blue capitalize">
                                    {category}
                                </Link>
                            ))}
                        </div>
                        <div className="md:hidden">
                           {/* This button is stylistic; search is in the mobile menu */}
                           <div className="w-5 h-5"></div>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Mobile Menu - Slide-in panel */}
            <div className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : 'translate-x-[-100%]'}`} aria-hidden={!isMenuOpen}>
                <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} aria-hidden="true"></div>
                <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-gray-800 shadow-xl flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
                        <div className="text-xl font-bold font-serif">
                           <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-brand-blue hover:text-brand-red transition-colors">{APP_NAME}</Link>
                        </div>
                        <button onClick={() => setIsMenuOpen(false)} className="text-gray-600 dark:text-gray-300 p-1">
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="flex-grow p-4 overflow-y-auto">
                        <div className="mb-6">
                            <SearchInput isMobile onSearch={() => setIsMenuOpen(false)} />
                        </div>
                        <nav className="flex flex-col space-y-2">
                             {CATEGORIES.map(category => (
                                <Link key={category} to={`/category/${encodeURIComponent(category)}`} onClick={() => setIsMenuOpen(false)} className="text-lg font-semibold text-gray-700 dark:text-gray-300 hover:text-brand-blue dark:hover:text-white transition-colors p-3 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 capitalize">
                                    {category}
                                </Link>
                            ))}
                        </nav>
                        <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6 space-y-4">
                            <Link to="/submit" onClick={() => setIsMenuOpen(false)} className="w-full text-center bg-brand-red text-white font-bold py-3 px-4 rounded-md hover:bg-red-700 transition-colors block">
                                Submit Your Story
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
             <LocationModal 
                isOpen={isLocationModalOpen}
                onClose={() => setIsLocationModalOpen(false)}
                currentLocation={location}
                onLocationChange={setLocation}
            />
        </>
    );
};
