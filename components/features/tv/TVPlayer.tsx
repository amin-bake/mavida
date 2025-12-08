/**
 * TV Player Component
 * Video player for TV show episodes with episode navigation and watch progress tracking
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useWatchProgress } from '@/hooks';
import type { TVShow, TVEpisode } from '@/types/tv';

interface TVPlayerProps {
  tvShow: TVShow;
  season: number;
  episode: number;
  episodeDetails?: TVEpisode;
  onEpisodeChange?: (season: number, episode: number) => void;
  className?: string;
}

export function TVPlayer({
  tvShow,
  season,
  episode,
  episodeDetails,
  onEpisodeChange,
  className = '',
}: TVPlayerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [showAutoplayPrompt, setShowAutoplayPrompt] = useState(false);
  const [autoplayCountdown, setAutoplayCountdown] = useState(5);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // VidSrc embed URL format for TV shows: https://vidsrc.xyz/embed/tv/{tmdb_id}/{season}/{episode}
  const streamUrl = `https://vidsrc.xyz/embed/tv/${tvShow.id}/${season}/${episode}`;

  // Get current season data
  const currentSeason = tvShow.seasons?.find((s) => s.season_number === season);
  const currentSeasonEpisodeCount = currentSeason?.episode_count || 0;

  // Watch progress tracking
  const { updateProgress, saveProgress } = useWatchProgress({
    id: tvShow.id,
    type: 'tv',
    season,
    episode,
    episodeTitle: episodeDetails?.name,
    title: tvShow.name,
    posterPath: tvShow.poster_path || undefined,
    runtime: episodeDetails?.runtime || undefined,
    totalSeasons: tvShow.number_of_seasons,
    totalEpisodes: currentSeasonEpisodeCount,
  });

  // Navigation helpers
  const hasPreviousEpisode = episode > 1;
  const hasNextEpisode = currentSeason ? episode < currentSeason.episode_count : false;

  // Check if we can auto-advance to next season
  const canAdvanceToNextSeason = () => {
    if (!currentSeason || episode !== currentSeason.episode_count) return false;
    return season < tvShow.number_of_seasons;
  };

  const getNextEpisodeInfo = (): {
    season: number;
    episode: number;
    isNewSeason: boolean;
  } | null => {
    if (hasNextEpisode) {
      return { season, episode: episode + 1, isNewSeason: false };
    } else if (canAdvanceToNextSeason()) {
      return { season: season + 1, episode: 1, isNewSeason: true };
    }
    return null;
  };

  const handlePreviousEpisode = () => {
    if (!hasPreviousEpisode) return;

    const newEpisode = episode - 1;
    if (onEpisodeChange) {
      onEpisodeChange(season, newEpisode);
    } else {
      router.push(`/tv/${tvShow.id}/watch/${season}/${newEpisode}`);
    }
  };

  const handleNextEpisode = () => {
    const nextEp = getNextEpisodeInfo();
    if (!nextEp) return;

    if (onEpisodeChange) {
      onEpisodeChange(nextEp.season, nextEp.episode);
    } else {
      router.push(`/tv/${tvShow.id}/watch/${nextEp.season}/${nextEp.episode}`);
    }
  };

  // Simulate progress tracking (since we can't access iframe content)
  // In a real implementation, you'd use postMessage API if the iframe supports it
  useEffect(() => {
    // Start simulating progress after player loads
    if (!isLoading && episodeDetails?.runtime) {
      const runtimeSeconds = episodeDetails.runtime * 60;
      let elapsedSeconds = 0;

      // Save progress every 10 seconds
      progressIntervalRef.current = setInterval(() => {
        elapsedSeconds += 10;
        const progress = Math.min((elapsedSeconds / runtimeSeconds) * 100, 100);

        // Update progress
        saveProgress(progress);

        // If 90% complete and there's a next episode, show autoplay prompt
        if (progress >= 90 && getNextEpisodeInfo() && !showAutoplayPrompt) {
          setShowAutoplayPrompt(true);
          startAutoplayCountdown();
        }

        // Stop tracking if we've reached the end
        if (progress >= 100) {
          if (progressIntervalRef.current) {
            clearInterval(progressIntervalRef.current);
          }
        }
      }, 10000);

      return () => {
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current);
        }
      };
    }
  }, [isLoading, episodeDetails?.runtime, season, episode]);

  // Autoplay countdown
  const startAutoplayCountdown = () => {
    setAutoplayCountdown(5);

    const countdown = setInterval(() => {
      setAutoplayCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          handleNextEpisode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    autoplayTimerRef.current = countdown;
  };

  const cancelAutoplay = () => {
    if (autoplayTimerRef.current) {
      clearInterval(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }
    setShowAutoplayPrompt(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'ArrowLeft' && hasPreviousEpisode) {
        handlePreviousEpisode();
      } else if (e.key === 'ArrowRight' && getNextEpisodeInfo()) {
        handleNextEpisode();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [season, episode, hasPreviousEpisode]);

  // Reset loading state and cleanup when episode changes
  useEffect(() => {
    setIsLoading(true);
    setShowAutoplayPrompt(false);
    cancelAutoplay();
  }, [season, episode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      if (autoplayTimerRef.current) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-white/80">Loading episode...</p>
            </div>
          </div>
        )}

        {/* Autoplay Next Episode Prompt */}
        {showAutoplayPrompt && getNextEpisodeInfo() && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/90 backdrop-blur-sm z-20">
            <div className="bg-card border border-border rounded-lg p-8 max-w-md mx-4 shadow-2xl">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <div className="relative h-16 w-16">
                    <svg className="h-16 w-16 -rotate-90">
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        className="text-muted"
                      />
                      <circle
                        cx="32"
                        cy="32"
                        r="28"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        strokeDasharray={`${(autoplayCountdown / 5) * 175.93} 175.93`}
                        className="text-primary transition-all duration-1000"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold text-foreground">
                        {autoplayCountdown}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-foreground mb-2">
                    {getNextEpisodeInfo()?.isNewSeason
                      ? 'Next Season Starting...'
                      : 'Next Episode Starting...'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Season {getNextEpisodeInfo()?.season} · Episode {getNextEpisodeInfo()?.episode}
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={cancelAutoplay}
                    className="flex-1 px-4 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleNextEpisode}
                    className="flex-1 px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
                  >
                    Play Now
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <iframe
          ref={iframeRef}
          src={streamUrl}
          className="h-full w-full"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="origin"
          onLoad={() => setIsLoading(false)}
          title={`${tvShow.name} - S${season} E${episode}`}
        />
      </div>

      {/* Episode Info and Controls */}
      <div className="space-y-4">
        {/* Episode Title and Details */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-bold text-primary">
              Season {season} · Episode {episode}
            </span>
            {currentSeason && (
              <span className="text-sm text-muted-foreground">
                of {currentSeason.episode_count}
              </span>
            )}
          </div>

          {episodeDetails && (
            <>
              <h2 className="text-2xl font-bold text-foreground mb-2">{episodeDetails.name}</h2>
              {episodeDetails.overview && (
                <p className="text-base text-muted-foreground leading-relaxed">
                  {episodeDetails.overview}
                </p>
              )}
            </>
          )}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between gap-4 pt-4 border-t border-border">
          {/* Previous Episode Button */}
          <button
            onClick={handlePreviousEpisode}
            disabled={!hasPreviousEpisode}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Previous episode"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium hidden sm:inline">Previous Episode</span>
            <span className="font-medium sm:hidden">Previous</span>
          </button>

          {/* Episode Counter */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            <span className="font-medium">
              S{season} E{episode}
            </span>
          </div>

          {/* Next Episode Button */}
          <button
            onClick={handleNextEpisode}
            disabled={!getNextEpisodeInfo()}
            className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary text-primary-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            aria-label="Next episode"
          >
            <span className="font-medium hidden sm:inline">
              {canAdvanceToNextSeason() ? 'Next Season' : 'Next Episode'}
            </span>
            <span className="font-medium sm:hidden">Next</span>
            <svg
              className="h-5 w-5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Keyboard Shortcuts Hint */}
        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-muted font-mono">←</kbd>
            <span>Previous</span>
          </div>
          <div className="flex items-center gap-2">
            <kbd className="px-2 py-1 rounded bg-muted font-mono">→</kbd>
            <span>Next</span>
          </div>
        </div>
      </div>
    </div>
  );
}
