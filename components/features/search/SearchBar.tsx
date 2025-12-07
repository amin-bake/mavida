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
          className="w-full pr-12"
        />
        <button
          type="submit"
          className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors p-1"
          aria-label="Search"
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
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </form>

      {/* Recent Searches Dropdown */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-3 bg-popover border-2 border-border rounded-xl shadow-2xl overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <span className="text-sm font-semibold text-foreground">
              {query ? 'Matching Searches' : 'Recent Searches'}
            </span>
            {recentSearches.length > 0 && (
              <button
                onClick={clearRecentSearches}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-1 hover:bg-muted rounded"
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
                      className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-muted transition-colors group rounded-lg mx-1 my-0.5"
                    >
                      <div className="flex items-center gap-3">
                        <svg
                          className="h-5 w-5 text-muted-foreground"
                          fill="none"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-base text-foreground">{recentQuery}</span>
                      </div>
                      <button
                        onClick={(e) => handleRemoveRecentSearch(e, recentQuery)}
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all p-1.5 hover:bg-muted/50 rounded"
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
              <div className="px-5 py-10 text-center text-base text-muted-foreground">
                {query ? 'No matching recent searches' : 'No recent searches'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
