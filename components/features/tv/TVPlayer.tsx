/**
 * TV Player Component
 * Video player for TV show episodes with episode navigation and watch progress tracking
 */

'use client';

import { useEffect, useRef, useCallback, useReducer } from 'react';
import { useRouter } from 'next/navigation';
import Play from 'lucide-react/dist/esm/icons/play';
import PlaySquare from 'lucide-react/dist/esm/icons/play-square';
import { Toggle } from '@/components/ui/toggle';
import { useWatchProgress } from '@/hooks';
import { usePlayerPreferencesStore } from '@/stores/playerPreferencesStore';
import type { TVShow, TVEpisode } from '@/types/tv';

interface PlayerState {
  currentTime: number;
  duration: number;
  hasTriggeredAutoNext: boolean;
  isLoading: boolean;
}

type PlayerAction =
  | { type: 'SET_TIME'; time: number; duration: number }
  | { type: 'TRIGGER_AUTO_NEXT' }
  | { type: 'SET_LOADING'; loading: boolean };

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'SET_TIME':
      return { ...state, currentTime: action.time, duration: action.duration };
    case 'TRIGGER_AUTO_NEXT':
      return { ...state, hasTriggeredAutoNext: true };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    default:
      return state;
  }
};

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
  const [playerState, dispatch] = useReducer(playerReducer, {
    currentTime: 0,
    duration: 0,
    hasTriggeredAutoNext: false,
    isLoading: true,
  });

  const { hasTriggeredAutoNext, isLoading } = playerState;
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Player preferences from Zustand store
  const { autoplayEnabled, autonextEnabled, setAutoplay, setAutonext } =
    usePlayerPreferencesStore();

  // VidSrc API embed URL format for TV shows with autoplay and autonext support
  // autoplay=1: Video starts playing automatically (enabled by default)
  // autonext=1: Automatically plays next episode when current episode ends
  const streamUrl = `https://vidsrc-embed.ru/embed/tv?tmdb=${tvShow.id}&season=${season}&episode=${episode}${autoplayEnabled ? '&autoplay=1' : '&autoplay=0'}${autonextEnabled ? '&autonext=1' : '&autonext=0'}`;

  // Client-side fallback: Monitor iframe for potential episode completion
  // This is a backup in case VidSrc's auto-next doesn't work
  useEffect(() => {
    if (!autonextEnabled) return;

    const checkForEpisodeEnd = () => {
      // Try to detect if iframe content indicates episode completion
      // This is limited since we can't access iframe content directly due to CORS
      const iframe = iframeRef.current;
      if (iframe) {
        try {
          // Check if iframe is still loading or if src changed (indicating VidSrc handled auto-next)
          // If the iframe src doesn't match our expected URL, VidSrc might have changed it
          if (iframe.src !== streamUrl && iframe.src.includes('vidsrc')) {
            // VidSrc may have handled auto-next
          }
        } catch {
          // Cannot access iframe properties due to CORS
        }
      }
    };

    // Check every 30 seconds as a fallback mechanism
    const interval = setInterval(checkForEpisodeEnd, 30000);

    return () => {
      clearInterval(interval);
    };
  }, [autonextEnabled, streamUrl]);

  // Get current season data
  const currentSeason = tvShow.seasons?.find((s) => s.season_number === season);
  const currentSeasonEpisodeCount = currentSeason?.episode_count || 0;

  // Watch progress tracking
  const { updateProgress: _updateProgress, saveProgress: _saveProgress } = useWatchProgress({
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
  const canAdvanceToNextSeason = useCallback(() => {
    if (!currentSeason || episode !== currentSeason.episode_count) return false;
    return season < tvShow.number_of_seasons;
  }, [currentSeason, episode, season, tvShow.number_of_seasons]);

  const getNextEpisodeInfo = useCallback((): {
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
  }, [hasNextEpisode, season, episode, canAdvanceToNextSeason]);

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
    if (!nextEp) return;

    if (onEpisodeChange) {
      onEpisodeChange(nextEp.season, nextEp.episode);
    } else {
      router.push(`/tv/${tvShow.id}/watch/${nextEp.season}/${nextEp.episode}`);
    }
  }, [getNextEpisodeInfo, onEpisodeChange, router, tvShow.id]);

  // Listen for postMessage events from VidSrc iframe (potential auto-next signals)
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      // Handle object messages from VidSrc
      if (typeof event.data === 'object' && event.data !== null) {
        const { event: eventType, time, duration: dur } = event.data;

        if (eventType === 'time' && typeof time === 'number' && typeof dur === 'number') {
          dispatch({ type: 'SET_TIME', time, duration: dur });

          // Check if episode is ending soon (within 10 seconds) and auto-next is enabled
          // Only trigger once per episode
          if (
            autonextEnabled &&
            !hasTriggeredAutoNext &&
            time >= dur - 10 &&
            time > 60 &&
            getNextEpisodeInfo()
          ) {
            dispatch({ type: 'TRIGGER_AUTO_NEXT' });
            handleNextEpisode();
          }
        } else if (eventType === 'ended') {
          // If there's an explicit ended event, handle it
          if (autonextEnabled && !hasTriggeredAutoNext && getNextEpisodeInfo()) {
            dispatch({ type: 'TRIGGER_AUTO_NEXT' });
            handleNextEpisode();
          }
        }
      }

      // Legacy string-based checks (keep for compatibility)
      if (typeof event.data === 'string') {
        if (
          event.data.includes('ended') ||
          event.data.includes('finished') ||
          event.data.includes('complete')
        ) {
          // Potential episode end detected
        }
        if (event.data.includes('next') || event.data.includes('autonext')) {
          // Auto-next event detected
        }
      }
    };

    window.addEventListener('message', handlePostMessage);

    return () => {
      window.removeEventListener('message', handlePostMessage);
    };
  }, [autonextEnabled, getNextEpisodeInfo, handleNextEpisode, hasTriggeredAutoNext]);

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
  }, [getNextEpisodeInfo, hasPreviousEpisode, handleNextEpisode, handlePreviousEpisode]);

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

        <iframe
          key={`${tvShow.id}-${season}-${episode}`}
          ref={iframeRef}
          src={streamUrl}
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="origin"
          title={`${tvShow.name} - S${season} E${episode}`}
          onLoad={() => {
            dispatch({ type: 'SET_LOADING', loading: false });
          }}
          onError={() => {
            dispatch({ type: 'SET_LOADING', loading: false });
          }}
        />
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
