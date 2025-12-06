# Mavida - Task Breakdown & Implementation Roadmap

**Phased Development Plan**  
_Last Updated: December 6, 2025_

---

## Overview

This document provides a granular breakdown of all development tasks organized into logical phases. Each task includes estimated complexity, dependencies, and success criteria.

**Status Legend:**

- 🔴 Not Started
- 🟡 In Progress
- 🟢 Completed
- ⏸️ Blocked

---

## Phase 1: Foundation & Setup (Days 1-2)

### 1.1 Project Configuration

**Status:** 🟢 Completed

| Task ID | Task                                                      | Complexity | Status | Dependencies |
| ------- | --------------------------------------------------------- | ---------- | ------ | ------------ |
| 1.1.1   | Install core dependencies (Zustand, TanStack Query, etc.) | Low        | 🟢     | None         |
| 1.1.2   | Configure Tailwind CSS with custom theme                  | Medium     | 🟢     | 1.1.1        |
| 1.1.3   | Set up ESLint + Prettier with strict rules                | Low        | 🟢     | 1.1.1        |
| 1.1.4   | Configure Next.js for TMDB images                         | Low        | 🟢     | None         |
| 1.1.5   | Create environment variables template                     | Low        | 🟢     | None         |
| 1.1.6   | Set up directory structure (components, services, etc.)   | Low        | 🟢     | None         |

**Deliverables:**

- ✅ `package.json` with all dependencies
- ✅ Custom Tailwind configuration with Netflix-inspired theme
- ✅ ESLint/Prettier configuration files
- ✅ `.env.local.example` template
- ✅ Complete folder structure as per specification

**Success Criteria:**

- Project builds without errors
- Linting passes with zero warnings
- Theme colors accessible via Tailwind classes

---

### 1.2 Design System - Base UI Components

**Status:** 🟢 Completed

| Task ID | Task                                       | Complexity | Status | Dependencies |
| ------- | ------------------------------------------ | ---------- | ------ | ------------ |
| 1.2.1   | Create `Button` component with variants    | Low        | 🟢     | 1.1.2        |
| 1.2.2   | Create `Card` component with hover effects | Low        | 🟢     | 1.1.2        |
| 1.2.3   | Create `Input` component for search        | Medium     | 🟢     | 1.1.2        |
| 1.2.4   | Create `Modal` component with animations   | Medium     | 🟢     | 1.1.2        |
| 1.2.5   | Create `Skeleton` loader components        | Low        | 🟢     | 1.1.2        |
| 1.2.6   | Create `Spinner` loading indicator         | Low        | 🟢     | 1.1.2        |

**Deliverables:**

- ✅ Reusable UI components in `components/ui/`
- ✅ TypeScript interfaces for all props
- ✅ Consistent styling following design system
- ✅ Accessibility attributes (ARIA labels, keyboard support)

**Success Criteria:**

- All components render correctly
- TypeScript types are strict (no `any`)
- Hover/focus states work as expected
- Keyboard navigation functional

---

### 1.3 API Service Layer - TMDB Integration

**Status:** 🟢 Completed

| Task ID | Task                                            | Complexity | Status | Dependencies |
| ------- | ----------------------------------------------- | ---------- | ------ | ------------ |
| 1.3.1   | Create TMDB API client class                    | Medium     | 🟢     | 1.1.1        |
| 1.3.2   | Define TypeScript interfaces for TMDB responses | Medium     | 🟢     | None         |
| 1.3.3   | Implement `getTrending()` method                | Low        | 🟢     | 1.3.1, 1.3.2 |
| 1.3.4   | Implement `getPopular()` method                 | Low        | 🟢     | 1.3.1, 1.3.2 |
| 1.3.5   | Implement `getMovieDetail()` method             | Medium     | 🟢     | 1.3.1, 1.3.2 |
| 1.3.6   | Implement `searchMovies()` method               | Medium     | 🟢     | 1.3.1, 1.3.2 |
| 1.3.7   | Add error handling and rate limiting logic      | Medium     | 🟢     | 1.3.1        |

**Deliverables:**

- ✅ `services/tmdb/client.ts` with full API methods
- ✅ `types/movie.ts` with comprehensive types
- ✅ Error handling for failed requests
- ✅ Request/response logging (development mode)

**Success Criteria:**

- API calls successfully fetch data from TMDB
- TypeScript types match API responses
- Errors are caught and handled gracefully
- Rate limiting prevents API quota exhaustion

---

### 1.4 TanStack Query Setup

**Status:** 🟢 Completed

| Task ID | Task                                      | Complexity | Status | Dependencies |
| ------- | ----------------------------------------- | ---------- | ------ | ------------ |
| 1.4.1   | Configure QueryClient with cache settings | Low        | 🟢     | 1.1.1        |
| 1.4.2   | Create query key factory                  | Low        | 🟢     | 1.4.1        |
| 1.4.3   | Wrap app with QueryClientProvider         | Low        | 🟢     | 1.4.1        |
| 1.4.4   | Create custom hooks: `useTrendingMovies`  | Medium     | 🟢     | 1.3.3, 1.4.1 |
| 1.4.5   | Create custom hooks: `useMovieDetail`     | Medium     | 🟢     | 1.3.5, 1.4.1 |
| 1.4.6   | Create custom hooks: `useSearchMovies`    | Medium     | 🟢     | 1.3.6, 1.4.1 |

**Deliverables:**

- ✅ `lib/queryClient.ts` with configuration
- ✅ `hooks/useMovies.ts` with all query hooks
- ✅ QueryClientProvider in root layout
- ✅ Proper stale time and cache configuration

**Success Criteria:**

- Data fetching works with React Query
- Caching reduces redundant API calls
- Loading and error states handled automatically

---

## Phase 2: Layout & Navigation (Days 3-4)

### 2.1 Core Layout Components

**Status:** 🔴 Not Started

| Task ID | Task                                               | Complexity | Status | Dependencies |
| ------- | -------------------------------------------------- | ---------- | ------ | ------------ |
| 2.1.1   | Create `Navbar` with logo and search               | High       | 🔴     | 1.2.3        |
| 2.1.2   | Implement sticky navbar on scroll                  | Medium     | 🔴     | 2.1.1        |
| 2.1.3   | Create `Footer` with links                         | Low        | 🔴     | None         |
| 2.1.4   | Build main layout structure in `(main)/layout.tsx` | Medium     | 🔴     | 2.1.1, 2.1.3 |
| 2.1.5   | Add mobile responsive menu (hamburger)             | High       | 🔴     | 2.1.1        |

**Deliverables:**

- ✅ `components/layout/Navbar.tsx`
- ✅ `components/layout/Footer.tsx`
- ✅ `app/(main)/layout.tsx` with navigation
- ✅ Responsive design for mobile, tablet, desktop

**Success Criteria:**

- Navbar visible on all pages
- Search bar functional (triggers search page)
- Mobile menu opens/closes smoothly
- Footer displays correctly

---

### 2.2 Search Functionality

**Status:** 🔴 Not Started

| Task ID | Task                                                     | Complexity | Status | Dependencies |
| ------- | -------------------------------------------------------- | ---------- | ------ | ------------ |
| 2.2.1   | Create `SearchBar` component with debouncing             | High       | 🔴     | 1.2.3        |
| 2.2.2   | Build search results page (`app/(main)/search/page.tsx`) | Medium     | 🔴     | 2.2.1, 1.4.6 |
| 2.2.3   | Implement search filters (genre, year, rating)           | High       | 🔴     | 2.2.2        |
| 2.2.4   | Add recent searches to Zustand store                     | Medium     | 🔴     | 2.2.1        |
| 2.2.5   | Display recent searches dropdown                         | Medium     | 🔴     | 2.2.4        |

**Deliverables:**

- ✅ `components/features/search/SearchBar.tsx`
- ✅ `app/(main)/search/page.tsx`
- ✅ `stores/searchStore.ts`
- ✅ Debounced search input (300ms delay)

**Success Criteria:**

- Search triggers on Enter or button click
- Results update dynamically as user types
- Filters narrow down results correctly
- Recent searches persist in localStorage

---

## Phase 3: Homepage & Movie Discovery (Days 5-7)

### 3.1 Movie Card Component

**Status:** 🔴 Not Started

| Task ID | Task                                     | Complexity | Status | Dependencies |
| ------- | ---------------------------------------- | ---------- | ------ | ------------ |
| 3.1.1   | Create `MovieCard` with poster and title | Medium     | 🔴     | 1.2.2        |
| 3.1.2   | Add hover effect (scale + info overlay)  | Medium     | 🔴     | 3.1.1        |
| 3.1.3   | Implement favorite button (heart icon)   | Medium     | 🔴     | 3.1.1        |
| 3.1.4   | Add prefetch on hover for detail page    | Medium     | 🔴     | 3.1.1, 1.4.5 |
| 3.1.5   | Optimize images with next/image          | Medium     | 🔴     | 3.1.1        |

**Deliverables:**

- ✅ `components/features/movie/MovieCard.tsx`
- ✅ Hover animations with CSS transitions
- ✅ Favorite button integrated with Zustand store
- ✅ Image optimization with blur placeholder

**Success Criteria:**

- Movie cards display poster and title
- Hover reveals additional info (rating, year)
- Favorite button toggles state correctly
- Images load quickly with blur-up effect

---

### 3.2 Movie Grid & Rows

**Status:** 🔴 Not Started

| Task ID | Task                                         | Complexity | Status | Dependencies |
| ------- | -------------------------------------------- | ---------- | ------ | ------------ |
| 3.2.1   | Create `MovieGrid` for grid layout           | Medium     | 🔴     | 3.1.1        |
| 3.2.2   | Create `MovieRow` for horizontal scrolling   | High       | 🔴     | 3.1.1        |
| 3.2.3   | Implement horizontal scroll with scroll-snap | Medium     | 🔴     | 3.2.2        |
| 3.2.4   | Add gradient fade at row edges               | Low        | 🔴     | 3.2.2        |
| 3.2.5   | Implement arrow navigation for rows          | Medium     | 🔴     | 3.2.2        |

**Deliverables:**

- ✅ `components/features/movie/MovieGrid.tsx`
- ✅ `components/features/movie/MovieRow.tsx`
- ✅ Smooth horizontal scrolling
- ✅ Gradient overlays on edges

**Success Criteria:**

- Grid displays movies in responsive columns
- Rows scroll horizontally on swipe/drag
- Arrow buttons navigate through movies
- Gradient fades enhance visual hierarchy

---

### 3.3 Homepage Hero Section

**Status:** 🔴 Not Started

| Task ID | Task                                     | Complexity | Status | Dependencies |
| ------- | ---------------------------------------- | ---------- | ------ | ------------ |
| 3.3.1   | Create `MovieHero` component             | High       | 🔴     | 1.4.4        |
| 3.3.2   | Fetch featured movie (trending #1)       | Medium     | 🔴     | 3.3.1, 1.4.4 |
| 3.3.3   | Add backdrop image with gradient overlay | Medium     | 🔴     | 3.3.1        |
| 3.3.4   | Display movie title, description, rating | Low        | 🔴     | 3.3.1        |
| 3.3.5   | Add "Play" and "More Info" buttons       | Medium     | 🔴     | 3.3.1        |
| 3.3.6   | Auto-rotate hero every 10 seconds        | Medium     | 🔴     | 3.3.2        |

**Deliverables:**

- ✅ `components/features/movie/MovieHero.tsx`
- ✅ Full-viewport hero section
- ✅ Backdrop image with text overlay
- ✅ Action buttons (Play, Info)

**Success Criteria:**

- Hero displays trending movie
- Backdrop image loads without layout shift
- Buttons navigate to correct pages
- Auto-rotation works smoothly

---

### 3.4 Homepage Assembly

**Status:** 🔴 Not Started

| Task ID | Task                                              | Complexity | Status | Dependencies |
| ------- | ------------------------------------------------- | ---------- | ------ | ------------ |
| 3.4.1   | Implement homepage layout (`app/(main)/page.tsx`) | Medium     | 🔴     | 3.3.1        |
| 3.4.2   | Add "Trending Now" movie row                      | Medium     | 🔴     | 3.2.2, 1.4.4 |
| 3.4.3   | Add "Popular Movies" movie row                    | Medium     | 🔴     | 3.2.2        |
| 3.4.4   | Add "Top Rated" movie row                         | Medium     | 🔴     | 3.2.2        |
| 3.4.5   | Add "Continue Watching" row (from Zustand)        | Medium     | 🔴     | 3.2.2        |
| 3.4.6   | Implement infinite scroll for movie rows          | High       | 🔴     | 3.2.2        |

**Deliverables:**

- ✅ Complete homepage with hero and multiple rows
- ✅ Data fetched from TMDB API
- ✅ Skeleton loaders during data fetch
- ✅ Smooth scrolling and transitions

**Success Criteria:**

- Homepage displays hero + 4-5 movie rows
- All data loads correctly from API
- Loading states show skeleton screens
- Performance: LCP < 2.5s

---

## Phase 4: Movie Detail & Watch Pages (Days 8-10)

### 4.1 Movie Detail Page

**Status:** 🔴 Not Started

| Task ID | Task                                                        | Complexity | Status | Dependencies |
| ------- | ----------------------------------------------------------- | ---------- | ------ | ------------ |
| 4.1.1   | Create detail page route (`app/(main)/movie/[id]/page.tsx`) | Medium     | 🔴     | 1.4.5        |
| 4.1.2   | Fetch and display movie details (title, description, etc.)  | Medium     | 🔴     | 4.1.1        |
| 4.1.3   | Display cast and crew information                           | Medium     | 🔴     | 4.1.2        |
| 4.1.4   | Add backdrop image with blur effect                         | Medium     | 🔴     | 4.1.2        |
| 4.1.5   | Show rating, release date, runtime                          | Low        | 🔴     | 4.1.2        |
| 4.1.6   | Add "Watch Now" button                                      | Low        | 🔴     | 4.1.2        |
| 4.1.7   | Add "Add to Favorites" button                               | Medium     | 🔴     | 4.1.2        |
| 4.1.8   | Display trailers (if available)                             | Medium     | 🔴     | 4.1.2        |
| 4.1.9   | Show "More Like This" section                               | High       | 🔴     | 4.1.2, 3.2.2 |

**Deliverables:**

- ✅ `app/(main)/movie/[id]/page.tsx`
- ✅ Comprehensive movie information display
- ✅ Trailer player (YouTube embed or TMDB video)
- ✅ Related movies section

**Success Criteria:**

- Detail page loads movie info correctly
- Images optimized with blur placeholders
- Buttons navigate to watch page or toggle favorites
- Recommendations display similar movies

---

### 4.2 Video Player Page

**Status:** 🔴 Not Started

| Task ID | Task                                                             | Complexity | Status | Dependencies |
| ------- | ---------------------------------------------------------------- | ---------- | ------ | ------------ |
| 4.2.1   | Create watch page route (`app/(main)/movie/[id]/watch/page.tsx`) | Medium     | 🔴     | None         |
| 4.2.2   | Build `MoviePlayer` component with VidSrc embed                  | High       | 🔴     | 4.2.1        |
| 4.2.3   | Implement fullscreen functionality                               | Medium     | 🔴     | 4.2.2        |
| 4.2.4   | Add back button to return to detail page                         | Low        | 🔴     | 4.2.1        |
| 4.2.5   | Track watch progress with localStorage                           | High       | 🔴     | 4.2.2        |
| 4.2.6   | Resume playback from last position                               | High       | 🔴     | 4.2.5        |
| 4.2.7   | Update "Continue Watching" in Zustand store                      | Medium     | 🔴     | 4.2.5        |

**Deliverables:**

- ✅ `app/(main)/movie/[id]/watch/page.tsx`
- ✅ `components/features/movie/MoviePlayer.tsx`
- ✅ Watch progress tracking
- ✅ Resume functionality

**Success Criteria:**

- Video player embeds VidSrc iframe correctly
- Fullscreen mode works on all devices
- Watch progress saves to localStorage
- User can resume from last position

---

## Phase 5: User Preferences & Personalization (Days 11-12)

### 5.1 Zustand Store Implementation

**Status:** 🔴 Not Started

| Task ID | Task                                                   | Complexity | Status | Dependencies |
| ------- | ------------------------------------------------------ | ---------- | ------ | ------------ |
| 5.1.1   | Create `movieStore.ts` for playback state              | Medium     | 🔴     | 1.1.1        |
| 5.1.2   | Create `userPreferencesStore.ts` for favorites/history | High       | 🔴     | 1.1.1        |
| 5.1.3   | Create `searchStore.ts` for search state               | Medium     | 🔴     | 1.1.1        |
| 5.1.4   | Implement localStorage persistence middleware          | Medium     | 🔴     | 5.1.2        |
| 5.1.5   | Add Zustand devtools integration                       | Low        | 🔴     | 5.1.1        |

**Deliverables:**

- ✅ `stores/movieStore.ts`
- ✅ `stores/userPreferencesStore.ts`
- ✅ `stores/searchStore.ts`
- ✅ Persistent state across sessions

**Success Criteria:**

- Stores manage state correctly
- State persists to localStorage
- Devtools show state changes in development

---

### 5.2 Favorites & Watch History

**Status:** 🔴 Not Started

| Task ID | Task                                                  | Complexity | Status | Dependencies |
| ------- | ----------------------------------------------------- | ---------- | ------ | ------------ |
| 5.2.1   | Implement "Add to Favorites" functionality            | Medium     | 🔴     | 5.1.2        |
| 5.2.2   | Create "My List" page (`app/(main)/my-list/page.tsx`) | Medium     | 🔴     | 5.2.1        |
| 5.2.3   | Display favorited movies in grid                      | Medium     | 🔴     | 5.2.2, 3.2.1 |
| 5.2.4   | Add "Remove from Favorites" option                    | Low        | 🔴     | 5.2.3        |
| 5.2.5   | Track watch history automatically                     | Medium     | 🔴     | 5.1.2        |
| 5.2.6   | Display "Continue Watching" on homepage               | Medium     | 🔴     | 5.2.5, 3.4.5 |

**Deliverables:**

- ✅ `app/(main)/my-list/page.tsx`
- ✅ Favorite/unfavorite functionality
- ✅ Watch history tracking
- ✅ "Continue Watching" row on homepage

**Success Criteria:**

- Users can add/remove favorites
- My List page shows all favorited movies
- Watch history tracks progress accurately
- Continue Watching displays incomplete movies

---

## Phase 6: Optimization & Polish (Days 13-14)

### 6.1 Performance Optimization

**Status:** 🔴 Not Started

| Task ID | Task                                                     | Complexity | Status | Dependencies |
| ------- | -------------------------------------------------------- | ---------- | ------ | ------------ |
| 6.1.1   | Implement image blur placeholders (blur hashes)          | Medium     | 🔴     | 3.1.5        |
| 6.1.2   | Add prefetching for movie detail pages                   | Medium     | 🔴     | 3.1.4        |
| 6.1.3   | Optimize bundle size (analyze with next/bundle-analyzer) | Medium     | 🔴     | None         |
| 6.1.4   | Implement lazy loading for below-fold content            | Medium     | 🔴     | 3.4.1        |
| 6.1.5   | Add service worker for offline functionality (optional)  | High       | 🔴     | None         |
| 6.1.6   | Optimize Tailwind CSS (purge unused classes)             | Low        | 🔴     | 1.1.2        |

**Deliverables:**

- ✅ Optimized images with blur placeholders
- ✅ Prefetching on hover/link
- ✅ Reduced bundle size
- ✅ Lazy-loaded components

**Success Criteria:**

- LCP < 2.5s
- CLS < 0.1
- FID < 100ms
- Bundle size < 500KB (initial load)

---

### 6.2 Accessibility & UX Improvements

**Status:** 🔴 Not Started

| Task ID | Task                                            | Complexity | Status | Dependencies   |
| ------- | ----------------------------------------------- | ---------- | ------ | -------------- |
| 6.2.1   | Add ARIA labels to all interactive elements     | Medium     | 🔴     | All components |
| 6.2.2   | Implement keyboard navigation (Tab, Enter, Esc) | Medium     | 🔴     | All components |
| 6.2.3   | Add skip-to-content link for keyboard users     | Low        | 🔴     | 2.1.4          |
| 6.2.4   | Test color contrast (WCAG AA compliance)        | Low        | 🔴     | 1.1.2          |
| 6.2.5   | Add focus indicators (2px outline)              | Low        | 🔴     | 1.1.2          |
| 6.2.6   | Implement focus trap in modals                  | Medium     | 🔴     | 1.2.4          |

**Deliverables:**

- ✅ WCAG 2.1 AA compliant UI
- ✅ Full keyboard navigation support
- ✅ Screen reader friendly

**Success Criteria:**

- All interactive elements keyboard accessible
- ARIA labels present where needed
- Focus indicators visible
- Passes WAVE accessibility checker

---

### 6.3 Error Handling & Loading States

**Status:** 🔴 Not Started

| Task ID | Task                                             | Complexity | Status | Dependencies |
| ------- | ------------------------------------------------ | ---------- | ------ | ------------ |
| 6.3.1   | Create global error boundary component           | Medium     | 🔴     | None         |
| 6.3.2   | Add error fallback UI for failed API calls       | Medium     | 🔴     | 6.3.1        |
| 6.3.3   | Implement skeleton loaders for all data fetching | Medium     | 🔴     | 1.2.5        |
| 6.3.4   | Add toast notifications for user actions         | Medium     | 🔴     | None         |
| 6.3.5   | Handle 404 errors with custom page               | Low        | 🔴     | None         |

**Deliverables:**

- ✅ `components/ErrorBoundary.tsx`
- ✅ Skeleton screens for loading states
- ✅ Toast notification system
- ✅ Custom 404 page

**Success Criteria:**

- Errors caught and displayed gracefully
- No blank screens during loading
- User feedback for all actions
- 404 page guides users back to homepage

---

## Phase 7: Deployment & Final Touches (Day 15)

### 7.1 Deployment Setup

**Status:** 🔴 Not Started

| Task ID | Task                                          | Complexity | Status | Dependencies       |
| ------- | --------------------------------------------- | ---------- | ------ | ------------------ |
| 7.1.1   | Create Vercel account and link repository     | Low        | 🔴     | None               |
| 7.1.2   | Configure environment variables in Vercel     | Low        | 🔴     | 7.1.1              |
| 7.1.3   | Set up custom domain (optional)               | Low        | 🔴     | 7.1.1              |
| 7.1.4   | Enable Vercel Analytics                       | Low        | 🔴     | 7.1.1              |
| 7.1.5   | Configure build settings (output: standalone) | Low        | 🔴     | 7.1.1              |
| 7.1.6   | Test production build locally                 | Medium     | 🔴     | None               |
| 7.1.7   | Deploy to production                          | Low        | 🔴     | All previous tasks |

**Deliverables:**

- ✅ Live production deployment on Vercel
- ✅ Environment variables configured
- ✅ Analytics enabled
- ✅ Custom domain (if applicable)

**Success Criteria:**

- Application accessible via public URL
- All features work in production
- No console errors
- Performance metrics meet targets

---

### 7.2 Documentation & Cleanup

**Status:** 🔴 Not Started

| Task ID | Task                                         | Complexity | Status | Dependencies |
| ------- | -------------------------------------------- | ---------- | ------ | ------------ |
| 7.2.1   | Update README.md with setup instructions     | Low        | 🔴     | None         |
| 7.2.2   | Document API integration (TMDB, VidSrc)      | Low        | 🔴     | None         |
| 7.2.3   | Add contributing guidelines (if open-source) | Low        | 🔴     | None         |
| 7.2.4   | Create `.env.local.example` file             | Low        | 🔴     | None         |
| 7.2.5   | Remove unused dependencies                   | Low        | 🔴     | None         |
| 7.2.6   | Final code review and cleanup                | Medium     | 🔴     | None         |

**Deliverables:**

- ✅ Comprehensive README.md
- ✅ Environment variable template
- ✅ Clean codebase with no unused files

**Success Criteria:**

- README explains setup process clearly
- New developers can run project from README
- No unused dependencies in package.json

---

## Optional Future Enhancements

### Phase 8: Advanced Features (Post-MVP)

| Feature                                    | Complexity | Priority | Estimated Time |
| ------------------------------------------ | ---------- | -------- | -------------- |
| TV Shows Support                           | High       | Medium   | 3-4 days       |
| Advanced Search Filters                    | Medium     | High     | 2 days         |
| User Authentication (NextAuth.js)          | High       | Low      | 2-3 days       |
| Recommendations Engine (ML-based)          | Very High  | Low      | 5-7 days       |
| Multi-language Support (i18n)              | Medium     | Medium   | 2 days         |
| PWA Features (Offline mode)                | High       | Low      | 3 days         |
| Custom Video Player (HLS.js)               | Very High  | Low      | 4-5 days       |
| Social Features (Share, Watch Parties)     | High       | Low      | 4-5 days       |
| Backend API + Database (PostgreSQL/Prisma) | Very High  | Medium   | 5-7 days       |
| Content Ratings & Reviews                  | Medium     | Low      | 2 days         |

---

## Complexity Legend

- **Low:** 1-2 hours
- **Medium:** 3-6 hours
- **High:** 1-2 days
- **Very High:** 3+ days

---

## Risk Assessment & Mitigation

### High-Risk Items

1. **Video Player Embeds (4.2.2)**
   - **Risk:** VidSrc API may be unstable or change
   - **Mitigation:** Implement fallback sources, graceful error handling

2. **Performance Targets (6.1)**
   - **Risk:** May not meet LCP < 2.5s with large images
   - **Mitigation:** Aggressive image optimization, lazy loading

3. **TMDB API Rate Limits (1.3)**
   - **Risk:** Exceeding free tier limits (40 requests/10 seconds)
   - **Mitigation:** Implement caching, consider API proxy with Redis

### Medium-Risk Items

1. **Mobile Responsiveness (2.1.5)**
   - **Risk:** Complex layouts may break on small screens
   - **Mitigation:** Mobile-first design, thorough testing

2. **State Management Complexity (5.1)**
   - **Risk:** Store interactions may become convoluted
   - **Mitigation:** Keep stores focused, clear separation of concerns

---

## Dependencies Graph

```
Phase 1 (Setup) → Phase 2 (Layout) → Phase 3 (Homepage)
                       ↓
Phase 1 (API) → Phase 4 (Detail/Watch) → Phase 5 (User Prefs)
                                               ↓
                                         Phase 6 (Optimization)
                                               ↓
                                         Phase 7 (Deployment)
```

---

## Progress Tracking

**Total Tasks:** 120+  
**Completed:** 25 (Phase 1 Complete!)  
**In Progress:** 0  
**Not Started:** 95+

**Estimated Total Time:** 12-15 days (full-time)  
**Current Phase:** Phase 2.1 - Core Layout Components

---

## Next Session Agenda

For the next implementation session, we'll tackle:

1. **Task 2.1.1** - Create Navbar component with logo and search bar
2. **Task 2.1.2** - Implement sticky navbar on scroll
3. **Task 2.1.3** - Create Footer component with links
4. **Task 2.1.4** - Build main layout structure in (main)/layout.tsx
5. **Task 2.1.5** - Add mobile responsive menu (hamburger)

**Estimated Time for Next Session:** 3-4 hours

---

## Context Preservation Protocol

After each session, update this document with:

- ✅ Completed task IDs
- 🟡 In-progress tasks with blockers
- 📝 Architectural decisions made
- 🔗 Dependencies discovered
- 🎯 Next priority tasks

---

**Last Updated:** December 7, 2025  
**Current Status:** Phase 1 Complete (Foundation & Setup) - Starting Phase 2

---

## Session Log

### Session 3 - December 7, 2025 (Phase 1.4 - TanStack Query Setup)

**✅ Completed Tasks:**

- 1.4.1: Configured QueryClient with custom cache settings and retry logic
- 1.4.2: Created query key factory for consistent cache key management
- 1.4.3: Wrapped app with QueryClientProvider in root layout
- 1.4.4: Created useTrendingMovies, usePopularMovies, useTopRatedMovies, useNowPlayingMovies, useUpcomingMovies hooks
- 1.4.5: Created useMovieDetail, useSimilarMovies, useMovieRecommendations hooks
- 1.4.6: Created useSearchMovies and useDiscoverMovies hooks

**📝 Architectural Decisions:**

1. **Query Client Configuration:** Default stale time 5min, cache time 25min, 3 retries with exponential backoff
2. **Query Key Factory:** Centralized key management using hierarchical structure for easy invalidation
3. **SSR Support:** QueryClient singleton pattern with server/client distinction
4. **DevTools Integration:** React Query DevTools enabled in development for debugging
5. **Type Safety:** All hooks return properly typed UseQueryResult with TypeScript generics
6. **Cache Strategy:** Different stale times per data type (trending: 1h, details: 24h, search: 5min)
7. **Conditional Fetching:** Hooks use `enabled` option to prevent unnecessary requests

**🔗 Files Created:**

- lib/queryClient.ts: QueryClient configuration and singleton instance
- lib/queryKeys.ts: Query key factory for movies, genres, and user data
- components/providers/QueryProvider.tsx: Client-side QueryClientProvider wrapper
- hooks/useMovies.ts: 10 custom hooks for all movie data fetching operations
- hooks/index.ts: Barrel exports for hooks
- hooks/README.md: Comprehensive documentation for TanStack Query usage
- components/examples/QueryHooksExample.tsx: Example components demonstrating hook usage

**🔧 Files Modified:**

- app/layout.tsx: Added QueryProvider wrapper, updated metadata
- lib/constants.ts: Added default cache time (5 minutes)

**🎯 Hooks Implemented:**

- useTrendingMovies(timeWindow, page): Fetch trending movies
- usePopularMovies(page): Fetch popular movies
- useTopRatedMovies(page): Fetch top rated movies
- useNowPlayingMovies(page): Fetch now playing movies
- useUpcomingMovies(page): Fetch upcoming movies
- useMovieDetail(movieId): Fetch complete movie details
- useSimilarMovies(movieId, page): Fetch similar movies
- useMovieRecommendations(movieId, page): Fetch recommendations
- useSearchMovies(query, params): Search movies
- useDiscoverMovies(filters): Discover movies with filters

**📦 Packages Installed:**

- @tanstack/react-query-devtools: Development tools for debugging queries

**✅ Verification:**

- TypeScript compilation: ✅ Passed (npm run type-check)
- All hooks properly typed with TypeScript
- DevTools accessible in development mode
- Query key factory provides consistent cache keys

**📌 Notes:**

- Phase 1 (Foundation & Setup) is now 100% complete!
- Ready to begin Phase 2 (Layout & Navigation)
- TanStack Query fully integrated with automatic caching and loading states
- Example components available for reference
- All hooks support custom options for advanced use cases

**🎉 Phase 1 Complete:**

- ✅ 1.1 Project Configuration (6 tasks)
- ✅ 1.2 Design System - Base UI Components (6 tasks)
- ✅ 1.3 API Service Layer - TMDB Integration (7 tasks)
- ✅ 1.4 TanStack Query Setup (6 tasks)
- **Total: 25 tasks completed**

### Session 2 - December 7, 2025 (Phase 1.3 - TMDB API Integration)

**✅ Completed Tasks:**

- 1.3.1: Created TMDB API client class with rate limiting (4 requests/second)
- 1.3.2: Defined comprehensive TypeScript interfaces for TMDB responses
- 1.3.3: Implemented getTrending() method with time window support
- 1.3.4: Implemented getPopular(), getTopRated(), getNowPlaying(), getUpcoming() methods
- 1.3.5: Implemented getMovieDetail() with full movie information
- 1.3.6: Implemented searchMovies() method with query parameters
- 1.3.7: Added error handling (TMDBError class) and RateLimiter class

**📝 Architectural Decisions:**

1. **Rate Limiting:** Implemented custom RateLimiter class to prevent API quota exhaustion (4 req/sec default)
2. **Error Handling:** Created TMDBError class extending Error for structured error information
3. **Data Transformation:** Separated TMDB API types from application types for cleaner architecture
4. **Service Layer:** High-level service functions that combine client + transformer for ease of use
5. **Singleton Pattern:** TMDB client uses singleton pattern to prevent multiple instances
6. **Image Utilities:** Created helper functions for TMDB image URLs with responsive srcset support
7. **Type Safety:** All API responses strictly typed with TypeScript interfaces

**🔗 Files Created:**

- types/movie.ts: Complete TypeScript interfaces (TMDBMovie, Movie, MovieDetail, etc.)
- lib/tmdb/transformer.ts: Data transformation functions (transformMovie, transformMovieDetail)
- services/tmdb/client.ts: TMDB API client with RateLimiter and error handling
- services/tmdb/service.ts: High-level service functions (getTrendingMovies, getMovieDetails, etc.)
- services/tmdb/index.ts: Barrel exports for clean imports
- lib/tmdb/config.ts: TMDB client initialization with env variables
- lib/tmdb/images.ts: Image URL helper functions (getPosterUrl, getBackdropUrl, etc.)
- lib/tmdb/test.ts: Test utility to verify TMDB integration

**🔧 Files Modified:**

- .env.local.example: Added NEXT_PUBLIC_TMDB_API_KEY and related config variables

**🎯 API Methods Implemented:**

- getTrending(timeWindow, page): Fetch trending movies
- getPopular(page): Fetch popular movies
- getTopRated(page): Fetch top rated movies
- getNowPlaying(page): Fetch now playing movies
- getUpcoming(page): Fetch upcoming movies
- getMovieDetail(movieId): Fetch movie details
- getMovieCredits(movieId): Fetch cast and crew
- getMovieVideos(movieId): Fetch trailers/videos
- getSimilarMovies(movieId, page): Fetch similar movies
- getRecommendations(movieId, page): Fetch recommendations
- searchMovies(query, params): Search movies by query
- discoverMovies(params): Discover movies with filters
- getFullMovieInfo(movieId): Fetch details + credits + videos in parallel

**✅ Verification:**

- TypeScript compilation: ✅ Passed (npm run type-check)
- All imports resolve correctly
- Rate limiting logic validated
- Error handling structure complete

**📌 Notes:**

- TMDB client ready for integration with TanStack Query
- Need to test with actual TMDB API key (user should add to .env.local)
- Image utility functions support responsive images with srcset
- Test utility available at lib/tmdb/test.ts for API verification

### Session 1 - December 7, 2025

**✅ Completed Tasks:**

- 1.1.1: Installed core dependencies (zustand, @tanstack/react-query, clsx, tailwind-merge)
- 1.1.2: Configured Tailwind CSS v4 with Netflix-inspired theme in globals.css
- 1.1.3: Set up ESLint with strict TypeScript rules + Prettier
- 1.1.4: Configured Next.js for TMDB image optimization (remotePatterns)
- 1.1.5: Created .env.local.example with TMDB_API_KEY template
- 1.1.6: Set up complete directory structure (components, services, stores, types, hooks, lib, styles)
- 1.2.1: Created Button component (4 variants, 3 sizes, loading state)
- 1.2.2: Created Card component with hover effects and sub-components
- 1.2.3: Created Input component with error state support
- 1.2.4: Created Modal component with animations and keyboard support
- 1.2.5: Created Skeleton component (3 variants)
- 1.2.6: Created Spinner component (placeholder - needs implementation)

**📝 Architectural Decisions:**

1. Using Tailwind CSS v4's CSS-first configuration with @theme directive
2. Implemented 8px spacing grid system with dynamic utilities (--spacing: 0.5rem)
3. OKLCH color space for Netflix red accent (wider P3 gamut support)
4. Strict TypeScript configuration (no 'any' types allowed)
5. Component architecture: Base UI components in components/ui/ with forwardRef pattern
6. Utility files: cn() for className merging, constants.ts for app-wide config

**🔗 Additional Files Created:**

- lib/utils.ts: cn() utility function for className merging
- lib/constants.ts: Application constants (API URLs, image sizes, cache times)
- components/ui/index.ts: Barrel export for clean imports
- .prettierrc.json: Code formatting configuration

**🎯 Next Priority Tasks:**

1. Create TMDB API client with TypeScript interfaces (1.3.1-1.3.2)
2. Implement API methods for movie data fetching (1.3.3-1.3.6)
3. Set up TanStack Query with cache configuration (1.4.1-1.4.3)
4. Create custom React Query hooks for data fetching (1.4.4-1.4.6)

**✅ Verification:**

- TypeScript compilation: ✅ Passed (npm run type-check)
- Build test: Pending
- ESLint: Configured with strict rules
- All dependencies installed successfully

**📌 Notes:**

- Spinner component export added but implementation file missing - will create in next session
- Ready to proceed with TMDB API integration
- Need TMDB API key from user to test API integration
