/**
 * TanStack Query Configuration
 * Configures QueryClient with custom cache settings and default options
 */

import { QueryClient, DefaultOptions } from '@tanstack/react-query';
import { CACHE_TIMES } from '@/lib/constants';

/**
 * Default query options for TanStack Query
 */
const defaultQueryOptions: DefaultOptions = {
  queries: {
    // Stale time: How long data is considered fresh
    staleTime: CACHE_TIMES.default,

    // Cache time: How long inactive data stays in cache
    gcTime: CACHE_TIMES.default * 5, // 5x stale time

    // Retry configuration
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

    // Refetch configuration
    refetchOnWindowFocus: false, // Don't refetch on window focus (better UX for video app)
    refetchOnReconnect: true, // Refetch when reconnecting
    refetchOnMount: true, // Always refetch on mount to ensure fresh data on reload

    // Network mode
    networkMode: 'online',
  },
  mutations: {
    // Retry mutations once on failure
    retry: 1,
    retryDelay: 1000,
    networkMode: 'online',
  },
};

/**
 * Create a new QueryClient instance with default configuration
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: defaultQueryOptions,
  });
}

/**
 * Singleton QueryClient instance for client-side usage
 */
let queryClient: QueryClient | undefined;

/**
 * Get or create the QueryClient instance
 * For client components
 */
export function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server-side: always create a new client
    return createQueryClient();
  }

  // Client-side: create a singleton
  if (!queryClient) {
    queryClient = createQueryClient();
  }

  return queryClient;
}
