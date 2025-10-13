
import React from 'react';
import type { Weather } from '../types';

interface WeatherWidgetProps {
    weather: Weather;
}

const WeatherIcon: React.FC<{ icon: Weather['icon'], className?: string }> = ({ icon, className = "w-16 h-16" }) => {
    const iconMap = {
        sunny: "☀️",
        cloudy: "☁️",
        rainy: "🌧️",
        stormy: "⛈️",
        snowy: "❄️",
    };
    return <div className={`text-5xl ${className}`} aria-label={icon}>{iconMap[icon] || "🌡️"}</div>;
};

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({ weather }) => {
    return (
        <div className="bg-gradient-to-br from-blue-400 to-blue-600 dark:from-gray-700 dark:to-gray-900 text-white p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center">
                <div>
                    <p className="font-bold text-lg">Current Weather</p>
                    <p className="text-4xl font-bold">{weather.temperature}°C</p>
                    <p className="text-lg">{weather.condition}</p>
                </div>
                <div>
                    <WeatherIcon icon={weather.icon} />
                </div>
            </div>
        </div>
    );
};
