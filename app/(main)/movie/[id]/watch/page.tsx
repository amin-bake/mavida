'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import Play from 'lucide-react/dist/esm/icons/play';
import { Toggle } from '@/components/ui/toggle';
import { useMovieDetail } from '@/hooks/useMovies';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';
import { usePlayerPreferencesStore } from '@/stores/playerPreferencesStore';
import { getMovieEmbedUrl } from '@/lib/constants';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);

  const { data: movie, isLoading } = useMovieDetail(movieId);
  const updateWatchProgress = useUserPreferencesStore((state) => state.updateWatchProgress);
  const { autoplayEnabled, setAutoplay } = usePlayerPreferencesStore();

  // Track watch when page loads
  useEffect(() => {
    if (movie) {
      // Set progress to 15% for visibility
      // Note: VidSrc is an iframe, so we cannot track actual playback progress
      // Users would need to manually update progress or we'd need a different player
      updateWatchProgress(movie.id, 15, movie.title, movie.posterPath);
    }
  }, [movie, updateWatchProgress]);

  // Loading state
  if (isLoading || !movie) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading player...</p>
        </div>
      </div>
    );
  }

  // VidSrc API embed URL with autoplay from user preferences
  const embedUrl = getMovieEmbedUrl(movieId, autoplayEnabled);

  return (
    <div className="min-h-screen pb-16 mt-16">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-4">
          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-card transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Go back"
          >
            <svg
              className="h-6 w-6 text-foreground"
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

          {/* Movie Title */}
          <div>
            <Link
              href={`/movie/${movieId}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Back to Details
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">{movie.title}</h1>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="px-4 md:px-8 space-y-4">
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full"
            allowFullScreen
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="origin"
            title={`Watch ${movie.title}`}
          />
        </div>
        <div className="flex items-center justify-center gap-3">
          <Toggle
            pressed={autoplayEnabled}
            onPressedChange={setAutoplay}
            variant="outline"
            aria-label="Toggle autoplay"
            className="gap-2 data-[state=on]:text-[#E50914] data-[state=on]:*:[svg]:fill-[#E50914]"
          >
            <Play className="h-4 w-4" />
            <span className="text-sm font-medium">Autoplay</span>
          </Toggle>
        </div>
      </div>

      {/* Movie Details */}
      {movie && (
        <div className="px-4 md:px-8 mt-12">
          <div className="max-w-4xl">
            {/* Movie Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">{movie.title}</h2>
              {movie.overview && (
                <p className="text-base text-muted-foreground leading-relaxed">{movie.overview}</p>
              )}
            </div>

            {/* Movie Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              {movie.releaseDate && (
                <div>
                  <span className="text-muted-foreground">Release Date: </span>
                  <span className="text-foreground">
                    {new Date(movie.releaseDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {movie.runtime && (
                <div>
                  <span className="text-muted-foreground">Runtime: </span>
                  <span className="text-foreground">
                    {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                  </span>
                </div>
              )}
              {movie.rating > 0 && (
                <div>
                  <span className="text-muted-foreground">Rating: </span>
                  <div className="inline-flex items-center gap-1">
                    <svg
                      className="h-4 w-4 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-foreground font-semibold">{movie.rating.toFixed(1)}</span>
                  </div>
                </div>
              )}
              {movie.genres && movie.genres.length > 0 && (
                <div>
                  <span className="text-muted-foreground">Genres: </span>
                  <span className="text-foreground">{movie.genres.join(', ')}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
