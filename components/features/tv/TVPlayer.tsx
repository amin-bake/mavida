/**
 * TV Player Component
 * Video player for TV show episodes with episode navigation and watch progress tracking
 */

'use client';

import { useEffect, useRef, useCallback, useReducer, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Play from 'lucide-react/dist/esm/icons/play';
import PlaySquare from 'lucide-react/dist/esm/icons/play-square';
import Film from 'lucide-react/dist/esm/icons/film';
import { Toggle } from '@/components/ui/toggle';
import { useWatchProgress, useEpisodeAvailability } from '@/hooks';
import { usePlayerPreferencesStore } from '@/stores/playerPreferencesStore';
import { useUserPreferencesStore } from '@/stores';
import { getTVEmbedUrl } from '@/lib/constants';
import type { TVShow, TVEpisode } from '@/types/tv';

interface PlayerState {
  currentTime: number;
  duration: number;
  isLoading: boolean;
}

type PlayerAction =
  | { type: 'SET_TIME'; time: number; duration: number }
  | { type: 'SET_LOADING'; loading: boolean };

const playerReducer = (state: PlayerState, action: PlayerAction): PlayerState => {
  switch (action.type) {
    case 'SET_TIME':
      return { ...state, currentTime: action.time, duration: action.duration };
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
    isLoading: true,
  });

  const { isLoading } = playerState;

  // Player preferences from Zustand store
  const { autoplayEnabled, autonextEnabled, setAutoplay, setAutonext } =
    usePlayerPreferencesStore();

  // VidSrc availability for the initially-loaded episode (keyed on props, which stay
  // static during autonext playback, so this never refetches mid-episode).
  const availability = useEpisodeAvailability(tvShow.id, season, episode);
  const availabilityResolved = availability.isSuccess || availability.isError;
  const notAvailable = availability.data?.status === 'unavailable';
  const qualityBadge =
    availability.data?.status === 'available' ? availability.data.info.quality : undefined;

  // Resume playback: map the last saved progress for this exact episode to a startAt
  // timestamp (seconds). Resolved once — via the render-phase "adjust state" pattern,
  // after the persisted store has rehydrated and BEFORE the iframe mounts — so the
  // player loads exactly one time with the resume position baked into the URL
  // (no src swap → no playback restart).
  const watchHistoryItems = useUserPreferencesStore((state) => state.watchHistoryItems);
  const [resumeStartAt, setResumeStartAt] = useState<number | undefined>(undefined);
  const [resumeReady, setResumeReady] = useState(false);

  // VidSrc embed URL for TV shows.
  //
  // Per the official API docs (https://vidsrc.sh/vidsrc/docs/):
  //   autoplay=1 — on official domains the player always shows a play button first;
  //                this only controls whether playback starts automatically after that click.
  //   autonext=1 — shows an "Up next" countdown and auto-plays the next episode when the
  //                current one ends; works on specific-episode URLs too.
  //   startAt    — resume from the last saved position (resolved once, below).
  //
  // Using VidSrc's native autonext=1 means episode transitions happen inside the same
  // iframe context, so the browser never needs a new user gesture to autoplay.
  // We detect the episode change via PLAYER_EVENT (player_info.season/episode) and sync
  // the URL with replaceState (no iframe remount needed).
  const streamUrl = getTVEmbedUrl(tvShow.id, season, episode, {
    autoplay: autoplayEnabled,
    autonext: autonextEnabled,
    startAtSeconds: resumeStartAt,
  });

  // Tracks the episode VidSrc is currently playing.
  // Initialised from props; updated in the postMessage event handler when VidSrc's native
  // autonext advances to a different episode (not in a useEffect body, so no cascading-
  // renders lint issue).
  const [liveEpisode, setLiveEpisode] = useState({ s: season, e: episode });
  // Ref copy for stale-closure-free access inside the event listener without re-registering it.
  const liveEpisodeRef = useRef(liveEpisode);
  // Ref-stabilised callback so the message listener never needs to be re-registered.
  const onEpisodeChangeRef = useRef(onEpisodeChange);
  useEffect(() => {
    onEpisodeChangeRef.current = onEpisodeChange;
  });

  if (!resumeReady && useUserPreferencesStore.persist.hasHydrated()) {
    let startAt: number | undefined;
    if (
      episodeDetails &&
      episodeDetails.season_number === season &&
      episodeDetails.episode_number === episode
    ) {
      const durationSeconds = episodeDetails.runtime ? episodeDetails.runtime * 60 : undefined;
      const saved = watchHistoryItems.find(
        (item) =>
          item.id === tvShow.id &&
          item.type === 'tv' &&
          item.season === season &&
          item.episode === episode
      );
      // Only resume meaningful progress (>= 5s); treat >= 90% as watched-through.
      if (saved && durationSeconds && saved.progress >= 5 && saved.progress < 90) {
        startAt = Math.floor((saved.progress / 100) * durationSeconds);
      }
    }
    setResumeStartAt(startAt);
    setResumeReady(true);
  }

  // Show-level iframe key — intentionally excludes season/episode so VidSrc's native
  // autonext can transition episodes inside the same iframe without a React remount.
  // Toggling autoplay/autonext preferences still remounts the iframe (the params live
  // in the URL, and a fresh load is required to apply them).
  const iframeKey = useMemo(
    () =>
      `${tvShow.id}-${autoplayEnabled ? 'ap1' : 'ap0'}-${autonextEnabled ? 'an1' : 'an0'}`,
    [tvShow.id, autoplayEnabled, autonextEnabled]
  );

  // Get current season data (keyed to liveEpisode so prev/next buttons stay correct)
  const currentSeason = tvShow.seasons?.find((s) => s.season_number === liveEpisode.s);
  const currentSeasonEpisodeCount = currentSeason?.episode_count || 0;

  // Watch progress tracking
  const { updateProgress, markComplete, saveProgress } = useWatchProgress({
    id: tvShow.id,
    type: 'tv',
    season: liveEpisode.s,
    episode: liveEpisode.e,
    episodeTitle: episodeDetails?.name,
    title: tvShow.name,
    posterPath: tvShow.poster_path || undefined,
    runtime: episodeDetails?.runtime || undefined,
    totalSeasons: tvShow.number_of_seasons,
    totalEpisodes: currentSeasonEpisodeCount,
  });

  // Refs so the stable postMessage listener always sees the latest callbacks
  // (their closures re-bind to the active season/episode on every render).
  const updateProgressRef = useRef(updateProgress);
  const saveProgressRef = useRef(saveProgress);
  const markCompleteRef = useRef(markComplete);
  useEffect(() => {
    updateProgressRef.current = updateProgress;
    saveProgressRef.current = saveProgress;
    markCompleteRef.current = markComplete;
  });

  // Navigation helpers (based on liveEpisode so they stay accurate after VidSrc autonext)
  const hasPreviousEpisode = liveEpisode.e > 1;
  const hasNextEpisode = currentSeason ? liveEpisode.e < currentSeason.episode_count : false;

  // Check if we can auto-advance to next season
  const canAdvanceToNextSeason = useCallback(() => {
    if (!currentSeason || liveEpisode.e !== currentSeason.episode_count) return false;
    return liveEpisode.s < tvShow.number_of_seasons;
  }, [currentSeason, liveEpisode, tvShow.number_of_seasons]);

  const getNextEpisodeInfo = useCallback((): {
    season: number;
    episode: number;
    isNewSeason: boolean;
  } | null => {
    if (hasNextEpisode) {
      return { season: liveEpisode.s, episode: liveEpisode.e + 1, isNewSeason: false };
    } else if (canAdvanceToNextSeason()) {
      return { season: liveEpisode.s + 1, episode: 1, isNewSeason: true };
    }
    return null;
  }, [hasNextEpisode, liveEpisode, canAdvanceToNextSeason]);

  const handlePreviousEpisode = useCallback(() => {
    if (!hasPreviousEpisode) return;
    router.push(`/tv/${tvShow.id}/watch/${liveEpisode.s}/${liveEpisode.e - 1}`);
  }, [hasPreviousEpisode, liveEpisode, router, tvShow.id]);

  const handleNextEpisode = useCallback(() => {
    const nextEp = getNextEpisodeInfo();
    if (!nextEp) return;
    router.push(`/tv/${tvShow.id}/watch/${nextEp.season}/${nextEp.episode}`);
  }, [getNextEpisodeInfo, router, tvShow.id]);

  // Listen for postMessage events from the VidSrc iframe.
  //
  // Current payload (https://vidsrc.sh/vidsrc/docs/):
  //   { type: 'PLAYER_EVENT', data: {
  //       player_info:    { imdb, tmdb, mediaType, season, episode },
  //       player_status:  'playing' | 'paused' | 'completed' | 'seeked',
  //       player_progress:  <seconds>,
  //       player_duration:  <seconds>
  //   } }
  //
  // The old formats ({ event: 'time', time, duration } and PLAYER_EVENT with a flat
  // data.season/data.episode) are no longer emitted.
  //
  // On PLAYER_EVENT we:
  //   - sync liveEpisode from player_info (fires on native autonext transitions)
  //     → re-renders episode counter + nav buttons, calls onEpisodeChangeRef
  //   - track playback progress (~every 5s while playing, plus pause/seek)
  //   - mark the episode complete on 'completed'
  // The iframe is NOT remounted — VidSrc already loaded the new episode inside it.
  //
  // Registered once (empty dep array); changing values accessed via refs to avoid
  // stale closures without re-registering the listener on every render.
  useEffect(() => {
    const handlePostMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.data === null) return;
      const data = event.data as Record<string, unknown>;
      if (data.type !== 'PLAYER_EVENT') return;

      const pd = (data.data ?? {}) as {
        player_info?: {
          imdb?: string | null;
          tmdb?: number | null;
          mediaType?: string | null;
          season?: number | null;
          episode?: number | null;
        };
        player_status?: string;
        player_progress?: number;
        player_duration?: number;
      };
      const { player_status, player_progress, player_duration } = pd;

      // Episode sync — the player re-sends PLAYER_EVENT (with the new player_info) when
      // native autonext advances to a different episode inside the same iframe.
      const info = pd.player_info ?? {};
      if (typeof info.season === 'number' && typeof info.episode === 'number') {
        if (info.season !== liveEpisodeRef.current.s || info.episode !== liveEpisodeRef.current.e) {
          const next = { s: info.season, e: info.episode };
          liveEpisodeRef.current = next;
          setLiveEpisode(next);
          onEpisodeChangeRef.current?.(info.season, info.episode);
        }
      }

      // Progress + duration arrive on every event; throttle saving inside the hook.
      if (
        typeof player_progress === 'number' &&
        typeof player_duration === 'number' &&
        player_duration > 0
      ) {
        dispatch({ type: 'SET_TIME', time: player_progress, duration: player_duration });
        if (player_status === 'playing') {
          updateProgressRef.current(player_progress, player_duration);
        } else if (player_status === 'paused' || player_status === 'seeked') {
          // Commit the exact position immediately on pause/seek so resume is accurate.
          saveProgressRef.current(Math.min((player_progress / player_duration) * 100, 100));
        }
      }

      // Episode finished.
      if (player_status === 'completed') {
        markCompleteRef.current();
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, []); // stable — changing values accessed via refs

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
        {isLoading && !notAvailable && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              <p className="text-sm text-white/80">Loading episode...</p>
            </div>
          </div>
        )}

        {resumeReady && availabilityResolved && !notAvailable && (
          <iframe
            // Mounted only after resume + availability are resolved so the src is final
            // on first load (no startAt-less load followed by a reload with startAt).
            // Key includes autoplayEnabled so toggling the preference unmounts/remounts the
            // iframe immediately, which is how the new autoplay=0/default setting takes effect.
            // Key includes autonext so toggling it remounts the iframe with the updated URL.
            key={iframeKey}
            src={streamUrl}
            className="h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="origin"
            title={`${tvShow.name} - S${liveEpisode.s} E${liveEpisode.e}`}
            onLoad={() => dispatch({ type: 'SET_LOADING', loading: false })}
            onError={() => dispatch({ type: 'SET_LOADING', loading: false })}
          />
        )}

        {resumeReady && availabilityResolved && notAvailable && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center backdrop-blur-sm">
            <Film className="h-10 w-10 text-white/50" />
            <p className="font-medium text-white/90">
              This episode isn&apos;t currently available on VidSrc.
            </p>
            <Link
              href={`/tv/${tvShow.id}`}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Back to {tvShow.name}
            </Link>
          </div>
        )}

        {qualityBadge && (
          <div className="absolute right-3 top-3 z-20 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
            {qualityBadge}
          </div>
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
          className="gap-2 data-[state=on]:text-[#E50914] data-[state=on]:*:[svg]:stroke-[#E50914] cursor-pointer"
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
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-card hover:bg-card-hover disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-card transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
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
                  S{liveEpisode.s} E{liveEpisode.e}
                </span>
              </div>

              {/* VidSrc automatically handles next episode with autonext=1 parameter */}
            </div>

            {/* Next Episode Button */}
            <button
              onClick={handleNextEpisode}
              disabled={!getNextEpisodeInfo()}
              className="flex items-center gap-2 px-6 py-3 rounded-lg bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary text-primary-foreground transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 cursor-pointer"
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
