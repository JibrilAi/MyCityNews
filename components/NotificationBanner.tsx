import React, { useEffect, useState } from 'react';

interface NotificationBannerProps {
    message: string | null;
    onClose: () => void;
}

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
);

export const NotificationBanner: React.FC<NotificationBannerProps> = ({ message, onClose }) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setIsVisible(true);
        } else {
            setIsVisible(false);
        }
    }, [message]);

    return (
        <div 
            className={`
                mb-6 transition-all duration-300 ease-in-out
                ${isVisible ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}
            `}
        >
            <div 
                className={`
                    relative p-4 rounded-md bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700
                `}
                role="alert"
            >
                <div className="flex">
                    <div className="flex-shrink-0">
                        <CheckCircleIcon />
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium text-green-800 dark:text-green-200">
                            {message}
                        </p>
                    </div>
                    <div className="ml-auto pl-3">
                        <div className="-mx-1.5 -my-1.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="inline-flex bg-green-50 dark:bg-green-900 rounded-md p-1.5 text-green-500 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-50 dark:focus:ring-offset-green-900 focus:ring-green-600"
                            >
                                <span className="sr-only">Dismiss</span>
                                <CloseIcon />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};