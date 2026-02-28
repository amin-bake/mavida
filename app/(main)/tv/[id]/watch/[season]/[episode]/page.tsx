/**
 * Episode Player Page
 * Plays TV show episodes with navigation controls
 */

'use client';

import { use } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTVShow, useTVEpisode, useTVSeason } from '@/services/tmdb/tv.queries';
import { TVPlayer } from '@/components/features/tv/TVPlayer';
import { SeasonSelector } from '@/components/features/tv/SeasonSelector';
import { EpisodeGrid } from '@/components/features/tv/EpisodeGrid';
import { useState, useCallback } from 'react';

interface EpisodePlayerPageProps {
  params: Promise<{
    id: string;
    season: string;
    episode: string;
  }>;
}

export default function EpisodePlayerPage({ params }: EpisodePlayerPageProps) {
  const { id, season, episode } = use(params);
  const router = useRouter();
  const tvId = parseInt(id, 10);
  const seasonNumber = parseInt(season, 10);
  const episodeNumber = parseInt(episode, 10);

  // Validate params
  if (isNaN(tvId) || isNaN(seasonNumber) || isNaN(episodeNumber)) {
    notFound();
  }

  // State for season selector
  const [selectedSeason, setSelectedSeason] = useState(seasonNumber);

  // Active episode state — updated when VidSrc internally transitions via autonext.
  // Separate from URL params (use(params) is static) so React Query re-fetches and
  // the header updates without a full page navigation or iframe remount.
  const [activeSeasonNum, setActiveSeasonNum] = useState(seasonNumber);
  const [activeEpisodeNum, setActiveEpisodeNum] = useState(episodeNumber);

  const handleEpisodeChange = useCallback(
    (s: number, e: number) => {
      setActiveSeasonNum(s);
      setActiveEpisodeNum(e);
      window.history.replaceState({}, '', `/tv/${tvId}/watch/${s}/${e}`);
    },
    [tvId]
  );

  // Fetch TV show and episode data
  const {
    data: tvShow,
    isLoading: isLoadingShow,
    isError: isErrorShow,
    error: showError,
  } = useTVShow(tvId);
  const {
    data: episodeDetails,
    isLoading: isLoadingEpisode,
    isError: isErrorEpisode,
    error: episodeError,
  } = useTVEpisode(tvId, activeSeasonNum, activeEpisodeNum);

  // Fetch season details for episode list
  const { data: seasonDetails, isLoading: isLoadingSeasonDetails } = useTVSeason(
    tvId,
    selectedSeason
  );

  // Loading state - show loading while queries are in progress
  if (isLoadingShow || (isLoadingEpisode && !episodeDetails)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading episode...</p>
        </div>
      </div>
    );
  }

  // Handle errors - only show 404 if we actually got error responses
  if (isErrorShow || isErrorEpisode) {
    // Check if it's a 404 error
    const is404 =
      (showError as any)?.response?.status === 404 ||
      (episodeError as any)?.response?.status === 404;

    if (is404) {
      notFound();
    }

    // For other errors, show an error message with retry
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center max-w-md px-4">
          <div className="text-destructive text-5xl mb-2">⚠️</div>
          <h2 className="text-xl font-bold">Failed to load episode</h2>
          <p className="text-muted-foreground text-sm">
            {(showError as Error)?.message || (episodeError as Error)?.message || 'Unknown error'}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Ensure data is loaded
  if (!tvShow) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground">Loading episode...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-16 mt-16">
      {/* Header */}
      <div className="px-4 md:px-8 pt-6 pb-4">
        <div className="flex items-center gap-4 mb-4">
          {/* Back to Show Button */}
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

          {/* Show Title */}
          <div>
            <Link
              href={`/tv/${tvId}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {tvShow.name}
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-foreground">
              Season {activeSeasonNum} · Episode {activeEpisodeNum}
            </h1>
          </div>
        </div>
      </div>

      {/* Player */}
      <div className="px-4 md:px-8">
        <TVPlayer
          tvShow={tvShow}
          season={seasonNumber}
          episode={episodeNumber}
          episodeDetails={episodeDetails}
          onEpisodeChange={handleEpisodeChange}
        />
      </div>

      {/* Episode Details */}
      {episodeDetails && (
        <div className="px-4 md:px-8 mt-12">
          <div className="max-w-4xl">
            {/* Episode Info */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-foreground mb-2">{episodeDetails.name}</h2>
              {episodeDetails.overview && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {episodeDetails.overview}
                </p>
              )}
            </div>

            {/* Episode Metadata */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              {episodeDetails.air_date && (
                <div>
                  <span className="text-muted-foreground">Air Date: </span>
                  <span className="text-foreground">
                    {new Date(episodeDetails.air_date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
              {episodeDetails.runtime && (
                <div>
                  <span className="text-muted-foreground">Runtime: </span>
                  <span className="text-foreground">{episodeDetails.runtime} minutes</span>
                </div>
              )}
              {episodeDetails.vote_average > 0 && (
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
                    <span className="text-foreground font-medium">
                      {episodeDetails.vote_average.toFixed(1)}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Guest Stars */}
            {episodeDetails.guest_stars && episodeDetails.guest_stars.length > 0 && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-foreground mb-4">Guest Stars</h3>
                <div className="flex flex-wrap gap-3">
                  {episodeDetails.guest_stars.slice(0, 8).map((guest) => (
                    <div key={guest.id} className="px-4 py-2 rounded-lg bg-card text-sm">
                      <span className="text-foreground font-medium">{guest.name}</span>
                      {guest.character && (
                        <span className="text-muted-foreground"> as {guest.character}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation Hint for Mobile */}
      <div className="px-4 md:px-8 mt-12">
        <div className="max-w-4xl p-6 rounded-lg bg-card border border-border sr-only">
          <div className="flex items-start gap-4">
            <div className="flex-none p-2 rounded-lg bg-primary/20">
              <svg
                className="h-6 w-6 text-primary"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h4 className="font-semibold text-foreground mb-1">Quick Navigation</h4>
              <p className="text-sm text-muted-foreground">
                Use the Previous/Next buttons below the player, or press the left/right arrow keys
                on your keyboard to navigate between episodes.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Episode List Section */}
      {tvShow && (
        <div className="px-4 md:px-8 mt-12">
          <div className="max-w-6xl">
            <h3 className="text-2xl font-bold text-foreground mb-6">Episodes</h3>

            {/* Season Selector */}
            {tvShow.seasons && tvShow.seasons.length > 0 && (
              <div className="mb-8 ">
                <SeasonSelector
                  seasons={tvShow.seasons}
                  selectedSeason={selectedSeason}
                  onSeasonChange={setSelectedSeason}
                />
              </div>
            )}

            {/* Episode Grid */}
            <EpisodeGrid
              tvShowId={tvId}
              seasonNumber={selectedSeason}
              episodes={seasonDetails?.episodes || []}
              isLoading={isLoadingSeasonDetails}
            />
          </div>
        </div>
      )}

      {/* Back to Show Link */}
      <div className="px-4 md:px-8 mt-8 text-center">
        <Link
          href={`/tv/${tvId}`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
            <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to {tvShow.name}
        </Link>
      </div>
    </div>
  );
}
