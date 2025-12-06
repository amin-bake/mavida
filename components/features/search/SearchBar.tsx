/**
 * SearchBar Component
 * Advanced search bar with debouncing, recent searches, and filters
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { useSearchStore } from '@/stores/searchStore';
import { useDebounce } from '@/hooks/useDebounce';

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  showRecentSearches?: boolean;
  autoFocus?: boolean;
  className?: string;
}

export function SearchBar({
  initialQuery = '',
  onSearch,
  showRecentSearches = true,
  autoFocus = false,
  className = '',
}: SearchBarProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const { recentSearches, addRecentSearch, removeRecentSearch, clearRecentSearches } =
    useSearchStore();

  // Debounce the query for auto-suggestions (not used for actual search yet)
  const debouncedQuery = useDebounce(query, 300);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (searchQuery: string) => {
    const trimmedQuery = searchQuery.trim();
    if (!trimmedQuery) return;

    addRecentSearch(trimmedQuery);
    setIsOpen(false);

    if (onSearch) {
      onSearch(trimmedQuery);
    } else {
      router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch(query);
  };

  const handleRecentSearchClick = (recentQuery: string) => {
    setQuery(recentQuery);
    handleSearch(recentQuery);
  };

  const handleRemoveRecentSearch = (e: React.MouseEvent, recentQuery: string) => {
    e.stopPropagation();
    removeRecentSearch(recentQuery);
  };

  const filteredRecentSearches = showRecentSearches
    ? recentSearches.filter((recent) => recent.toLowerCase().includes(query.toLowerCase()))
    : [];

  const showDropdown =
    isOpen &&
    showRecentSearches &&
    (filteredRecentSearches.length > 0 || recentSearches.length > 0);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <Input
          type="search"
          placeholder="Search movies..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          autoFocus={autoFocus}
          className="w-full pr-10"
        />
        <button
          type="submit"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary transition-colors"
          aria-label="Search"
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
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Recent Searches Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-secondary border border-border rounded-lg shadow-lg overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border">
            <span className="text-sm font-semibold text-text-primary">
              {query ? 'Matching Searches' : 'Recent Searches'}
            </span>
            {recentSearches.length > 0 && (
              <button
                onClick={clearRecentSearches}
                className="text-xs text-text-secondary hover:text-text-primary transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {/* Recent Search Items */}
          <div className="max-h-64 overflow-y-auto">
            {filteredRecentSearches.length > 0 ? (
              <ul>
                {filteredRecentSearches.map((recentQuery) => (
                  <li key={recentQuery}>
                    <button
                      onClick={() => handleRecentSearchClick(recentQuery)}
                      className="w-full flex items-center justify-between px-4 py-2 hover:bg-tertiary transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <svg
                          className="h-4 w-4 text-text-secondary"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm text-text-primary">{recentQuery}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemoveRecentSearch(e, recentQuery)}
                        className="opacity-0 group-hover:opacity-100 text-text-secondary hover:text-text-primary transition-opacity"
                        aria-label="Remove"
                      >
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-8 text-center text-sm text-text-secondary">
                {query ? 'No matching recent searches' : 'No recent searches'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
