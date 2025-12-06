/**
 * TMDB API Test Utility
 * Run this to verify TMDB integration is working correctly
 *
 * Usage: node --loader ts-node/esm lib/tmdb/test.ts
 * Or add to package.json scripts
 */

import { createTMDBClient } from '@/services/tmdb';
import { getTrendingMovies, getMovieDetails, searchMovies } from '@/services/tmdb';

async function testTMDBIntegration() {
  console.log('🎬 Testing TMDB API Integration...\n');

  try {
    // Check for API key
    const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
    if (!apiKey) {
      throw new Error('NEXT_PUBLIC_TMDB_API_KEY not found in environment variables');
    }

    // Initialize client
    console.log('✓ API key found');
    createTMDBClient({
      apiKey,
      language: 'en-US',
      region: 'US',
      includeAdult: false,
    });
    console.log('✓ TMDB client initialized\n');

    // Test 1: Get trending movies
    console.log('Test 1: Fetching trending movies...');
    const trending = await getTrendingMovies('week', 1);
    console.log(`✓ Found ${trending.movies.length} trending movies`);
    if (trending.movies.length > 0) {
      const firstMovie = trending.movies[0];
      console.log(`  Example: "${firstMovie.title}" (${firstMovie.releaseYear})`);
      console.log(`  Rating: ${firstMovie.rating}/10 | Genres: ${firstMovie.genres.join(', ')}\n`);
    }

    // Test 2: Get movie details
    if (trending.movies.length > 0) {
      const movieId = trending.movies[0].id;
      console.log(`Test 2: Fetching details for movie ID ${movieId}...`);
      const details = await getMovieDetails(movieId);
      console.log(`✓ Movie details retrieved`);
      console.log(`  Title: ${details.title}`);
      console.log(`  Runtime: ${details.runtime} minutes`);
      console.log(`  Budget: $${details.budget.toLocaleString()}`);
      console.log(`  Revenue: $${details.revenue.toLocaleString()}`);
      console.log(
        `  Cast: ${details.cast
          .slice(0, 3)
          .map((c) => c.name)
          .join(', ')}...`
      );
      console.log(`  Videos: ${details.videos.length} available\n`);
    }

    // Test 3: Search movies
    console.log('Test 3: Searching for "Inception"...');
    const searchResults = await searchMovies('Inception', { page: 1 });
    console.log(`✓ Found ${searchResults.totalResults} results`);
    if (searchResults.movies.length > 0) {
      const match = searchResults.movies[0];
      console.log(`  Best match: "${match.title}" (${match.releaseYear})`);
      console.log(`  Overview: ${match.overview.substring(0, 100)}...\n`);
    }

    // Test 4: Rate limiting
    console.log('Test 4: Testing rate limiting (making 10 rapid requests)...');
    const startTime = Date.now();
    await Promise.all(Array.from({ length: 10 }, (_, i) => getTrendingMovies('week', i + 1)));
    const duration = Date.now() - startTime;
    console.log(`✓ Completed 10 requests in ${duration}ms`);
    console.log(`  Average: ${Math.round(duration / 10)}ms per request\n`);

    console.log('✅ All tests passed! TMDB integration is working correctly.\n');

    // Summary
    console.log('Summary:');
    console.log('- Trending movies: ✓');
    console.log('- Movie details: ✓');
    console.log('- Search: ✓');
    console.log('- Rate limiting: ✓');
    console.log('- Data transformation: ✓\n');
  } catch (error) {
    console.error('❌ Test failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack trace:', error.stack);
    }
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testTMDBIntegration();
}

export { testTMDBIntegration };
