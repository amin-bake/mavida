/**
 * Movie Row Component
 * Horizontal scrolling row of movies with arrow navigation and gradient fades
 */

'use client';

import { useRef, useState, useEffect } from 'react';
import { MovieCard } from './MovieCard';
import type { Movie } from '@/types/movie';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  className?: string;
  priority?: boolean; // For above-the-fold rows
}

export function MovieRow({ title, movies, className = '', priority = false }: MovieRowProps) {
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
    const scrollAmount = container.clientWidth * 0.8; // Scroll 80% of visible width
    const targetScroll =
      direction === 'left'
        ? container.scrollLeft - scrollAmount
        : container.scrollLeft + scrollAmount;

    container.scrollTo({
      left: targetScroll,
      behavior: 'smooth',
    });

    // Re-enable scrolling after animation
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

    container.addEventListener('scroll', checkScrollPosition);
    window.addEventListener('resize', checkScrollPosition);

    return () => {
      container.removeEventListener('scroll', checkScrollPosition);
      window.removeEventListener('resize', checkScrollPosition);
    };
  }, []);

  if (movies.length === 0) {
    return null;
  }

  return (
    <div className={`relative px-4 md:px-8 ${className}`}>
      {/* Title */}
      <h2 className="mb-8 w-fit text-xl font-bold text-text-primary md:text-2xl ">{title}</h2>

      {/* Scroll Container */}
      <div className="group relative">
        {/* Left Gradient Fade */}
        <div
          className={`absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-primary to-transparent z-10 pointer-events-none transition-opacity ${
            showLeftArrow ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Left Arrow */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:scale-110"
            aria-label="Scroll left"
          >
            <svg
              className="h-6 w-6"
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

        {/* Scroll Container */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth mt-4"
          style={{
            scrollSnapType: 'x mandatory',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          {movies.map((movie, index) => (
            <div
              key={movie.id}
              className="flex-none w-40 sm:w-48 md:w-56"
              style={{ scrollSnapAlign: 'start' }}
            >
              <MovieCard movie={movie} priority={priority && index < 5} />
            </div>
          ))}
        </div>

        {/* Right Gradient Fade */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-primary to-transparent z-10 pointer-events-none transition-opacity ${
            showRightArrow ? 'opacity-100' : 'opacity-0'
          }`}
        />

        {/* Right Arrow */}
        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-20 h-12 w-12 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/80 hover:scale-110"
            aria-label="Scroll right"
          >
            <svg
              className="h-6 w-6"
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
