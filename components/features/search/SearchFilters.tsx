/**
 * Search Filters Component
 * Genre, year, and rating filters for search results
 */

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface SearchFiltersProps {
  filters: {
    year: string;
    genre: string;
    minRating: number;
  };
  onFilterChange: (filters: SearchFiltersProps['filters']) => void;
}

// TMDB Genre IDs (most popular ones)
const GENRES = [
  { id: '', name: 'All Genres' },
  { id: '28', name: 'Action' },
  { id: '12', name: 'Adventure' },
  { id: '16', name: 'Animation' },
  { id: '35', name: 'Comedy' },
  { id: '80', name: 'Crime' },
  { id: '99', name: 'Documentary' },
  { id: '18', name: 'Drama' },
  { id: '10751', name: 'Family' },
  { id: '14', name: 'Fantasy' },
  { id: '36', name: 'History' },
  { id: '27', name: 'Horror' },
  { id: '10402', name: 'Music' },
  { id: '9648', name: 'Mystery' },
  { id: '10749', name: 'Romance' },
  { id: '878', name: 'Science Fiction' },
  { id: '10770', name: 'TV Movie' },
  { id: '53', name: 'Thriller' },
  { id: '10752', name: 'War' },
  { id: '37', name: 'Western' },
];

// Generate year options (current year down to 1900)
const currentYear = new Date().getFullYear();
const YEARS = [
  { value: '', label: 'All Years' },
  ...Array.from({ length: currentYear - 1899 }, (_, i) => {
    const year = currentYear - i;
    return { value: year.toString(), label: year.toString() };
  }),
];

// Rating options
const RATINGS = [
  { value: 0, label: 'All Ratings' },
  { value: 7, label: '7+ ⭐' },
  { value: 8, label: '8+ ⭐⭐' },
  { value: 9, label: '9+ ⭐⭐⭐' },
];

export function SearchFilters({ filters, onFilterChange }: SearchFiltersProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [isExpanded, setIsExpanded] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleYearChange = (year: string) => {
    const updated = { ...localFilters, year };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleGenreChange = (genre: string) => {
    const updated = { ...localFilters, genre };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleRatingChange = (rating: number) => {
    const updated = { ...localFilters, minRating: rating };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleReset = () => {
    const reset = { year: '', genre: '', minRating: 0 };
    setLocalFilters(reset);
    onFilterChange(reset);
  };

  const hasActiveFilters = localFilters.year || localFilters.genre || localFilters.minRating > 0;

  return (
    <div className="bg-secondary border border-border rounded-lg p-4">
      {/* Toggle Button for Mobile */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full md:hidden mb-4"
      >
        <span className="font-semibold text-text-primary">Filters</span>
        <svg
          className={`h-5 w-5 text-text-secondary transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Filters Grid */}
      <div
        className={`${
          isExpanded ? 'block' : 'hidden'
        } flex flex-col gap-4 md:gap-0 md:grid md:grid-cols-4 md:gap-4`}
      >
        {/* Genre Filter */}
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-text-primary mb-2">
            Genre
          </label>
          <select
            id="genre"
            value={localFilters.genre}
            onChange={(e) => handleGenreChange(e.target.value)}
            className="w-full px-3 py-2 bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {GENRES.map((genre) => (
              <option key={genre.id} value={genre.id}>
                {genre.name}
              </option>
            ))}
          </select>
        </div>

        {/* Year Filter */}
        <div>
          <label htmlFor="year" className="block text-sm font-medium text-text-primary mb-2">
            Year
          </label>
          <select
            id="year"
            value={localFilters.year}
            onChange={(e) => handleYearChange(e.target.value)}
            className="w-full px-3 py-2 bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {YEARS.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
        </div>

        {/* Rating Filter */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-text-primary mb-2">
            Minimum Rating
          </label>
          <select
            id="rating"
            value={localFilters.minRating}
            onChange={(e) => handleRatingChange(Number(e.target.value))}
            className="w-full px-3 py-2 bg-tertiary border border-border rounded-lg text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
          >
            {RATINGS.map((rating) => (
              <option key={rating.value} value={rating.value}>
                {rating.label}
              </option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div className="flex items-end">
          <Button
            variant="secondary"
            onClick={handleReset}
            disabled={!hasActiveFilters}
            className="w-full"
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Active Filters Indicator */}
      {hasActiveFilters && (
        <div className="mt-4 flex items-center gap-x-2 text-sm text-text-secondary">
          <svg
            className="h-4 w-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span>
            {[
              localFilters.genre && GENRES.find((g) => g.id === localFilters.genre)?.name,
              localFilters.year && localFilters.year,
              localFilters.minRating > 0 && `${localFilters.minRating}+ rating`,
            ]
              .filter(Boolean)
              .join(' • ')}
          </span>
        </div>
      )}
    </div>
  );
}
