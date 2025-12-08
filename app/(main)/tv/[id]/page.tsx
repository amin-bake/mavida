/**
 * TV Show Detail Page
 * Displays comprehensive TV show information with season/episode navigation
 */

'use client';

import { useState, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useRouter } from 'next/navigation';
import { getBackdropUrl, getPosterUrl } from '@/lib/tmdb/images';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';
import { useTVShow, useTVSeason, useTVCredits } from '@/services/tmdb/tv.queries';
import { SeasonSelector } from '@/components/features/tv/SeasonSelector';
import { EpisodeGrid } from '@/components/features/tv/EpisodeGrid';
import { MediaCard } from '@/components/features/media/MediaCard';
import { Button } from '@/components/ui';
import { useSimilarTV } from '@/services/tmdb/tv.queries';
import { useToast } from '@/contexts/ToastContext';
import type { TVShow } from '@/types/tv';

interface TVShowDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TVShowDetailPage({ params }: TVShowDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast();
  const tvId = parseInt(id, 10);

  if (isNaN(tvId)) {
    notFound();
  }

  // Fetch TV show data
  const { data: tvShow, isLoading, isError } = useTVShow(tvId);
  const { data: credits } = useTVCredits(tvId);
  const { data: similarShows } = useSimilarTV(tvId);

  // State for selected season
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Fetch season details when selected season changes
  const { data: seasonDetails, isLoading: isLoadingSeasonDetails } = useTVSeason(
    tvId,
    selectedSeason
  );

  // User preferences
  const { isFavoriteItem, toggleFavoriteItem } = useUserPreferencesStore();
  const isFavorite = isFavoriteItem(tvId, 'tv');

  // Handle 404
  if (isError) {
    notFound();
  }

  // Loading state
  if (isLoading || !tvShow) {
    return (
      <div className="min-h-screen">
        {/* Backdrop Skeleton */}
        <div className="relative h-[50vh] md:h-[60vh] bg-muted animate-pulse" />

        {/* Content Skeleton */}
        <div className="px-4 md:px-8 -mt-32 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Poster Skeleton */}
            <div className="w-48 md:w-64 aspect-2/3 rounded-lg bg-card animate-pulse flex-none" />

            {/* Info Skeleton */}
            <div className="flex-1 space-y-4">
              <div className="h-10 w-3/4 bg-card animate-pulse rounded" />
              <div className="h-6 w-1/2 bg-card animate-pulse rounded" />
              <div className="h-24 bg-card animate-pulse rounded" />
              <div className="flex gap-4">
                <div className="h-12 w-32 bg-card animate-pulse rounded" />
                <div className="h-12 w-32 bg-card animate-pulse rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const backdropUrl = tvShow.backdrop_path ? getBackdropUrl(tvShow.backdrop_path) : null;
  const posterUrl = tvShow.poster_path ? getPosterUrl(tvShow.poster_path, 'lg') : null;

  // Get first episode of first season for "Watch Now" button
  const firstSeason = tvShow.seasons?.find((s) => s.season_number > 0);

  const handleFavoriteClick = () => {
    toggleFavoriteItem(tvId, 'tv');
    if (isFavorite) {
      toast.info('Removed from My List', `${tvShow.name} has been removed from your list`);
    } else {
      toast.success('Added to My List', `${tvShow.name} has been added to your list`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop Hero Section - matching movie details page */}
      <div className="relative h-[95vh] overflow-hidden">
        {backdropUrl && (
          <>
            <Image
              src={backdropUrl}
              alt={tvShow.name}
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
                    alt={tvShow.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 0px, 192px"
                  />
                </div>
              )}

              {/* TV Show Info */}
              <div className="flex-1 flex flex-col gap-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground drop-shadow-2xl">
                  {tvShow.name}
                </h1>

                {/* Metadata */}
                <div className="flex flex-wrap items-center gap-4 text-base md:text-lg text-muted-foreground">
                  {tvShow.vote_average > 0 && (
                    <div className="flex items-center gap-1.5">
                      <svg
                        className="h-5 w-5 text-yellow-400"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="font-semibold text-foreground">
                        {tvShow.vote_average.toFixed(1)}
                      </span>
                    </div>
                  )}
                  {tvShow.first_air_date && (
                    <span>{new Date(tvShow.first_air_date).getFullYear()}</span>
                  )}
                  {tvShow.number_of_seasons && (
                    <>
                      <span>•</span>
                      <span>
                        {tvShow.number_of_seasons} Season{tvShow.number_of_seasons > 1 ? 's' : ''}
                      </span>
                    </>
                  )}
                  {tvShow.genres && tvShow.genres.length > 0 && (
                    <>
                      <span>•</span>
                      <span>
                        {tvShow.genres
                          .map((g) => g.name)
                          .slice(0, 3)
                          .join(', ')}
                      </span>
                    </>
                  )}
                  {tvShow.status && (
                    <>
                      <span>•</span>
                      <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-semibold uppercase tracking-wide">
                        {tvShow.status}
                      </span>
                    </>
                  )}
                </div>

                {/* Tagline (if available) */}
                {tvShow.tagline && (
                  <p className="text-lg md:text-xl italic text-muted-foreground drop-shadow-lg">
                    &ldquo;{tvShow.tagline}&rdquo;
                  </p>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 pt-4">
                  {firstSeason && (
                    <Button
                      size="lg"
                      className="shadow-xl"
                      onClick={() =>
                        router.push(`/tv/${tvId}/watch/${firstSeason.season_number}/1`)
                      }
                    >
                      <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                      Watch Now
                    </Button>
                  )}
                  <Button
                    variant="glass"
                    size="lg"
                    className="shadow-xl"
                    onClick={handleFavoriteClick}
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
        {tvShow.overview && (
          <div className="max-w-4xl flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-foreground">Overview</h2>
            <p className="text-lg text-muted-foreground leading-relaxed">{tvShow.overview}</p>
          </div>
        )}

        {/* Additional Info */}
        <div className="max-w-4xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-base">
            {tvShow.genres && tvShow.genres.length > 0 && (
              <div>
                <span className="text-muted-foreground font-semibold">Genres: </span>
                <span className="text-foreground">
                  {tvShow.genres.map((g) => g.name).join(', ')}
                </span>
              </div>
            )}
            {tvShow.created_by && tvShow.created_by.length > 0 && (
              <div>
                <span className="text-muted-foreground font-semibold">Created by: </span>
                <span className="text-foreground">
                  {tvShow.created_by.map((c) => c.name).join(', ')}
                </span>
              </div>
            )}
            {tvShow.networks && tvShow.networks.length > 0 && (
              <div>
                <span className="text-muted-foreground font-semibold">Networks: </span>
                <span className="text-foreground">
                  {tvShow.networks.map((network) => network.name).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Seasons and Episodes */}
        {tvShow.seasons && tvShow.seasons.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Episodes</h2>

            {/* Season Selector */}
            <SeasonSelector
              seasons={tvShow.seasons}
              selectedSeason={selectedSeason}
              onSeasonChange={setSelectedSeason}
              className="mb-8"
            />

            {/* Episode Grid */}
            <EpisodeGrid
              episodes={seasonDetails?.episodes || []}
              tvShowId={tvId}
              seasonNumber={selectedSeason}
              isLoading={isLoadingSeasonDetails}
            />
          </div>
        )}

        {/* Cast */}
        {credits?.cast && credits.cast.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">Cast</h2>
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
              {credits.cast.slice(0, 10).map((person) => {
                const profileUrl = person.profile_path
                  ? getPosterUrl(person.profile_path, 'sm')
                  : null;

                return (
                  <div key={person.id} className="flex-none w-32 text-center">
                    <div className="relative aspect-2/3 rounded-lg overflow-hidden bg-muted mb-2">
                      {profileUrl ? (
                        <Image
                          src={profileUrl}
                          alt={person.name}
                          fill
                          className="object-cover"
                          sizes="128px"
                        />
                      ) : (
                        <div className="h-full flex items-center justify-center">
                          <svg
                            className="h-12 w-12 text-muted-foreground"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-foreground line-clamp-2">
                      {person.name}
                    </p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{person.character}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Similar Shows */}
        {similarShows?.results && similarShows.results.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-foreground mb-6">More Like This</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {similarShows.results.slice(0, 10).map((show: TVShow) => (
                <MediaCard key={show.id} media={show} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
