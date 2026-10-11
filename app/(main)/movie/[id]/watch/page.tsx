'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Play from 'lucide-react/dist/esm/icons/play';
import Film from 'lucide-react/dist/esm/icons/film';
import { Toggle } from '@/components/ui/toggle';
import { useMovieDetail } from '@/hooks/useMovies';
import { useMovieAvailability } from '@/hooks/useVidsrc';
import { useWatchProgress } from '@/hooks';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';
import { usePlayerPreferencesStore } from '@/stores/playerPreferencesStore';
import { getMovieEmbedUrl } from '@/lib/constants';

export default function WatchPage() {
  const params = useParams();
  const router = useRouter();
  const movieId = parseInt(params.id as string);

  const { data: movie, isLoading } = useMovieDetail(movieId);

  // Unified watch tracking — same pipeline as the TV player. Writes the unified
  // watchHistoryItems + continueWatching store that feeds the homepage
  // "Continue Watching" row (the legacy updateWatchProgress path never did).
  const { updateProgress, saveProgress, markComplete } = useWatchProgress({
    id: movieId,
    type: 'movie',
    title: movie?.title,
    posterPath: movie?.posterPath || undefined,
    runtime: movie?.runtime ?? undefined,
  });
  // Refs so the stable postMessage listener always sees the latest callbacks.
  const updateProgressRef = useRef(updateProgress);
  const saveProgressRef = useRef(saveProgress);
  const markCompleteRef = useRef(markComplete);
  useEffect(() => {
    updateProgressRef.current = updateProgress;
    saveProgressRef.current = saveProgress;
    markCompleteRef.current = markComplete;
  });

  // Previously-saved positions: unified continueWatching first, with a legacy
  // watchHistory fallback so pre-migration data still resumes.
  const continueWatching = useUserPreferencesStore((state) => state.continueWatching);
  const watchHistory = useUserPreferencesStore((state) => state.watchHistory);
  const { autoplayEnabled, setAutoplay } = usePlayerPreferencesStore();

  // VidSrc availability for this movie — quality badge + graceful "not available" state.
  const availability = useMovieAvailability(movieId);
  const availabilityResolved = availability.isSuccess || availability.isError;
  const notAvailable = availability.data?.status === 'unavailable';
  const qualityBadge =
    availability.data?.status === 'available' ? availability.data.info.quality : undefined;

  // Resume playback: map the last saved progress to a startAt timestamp (seconds).
  // Resolved once — via the render-phase "adjust state" pattern, after the persisted
  // store has rehydrated and BEFORE the iframe mounts — so the player loads exactly one
  // time with the resume position baked into the URL (no src swap → no restart).
  const [resumeStartAt, setResumeStartAt] = useState<number | undefined>(undefined);
  const [resumeReady, setResumeReady] = useState(false);

  if (!resumeReady && movie && useUserPreferencesStore.persist.hasHydrated()) {
    let startAt: number | undefined;
    const durationSeconds = movie.runtime ? movie.runtime * 60 : undefined;
    const saved =
      continueWatching.find((item) => item.id === movie.id && item.type === 'movie') ||
      watchHistory.find((item) => item.movieId === movie.id);
    // Only resume meaningful progress (>= 5s); treat >= 90% as watched-through.
    if (saved && durationSeconds && saved.progress >= 5 && saved.progress < 90) {
      startAt = Math.floor((saved.progress / 100) * durationSeconds);
    }
    setResumeStartAt(startAt);
    setResumeReady(true);
  }

  // Track real playback progress from VidSrc player events.
  // The player postMessages { type: 'PLAYER_EVENT', data: { player_status,
  // player_progress, player_duration } } — ~every 5s while playing, plus on pause/seek.
  useEffect(() => {
    if (!movie) return;

    const handlePostMessage = (event: MessageEvent) => {
      if (typeof event.data !== 'object' || event.data === null) return;
      const data = event.data as Record<string, unknown>;
      if (data.type !== 'PLAYER_EVENT') return;

      const pd = (data.data ?? {}) as {
        player_status?: string;
        player_progress?: number;
        player_duration?: number;
      };
      const { player_status, player_progress, player_duration } = pd;

      if (player_status === 'completed') {
        markCompleteRef.current();
        return;
      }

      if (
        typeof player_progress === 'number' &&
        typeof player_duration === 'number' &&
        player_duration > 0
      ) {
        if (player_status === 'paused' || player_status === 'seeked') {
          // Commit the exact position immediately on pause/seek so resume is accurate.
          saveProgressRef.current(Math.min((player_progress / player_duration) * 100, 100));
          return;
        }
        if (player_status === 'playing') {
          updateProgressRef.current(player_progress, player_duration);
        }
      }
    };

    window.addEventListener('message', handlePostMessage);
    return () => window.removeEventListener('message', handlePostMessage);
  }, [movie]);

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

  // VidSrc embed URL with autoplay / resume from user preferences
  const embedUrl = getMovieEmbedUrl(movieId, {
    autoplay: autoplayEnabled,
    startAtSeconds: resumeStartAt,
  });

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
          {!resumeReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm">
              <div className="flex flex-col items-center gap-4">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                <p className="text-sm text-white/80">Loading player...</p>
              </div>
            </div>
          )}
          {resumeReady && availabilityResolved && !notAvailable && (
            <iframe
              // Keying by autoplayEnabled forces a remount (and therefore a fresh load
              // with the correct autoplay param) whenever the user toggles the preference.
              // Mounted only after resume + availability are resolved so the src is final
              // on first load.
              key={`movie-${movieId}-${autoplayEnabled ? 'ap1' : 'ap0'}`}
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="origin"
              title={`Watch ${movie.title}`}
              onLoad={() => {}}
              onError={() => {}}
            />
          )}
          {resumeReady && availabilityResolved && notAvailable && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/80 px-6 text-center backdrop-blur-sm">
              <Film className="h-10 w-10 text-white/50" />
              <p className="font-medium text-white/90">
                This title isn&apos;t currently available on VidSrc.
              </p>
              <Link
                href={`/movie/${movieId}`}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Back to Details
              </Link>
            </div>
          )}
          {qualityBadge && (
            <div className="absolute right-3 top-3 z-20 rounded-md bg-black/70 px-2 py-1 text-xs font-semibold text-white/90 backdrop-blur-sm">
              {qualityBadge}
            </div>
          )}
        </div>
        <div className="flex items-center justify-center gap-3">
          <Toggle
            pressed={autoplayEnabled}
            onPressedChange={setAutoplay}
            variant="outline"
            aria-label="Toggle autoplay"
            className="gap-2 data-[state=on]:text-[#E50914] data-[state=on]:*:[svg]:fill-[#E50914] cursor-pointer"
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
