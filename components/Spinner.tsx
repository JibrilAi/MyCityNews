
import React from 'react';

export const Spinner: React.FC = () => {
    return (
        <div className="flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-brand-blue border-t-transparent border-solid rounded-full animate-spin"></div>
            <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-gray-300">Fetching Latest News...</p>
        </div>
    );
};
