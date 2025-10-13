
import React, { useState, useEffect } from 'react';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation: string;
    onLocationChange: (newLocation: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, currentLocation, onLocationChange }) => {
    const [newLocation, setNewLocation] = useState(currentLocation);

    useEffect(() => {
        setNewLocation(currentLocation);
    }, [currentLocation]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newLocation.trim()) {
            onLocationChange(newLocation.trim());
            onClose();
        }
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            aria-labelledby="location-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div 
                className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md m-4"
                role="document"
            >
                <h2 id="location-modal-title" className="text-2xl font-bold font-serif mb-4">Change Location</h2>
                <form onSubmit={handleSubmit}>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        Enter a city name to see local news and weather from that area.
                    </p>
                    <div>
                        <label htmlFor="location-input" className="sr-only">City Name</label>
                        <input
                            id="location-input"
                            type="text"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-brand-blue"
                            placeholder="e.g., Vancouver"
                            autoFocus
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-brand-blue text-white font-bold rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Update Location
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
