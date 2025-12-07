'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useMovieDetail } from '@/hooks/useMovies';
import { Button } from '@/components/ui';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);

  const { data: movie, isLoading } = useMovieDetail(movieId);
  const updateWatchProgress = useUserPreferencesStore((state) => state.updateWatchProgress);

  // Track watch when page loads
  useEffect(() => {
    if (movie) {
      updateWatchProgress(movie.id, 0, movie.title, movie.posterPath);
    }
  }, [movie, updateWatchProgress]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center pt-20">
        <div className="text-center flex flex-col gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading player...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-foreground">Movie Not Found</h1>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  // VidSrc embed URL
  const embedUrl = `https://vidsrc.xyz/embed/movie/${movieId}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Back Button - positioned below navbar */}
      <div className="absolute top-24 left-4 z-50">
        <Button
          variant="secondary"
          size="icon"
          onClick={() => router.back()}
          className="backdrop-blur-sm bg-black/60 hover:bg-black/80"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
        </Button>
      </div>

      {/* Video Player */}
      <div className="relative w-full h-screen">
        <iframe
          src={embedUrl}
          className="w-full h-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="origin"
          title={`Watch ${movie.title}`}
        />
      </div>

      {/* Movie Info (optional footer) */}
      <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-background via-background/80 to-transparent p-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <div className="container mx-auto">
          <h2 className="text-xl font-bold text-foreground">{movie.title}</h2>
          {movie.releaseDate && (
            <p className="text-muted-foreground">{new Date(movie.releaseDate).getFullYear()}</p>
          )}
        </div>
      </div>
    </div>
  );
}
