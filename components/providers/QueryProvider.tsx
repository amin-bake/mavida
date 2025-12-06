/**
 * Query Provider Component
 * Wraps the application with TanStack Query's QueryClientProvider
 */

'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { getQueryClient } from '@/lib/queryClient';

interface QueryProviderProps {
  children: React.ReactNode;
}

/**
 * Client-side QueryClientProvider wrapper
 * Creates a new QueryClient instance per request for server-side rendering
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // Create a new QueryClient instance for each request
  // This ensures no data leakage between users in SSR
  const [queryClient] = useState(() => getQueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Only show devtools in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
      )}
    </QueryClientProvider>
  );
}
