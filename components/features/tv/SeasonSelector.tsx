/**
 * Season Selector Component
 * Tab-based navigation for TV show seasons
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import type { TVSeason } from '@/types/tv';

interface SeasonSelectorProps {
  seasons: TVSeason[];
  selectedSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
  className?: string;
}

export function SeasonSelector({
  seasons,
  selectedSeason,
  onSeasonChange,
  className = '',
}: SeasonSelectorProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Filter out season 0 (specials) and sort by season number
  const validSeasons = seasons
    .filter((season) => season.season_number > 0)
    .sort((a, b) => a.season_number - b.season_number);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowLeftArrow(scrollLeft > 10);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Scroll to active season on mount
  useEffect(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const activeButton = container.querySelector('[data-active="true"]') as HTMLElement;

    if (activeButton) {
      const containerRect = container.getBoundingClientRect();
      const buttonRect = activeButton.getBoundingClientRect();
      const scrollLeft =
        buttonRect.left -
        containerRect.left +
        container.scrollLeft -
        containerRect.width / 2 +
        buttonRect.width / 2;

      container.scrollTo({
        left: scrollLeft,
        behavior: 'smooth',
      });
    }

    checkScrollPosition();
  }, [selectedSeason]);

  // Update arrows on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();

    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  // Handle scroll with arrow buttons
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.5;

    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (validSeasons.length === 0) {
    return null;
  }

  // If only one season, no need for selector
  if (validSeasons.length === 1) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <div className="px-6 py-3 rounded-lg bg-primary/20 backdrop-blur-sm border border-primary/30">
          <span className="font-semibold text-primary">Season 1</span>
          <span className="ml-3 text-sm text-muted-foreground">
            {validSeasons[0].episode_count}{' '}
            {validSeasons[0].episode_count === 1 ? 'Episode' : 'Episodes'}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="flex items-center gap-3">
        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="flex-none h-10 w-10 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-full text-foreground hover:bg-card hover:scale-110 transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Scroll seasons left"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Seasons Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {validSeasons.map((season) => {
            const isActive = season.season_number === selectedSeason;

            return (
              <button
                key={season.id}
                onClick={() => onSeasonChange(season.season_number)}
                data-active={isActive}
                className={`flex-none px-3 py-3 rounded-lg backdrop-blur-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/50 scale-105'
                    : 'bg-card/60 text-foreground hover:bg-card hover:scale-105'
                }`}
                style={{ scrollSnapAlign: 'center' }}
                aria-label={`Season ${season.season_number}, ${season.episode_count} episodes`}
                aria-pressed={isActive}
              >
                <div className="flex items-center gap-3 border border-white/20 px-4 py-2 rounded-md">
                  <span className="font-semibold whitespace-nowrap">
                    Season {season.season_number}
                  </span>
                  <span
                    className={`text-sm ${isActive ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}
                  >
                    {season.episode_count} {season.episode_count === 1 ? 'Ep' : 'Eps'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="flex-none h-10 w-10 flex items-center justify-center bg-card/80 backdrop-blur-sm rounded-full text-foreground hover:bg-card hover:scale-110 transition-all shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Scroll seasons right"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
