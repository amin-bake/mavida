# Mavida - Technical Specification Document

**Personal Movie & TV Show Streaming Application**  
_Version 2.0 | December 8, 2025_

---

## 1. Executive Summary

Mavida is a Netflix-inspired personal streaming application built with Next.js 16, featuring a modern, performant interface for browsing and watching movies and TV shows. The application integrates TMDB for metadata and VidSrc API for video streaming.

### Key Objectives

- Create an intuitive, responsive media browsing experience for movies and TV shows
- Achieve optimal performance metrics (LCP < 2.5s, CLS < 0.1, FID < 100ms)
- Implement seamless video playback with adaptive streaming for both movies and episodes
- Support season/episode navigation for TV shows
- Track watch progress at episode level for TV series
- Maintain strict TypeScript typing and code quality standards

---

## 2. Technology Stack

### Core Framework

- **Next.js 16.0.7** (App Router)
  - Server Components for optimal performance
  - Streaming SSR for faster page loads
  - Built-in API routes for backend logic

### Languages & Type Safety

- **TypeScript 5+** (strict mode enabled)
  - No `any` types
  - Comprehensive type definitions
  - Interface-driven development

### Styling & UI

- **Tailwind CSS 4** with custom theme
  - 8px grid system for consistent spacing
  - Dark-first color palette
  - Custom utility classes for Netflix-style UI
- **CSS Transitions / Framer Motion** for animations
  - Smooth hover effects
  - Page transitions
  - Modal animations

### State Management

- **Zustand** (v4+)
  - Lightweight and performant
  - TypeScript-first API
  - Devtools integration

**Store Architecture:**

```typescript
stores/
├── movieStore.ts          # Current movie, player state
├── userPreferencesStore.ts # Watch history, favorites
└── searchStore.ts         # Search state, filters
```

### Data Fetching & Caching

- **TanStack Query (React Query) v5**
  - Automatic caching and revalidation
  - Optimistic updates
  - Infinite scroll pagination

**Cache Strategy:**

- Movie metadata: 24 hours stale time
- Trending/popular: 1 hour stale time
- Search results: 5 minutes stale time
- User data: No caching (always fresh)

### Performance Optimization

- **Redis** (Optional - Phase 2)
  - Server-side caching for API responses
  - Rate limiting for TMDB API
  - Session storage (if auth added)

- **Next.js Image Optimization**
  - Automatic format conversion (WebP/AVIF)
  - Responsive images with blur placeholders
  - Lazy loading for below-fold content

---

## 3. API Integration Architecture

### 3.1 Media Metadata - TMDB API

**Selected API:** The Movie Database (TMDB)  
**Rationale:**

- Comprehensive metadata for movies and TV shows (titles, posters, descriptions, ratings, cast)
- Episode-level data for TV series (air dates, episode titles, thumbnails)
- Season information (number of episodes, air dates, overviews)
- 40+ language support
- Free tier: 10,000 requests/day (sufficient for personal use)
- Excellent documentation and TypeScript support

**Base URL:** `https://api.themoviedb.org/3`

**Key Endpoints - Movies:**

```typescript
// Discovery & Trending
GET / trending / movie / { time_window }; // Daily/weekly trends
GET / movie / popular; // Popular movies
GET / movie / top_rated; // Top rated
GET / discover / movie; // Advanced filtering

// Movie Details
GET / movie / { movie_id }; // Full details
GET / movie / { movie_id } / videos; // Trailers
GET / movie / { movie_id } / credits; // Cast & crew
GET / movie / { movie_id } / recommendations; // Related movies

// Search
GET / search / movie; // Search by title
GET / search / multi; // Search all content (movies + TV)
```

**Key Endpoints - TV Shows:**

```typescript
// Discovery & Trending
GET / trending / tv / { time_window }; // Daily/weekly trending shows
GET / tv / popular; // Popular TV shows
GET / tv / top_rated; // Top rated shows
GET / tv / airing_today; // Shows airing today
GET / tv / on_the_air; // Currently airing shows
GET / discover / tv; // Advanced filtering

// TV Show Details
GET / tv / { tv_id }; // Full show details
GET / tv / { tv_id } / season / { season_number }; // Season details
GET / tv / { tv_id } / season / { season_number } / episode / { episode_number }; // Episode details
GET / tv / { tv_id } / videos; // Trailers
GET / tv / { tv_id } / credits; // Cast & crew
GET / tv / { tv_id } / recommendations; // Similar shows

// Search
GET / search / tv; // Search TV shows
```

**Implementation Pattern:**

```typescript
// services/tmdb/client.ts
export class TMDBClient {
  private readonly baseURL = 'https://api.themoviedb.org/3';
  private readonly apiKey = process.env.TMDB_API_KEY;

  // Movie methods
  async getMovie(id: number): Promise<Movie> {
    /* ... */
  }
  async searchMovies(query: string): Promise<MovieSearchResult> {
    /* ... */
  }

  // TV Show methods
  async getTVShow(id: number): Promise<TVShow> {
    /* ... */
  }
  async getTVSeason(tvId: number, seasonNumber: number): Promise<TVSeason> {
    /* ... */
  }
  async getTVEpisode(
    tvId: number,
    seasonNumber: number,
    episodeNumber: number
  ): Promise<TVEpisode> {
    /* ... */
  }
  async searchTVShows(query: string): Promise<TVShowSearchResult> {
    /* ... */
  }

  // Multi-search (movies + TV shows)
  async searchMulti(query: string): Promise<MultiSearchResult> {
    /* ... */
  }
}
```

### 3.2 Video Streaming - VidSrc API

**Selected API:** VidSrc (vidsrcme.su, vsrc.su)  
**Base URLs:**

- **Movies:** `https://vidsrcme.su/embed/movie?tmdb={tmdb_id}&autoplay={0|1}`
- **TV Shows:** `https://vidsrcme.su/embed/tv?tmdb={tmdb_id}&season={season}&episode={episode}&autoplay={0|1}&autonext={0|1}`
- **TV Shows:** `https://vidsrcme.ru/api/tv/{tmdb_id}/{season}/{episode}`

**Implementation:**

```typescript
// services/video/player.ts
export const getStreamingUrl = (
  mediaType: 'movie' | 'tv',
  tmdbId: number,
  season?: number,
  episode?: number
): string => {
  if (mediaType === 'movie') {
    return `https://vidsrcme.su/embed/movie?tmdb=${tmdbId}&autoplay=1`;
  } else {
    if (season === undefined || episode === undefined) {
      throw new Error('Season and episode are required for TV shows');
    }
    return `https://vidsrcme.ru/api/tv/${tmdbId}/${season}/${episode}`;
  }
};

// Alternative sources (fallback)
const STREAMING_SOURCES = {
  primary: 'vidsrcme.su',
  fallback: 'vidsrc.xyz', // Backup if primary fails
};
```

**Player Component Strategy:**

- Embed VidSrc player via iframe (simplest approach)
- Custom controls overlay (optional Phase 2)
- Episode navigation controls for TV shows (Previous/Next episode buttons)
- Watch progress tracking with localStorage
- Resume playback from last position

---

## 4. Application Architecture

### 4.1 Directory Structure

```
mavida/
├── app/                          # Next.js 16 App Router
│   ├── (auth)/                  # Auth group (future)
│   ├── (main)/                  # Main app routes
│   │   ├── layout.tsx           # Main layout with nav
│   │   ├── page.tsx             # Homepage (trending content)
│   │   ├── browse/              # Browse by category
│   │   │   └── page.tsx
│   │   ├── search/              # Search results (movies + TV)
│   │   │   └── page.tsx
│   │   ├── movies/              # Movies browse page
│   │   │   └── page.tsx
│   │   ├── tv/                  # TV shows browse page
│   │   │   └── page.tsx
│   │   ├── movie/               # Movie details
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── watch/       # Movie player page
│   │   │           └── page.tsx
│   │   ├── tv/                  # TV show details
│   │   │   └── [id]/
│   │   │       ├── page.tsx     # Show overview
│   │   │       └── watch/       # Episode player
│   │   │           └── [season]/
│   │   │               └── [episode]/
│   │   │                   └── page.tsx
│   │   └── my-list/             # User's saved content
│   │       └── page.tsx
│   ├── api/                     # API routes
│   │   ├── movies/
│   │   │   ├── [id]/route.ts
│   │   │   └── trending/route.ts
│   │   ├── tv/
│   │   │   ├── [id]/route.ts
│   │   │   ├── [id]/season/[season]/route.ts
│   │   │   └── trending/route.ts
│   │   └── search/route.ts
│   ├── globals.css              # Global styles
│   └── layout.tsx               # Root layout
│
├── components/
│   ├── ui/                      # Base UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Modal.tsx
│   │   ├── Skeleton.tsx
│   │   └── Spinner.tsx
│   ├── layout/                  # Layout components
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   └── Sidebar.tsx
│   └── features/                # Feature-specific components
│       ├── media/               # Shared movie/TV components
│       │   ├── MediaCard.tsx    # Renamed from MovieCard
│       │   ├── MediaGrid.tsx
│       │   ├── MediaRow.tsx
│       │   └── MediaHero.tsx
│       ├── movie/
│       │   └── MoviePlayer.tsx
│       ├── tv/
│       │   ├── TVPlayer.tsx
│       │   ├── SeasonSelector.tsx
│       │   ├── EpisodeGrid.tsx
│       │   └── EpisodeCard.tsx
│       └── search/
│           ├── SearchBar.tsx
│           ├── SearchFilters.tsx
│           └── MediaTypeToggle.tsx
│
├── lib/                         # Utilities & config
│   ├── utils.ts                 # Utility functions
│   ├── cn.ts                    # Class name merger
│   ├── constants.ts             # App constants
│   └── queryClient.ts           # TanStack Query setup
│
├── services/                    # API integrations
│   ├── tmdb/
│   │   ├── client.ts            # TMDB API client
│   │   ├── queries.ts           # React Query hooks
│   │   ├── movie.queries.ts     # Movie-specific hooks
│   │   ├── tv.queries.ts        # TV show-specific hooks
│   │   └── types.ts             # TMDB-specific types
│   └── video/
│       ├── player.ts            # Video player logic
│       └── types.ts
│
├── stores/                      # Zustand stores
│   ├── mediaStore.ts            # Current media, player state
│   ├── userPreferencesStore.ts  # Watch history, favorites
│   ├── searchStore.ts           # Search state, filters
│   └── tvStore.ts               # TV-specific state (current season/episode)
│
├── types/                       # TypeScript definitions
│   ├── movie.ts                 # Movie interfaces
│   ├── tv.ts                    # TV show, season, episode types
│   ├── media.ts                 # Shared media types (union types)
│   ├── user.ts                  # User preferences
│   └── api.ts                   # API response types
│
├── hooks/                       # Custom React hooks
│   ├── useMovies.ts
│   ├── useTVShows.ts
│   ├── useSeasons.ts
│   ├── useEpisodes.ts
│   ├── useSearch.ts
│   ├── useLocalStorage.ts
│   └── useWatchHistory.ts
│
└── styles/                      # Additional styles
    └── player.css               # Video player specific styles
```

### 4.2 Component Architecture

```
┌─────────────────────────────────────────┐
│          Root Layout (app/layout.tsx)    │
│  - TanStack Query Provider               │
│  - Theme Provider                        │
│  - Font Configuration                    │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│     Main Layout ((main)/layout.tsx)     │
│  - Navbar (search, navigation)          │
│  - Main content area                    │
│  - Footer                               │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐      ┌──────────────────┐
│  Homepage    │      │  Movie Detail    │
│              │      │                  │
│ - MovieHero  │      │ - Movie Info     │
│ - MovieRow[] │      │ - Watch Button   │
│              │      │ - Related Movies │
└──────────────┘      └──────────────────┘
                                │
                                ▼
                      ┌──────────────────┐
                      │  Watch Page      │
                      │                  │
                      │ - MoviePlayer    │
                      │ - Controls       │
                      └──────────────────┘
```

### 4.3 State Management Strategy

**Zustand Stores:**

1. **Media Store** - Current playback state (unified for movies and TV)

   ```typescript
   interface MediaState {
     currentMedia: Movie | TVShow | null;
     mediaType: 'movie' | 'tv' | null;
     isPlaying: boolean;
     currentTime: number;

     // TV-specific state
     currentSeason?: number;
     currentEpisode?: number;

     setCurrentMedia: (media: Movie | TVShow, type: 'movie' | 'tv') => void;
     updatePlaybackTime: (time: number) => void;
     setEpisode: (season: number, episode: number) => void;
   }
   ```

2. **User Preferences Store** - Personal data

   ```typescript
   interface UserPreferencesState {
     favorites: FavoriteItem[]; // { id: number, type: 'movie' | 'tv' }
     watchHistory: WatchHistoryItem[];
     continueWatching: ContinueWatchingItem[];

     addFavorite: (id: number, type: 'movie' | 'tv') => void;
     removeFavorite: (id: number, type: 'movie' | 'tv') => void;
     updateWatchProgress: (
       id: number,
       type: 'movie' | 'tv',
       progress: number,
       season?: number,
       episode?: number
     ) => void;
   }

   interface WatchHistoryItem {
     id: number;
     type: 'movie' | 'tv';
     timestamp: number;
     progress: number;
     season?: number; // For TV shows
     episode?: number; // For TV shows
   }
   ```

3. **Search Store** - Search state
   ```typescript
   interface SearchState {
     query: string;
     mediaType: 'all' | 'movie' | 'tv'; // Filter by content type
     filters: SearchFilters;
     recentSearches: string[];
     setQuery: (query: string) => void;
     setMediaType: (type: 'all' | 'movie' | 'tv') => void;
     addRecentSearch: (query: string) => void;
   }
   ```

**Persistence Strategy:**

- Use `zustand/middleware/persist` with localStorage
- Sync watch history and favorites across sessions
- Store episode-level progress for TV shows
- Clear sensitive data on logout (if auth added)

---

## 5. Data Flow & Caching

### 5.1 TanStack Query Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes default
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

// Query Keys
export const queryKeys = {
  movies: {
    all: ['movies'] as const,
    trending: (timeWindow: string) => ['movies', 'trending', timeWindow] as const,
    popular: (page: number) => ['movies', 'popular', page] as const,
    detail: (id: number) => ['movies', 'detail', id] as const,
    search: (query: string) => ['movies', 'search', query] as const,
  },
};
```

### 5.2 Custom Hooks Pattern

```typescript
// hooks/useMovies.ts
export const useTrendingMovies = (timeWindow: 'day' | 'week' = 'day') => {
  return useQuery({
    queryKey: queryKeys.movies.trending(timeWindow),
    queryFn: () => tmdbClient.getTrending(timeWindow),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useMovieDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.movies.detail(id),
    queryFn: () => tmdbClient.getMovie(id),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

// hooks/useTVShows.ts
export const useTrendingTVShows = (timeWindow: 'day' | 'week' = 'day') => {
  return useQuery({
    queryKey: queryKeys.tv.trending(timeWindow),
    queryFn: () => tmdbClient.getTrendingTV(timeWindow),
    staleTime: 1000 * 60 * 60, // 1 hour
  });
};

export const useTVShowDetail = (id: number) => {
  return useQuery({
    queryKey: queryKeys.tv.detail(id),
    queryFn: () => tmdbClient.getTVShow(id),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useTVSeason = (tvId: number, seasonNumber: number) => {
  return useQuery({
    queryKey: queryKeys.tv.season(tvId, seasonNumber),
    queryFn: () => tmdbClient.getTVSeason(tvId, seasonNumber),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useTVEpisode = (tvId: number, seasonNumber: number, episodeNumber: number) => {
  return useQuery({
    queryKey: queryKeys.tv.episode(tvId, seasonNumber, episodeNumber),
    queryFn: () => tmdbClient.getTVEpisode(tvId, seasonNumber, episodeNumber),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
```

---

## 6. Video Player Implementation

### Strategy: Embedded Player (Phase 1)

**Approach:** Use VidSrc embed URLs in an iframe for both movies and TV shows

- **Pros:** No complex video logic needed, adaptive streaming handled by VidSrc
- **Cons:** Limited customization of player controls

**Implementation - Movies:**

```typescript
// components/features/movie/MoviePlayer.tsx
export function MoviePlayer({ tmdbId }: { tmdbId: number }) {
  const streamUrl = `https://vidsrc.me/embed/movie/${tmdbId}`;

  return (
    <div className="relative aspect-video w-full">
      <iframe
        src={streamUrl}
        className="h-full w-full"
        allowFullScreen
        allow="autoplay; encrypted-media"
      />
    </div>
  );
}
```

**Implementation - TV Shows:**

```typescript
// components/features/tv/TVPlayer.tsx
interface TVPlayerProps {
  tmdbId: number;
  season: number;
  episode: number;
  onEpisodeChange?: (season: number, episode: number) => void;
}

export function TVPlayer({
  tmdbId,
  season,
  episode,
  onEpisodeChange
}: TVPlayerProps) {
  const streamUrl = `https://vidsrcme.ru/api/tv/${tmdbId}/${season}/${episode}`;

  return (
    <div className="space-y-4">
      <div className="relative aspect-video w-full">
        <iframe
          src={streamUrl}
          className="h-full w-full"
          allowFullScreen
          allow="autoplay; encrypted-media"
        />
      </div>

      {/* Episode navigation controls */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => onEpisodeChange?.(season, episode - 1)}
          disabled={episode === 1}
        >
          ← Previous Episode
        </Button>
        <span className="text-sm text-gray-400">
          S{season} E{episode}
        </span>
        <Button
          onClick={() => onEpisodeChange?.(season, episode + 1)}
        >
          Next Episode →
        </Button>
      </div>
    </div>
  );
}
```

### Watch Progress Tracking

```typescript
// hooks/useWatchHistory.ts
export const useWatchHistory = () => {
  const updateProgress = (
    id: number,
    type: 'movie' | 'tv',
    progressSeconds: number,
    season?: number,
    episode?: number
  ) => {
    const item: WatchHistoryItem = {
      id,
      type,
      progressSeconds,
      totalSeconds: 0, // Get from player if available
      lastWatched: new Date().toISOString(),
      ...(type === 'tv' && { season, episode }),
    };
    // Save to localStorage via Zustand store
  };
};
```

---

## 7. Design System Specifications

### 7.1 Tailwind CSS v4 Configuration

Tailwind CSS v4 uses a **CSS-first configuration** approach with the `@theme` directive instead of `tailwind.config.ts`. All customizations are defined directly in your CSS file using CSS variables.

**Configuration in `app/globals.css`:**

```css
@import 'tailwindcss';

@theme {
  /* Netflix-inspired Color Palette */
  --color-netflix-red: #e50914;
  --color-netflix-red-hover: #f40612;
  --color-netflix-black: #141414;
  --color-netflix-gray: #1f1f1f;
  --color-netflix-gray-light: #2f2f2f;

  /* Background Colors */
  --color-bg-primary: #141414;
  --color-bg-secondary: #1f1f1f;
  --color-bg-tertiary: #2f2f2f;

  /* Text Colors */
  --color-text-primary: #ffffff;
  --color-text-secondary: #b3b3b3;
  --color-text-muted: #808080;

  /* Accent Colors (using OKLCH for P3 gamut) */
  --color-accent-red: oklch(0.55 0.22 25);
  --color-accent-red-hover: oklch(0.6 0.24 25);

  /* Typography Scale */
  --font-size-xs: 0.75rem; /* 12px */
  --font-size-sm: 0.875rem; /* 14px */
  --font-size-base: 1rem; /* 16px */
  --font-size-lg: 1.125rem; /* 18px */
  --font-size-xl: 1.25rem; /* 20px */
  --font-size-2xl: 1.5rem; /* 24px */
  --font-size-3xl: 2rem; /* 32px */
  --font-size-4xl: 2.5rem; /* 40px */

  /* Font Families */
  --font-display: 'Inter', system-ui, sans-serif;
  --font-body: 'Inter', system-ui, sans-serif;

  /* Spacing Scale (8px grid system) */
  --spacing: 0.5rem; /* 8px base unit */
  /* Dynamic spacing utilities: mt-1 = 8px, mt-2 = 16px, mt-3 = 24px, etc. */

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
  --breakpoint-3xl: 1920px;

  /* Transitions & Animations */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-snappy: cubic-bezier(0.2, 0, 0, 1);
  --transition-fast: 150ms;
  --transition-base: 200ms;
  --transition-slow: 300ms;

  /* Border Radius */
  --radius-sm: 0.25rem;
  --radius-md: 0.5rem;
  --radius-lg: 1rem;
  --radius-xl: 1.5rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
  --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
}
```

### 7.2 Usage Examples

**Accessing Theme Variables in Components:**

```tsx
// Using Tailwind classes with custom colors
<button className="bg-netflix-red hover:bg-netflix-red-hover">
  Watch Now
</button>

// Using theme variables directly in CSS
<div style={{ backgroundColor: 'var(--color-netflix-black)' }}>
  Content
</div>

// Dynamic spacing (calculated from --spacing base unit)
<div className="mt-8 px-6"> {/* mt-8 = 64px, px-6 = 48px */}
  Content
</div>
```

### 7.3 Spacing System (8px Grid)

Tailwind v4 uses a **dynamic spacing scale** based on a single `--spacing` variable (8px):

```css
/* Base unit defined in @theme */
--spacing: 0.5rem; /* 8px */

/* Automatically generates utilities: */
.mt-1 {
  margin-top: calc(var(--spacing) * 1);
} /* 8px */
.mt-2 {
  margin-top: calc(var(--spacing) * 2);
} /* 16px */
.mt-3 {
  margin-top: calc(var(--spacing) * 3);
} /* 24px */
.px-6 {
  padding-inline: calc(var(--spacing) * 6);
} /* 48px */
.w-17 {
  width: calc(var(--spacing) * 17);
} /* 136px */
/* ... any numeric value works! */
```

### 7.4 Component Patterns

**Media Card (Movies & TV Shows):**

- Aspect ratio: 2:3 (poster)
- Hover effect: Scale 1.05, show title overlay
- Transition: 200ms ease-in-out
- Badge overlay for TV show episode count or season indicator

```tsx
<div className="group relative aspect-2/3 overflow-hidden rounded-md transition-transform duration-200 hover:scale-105">
  <Image src={posterUrl} alt={title} fill className="object-cover" />

  {/* Media type badge (TV shows only) */}
  {mediaType === 'tv' && (
    <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded text-xs font-semibold">
      TV
    </div>
  )}

  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
    <div className="absolute bottom-0 p-4">
      <h3 className="text-text-primary font-semibold">{title}</h3>
      <p className="text-text-secondary text-sm">
        {mediaType === 'movie' ? year : `${numberOfSeasons} Seasons`}
      </p>
    </div>
  </div>
</div>
```

**Season Selector (TV Shows):**

- Tab-based navigation for seasons
- Episode count indicator
- Active state highlighting

```tsx
<div className="flex gap-2 border-b border-bg-tertiary">
  {seasons.map((season) => (
    <button
      key={season.seasonNumber}
      onClick={() => setActiveSeason(season.seasonNumber)}
      className={cn(
        'px-4 py-3 text-sm font-semibold transition-colors border-b-2',
        activeSeason === season.seasonNumber
          ? 'border-netflix-red text-text-primary'
          : 'border-transparent text-text-secondary hover:text-text-primary'
      )}
    >
      Season {season.seasonNumber}
      <span className="ml-2 text-xs text-text-tertiary">({season.episodeCount} episodes)</span>
    </button>
  ))}
</div>
```

**Episode Card (TV Shows):**

- Landscape aspect ratio (16:9)
- Episode thumbnail from TMDB
- Episode number, title, runtime
- Watch progress indicator

```tsx
<div className="group relative overflow-hidden rounded-md bg-bg-secondary hover:bg-bg-tertiary transition-colors cursor-pointer">
  <div className="flex gap-4 p-4">
    {/* Episode thumbnail */}
    <div className="relative w-40 aspect-video shrink-0 rounded overflow-hidden">
      <Image src={stillPath} alt={episodeTitle} fill className="object-cover" />

      {/* Watch progress bar */}
      {watchProgress > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-bg-tertiary">
          <div className="h-full bg-netflix-red" style={{ width: `${watchProgress}%` }} />
        </div>
      )}
    </div>

    {/* Episode info */}
    <div className="flex-1 min-w-0">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-semibold text-text-primary truncate">
          {episodeNumber}. {episodeTitle}
        </h4>
        <span className="text-sm text-text-tertiary ml-2 shrink-0">{runtime}m</span>
      </div>
      <p className="text-sm text-text-secondary line-clamp-2">{overview}</p>
    </div>
  </div>
</div>
```

**Movie Row:**

- Horizontal scroll with scroll-snap
- Gradient fade at edges
- 4-6 visible items per viewport

```tsx
<div className="relative">
  <div className="flex gap-2 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide">
    {movies.map((movie) => (
      <div key={movie.id} className="min-w-[200px] snap-start">
        <MovieCard movie={movie} />
      </div>
    ))}
  </div>
  {/* Gradient overlays */}
  <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-linear-to-r from-bg-primary to-transparent" />
  <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-linear-to-l from-bg-primary to-transparent" />
</div>
```

**Hero Section:**

- Full viewport height initially
- Gradient overlay for text readability
- Play/Info buttons with custom styling
- Supports both movies and TV shows

```tsx
<section className="relative h-screen">
  <Image src={backdropUrl} alt={title} fill className="object-cover" priority />
  <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent" />
  <div className="relative z-10 flex h-full flex-col justify-center px-12 max-w-2xl">
    <h1 className="text-6xl font-bold text-text-primary mb-4">{title}</h1>
    <p className="text-lg text-text-secondary mb-8">{overview}</p>
    <div className="flex gap-4">
      <button className="bg-netflix-red hover:bg-netflix-red-hover px-8 py-3 rounded-md font-semibold transition-colors">
        {mediaType === 'movie' ? 'Play' : 'Play S1 E1'}
      </button>
      <button className="bg-bg-secondary/80 hover:bg-bg-tertiary px-8 py-3 rounded-md font-semibold transition-colors">
        More Info
      </button>
    </div>
  </div>
</section>
```

### 7.5 Custom Animations

Define custom animations in your CSS using the `@theme` directive:

```css
@theme {
  /* Animation keyframes */
  --animate-fade-in: fade-in 0.3s ease-in-out;
  --animate-slide-up: slide-up 0.4s ease-out;
  --animate-scale-in: scale-in 0.2s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scale-in {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
```

---

## 8. Performance Optimization Strategy

### 8.1 Image Optimization

**Next.js 16 Configuration:**

In Tailwind v4, Next.js configuration is done in `next.config.ts`:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
        pathname: '/t/p/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

**Note:** Next.js 15+ uses `remotePatterns` instead of `domains` for better security.

**Usage Pattern:**

```tsx
import Image from 'next/image';

<Image
  src={`https://image.tmdb.org/t/p/w500${movie.posterPath}`}
  alt={movie.title}
  width={300}
  height={450}
  placeholder="blur"
  blurDataURL={generateBlurDataURL(movie.posterPath)} // Use plaiceholder or similar
  className="object-cover"
/>;
```

### 8.2 Code Splitting

- Dynamic imports for heavy components (video player)
- Route-based splitting (automatic with App Router)
- Third-party library chunking

```typescript
// Dynamic import for player
const MoviePlayer = dynamic(
  () => import("@/components/features/movie/MoviePlayer"),
  {
    loading: () => <PlayerSkeleton />,
    ssr: false, // Client-side only
  }
);
```

### 8.3 Prefetching Strategy

```typescript
// Prefetch movie details on card hover
const handleMouseEnter = () => {
  queryClient.prefetchQuery({
    queryKey: queryKeys.movies.detail(movie.id),
    queryFn: () => tmdbClient.getMovie(movie.id),
  });
};
```

---

## 9. Error Handling & Loading States

### 9.1 Error Boundaries

```typescript
// components/ErrorBoundary.tsx
export class MovieErrorBoundary extends React.Component<Props, State> {
  // Catch rendering errors
  // Show user-friendly fallback UI
  // Log errors to console (or external service in production)
}
```

### 9.2 Loading Patterns

- **Skeleton screens** for movie grids
- **Spinner** for search/filter actions
- **Suspense boundaries** for lazy-loaded components
- **Optimistic updates** for user actions (favorites, etc.)

---

## 10. Accessibility Compliance

### WCAG 2.1 AA Standards

- **Keyboard Navigation:** All interactive elements accessible via Tab
- **ARIA Labels:** Descriptive labels for screen readers
- **Focus Indicators:** Visible focus states (2px outline)
- **Color Contrast:** Minimum 4.5:1 for text
- **Skip Links:** "Skip to main content" for keyboard users

**Implementation Checklist:**

- [ ] Semantic HTML (nav, main, article, section)
- [ ] Alt text for all images
- [ ] aria-label for icon-only buttons
- [ ] Focus trap in modals
- [ ] Announcement of dynamic content changes

---

## 11. Authentication Strategy (Future Phase)

**Recommendation for Personal Use:**

- **Option 1:** No authentication (fully public for personal device)
- **Option 2:** Simple password protection via middleware
- **Option 3:** NextAuth.js with local credentials (if multi-user needed)

**Selected Approach:** Start without auth, add in Phase 2 if needed.

---

## 12. Deployment Strategy

### Recommended Platform: Vercel

**Rationale:**

- Native Next.js support
- Automatic HTTPS and CDN
- Edge network for optimal performance
- Free tier sufficient for personal use
- Easy environment variable management

**Configuration:**

```bash
# Environment Variables (Vercel Dashboard)
TMDB_API_KEY=your_tmdb_api_key
NEXT_PUBLIC_APP_URL=https://mavida.vercel.app
```

**Build Optimization:**

```json
// package.json
{
  "scripts": {
    "build": "next build",
    "analyze": "ANALYZE=true next build"
  }
}
```

**Alternative Platforms:**

- Netlify (similar to Vercel)
- Railway (if backend/database needed)
- Self-hosted (Docker + Nginx)

---

## 13. Monitoring & Analytics (Optional)

**Performance Monitoring:**

- Vercel Analytics (built-in)
- Web Vitals tracking

**Error Tracking:**

- Sentry (optional for production)
- Console logging (development)

**User Analytics:**

- Plausible Analytics (privacy-friendly)
- Or skip entirely for personal use

---

## 14. Security Considerations

### API Key Protection

- Store TMDB API key in environment variables
- Use Next.js API routes to proxy requests (optional)
- Never expose keys in client-side code

### Content Security Policy

```typescript
// next.config.ts
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "frame-src 'self' https://vidsrc.me https://vidsrc.xyz;",
          },
        ],
      },
    ];
  },
};
```

---

## 15. TV Shows Implementation Details

### 15.1 Type Definitions

**Core TV Show Types:**

```typescript
// types/tv.ts
export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string;
  backdrop_path: string;
  first_air_date: string;
  last_air_date: string;
  vote_average: number;
  vote_count: number;
  popularity: number;
  origin_country: string[];
  original_language: string;

  // TV-specific fields
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TVSeason[];
  episode_run_time: number[];
  genres: Genre[];
  status: 'Returning Series' | 'Planned' | 'In Production' | 'Ended' | 'Canceled' | 'Pilot';
  type: 'Documentary' | 'News' | 'Miniseries' | 'Reality' | 'Scripted' | 'Talk Show' | 'Video';
  networks: Network[];
  created_by: Creator[];
}

export interface TVSeason {
  id: number;
  name: string;
  overview: string;
  poster_path: string;
  season_number: number;
  episode_count: number;
  air_date: string;
  episodes?: TVEpisode[];
}

export interface TVEpisode {
  id: number;
  name: string;
  overview: string;
  still_path: string;
  episode_number: number;
  season_number: number;
  air_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  crew: CrewMember[];
  guest_stars: CastMember[];
}

export interface Network {
  id: number;
  name: string;
  logo_path: string;
  origin_country: string;
}

export interface Creator {
  id: number;
  name: string;
  profile_path: string;
}
```

**Unified Media Types:**

```typescript
// types/media.ts
export type MediaType = 'movie' | 'tv';

export type Media = Movie | TVShow;

export interface FavoriteItem {
  id: number;
  type: MediaType;
  addedAt: string;
}

export interface ContinueWatchingItem {
  id: number;
  type: MediaType;
  progress: number; // 0-100
  lastWatched: string;

  // Movie-specific
  runtime?: number;

  // TV-specific
  season?: number;
  episode?: number;
  episodeTitle?: string;
}
```

### 15.2 Component Specifications

**SeasonSelector Component:**

```typescript
// components/features/tv/SeasonSelector.tsx
interface SeasonSelectorProps {
  seasons: TVSeason[];
  activeSeason: number;
  onSeasonChange: (seasonNumber: number) => void;
}

export function SeasonSelector({
  seasons,
  activeSeason,
  onSeasonChange
}: SeasonSelectorProps) {
  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {seasons.map((season) => (
          <Button
            key={season.season_number}
            variant={activeSeason === season.season_number ? 'default' : 'outline'}
            onClick={() => onSeasonChange(season.season_number)}
            className="shrink-0"
          >
            Season {season.season_number}
            <span className="ml-2 text-xs opacity-70">
              ({season.episode_count})
            </span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  );
}
```

**EpisodeGrid Component:**

```typescript
// components/features/tv/EpisodeGrid.tsx
interface EpisodeGridProps {
  episodes: TVEpisode[];
  tvShowId: number;
  seasonNumber: number;
  watchProgress?: Map<string, number>; // key: "S1E1" -> progress %
  onEpisodeClick: (episode: TVEpisode) => void;
}

export function EpisodeGrid({
  episodes,
  tvShowId,
  seasonNumber,
  watchProgress,
  onEpisodeClick
}: EpisodeGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {episodes.map((episode) => {
        const episodeKey = `S${seasonNumber}E${episode.episode_number}`;
        const progress = watchProgress?.get(episodeKey) || 0;

        return (
          <EpisodeCard
            key={episode.id}
            episode={episode}
            progress={progress}
            onClick={() => onEpisodeClick(episode)}
          />
        );
      })}
    </div>
  );
}
```

### 15.3 Routing Structure

**TV Show Routes:**

```
/tv                              # Browse TV shows
/tv/[id]                         # TV show details (overview, seasons)
/tv/[id]/watch/[season]/[episode] # Episode player
```

**Example URLs:**

```
/tv/1399                         # Breaking Bad overview
/tv/1399/watch/1/1              # Breaking Bad S1E1
/tv/1399/watch/5/16             # Breaking Bad S5E16 (finale)
```

### 15.4 State Management Extensions

**Continue Watching for TV Shows:**

```typescript
// stores/userPreferencesStore.ts
interface ContinueWatchingItem {
  id: number;
  type: 'movie' | 'tv';
  progress: number;
  lastWatched: string;

  // TV-specific fields
  season?: number;
  episode?: number;
  episodeTitle?: string;
  nextEpisode?: {
    season: number;
    episode: number;
  };
}

// When user clicks "Continue Watching" on a TV show:
// - If progress < 90%, resume current episode
// - If progress >= 90%, auto-advance to next episode
```

### 15.5 Implementation Phases

**Phase 1: Core TV Support (8-12 hours)**

1. Add TV type definitions
2. Create TV show detail page
3. Implement season/episode navigation
4. Add TV player with episode streaming
5. Update search to include TV shows

**Phase 2: Enhanced Features (6-8 hours)** 6. Episode watch progress tracking 7. Auto-play next episode 8. Continue Watching for TV shows 9. My List support for TV shows 10. Browse TV shows by category

**Phase 3: Polish & Optimization (8-11 hours)** 11. Season/episode metadata caching 12. Prefetch adjacent episodes 13. Episode thumbnail optimization 14. TV show-specific UI polish 15. Mobile responsiveness for episode grids

---

## 16. Future Enhancements (Phase 2+)

1. ~~**TV Shows Support**~~ ✅ **Now in Phase 8**
2. **Advanced Search** - Filters by genre, year, rating, cast
3. **Recommendations Engine** - ML-based personalized suggestions
4. **Multi-language Support** - i18n with next-intl
5. **PWA Features** - Offline support, install prompt
6. **Custom Video Player** - Replace iframe with HLS.js or Video.js
7. **Social Features** - Share favorites, watch parties
8. **Backend API** - Dedicated API with database for user data

---

## 17. Development Standards

### Code Quality Tools

**ESLint Configuration:**

```json
{
  "extends": ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
  "rules": {
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": "error"
  }
}
```

**Prettier Configuration:**

```json
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 100
}
```

### Git Workflow

- Conventional Commits (feat:, fix:, docs:, etc.)
- Feature branches for major additions
- Main branch always deployable

---

## Conclusion

This specification provides a comprehensive blueprint for building Mavida as a unified movie and TV show streaming platform. The architecture prioritizes performance, maintainability, and user experience while remaining pragmatic for a personal project. Each decision balances modern best practices with implementation simplicity.

The addition of TV Shows support (Phase 8) extends the existing architecture with minimal breaking changes, leveraging the same TMDB and VidSrc APIs while introducing season/episode navigation and episode-level watch progress tracking.

**Next Steps:** Proceed to Task Breakdown Document for phased implementation plan including Phase 8 (TV Shows Support).
