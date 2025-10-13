import React, { useState, useRef, useEffect } from 'react';

const PULL_THRESHOLD = 80; // Pixels to pull before refresh is triggered
const PULL_RESISTANCE = 0.6; // Makes the pull feel heavier and more physical

const RefreshIndicator: React.FC<{ progress: number; isRefreshing: boolean }> = ({ progress, isRefreshing }) => (
    <div
        className={`
            fixed top-4 left-1/2 -translate-x-1/2
            w-12 h-12 rounded-full flex items-center justify-center 
            bg-white dark:bg-gray-800 shadow-lg 
            transition-all duration-300 ease-out z-50
            ${isRefreshing ? 'opacity-100 scale-100' : ''}
            ${progress > 0 && !isRefreshing ? 'opacity-100' : ''}
            ${progress === 0 && !isRefreshing ? 'opacity-0 scale-50' : ''}
        `}
        style={{ transform: `translateX(-50%) scale(${isRefreshing ? 1 : Math.min(progress, 1)})`}}
        aria-hidden="true"
    >
        {isRefreshing ? (
            <div className="w-6 h-6 border-2 border-brand-blue border-t-transparent border-solid rounded-full animate-spin" role="status" aria-label="Refreshing"></div>
        ) : (
            <svg 
                className="w-6 h-6 text-brand-blue transition-transform duration-200" 
                style={{ transform: `rotate(${progress * 180}deg)` }} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
        )}
    </div>
);

/**
 * A container that enables pull-to-refresh functionality.
 * This component is designed to be robust and performant for touch devices by:
 * - Attaching event listeners directly to its own DOM element, avoiding global conflicts in a Single Page App.
 * - Using refs to access the latest state and props within event handlers, preventing stale closures and unnecessary re-binding of listeners.
 * - Disabling CSS transitions during the drag action for a smooth, jank-free user experience.
 */
export const PullToRefreshContainer: React.FC<{ onRefresh: () => Promise<any>; children: React.ReactNode }> = ({ onRefresh, children }) => {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [pullDistance, setPullDistance] = useState(0);
    
    const containerRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef(false);
    const touchStartYRef = useRef(0);

    // Use refs to store the latest version of props/state for our event listeners.
    // This avoids stale closures without needing to re-attach listeners on every render.
    const onRefreshRef = useRef(onRefresh);
    useEffect(() => { onRefreshRef.current = onRefresh; }, [onRefresh]);

    const isRefreshingRef = useRef(isRefreshing);
    useEffect(() => { isRefreshingRef.current = isRefreshing; }, [isRefreshing]);
    
    const pullDistanceRef = useRef(pullDistance);
    useEffect(() => { pullDistanceRef.current = pullDistance; }, [pullDistance]);

    useEffect(() => {
        const node = containerRef.current;
        if (!node) return;

        const handleTouchStart = (e: TouchEvent) => {
            // Use window.scrollY for a more reliable check for the top of the page.
            if (window.scrollY === 0 && !isRefreshingRef.current) {
                touchStartYRef.current = e.targetTouches[0].clientY;
                isDraggingRef.current = true;
            }
        };

        const handleTouchMove = (e: TouchEvent) => {
            if (!isDraggingRef.current) return;
            const currentY = e.targetTouches[0].clientY;
            const distance = currentY - touchStartYRef.current;
            if (distance > 0) {
                e.preventDefault();
                // Apply resistance to make the pull feel more natural.
                setPullDistance(distance * PULL_RESISTANCE);
            }
        };

        const handleTouchEnd = async () => {
            if (!isDraggingRef.current) return;
            isDraggingRef.current = false;
            
            if (pullDistanceRef.current >= PULL_THRESHOLD) {
                setIsRefreshing(true);
                try {
                    await onRefreshRef.current();
                } finally {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }
            } else {
                setPullDistance(0);
            }
        };

        node.addEventListener('touchstart', handleTouchStart);
        node.addEventListener('touchmove', handleTouchMove, { passive: false });
        node.addEventListener('touchend', handleTouchEnd);
        node.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            node.removeEventListener('touchstart', handleTouchStart);
            node.removeEventListener('touchmove', handleTouchMove);
            node.removeEventListener('touchend', handleTouchEnd);
            node.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, []); // Empty dependency array ensures this effect runs only once, making it very performant.

    const progress = Math.min(pullDistance / PULL_THRESHOLD, 1);

    const contentStyle: React.CSSProperties = {
        transform: `translateY(${isRefreshing ? PULL_THRESHOLD : pullDistance}px)`,
        // Disable transitions while dragging for a smooth experience, enable for snapping back.
        transition: pullDistance > 0 && !isRefreshing ? 'none' : 'transform 0.3s ease-out',
    };

    return (
        <>
            <RefreshIndicator progress={progress} isRefreshing={isRefreshing} />
            <div ref={containerRef} style={contentStyle}>
                {children}
            </div>
        </>
    );
};