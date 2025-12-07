# Mavida - Technical Specification Document

**Personal Movie Streaming Application**  
_Version 1.0 | December 6, 2025_

---

## 1. Executive Summary

Mavida is a Netflix-inspired personal movie streaming application built with Next.js 16, featuring a modern, performant interface for browsing and watching movies. The application integrates TMDB for metadata and VidSrc API for video streaming.

### Key Objectives

- Create an intuitive, responsive movie browsing experience
- Achieve optimal performance metrics (LCP < 2.5s, CLS < 0.1, FID < 100ms)
- Implement seamless video playback with adaptive streaming
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

### 3.1 Movie Metadata - TMDB API

**Selected API:** The Movie Database (TMDB)  
**Rationale:**

- Comprehensive metadata (titles, posters, descriptions, ratings, cast)
- 40+ language support
- Free tier: 10,000 requests/day (sufficient for personal use)
- Excellent documentation and TypeScript support

**Base URL:** `https://api.themoviedb.org/3`

**Key Endpoints:**

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
GET / search / multi; // Search all content
```

**Implementation Pattern:**

```typescript
// services/tmdb/client.ts
export class TMDBClient {
  private readonly baseURL = "https://api.themoviedb.org/3";
  private readonly apiKey = process.env.TMDB_API_KEY;

  async getMovie(id: number): Promise<Movie> {
    /* ... */
  }
  async searchMovies(query: string): Promise<MovieSearchResult> {
    /* ... */
  }
  // ... other methods
}
```

### 3.2 Video Streaming - VidSrc API

**Selected API:** VidSrc.me  
**Base URL:** `https://vidsrc.me/embed/movie/{tmdb_id}`

**Implementation:**

```typescript
// services/video/player.ts
export const getStreamingUrl = (tmdbId: number): string => {
  return `https://vidsrc.me/embed/movie/${tmdbId}`;
};

// Alternative sources (fallback)
const STREAMING_SOURCES = {
  primary: "vidsrc.me",
  fallback: "vidsrc.xyz", // Backup if primary fails
};
```

**Player Component Strategy:**

- Embed VidSrc player via iframe (simplest approach)
- Custom controls overlay (optional Phase 2)
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
│   │   ├── page.tsx             # Homepage (trending movies)
│   │   ├── browse/              # Browse by category
│   │   │   └── page.tsx
│   │   ├── search/              # Search results
│   │   │   └── page.tsx
│   │   ├── movie/               # Movie details
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── watch/       # Video player page
│   │   │           └── page.tsx
│   │   └── my-list/             # User's saved movies
│   │       └── page.tsx
│   ├── api/                     # API routes
│   │   ├── movies/
│   │   │   ├── [id]/route.ts
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
│       ├── movie/
│       │   ├── MovieCard.tsx
│       │   ├── MovieGrid.tsx
│       │   ├── MovieRow.tsx
│       │   ├── MovieHero.tsx
│       │   └── MoviePlayer.tsx
│       └── search/
│           ├── SearchBar.tsx
│           └── SearchFilters.tsx
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
│   │   └── types.ts             # TMDB-specific types
│   └── video/
│       ├── player.ts            # Video player logic
│       └── types.ts
│
├── stores/                      # Zustand stores
│   ├── movieStore.ts
│   ├── userPreferencesStore.ts
│   └── searchStore.ts
│
├── types/                       # TypeScript definitions
│   ├── movie.ts                 # Movie interfaces
│   ├── user.ts                  # User preferences
│   └── api.ts                   # API response types
│
├── hooks/                       # Custom React hooks
│   ├── useMovies.ts
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

1. **Movie Store** - Current playback state

   ```typescript
   interface MovieState {
     currentMovie: Movie | null;
     isPlaying: boolean;
     currentTime: number;
     setCurrentMovie: (movie: Movie) => void;
     updatePlaybackTime: (time: number) => void;
   }
   ```

2. **User Preferences Store** - Personal data

   ```typescript
   interface UserPreferencesState {
     favorites: number[]; // Movie IDs
     watchHistory: WatchHistoryItem[];
     continueWatching: ContinueWatchingItem[];
     addFavorite: (movieId: number) => void;
     removeFavorite: (movieId: number) => void;
     updateWatchProgress: (movieId: number, progress: number) => void;
   }
   ```

3. **Search Store** - Search state
   ```typescript
   interface SearchState {
     query: string;
     filters: SearchFilters;
     recentSearches: string[];
     setQuery: (query: string) => void;
     addRecentSearch: (query: string) => void;
   }
   ```

**Persistence Strategy:**

- Use `zustand/middleware/persist` with localStorage
- Sync watch history and favorites across sessions
- Clear sensitive data on logout (if auth added)

---

## 5. Data Flow & Caching

### 5.1 TanStack Query Configuration

```typescript
// lib/queryClient.ts
import { QueryClient } from "@tanstack/react-query";

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
    all: ["movies"] as const,
    trending: (timeWindow: string) =>
      ["movies", "trending", timeWindow] as const,
    popular: (page: number) => ["movies", "popular", page] as const,
    detail: (id: number) => ["movies", "detail", id] as const,
    search: (query: string) => ["movies", "search", query] as const,
  },
};
```

### 5.2 Custom Hooks Pattern

```typescript
// hooks/useMovies.ts
export const useTrendingMovies = (timeWindow: "day" | "week" = "day") => {
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
```

---

## 6. Video Player Implementation

### Strategy: Embedded Player (Phase 1)

**Approach:** Use VidSrc embed URLs in an iframe

- **Pros:** No complex video logic needed, adaptive streaming handled by VidSrc
- **Cons:** Limited customization of player controls

**Implementation:**

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

### Watch Progress Tracking

```typescript
// hooks/useWatchHistory.ts
export const useWatchHistory = () => {
  const updateProgress = (movieId: number, progressSeconds: number) => {
    const item: WatchHistoryItem = {
      movieId,
      progressSeconds,
      totalSeconds: 0, // Get from player if available
      lastWatched: new Date().toISOString(),
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
@import "tailwindcss";

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
  --font-display: "Inter", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;

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

**Movie Card:**

- Aspect ratio: 2:3 (poster)
- Hover effect: Scale 1.05, show title overlay
- Transition: 200ms ease-in-out

```tsx
<div className="group relative aspect-2/3 overflow-hidden rounded-md transition-transform duration-200 hover:scale-105">
  <Image src={posterUrl} alt={title} fill className="object-cover" />
  <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100">
    <div className="absolute bottom-0 p-4">
      <h3 className="text-text-primary font-semibold">{title}</h3>
      <p className="text-text-secondary text-sm">{year}</p>
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

```tsx
<section className="relative h-screen">
  <Image src={backdropUrl} alt={title} fill className="object-cover" priority />
  <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/50 to-transparent" />
  <div className="relative z-10 flex h-full flex-col justify-center px-12 max-w-2xl">
    <h1 className="text-6xl font-bold text-text-primary mb-4">{title}</h1>
    <p className="text-lg text-text-secondary mb-8">{overview}</p>
    <div className="flex gap-4">
      <button className="bg-netflix-red hover:bg-netflix-red-hover px-8 py-3 rounded-md font-semibold transition-colors">
        Play
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
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;
```

**Note:** Next.js 15+ uses `remotePatterns` instead of `domains` for better security.

**Usage Pattern:**

```tsx
import Image from "next/image";

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
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: "frame-src 'self' https://vidsrc.me https://vidsrc.xyz;",
          },
        ],
      },
    ];
  },
};
```

---

## 15. Future Enhancements (Phase 2+)

1. **TV Shows Support** - Extend to TV series with season/episode tracking
2. **Advanced Search** - Filters by genre, year, rating, cast
3. **Recommendations Engine** - ML-based personalized suggestions
4. **Multi-language Support** - i18n with next-intl
5. **PWA Features** - Offline support, install prompt
6. **Custom Video Player** - Replace iframe with HLS.js or Video.js
7. **Social Features** - Share favorites, watch parties
8. **Backend API** - Dedicated API with database for user data

---

## 16. Development Standards

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

This specification provides a comprehensive blueprint for building Mavida. The architecture prioritizes performance, maintainability, and user experience while remaining pragmatic for a personal project. Each decision balances modern best practices with implementation simplicity.

**Next Steps:** Proceed to Task Breakdown Document for phased implementation plan.
