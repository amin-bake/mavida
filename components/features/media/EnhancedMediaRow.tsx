/**
 * Enhanced Media Row Component
 * Displays both movies and TV shows in a horizontal scrolling row
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import { MediaCard } from '../media/MediaCard';
import type { Movie } from '@/types/movie';
import type { TVShow } from '@/types/tv';

interface MediaItem {
  media: Movie | TVShow;
  progress?: number;
  season?: number;
  episode?: number;
}

interface EnhancedMediaRowProps {
  title: string;
  items: MediaItem[];
  className?: string;
  priority?: boolean;
}

export function EnhancedMediaRow({
  title,
  items,
  className = '',
  priority = false,
}: EnhancedMediaRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);

  // Check scroll position to show/hide arrows
  const checkScrollPosition = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;

    setShowLeftArrow(scrollLeft > 0);
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
  };

  // Handle scroll with smooth animation
  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current || isScrolling) return;

    setIsScrolling(true);
    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8;
    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });

    setTimeout(() => {
      setIsScrolling(false);
      checkScrollPosition();
    }, 500);
  };

  // Update arrow visibility on scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();

    container.addEventListener('scroll', checkScrollPosition, { passive: true });
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  if (items.length === 0) {
    return null;
  }

  return (
    <section className={`relative px-4 md:px-8 ${className}`} aria-label={`${title} collection`}>
      <h2 className="mb-8 w-fit text-xl font-bold text-text-primary md:text-2xl">{title}</h2>

      <div className="group relative" role="region" aria-label={`Scrollable ${title} list`}>
        {/* Left Gradient Fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-primary to-transparent z-10 pointer-events-none transition-opacity ${
            showLeftArrow ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Right Gradient Fade */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-primary to-transparent z-10 pointer-events-none transition-opacity ${
            showRightArrow ? 'opacity-100' : 'opacity-0'
          }`}
          aria-hidden="true"
        />

        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-20 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/95 text-text-primary rounded-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Scroll left"
            disabled={isScrolling}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 mx-auto"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>
        )}

        {/* Right Arrow Button */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-20 w-10 bg-background/80 backdrop-blur-sm hover:bg-background/95 text-text-primary rounded-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            aria-label="Scroll right"
            disabled={isScrolling}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-6 h-6 mx-auto"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}

        {/* Cards Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 md:gap-6 overflow-x-auto scrollbar-hide scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, index) => (
            <div
              key={`${item.media.id}-${item.season || 0}-${item.episode || 0}`}
              className="shrink-0 w-[calc(50%-8px)] sm:w-[calc(33.333%-11px)] md:w-[calc(25%-14px)] lg:w-[calc(20%-16px)]"
            >
              <MediaCard
                media={item.media}
                priority={priority && index < 5}
                progress={item.progress}
                season={item.season}
                episode={item.episode}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
