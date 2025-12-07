'use client';

import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { useMovieDetail, useSimilarMovies } from '@/hooks/useMovies';
import { Button } from '@/components/ui';
import { MovieRow } from '@/components/features/movie';
import { getBackdropUrl, getPosterUrl } from '@/lib/tmdb/images';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

export default function MovieDetailPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);

  const { data: movie, isLoading, isError } = useMovieDetail(movieId);
  const { data: similarMovies } = useSimilarMovies(movieId, 1);

  const favorites = useUserPreferencesStore((state) => state.favorites);
  const toggleFavorite = useUserPreferencesStore((state) => state.toggleFavorite);
  const isFavorite = movie ? favorites.some((fav) => fav.id === movie.id) : false;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="relative h-[70vh] animate-pulse bg-card" />
        <div className="container mx-auto px-4 py-8 flex flex-col gap-4">
          <div className="h-12 w-2/3 bg-card rounded-md animate-pulse" />
          <div className="h-6 w-1/2 bg-card rounded-md animate-pulse" />
          <div className="h-32 w-full bg-card rounded-md animate-pulse" />
        </div>
      </div>
    );
  }

  if (isError || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-foreground">Movie Not Found</h1>
          <p className="text-muted-foreground">The movie you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  const backdropUrl = movie.backdropPath ? getBackdropUrl(movie.backdropPath, 'original') : null;
  const posterUrl = movie.posterPath ? getPosterUrl(movie.posterPath, 'lg') : null;
  const releaseYear = movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A';
  const runtime = movie.runtime
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : 'N/A';

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop Hero Section */}
      <div className="relative h-[95vh] overflow-hidden">
        {backdropUrl && (
          <>
            <Image
              src={backdropUrl}
              alt={movie.title}
              fill
              className="object-cover"
              priority
              sizes="100vw"
            />
            {/* Gradient Overlays - matching hero design */}
            {/* Top gradient for navbar area */}
            <div className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-black/80 via-black/30 to-black/0 blur-in-xl" />
            {/* Content area gradient with soft edges */}
            <div className="absolute bottom-0 left-0 w-[50%] h-[65%] bg-linear-to-tr from-black/60 via-black/20 to-transparent blur-2xl" />
          </>
        )}

        {/* Content Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster */}
              {posterUrl && (
                <div className="relative w-48 h-72 shrink-0 rounded-md overflow-hidden shadow-2xl hidden md:block">
                  <Image
                    src={posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 0px, 192px"
                  />
                </div>
              )}

              {/* Movie Info */}
              <div className="flex-1 flex flex-col gap-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground drop-shadow-2xl">
                  {movie.title}
                </h1>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-base md:text-lg text-muted-foreground">
                  {movie.rating > 0 && (
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-foreground">
                        {movie.rating.toFixed(1)}
                      </span>
                    </div>
                  )}
                  <span>{releaseYear}</span>
                  <span>•</span>
                  <span>{runtime}</span>
                  {movie.genres && movie.genres.length > 0 && (
                    <>
                      <span>•</span>
                      <span>{movie.genres.slice(0, 3).join(', ')}</span>
                    </>
                  )}
                </div>

                {/* Tagline */}
                {movie.tagline && (
                  <p className="text-lg md:text-xl italic text-muted-foreground drop-shadow-lg">
                    "{movie.tagline}"
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  <Button
                    size="lg"
                    className="shadow-xl"
                    onClick={() => router.push(`/movie/${movieId}/watch`)}
                  >
                    <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                    Watch Now
                  </Button>
                  <Button
                    variant="glass"
                    size="lg"
                    className="shadow-xl"
                    onClick={() => movie && toggleFavorite(movie)}
                  >
                    {isFavorite ? (
                      <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    ) : (
                      <svg
                        className="mr-2 h-5 w-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    )}
                    {isFavorite ? 'Remove from List' : 'Add to List'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col gap-12">
        {/* Overview */}
        {movie.overview && (
          <div className="max-w-4xl flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{movie.overview}</p>
          </div>
        )}

        {/* Cast */}
        {movie.cast && movie.cast.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground">Cast</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {movie.cast.slice(0, 12).map((actor) => {
                const profileUrl = actor.profilePath ? getPosterUrl(actor.profilePath, 'sm') : null;
                return (
                  <div key={actor.id} className="flex flex-col gap-2">
                    {profileUrl ? (
                      <div className="relative aspect-2/3 rounded-md overflow-hidden bg-card size-32">
                        <Image
                          src={profileUrl}
                          alt={actor.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      </div>
                    ) : (
                      <div className="aspect-2/3 rounded-md bg-card flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-muted-foreground"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-foreground text-sm">{actor.name}</p>
                      <p className="text-muted-foreground text-xs">{actor.character}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Trailers */}
        {movie.videos && movie.videos.length > 0 && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground">Trailers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {movie.videos.slice(0, 1).map((video) => (
                <div key={video.id} className="aspect-video rounded-md overflow-hidden bg-card">
                  <iframe
                    src={`https://www.youtube.com/embed/${video.key}`}
                    title={video.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* More Like This */}
        {similarMovies?.movies && similarMovies.movies.length > 0 && (
          <div>
            <MovieRow title="More Like This" movies={similarMovies.movies} priority={false} />
          </div>
        )}
      </div>
    </div>
  );
}
