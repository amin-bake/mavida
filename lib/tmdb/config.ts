/**
 * TMDB Configuration
 * Initialize TMDB client with environment variables
 */

import { createTMDBClient } from '@/services/tmdb';

// Validate environment variables
if (!process.env.NEXT_PUBLIC_TMDB_API_KEY) {
  throw new Error('Missing NEXT_PUBLIC_TMDB_API_KEY environment variable');
}

// Initialize TMDB client
export const tmdbClient = createTMDBClient({
  apiKey: process.env.NEXT_PUBLIC_TMDB_API_KEY,
  language: process.env.NEXT_PUBLIC_TMDB_LANGUAGE || 'en-US',
  region: process.env.NEXT_PUBLIC_TMDB_REGION || 'US',
  includeAdult: process.env.NEXT_PUBLIC_TMDB_INCLUDE_ADULT === 'true',
});

// Export for server-side usage
export { getTMDBClient } from '@/services/tmdb';
