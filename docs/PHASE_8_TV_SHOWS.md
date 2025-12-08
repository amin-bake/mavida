# Phase 8: TV Shows Support

**Version:** 1.0  
**Status:** Planning  
**Branch:** `tv-shows`  
**Estimated Time:** 22-31 hours (3-4 days)

---

## Overview

Extend Mavida from a movie-only streaming application to support TV shows with season/episode navigation, episode-level watch progress tracking, and TV show discovery features. This phase leverages existing TMDB and VidSrc APIs while introducing minimal breaking changes to the current architecture.

---

## Prerequisites

- ✅ Phase 1-7 completed
- ✅ Core movie features functional
- ✅ TMDB API integration working
- ✅ VidSrc player implementation stable
- ✅ Feasibility analysis completed

---

## Technical Foundation

### API Support Confirmed

**TMDB API Endpoints:**

- `/trending/tv/{time_window}` - Trending TV shows
- `/tv/popular` - Popular TV shows
- `/tv/top_rated` - Top rated shows
- `/tv/{id}` - TV show details
- `/tv/{id}/season/{season}` - Season details with episodes
- `/tv/{id}/season/{season}/episode/{episode}` - Episode details
- `/search/tv` - Search TV shows
- `/discover/tv` - Advanced filtering

**VidSrc API:**

- Format: `https://vidsrcme.ru/api/tv/{tmdb_id}/{season}/{episode}`
- Example: `https://vidsrcme.ru/api/tv/1399/1/1` (Breaking Bad S1E1)

### Architecture Compatibility

- ✅ Next.js App Router supports nested routes (`/tv/[id]/watch/[season]/[episode]`)
- ✅ TanStack Query handles hierarchical data (show → season → episode)
- ✅ Zustand stores can extend to track season/episode state
- ✅ Component structure reusable (MovieCard → MediaCard with type prop)
- ✅ VidSrc API supports TV show streaming

---

## Phase Breakdown

### **Phase 8.1: Type Definitions & Core Types** (2-3 hours)

**8.1.1** Create TV show type definitions

- [ ] `types/tv.ts` - TVShow, TVSeason, TVEpisode interfaces
- [ ] `types/media.ts` - Unified Media type (Movie | TVShow)
- [ ] Update `types/api.ts` for TV-specific API responses

**8.1.2** Extend existing type definitions

- [ ] Update `FavoriteItem` to include `type: 'movie' | 'tv'`
- [ ] Update `WatchHistoryItem` to include season/episode fields
- [ ] Update `ContinueWatchingItem` for episode-level tracking

**Expected Output:**

```typescript
// types/tv.ts
export interface TVShow {
  id: number;
  name: string;
  number_of_seasons: number;
  number_of_episodes: number;
  seasons: TVSeason[];
  // ... other fields
}

export interface TVSeason {
  id: number;
  season_number: number;
  episode_count: number;
  episodes?: TVEpisode[];
  // ... other fields
}

export interface TVEpisode {
  id: number;
  episode_number: number;
  season_number: number;
  name: string;
  still_path: string;
  runtime: number;
  // ... other fields
}
```

---

### **Phase 8.2: TMDB API Integration for TV** (3-4 hours)

**8.2.1** Extend TMDB client for TV shows

- [ ] Add TV show methods to `services/tmdb/client.ts`
- [ ] `getTVShow(id)` - Fetch TV show details
- [ ] `getTVSeason(tvId, season)` - Fetch season with episodes
- [ ] `getTVEpisode(tvId, season, episode)` - Fetch episode details
- [ ] `getTrendingTV(timeWindow)` - Trending TV shows
- [ ] `searchTVShows(query)` - Search TV shows

**8.2.2** Create TV-specific React Query hooks

- [ ] `services/tmdb/tv.queries.ts` - TV show query hooks
- [ ] `useTVShow(id)` - Fetch TV show details
- [ ] `useTVSeason(tvId, season)` - Fetch season details
- [ ] `useTVEpisode(tvId, season, episode)` - Fetch episode
- [ ] `useTrendingTVShows(timeWindow)` - Trending shows
- [ ] `usePopularTVShows(page)` - Popular shows
- [ ] `useSearchTVShows(query)` - Search shows

**8.2.3** Update query keys structure

- [ ] Add TV show query keys to `lib/queryClient.ts`
- [ ] Define cache strategies (24h for shows, 1h for trending)

**Expected Output:**

```typescript
// services/tmdb/tv.queries.ts
export const useTVShow = (id: number) => {
  return useQuery({
    queryKey: queryKeys.tv.detail(id),
    queryFn: () => tmdbClient.getTVShow(id),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};

export const useTVSeason = (tvId: number, season: number) => {
  return useQuery({
    queryKey: queryKeys.tv.season(tvId, season),
    queryFn: () => tmdbClient.getTVSeason(tvId, season),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
};
```

---

### **Phase 8.3: TV Show Components** (5-7 hours)

**Status:** ✅ COMPLETE

**8.3.1** Rename MovieCard to MediaCard (Breaking Change)

- [x] Rename `components/features/movie/MovieCard.tsx` → `components/features/media/MediaCard.tsx`
- [x] Add `mediaType` prop ('movie' | 'tv')
- [x] Conditional rendering for movies vs TV shows (year vs seasons)
- [x] Update all imports across the codebase
- [x] Create backward-compatible wrapper in MovieCard.tsx

**8.3.2** Create SeasonSelector component

- [x] `components/features/tv/SeasonSelector.tsx`
- [x] Tab-based navigation for seasons
- [x] Episode count indicator
- [x] Active state highlighting
- [x] Responsive design (horizontal scroll on mobile)

**8.3.3** Create EpisodeCard component

- [x] `components/features/tv/EpisodeCard.tsx`
- [x] Landscape aspect ratio (16:9)
- [x] Episode thumbnail from TMDB
- [x] Episode number, title, runtime
- [x] Watch progress bar overlay
- [x] Hover effects

**8.3.4** Create EpisodeGrid component

- [x] `components/features/tv/EpisodeGrid.tsx`
- [x] Responsive grid (1 col mobile, 2 cols desktop)
- [x] Episode cards with click handlers
- [x] Loading states (EpisodeCardSkeleton)
- [x] Empty state (no episodes)

**8.3.5** Create TVPlayer component

- [x] `components/features/tv/TVPlayer.tsx`
- [x] VidSrc iframe with TV show URL format
- [x] Episode navigation controls (Previous/Next)
- [x] Season/Episode display (S1 E1)
- [x] Keyboard navigation (Arrow keys)
- [x] Loading state

**Expected Output:**

```tsx
// components/features/tv/TVPlayer.tsx
interface TVPlayerProps {
  tmdbId: number;
  season: number;
  episode: number;
  onEpisodeChange?: (season: number, episode: number) => void;
}

export function TVPlayer({ tmdbId, season, episode, onEpisodeChange }: TVPlayerProps) {
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

      <div className="flex items-center justify-between">
        <Button onClick={() => onEpisodeChange?.(season, episode - 1)}>← Previous Episode</Button>
        <span>
          S{season} E{episode}
        </span>
        <Button onClick={() => onEpisodeChange?.(season, episode + 1)}>Next Episode →</Button>
      </div>
    </div>
  );
}
```

---

### **Phase 8.4: TV Show Pages & Routes** (4-5 hours)

**8.4.1** Create TV show browse page

- [ ] `app/(main)/tv/page.tsx`
- [ ] Category tabs: Trending, Popular, Top Rated, Airing Today
- [ ] Reuse MediaGrid with `mediaType="tv"`
- [ ] Pagination support
- [ ] Error handling and loading states

**8.4.2** Create TV show detail page

- [ ] `app/(main)/tv/[id]/page.tsx`
- [ ] Fetch TV show details with `useTVShow(id)`
- [ ] Display show overview, poster, backdrop
- [ ] Season selector component
- [ ] Episode grid for selected season
- [ ] Add to My List button
- [ ] Cast and crew section
- [ ] Recommendations section

**8.4.3** Create episode player page

- [ ] `app/(main)/tv/[id]/watch/[season]/[episode]/page.tsx`
- [ ] Extract params: `{ id, season, episode }`
- [ ] Fetch episode details with `useTVEpisode(id, season, episode)`
- [ ] TVPlayer component integration
- [ ] Episode navigation logic (next/previous)
- [ ] Update watch progress in store
- [ ] Back to show button

**Expected Directory Structure:**

```
app/(main)/
├── tv/
│   ├── page.tsx                 # Browse TV shows
│   └── [id]/
│       ├── page.tsx             # TV show details
│       └── watch/
│           └── [season]/
│               └── [episode]/
│                   └── page.tsx # Episode player
```

---

### **Phase 8.5: State Management Updates** (2-3 hours)

**8.5.1** Create mediaStore for unified playback state

- [x] Create `stores/mediaStore.ts` for movie and TV playback
- [x] Add state: `currentMedia`, `mediaType`, `isPlaying`, `currentTime`, `duration`, `volume`, `isMuted`
- [x] Add TV-specific fields: `currentSeason?`, `currentEpisode?`
- [x] Add actions: `setCurrentMedia()`, `setEpisode()`, `setPlaybackState()`, `updatePlaybackTime()`
- [x] Session-only state (no persistence)

**8.5.2** Extend userPreferencesStore

- [x] Update `FavoriteItem` to include media type (completed in Phase 8.1)
- [x] Update `addFavoriteItem()`, `removeFavoriteItem()`, `isFavoriteItem()`, `toggleFavoriteItem()`
- [x] Update `WatchHistoryItem` to include season/episode
- [x] Update `updateWatchHistoryItem()`, `getWatchHistoryItem()`, `removeWatchHistoryItem()`
- [x] Add `ContinueWatchingItem` with TV show support and `nextEpisode` field
- [x] Update `updateContinueWatching()`, `removeFromContinueWatching()`

**8.5.3** Extend searchStore for media type filtering

- [x] Add `mediaType: 'all' | 'movie' | 'tv'` filter (default: 'all')
- [x] Add `setMediaType(type)` action
- [x] Update persist configuration to include mediaType preference
- [x] Import MediaType from types/media.ts

**Expected Output:**

```typescript
// stores/mediaStore.ts
interface MediaState {
  currentMedia: Movie | TVShow | null;
  mediaType: 'movie' | 'tv' | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // TV-specific state
  currentSeason?: number;
  currentEpisode?: number;

  setCurrentMedia: (media: Movie | TVShow, type: 'movie' | 'tv') => void;
  setEpisode: (season: number, episode: number) => void;
  setPlaybackState: (isPlaying: boolean) => void;
  updatePlaybackTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  setMuted: (isMuted: boolean) => void;
  clearMedia: () => void;
}
```

---

### **Phase 8.6: Search & Discovery Updates** (2-3 hours)

**8.6.1** Update search functionality

- [ ] Extend `useSearch` hook to support `mediaType` filter
- [ ] Update SearchBar component with media type toggle
- [ ] Update search results to show both movies and TV shows
- [ ] Add media type badge to search results
- [ ] Update search page to handle TV show results

**8.6.2** Create MediaTypeToggle component

- [ ] `components/features/search/MediaTypeToggle.tsx`
- [ ] Button group: All, Movies, TV Shows
- [ ] Active state styling
- [ ] Integrate with searchStore

**8.6.3** Update homepage for TV shows

- [ ] Add "Trending TV Shows" row to homepage
- [ ] Add "Popular TV Shows" row
- [ ] Reuse MediaRow component with `mediaType="tv"`

**Expected Output:**

```tsx
// components/features/search/MediaTypeToggle.tsx
export function MediaTypeToggle() {
  const { mediaType, setMediaType } = useSearchStore();

  return (
    <div className="flex gap-2">
      <Button
        variant={mediaType === 'all' ? 'default' : 'outline'}
        onClick={() => setMediaType('all')}
      >
        All
      </Button>
      <Button
        variant={mediaType === 'movie' ? 'default' : 'outline'}
        onClick={() => setMediaType('movie')}
      >
        Movies
      </Button>
      <Button
        variant={mediaType === 'tv' ? 'default' : 'outline'}
        onClick={() => setMediaType('tv')}
      >
        TV Shows
      </Button>
    </div>
  );
}
```

---

### **Phase 8.7: Navigation & UI Updates** (2-3 hours)

**8.7.1** Update Navbar component

- [ ] Add "TV Shows" navigation link
- [ ] Active state for `/tv` routes
- [ ] Responsive mobile navigation

**8.7.2** Update My List page

- [ ] Support both movies and TV shows
- [ ] Filter tabs: All, Movies, TV Shows
- [ ] Display appropriate metadata (year vs seasons)
- [ ] Redirect to correct detail page based on media type

**8.7.3** Update Continue Watching section

- [ ] Display TV shows with episode info
- [ ] Show "S1 E1" badge on TV show cards
- [ ] Handle resume logic (current episode vs next episode)
- [ ] Update card click to navigate to episode player

**Expected Output:**

```tsx
// components/layout/Navbar.tsx
const navLinks = [
  { href: '/', label: 'Home' },
  { href: '/movies', label: 'Movies' },
  { href: '/tv', label: 'TV Shows' }, // NEW
  { href: '/my-list', label: 'My List' },
  { href: '/search', label: 'Search' },
];
```

---

### **Phase 8.8: Watch Progress & Analytics** (2-3 hours)

**8.8.1** Extend watch progress tracking

- [ ] Update `useWatchHistory` hook for TV shows
- [ ] Track episode-level progress
- [ ] Store season/episode in watch history
- [ ] Auto-mark episodes as watched (90%+ progress)
- [ ] Calculate total watch time for TV shows

**8.8.2** Implement auto-play next episode

- [ ] Detect when episode ends (90%+ progress)
- [ ] Show "Next Episode" prompt (5-second countdown)
- [ ] Auto-navigate to next episode if not canceled
- [ ] Handle season boundaries (S1E10 → S2E1)
- [ ] Handle series finale (no next episode)

**8.8.3** Continue Watching logic for TV shows

- [ ] Determine resume point: current episode or next episode
- [ ] Display "Continue S1 E3" on TV show cards
- [ ] Update continue watching on episode completion
- [ ] Remove from continue watching when series completed

**Expected Output:**

```typescript
// hooks/useWatchHistory.ts
export const useWatchHistory = () => {
  const updateProgress = (
    id: number,
    type: 'movie' | 'tv',
    progress: number,
    season?: number,
    episode?: number
  ) => {
    const item: WatchHistoryItem = {
      id,
      type,
      progressSeconds: progress,
      lastWatched: new Date().toISOString(),
      ...(type === 'tv' && { season, episode }),
    };
    // Save to localStorage via Zustand store
  };
};
```

---

### **Phase 8.9: Testing & Polish** (3-4 hours)

**8.9.1** TypeScript validation

- [ ] Run `tsc --noEmit` to check for type errors
- [ ] Fix any type mismatches
- [ ] Ensure strict mode compliance
- [ ] Update type exports

**8.9.2** Build verification

- [ ] Run `npm run build` to test production build
- [ ] Verify all routes generate correctly
- [ ] Check for bundle size increase
- [ ] Test dynamic imports

**8.9.3** Manual testing checklist

- [ ] Browse TV shows page works
- [ ] TV show detail page displays correctly
- [ ] Season selector switches episodes
- [ ] Episode player loads and plays
- [ ] Episode navigation (previous/next) works
- [ ] Add to My List works for TV shows
- [ ] Continue Watching tracks TV shows
- [ ] Search includes TV shows
- [ ] Media type filter works in search
- [ ] Watch progress saves correctly
- [ ] Auto-play next episode functions
- [ ] Mobile responsiveness verified

**8.9.4** Error handling verification

- [ ] Test invalid TV show ID (404)
- [ ] Test invalid season/episode (error boundary)
- [ ] Test network errors (retry logic)
- [ ] Test empty states (no episodes, no seasons)
- [ ] Verify error fallback UI displays

**8.9.5** Performance optimization

- [ ] Verify TanStack Query caching works
- [ ] Check for unnecessary re-renders
- [ ] Optimize episode grid rendering
- [ ] Test prefetching logic
- [ ] Measure Lighthouse scores

---

## Acceptance Criteria

### Functional Requirements

- ✅ TV shows can be browsed by category (trending, popular, top rated)
- ✅ TV show detail page displays seasons and episodes
- ✅ Season selector allows switching between seasons
- ✅ Episode player streams episodes correctly
- ✅ Episode navigation (previous/next) works
- ✅ TV shows can be added to My List
- ✅ TV shows appear in Continue Watching with episode info
- ✅ Search includes TV shows with media type filter
- ✅ Watch progress tracks at episode level
- ✅ Auto-play next episode functions correctly

### Technical Requirements

- ✅ TypeScript strict mode passes with no errors
- ✅ Production build succeeds (`npm run build`)
- ✅ All routes generate correctly in build
- ✅ TanStack Query caching works for TV data
- ✅ Zustand persistence works for TV shows
- ✅ No breaking changes to existing movie features
- ✅ ESLint passes with no errors
- ✅ No console errors in browser

### UI/UX Requirements

- ✅ TV show cards display correctly in grids/rows
- ✅ Season selector is responsive and accessible
- ✅ Episode cards show thumbnails and metadata
- ✅ Episode player has intuitive controls
- ✅ Mobile navigation includes TV Shows link
- ✅ Loading states (skeletons) display during fetch
- ✅ Error states show user-friendly messages
- ✅ Responsive design works on mobile/tablet/desktop

---

## Breaking Changes

### Component Renames

- `MovieCard` → `MediaCard` (requires updating all imports)
- `movieStore` → `mediaStore` (requires updating all imports)
- `useMovieDetail` → `useMediaDetail` (optional, for consistency)

### Type Changes

- `FavoriteItem` now includes `type: 'movie' | 'tv'`
- `WatchHistoryItem` now includes optional `season` and `episode` fields
- `ContinueWatchingItem` extended with TV-specific fields

### Migration Strategy

1. **Phase 8.3.1**: Rename MovieCard to MediaCard (update all imports in one commit)
2. **Phase 8.5.1**: Rename movieStore to mediaStore (update all imports in one commit)
3. **Phase 8.5.2**: Migrate localStorage data to new format (add migration utility)

### Backwards Compatibility

- Existing movie features remain fully functional
- localStorage migration maintains existing watch history and favorites
- Movie routes and functionality unchanged
- Search still works for movies (new filter adds TV shows)

---

## Risk Assessment

### Low Risk ✅

- **TMDB API Support**: Fully documented and tested
- **VidSrc API Support**: TV show endpoint confirmed working
- **Architecture Compatibility**: Next.js App Router handles nested routes well
- **Component Reusability**: Existing patterns work for TV shows

### Medium Risk ⚠️

- **State Migration**: localStorage format change requires careful migration
- **Component Renames**: Bulk refactoring may introduce bugs (mitigated by TypeScript)
- **Episode Navigation Logic**: Complex boundary cases (season transitions, finale)

### Mitigation Strategies

1. **Test on separate branch**: `tv-shows` branch isolates changes
2. **Incremental implementation**: Complete one phase at a time
3. **TypeScript strict mode**: Catches errors at compile time
4. **Manual testing checklist**: Comprehensive verification before merge
5. **Rollback plan**: Keep `main` branch stable for quick revert if needed

---

## Development Workflow

1. **Branch Management**

   ```bash
   git checkout -b tv-shows
   git push -u origin tv-shows
   ```

2. **Phase-by-Phase Commits**
   - Complete one phase at a time
   - Commit after each sub-phase
   - Use conventional commit messages
   - Example: `feat(tv): add TV show type definitions (8.1.1)`

3. **Testing Cadence**
   - Run `npm run build` after each major phase
   - Manual testing after UI changes
   - Final comprehensive test in Phase 8.9

4. **Merge Strategy**
   - Create PR from `tv-shows` to `main`
   - Review all changes
   - Run CI/CD checks (if configured)
   - Merge with squash commit

---

## Post-Implementation

### Documentation Updates

- [ ] Update README.md with TV Shows features
- [ ] Update TASK_BREAKDOWN.md to mark Phase 8 complete
- [ ] Update .env.local.example if new vars added
- [ ] Create migration guide for existing users

### Future Enhancements (Phase 9+)

1. TV show recommendations based on watch history
2. Episode download for offline viewing
3. Episode bookmarking (mark episodes to watch)
4. Multi-language subtitle support
5. Season/episode notifications (new episodes)
6. Watchlist for upcoming TV shows
7. Episode ratings and reviews
8. Cast/crew pages for TV shows

---

## Success Metrics

**Phase 8 Complete When:**

- All 9 sub-phases (8.1 - 8.9) are finished
- All acceptance criteria are met
- Production build succeeds with no errors
- Manual testing checklist is 100% passing
- Documentation is updated
- PR is reviewed and merged to `main`

**Estimated Completion:** 3-4 days (22-31 hours)
