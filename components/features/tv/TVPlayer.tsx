/**
 * TV Player Component
 * Video player for TV show episodes with episode navigation and watch progress tracking
 */

'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, PlaySquare } from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { useWatchProgress } from '@/hooks';
import { usePlayerPreferencesStore } from '@/stores/playerPreferencesStore';
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
  const [debugLogs, setDebugLogs] = useState<string[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Player preferences from Zustand store
  const { autoplayEnabled, autonextEnabled, setAutoplay, setAutonext } =
    usePlayerPreferencesStore();

  // Handle hydration - only render iframe after client-side mount
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Add debug log helper
  const addDebugLog = useCallback((message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = `[${timestamp}] ${message}`;
    // console.log('[TVPlayer]', message);
    setDebugLogs((prev) => [...prev.slice(-9), logEntry]); // Keep last 10 logs
  }, []);

  // Log component mount
  useEffect(() => {
    addDebugLog(`Mounted - S${season}E${episode} of ${tvShow.name}`);
  }, [season, episode, tvShow.name, addDebugLog]);

  // VidSrc API embed URL format for TV shows with autoplay and autonext support
  // autoplay=1: Video starts playing automatically (enabled by default)
  // autonext=1: Automatically plays next episode when current episode ends
  const streamUrl = `https://vidsrc-embed.ru/embed/tv?tmdb=${tvShow.id}&season=${season}&episode=${episode}${autoplayEnabled ? '&autoplay=1' : '&autoplay=0'}${autonextEnabled ? '&autonext=1' : '&autonext=0'}`;

  useEffect(() => {
    addDebugLog(
      `Stream URL: ${streamUrl.substring(0, 80)}... (autoplay: ${autoplayEnabled}, autonext: ${autonextEnabled})`
    );
  }, [streamUrl, autoplayEnabled, autonextEnabled, addDebugLog]);

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

  const handlePreviousEpisode = useCallback(() => {
    if (!hasPreviousEpisode) return;

    const newEpisode = episode - 1;
    if (onEpisodeChange) {
      onEpisodeChange(season, newEpisode);
    } else {
      router.push(`/tv/${tvShow.id}/watch/${season}/${newEpisode}`);
    }
  }, [hasPreviousEpisode, episode, season, onEpisodeChange, router, tvShow.id]);

  const handleNextEpisode = useCallback(() => {
    const nextEp = getNextEpisodeInfo();
    addDebugLog(`Next episode: nextEp=${JSON.stringify(nextEp)}`);
    if (!nextEp) return;

    if (onEpisodeChange) {
      onEpisodeChange(nextEp.season, nextEp.episode);
    } else {
      const url = `/tv/${tvShow.id}/watch/${nextEp.season}/${nextEp.episode}`;
      addDebugLog(`Navigating to: ${url}`);
      router.push(url);
    }
  }, [season, episode, tvShow.id, currentSeason, onEpisodeChange, router, addDebugLog]);

  // VidSrc handles autoplay and autonext natively with URL parameters
  // No need for complex postMessage listeners or manual progress tracking

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
  }, [season, episode, hasPreviousEpisode, handleNextEpisode, handlePreviousEpisode]);

  // Reset loading state when episode changes
  useEffect(() => {
    setIsLoading(true);
  }, [season, episode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // No cleanup needed - VidSrc handles everything
    };
  }, []);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black shadow-2xl">
        {(!isMounted || isLoading) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-white/80">Loading episode...</p>
            </div>
          </div>
        )}

        {isMounted && (
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
        )}
      </div>

      {/* VidSrc handles auto-next episode natively with autonext=1 parameter */}

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-3">
        {/* Autoplay Toggle */}
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

        {/* Separator */}
        <div className="h-6 w-px bg-border" />

        {/* Autonext Toggle */}
        <Toggle
          pressed={autonextEnabled}
          onPressedChange={setAutonext}
          variant="outline"
          aria-label="Toggle auto-next episode"
          className="gap-2 data-[state=on]:text-[#E50914] data-[state=on]:*:[svg]:stroke-[#E50914]"
        >
          <PlaySquare className="h-4 w-4" />
          <span className="text-sm font-medium">Auto-Next</span>
        </Toggle>
      </div>

      {/* Episode Info and Controls */}
      <div className="space-y-4">
        {/* Episode Title and Details */}
        <div>
          {/* Navigation Controls */}
          <div className="flex items-center justify-between gap-4 pt-4 border-t border-white/10">
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

            {/* Episode Counter & Mark Complete */}
            <div className="flex items-center gap-3">
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

              {/* VidSrc automatically handles next episode with autonext=1 parameter */}
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
        </div>
      </div>
    </div>
  );
}
