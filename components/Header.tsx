import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { APP_NAME, CATEGORIES } from '../constants';
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
    <svg xmlns="http://www.w3.org/2000/svg" className="mr-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

const SearchInput: React.FC<{ isMobile?: boolean; onSearch?: () => void }> = ({ isMobile, onSearch }) => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const routerLocation = useLocation();

    const query = searchParams.get('q') || '';
    const [inputValue, setInputValue] = useState(query);

    useEffect(() => {
        setInputValue(query);
    }, [query]);

    useEffect(() => {
        const timer = window.setTimeout(() => {
            if (inputValue.trim() !== query) {
                if (inputValue.trim()) {
                    navigate(`/search?q=${encodeURIComponent(inputValue.trim())}`);
                } else if (routerLocation.pathname === '/search') {
                    navigate('/');
                }
            }
        }, 300);

        return () => window.clearTimeout(timer);
    }, [inputValue, query, routerLocation.pathname, navigate]);

    return (
        <form className="relative w-full" onSubmit={(event) => { event.preventDefault(); onSearch?.(); }}>
            <input
                type="search"
                placeholder="Search stories..."
                value={inputValue}
                onChange={(event) => setInputValue(event.target.value)}
                className={`w-full rounded-full border focus:outline-none focus:ring-2 focus:ring-brand-blue dark:border-gray-600 dark:bg-gray-700 ${isMobile ? 'py-2 pl-10 pr-3 text-base' : 'py-1 pl-9 pr-3 text-sm'}`}
            />
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <SearchIcon />
            </div>
        </form>
    );
};

export const Header: React.FC<HeaderProps> = ({
    isDarkMode,
    setIsDarkMode,
    location,
    setLocation,
}) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

    useEffect(() => {
        document.body.style.overflow = isMenuOpen ? 'hidden' : 'unset';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    return (
        <>
            <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 shadow-sm backdrop-blur dark:border-gray-700 dark:bg-gray-900/95">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between gap-4 border-b border-gray-200 py-2 dark:border-gray-700">
                        <button
                            onClick={() => setIsLocationModalOpen(true)}
                            className="flex items-center text-sm font-semibold text-gray-700 hover:text-brand-blue dark:text-gray-300"
                        >
                            <MapPinIcon />
                            {location}
                            <span className="ml-2 text-brand-blue">Change</span>
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="hidden w-64 md:block">
                                <SearchInput />
                            </div>

                            <button
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="text-gray-600 transition-colors hover:text-brand-blue dark:text-gray-300 dark:hover:text-yellow-300"
                                aria-label="Toggle colour theme"
                            >
                                {isDarkMode ? <SunIcon /> : <MoonIcon />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between py-4">
                        <button
                            onClick={() => setIsMenuOpen(true)}
                            className="text-gray-600 dark:text-gray-300 md:hidden"
                            aria-label="Open menu"
                        >
                            <MenuIcon />
                        </button>

                        <Link to="/" className="font-serif text-2xl font-bold text-brand-blue transition-colors hover:text-brand-red md:text-3xl">
                            {APP_NAME}
                        </Link>

                        <nav className="hidden items-center gap-4 overflow-x-auto md:flex">
                            {CATEGORIES.filter((category) => category !== 'general' && category !== 'social').map((category) => (
                                <Link
                                    key={category}
                                    to={`/category/${encodeURIComponent(category)}`}
                                    className="whitespace-nowrap border-b-2 border-transparent pb-1 text-sm font-semibold capitalize text-gray-700 transition-colors hover:border-brand-blue hover:text-brand-blue dark:text-gray-300 dark:hover:text-white"
                                >
                                    {category}
                                </Link>
                            ))}
                        </nav>

                        <div className="h-6 w-6 md:hidden" />
                    </div>
                </div>
            </header>

            <div
                className={`fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-hidden={!isMenuOpen}
            >
                <div className="fixed inset-0 bg-black/50" onClick={() => setIsMenuOpen(false)} aria-hidden="true" />
                <div className="relative flex h-full w-4/5 max-w-sm flex-col bg-white shadow-xl dark:bg-gray-800">
                    <div className="flex items-center justify-between border-b p-4 dark:border-gray-700">
                        <Link
                            to="/"
                            onClick={() => setIsMenuOpen(false)}
                            className="font-serif text-xl font-bold text-brand-blue"
                        >
                            {APP_NAME}
                        </Link>
                        <button
                            onClick={() => setIsMenuOpen(false)}
                            className="p-1 text-gray-600 dark:text-gray-300"
                            aria-label="Close menu"
                        >
                            <CloseIcon />
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto p-4">
                        <div className="mb-6">
                            <SearchInput isMobile onSearch={() => setIsMenuOpen(false)} />
                        </div>

                        <nav className="flex flex-col space-y-1">
                            {CATEGORIES.filter((category) => category !== 'general' && category !== 'social').map((category) => (
                                <Link
                                    key={category}
                                    to={`/category/${encodeURIComponent(category)}`}
                                    onClick={() => setIsMenuOpen(false)}
                                    className="rounded-md p-3 text-lg font-semibold capitalize text-gray-700 hover:bg-gray-100 hover:text-brand-blue dark:text-gray-300 dark:hover:bg-gray-700"
                                >
                                    {category}
                                </Link>
                            ))}
                        </nav>
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
