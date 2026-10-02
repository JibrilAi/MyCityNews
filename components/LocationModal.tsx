import React, { useEffect, useState } from 'react';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentLocation: string;
    onLocationChange: (newLocation: string) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
    isOpen,
    onClose,
    currentLocation,
    onLocationChange,
}) => {
    const [newLocation, setNewLocation] = useState(currentLocation);

    useEffect(() => {
        setNewLocation(currentLocation);
    }, [currentLocation]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };

        if (isOpen) window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        if (!newLocation.trim()) return;

        onLocationChange(newLocation.trim());
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            aria-labelledby="location-modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="m-4 w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800" role="document">
                <h2 id="location-modal-title" className="mb-4 font-serif text-2xl font-bold">
                    Change location
                </h2>

                <form onSubmit={handleSubmit}>
                    <p className="mb-4 text-gray-600 dark:text-gray-400">
                        Enter a city, province, Canada, or World to personalize the news feed.
                    </p>

                    <label htmlFor="location-input" className="sr-only">
                        Location
                    </label>
                    <input
                        id="location-input"
                        type="text"
                        value={newLocation}
                        onChange={(event) => setNewLocation(event.target.value)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-blue dark:border-gray-600 dark:bg-gray-700"
                        placeholder="e.g., Toronto"
                        autoFocus
                    />

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md bg-gray-200 px-4 py-2 text-gray-800 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-brand-blue px-4 py-2 font-bold text-white hover:bg-blue-700"
                        >
                            Update location
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
