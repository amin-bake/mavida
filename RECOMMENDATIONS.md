# Mavida - Strategic Recommendations & Decisions

**Architecture & Technology Choices**  
_December 6, 2025_

---

## 1. Movie Metadata API Selection

### ✅ Recommended: The Movie Database (TMDB)

**Rationale:**

| Criteria             | TMDB                                       | OMDb                        | TMDb Alternatives |
| -------------------- | ------------------------------------------ | --------------------------- | ----------------- |
| **Free Tier Limits** | 10,000 requests/day                        | 1,000 requests/day          | Varies            |
| **Data Richness**    | Comprehensive (cast, crew, videos, images) | Basic metadata              | Limited           |
| **Image Quality**    | High-res posters/backdrops                 | Low-res only                | Varies            |
| **Language Support** | 40+ languages                              | English-focused             | Limited           |
| **Documentation**    | Excellent + TypeScript support             | Good                        | Varies            |
| **Reliability**      | Very high (backed by large community)      | High                        | Unknown           |
| **Cost Scaling**     | Reasonable ($39/mo for unlimited)          | Expensive ($5/10k requests) | N/A               |

**Why TMDB Wins:**

1. **Rich Metadata:** Cast, crew, trailers, reviews, recommendations
2. **High-Quality Images:** Essential for Netflix-style UI (multiple resolutions available)
3. **Generous Free Tier:** 10,000 requests/day = ~300 unique visitors/day (adequate for personal use)
4. **Active Community:** Well-maintained, regularly updated
5. **TypeScript Support:** Community-created type definitions available

**Implementation Strategy:**

```typescript
// services/tmdb/config.ts
export const TMDB_CONFIG = {
  apiKey: process.env.TMDB_API_KEY,
  baseURL: "https://api.themoviedb.org/3",
  imageBaseURL: "https://image.tmdb.org/t/p/",
  imageSizes: {
    poster: ["w92", "w154", "w185", "w342", "w500", "w780", "original"],
    backdrop: ["w300", "w780", "w1280", "original"],
  },
  rateLimit: {
    maxRequests: 40,
    perSeconds: 10,
  },
};
```

**Fallback Strategy:**

- Cache responses aggressively (24h for movie details)
- Implement request queue to respect rate limits
- Consider proxy API route if needed for sensitive keys

---

## 2. Video Hosting & Streaming Strategy

### ✅ Recommended: VidSrc.me API (Phase 1)

**Context:** Personal streaming app (not distributing copyrighted content commercially)

**Phase 1: Third-Party Embed (VidSrc)**

**Pros:**

- ✅ Zero hosting costs
- ✅ No video storage/transcoding required
- ✅ Adaptive bitrate streaming handled automatically
- ✅ Multiple quality options (auto-switching)
- ✅ Works across devices (mobile, desktop)

**Cons:**

- ❌ Limited customization of player UI
- ❌ Dependent on third-party availability
- ❌ Ads may appear (varies by source)
- ❌ No control over video sources

**Implementation:**

```typescript
// services/video/streaming.ts
export const STREAMING_CONFIG = {
  sources: {
    primary: {
      name: "VidSrc",
      baseURL: "https://vidsrc.me/embed/movie",
      buildURL: (tmdbId: number) => `https://vidsrc.me/embed/movie/${tmdbId}`,
    },
    fallback: {
      name: "VidSrc XYZ",
      baseURL: "https://vidsrc.xyz/embed/movie",
      buildURL: (tmdbId: number) => `https://vidsrc.xyz/embed/movie/${tmdbId}`,
    },
  },
};

// Usage
const streamURL = STREAMING_CONFIG.sources.primary.buildURL(550); // Fight Club
```

**Player Integration:**

```tsx
// components/features/movie/MoviePlayer.tsx
export function MoviePlayer({ tmdbId }: { tmdbId: number }) {
  const [currentSource, setCurrentSource] = useState("primary");
  const streamURL = STREAMING_CONFIG.sources[currentSource].buildURL(tmdbId);

  return (
    <div className="relative aspect-video w-full bg-black">
      <iframe
        src={streamURL}
        className="h-full w-full"
        allowFullScreen
        allow="autoplay; encrypted-media; picture-in-picture"
        sandbox="allow-same-origin allow-scripts allow-presentation"
        onError={() => setCurrentSource("fallback")}
      />
    </div>
  );
}
```

### Alternative: Self-Hosted Video (Phase 2+)

**Only consider if:**

- You own content rights
- Building for specific use case (home media server)
- Need complete control over player

**Tech Stack (if self-hosting):**

- **Storage:** AWS S3 / Cloudflare R2
- **CDN:** Cloudflare / AWS CloudFront
- **Transcoding:** FFmpeg / AWS MediaConvert
- **Player:** Video.js / HLS.js for adaptive streaming
- **Format:** HLS (m3u8) for iOS/Safari + DASH for others

**Cost Estimate (100GB storage + 500GB bandwidth):**

- AWS S3: ~$2.50/month + $40/month bandwidth = $42.50/month
- Cloudflare R2: $1.50/month + $0/month bandwidth (free egress) = $1.50/month ✅

**Recommendation:** Use VidSrc for Phase 1, revisit self-hosting only if needed.

---

## 3. Authentication Strategy

### ✅ Recommended: No Authentication (Phase 1)

**Rationale for Personal Use:**

Since this is a **personal streaming app** (not a public service), authentication adds complexity without clear benefits:

**Scenarios:**

#### Option A: No Authentication (Recommended for Phase 1)

**Best for:** Single user, personal device, home network

**Pros:**

- ✅ Zero setup complexity
- ✅ Instant access
- ✅ No password management
- ✅ Focus development time on core features

**Cons:**

- ❌ Anyone with URL can access (mitigate with obscure domain)
- ❌ No multi-user support

**Implementation:**

- All user preferences stored in localStorage
- No server-side user data
- Watch history tied to browser/device

#### Option B: Simple Password Protection (Phase 2)

**Best for:** Shared device, want basic security

**Implementation via Middleware:**

```typescript
// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isAuthenticated = request.cookies.get("auth-token");

  if (!isAuthenticated && request.nextUrl.pathname !== "/login") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
```

**Single Password Protection:**

- Store hashed password in environment variable
- Set cookie on successful login (httpOnly, secure)
- No database required

#### Option C: Full Authentication (Phase 3)

**Best for:** Multiple users, cloud deployment, sharing with friends

**Tech Stack:**

- **NextAuth.js v5** (Auth.js)
  - Supports credentials (username/password)
  - Can add OAuth later (Google, GitHub)
  - Built-in session management

**Alternative:** Clerk, Auth0 (overkill for personal use)

**Implementation Complexity:**
| Feature | No Auth | Simple Password | NextAuth.js |
|---------|---------|-----------------|-------------|
| Setup Time | 0 hours | 2 hours | 4-6 hours |
| User Management | N/A | Single user | Multi-user |
| Database Required | No | No | Yes (for sessions) |
| OAuth Support | No | No | Yes |

**Recommendation Path:**

1. **Phase 1:** No auth - focus on core features
2. **Phase 2:** Add simple password if needed for basic protection
3. **Phase 3:** Migrate to NextAuth.js if multi-user support desired

---

## 4. Deployment Strategy

### ✅ Recommended: Vercel (Primary Choice)

**Comprehensive Comparison:**

| Criteria             | Vercel                       | Netlify           | Railway           | Self-Hosted (VPS) |
| -------------------- | ---------------------------- | ----------------- | ----------------- | ----------------- |
| **Next.js Support**  | Native (best-in-class)       | Good              | Basic             | Manual setup      |
| **Free Tier**        | 100 GB bandwidth             | 100 GB bandwidth  | $5 credit/month   | N/A               |
| **Build Time**       | Fast (optimized for Next.js) | Medium            | Medium            | Depends           |
| **Edge Network**     | Global CDN                   | Global CDN        | Regional          | Single location   |
| **Deployment**       | Git push (auto)              | Git push (auto)   | Git push (auto)   | Manual            |
| **Environment Vars** | Web UI + CLI                 | Web UI + CLI      | Web UI + CLI      | .env files        |
| **Analytics**        | Built-in (Web Vitals)        | Paid add-on       | No                | Self-hosted       |
| **Database**         | Vercel Postgres (optional)   | No (use external) | Built-in Postgres | Full control      |
| **Cost (100GB+)**    | $20/month (Pro)              | $19/month (Pro)   | ~$10/month        | $5-20/month       |

### Why Vercel Wins for This Project:

1. **Zero-Config Next.js Deployment**

   - Automatic optimizations (ISR, image optimization, etc.)
   - Built-in edge functions for API routes
   - Streaming SSR support

2. **Developer Experience**

   - Preview deployments for every commit
   - Instant rollbacks
   - Real-time logs and error tracking

3. **Performance**

   - Global edge network (low latency worldwide)
   - Automatic HTTPS and SSL
   - Built-in Web Vitals monitoring

4. **Free Tier Generosity**

   - 100 GB bandwidth/month (sufficient for personal use)
   - Unlimited deployments
   - 6,000 build minutes/month

5. **Scalability**
   - Start free, upgrade seamlessly if needed
   - Serverless functions scale automatically

### Deployment Setup Steps:

```bash
# 1. Install Vercel CLI (optional)
npm i -g vercel

# 2. Link project
vercel link

# 3. Set environment variables
vercel env add TMDB_API_KEY

# 4. Deploy
vercel --prod
```

**Automatic Deployment via GitHub:**

1. Push code to GitHub repository
2. Connect repository in Vercel dashboard
3. Every push to `main` auto-deploys to production
4. Pull requests get preview URLs

### Environment Variables Configuration:

```bash
# .env.local (local development)
TMDB_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Vercel Dashboard (production)
TMDB_API_KEY=your_actual_api_key_here
NEXT_PUBLIC_APP_URL=https://mavida.vercel.app
```

### Alternative Deployment Options:

#### Netlify (Close Second)

**Use if:** You prefer Netlify's UI or have existing projects there

**Pros:**

- Similar to Vercel (Git-based deployment)
- Generous free tier
- Good Next.js support (improving)

**Cons:**

- Slightly slower builds than Vercel
- Next.js support not as mature
- Image optimization less optimized

#### Railway (If Database Needed)

**Use if:** You need PostgreSQL + Redis in one place

**Pros:**

- Built-in Postgres database
- Redis add-on available
- Simple pricing ($5-20/month)

**Cons:**

- No free tier (credit-based)
- Smaller edge network
- Less Next.js optimization

#### Self-Hosted (Advanced)

**Use if:** You want full control, already have VPS

**Tech Stack:**

- Ubuntu VPS (DigitalOcean, Linode, Hetzner)
- Docker + Docker Compose
- Nginx reverse proxy
- Certbot for SSL

**Setup:**

```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
```

**Cost:** $5-10/month (Hetzner VPS)  
**Effort:** 4-6 hours initial setup

**Recommendation:** Only if you need it for learning or have specific requirements.

---

## 5. Additional Strategic Recommendations

### State Management: Why Zustand?

**Comparison:**

| Feature            | Zustand   | Redux Toolkit | Context API       | Jotai     |
| ------------------ | --------- | ------------- | ----------------- | --------- |
| **Bundle Size**    | 1.2 KB    | 11 KB         | 0 (built-in)      | 3 KB      |
| **Boilerplate**    | Minimal   | Moderate      | Minimal           | Minimal   |
| **DevTools**       | Yes       | Yes           | No                | Yes       |
| **TypeScript**     | Excellent | Excellent     | Good              | Excellent |
| **Learning Curve** | Easy      | Moderate      | Easy              | Moderate  |
| **Performance**    | Excellent | Good          | Poor (re-renders) | Excellent |

**Why Zustand for Mavida:**

1. Tiny bundle size (performance-critical)
2. No Provider boilerplate (unlike Context API)
3. Built-in persistence middleware (localStorage)
4. Perfect for small-to-medium apps
5. TypeScript-first API

### Data Fetching: Why TanStack Query?

**Comparison:**

| Feature             | TanStack Query | SWR     | Native Fetch | Apollo Client |
| ------------------- | -------------- | ------- | ------------ | ------------- |
| **Caching**         | Advanced       | Basic   | None         | Advanced      |
| **Devtools**        | Excellent      | No      | No           | Yes           |
| **Bundle Size**     | 13 KB          | 4 KB    | 0            | 33 KB         |
| **Type Safety**     | Excellent      | Good    | Manual       | Good          |
| **Offline Support** | Yes            | Limited | No           | Yes           |
| **Mutations**       | Built-in       | Manual  | Manual       | Built-in      |

**Why TanStack Query for Mavida:**

1. Automatic caching (reduces TMDB API calls)
2. Built-in loading/error states
3. Request deduplication (multiple components requesting same data)
4. Perfect for REST APIs (TMDB)
5. Prefetching support (hover-to-load)

### CSS Framework: Why Tailwind CSS?

Already chosen, but here's validation:

**Pros for Netflix-style UI:**

- ✅ Utility-first enables rapid prototyping
- ✅ Dark theme support built-in
- ✅ Responsive design with breakpoint prefixes
- ✅ JIT compiler (only generates used classes)
- ✅ Excellent with Next.js (zero config)

**Custom Theme Configuration:**

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        netflix: {
          red: "#E50914",
          black: "#141414",
          gray: "#1F1F1F",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## 6. Implementation Priority Matrix

### Must-Have (MVP) - Phase 1-4

- ✅ TMDB API integration
- ✅ Homepage with movie rows
- ✅ Movie detail pages
- ✅ Video player (VidSrc embed)
- ✅ Search functionality
- ✅ Responsive design

### Should-Have (Enhanced) - Phase 5-6

- ✅ Favorites/My List
- ✅ Watch history & continue watching
- ✅ Performance optimizations (LCP, CLS, FID)
- ✅ Accessibility compliance
- ✅ Error boundaries & loading states

### Nice-to-Have (Future) - Phase 7+

- ⏸️ TV shows support
- ⏸️ Advanced search filters
- ⏸️ User authentication
- ⏸️ PWA features
- ⏸️ Custom video player

### Won't-Have (Out of Scope)

- ❌ Content upload functionality
- ❌ Social features (comments, ratings)
- ❌ Payment integration
- ❌ Admin dashboard

---

## 7. Development Environment Recommendations

### VS Code Extensions (Productivity Boosters)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint", // ESLint
    "esbenp.prettier-vscode", // Prettier
    "bradlc.vscode-tailwindcss", // Tailwind IntelliSense
    "ms-vscode.vscode-typescript-next", // TypeScript
    "streetsidesoftware.code-spell-checker", // Spell Checker
    "usernamehw.errorlens", // Inline Errors
    "wix.vscode-import-cost", // Import Size
    "ms-vscode-remote.vscode-remote-extensionpack" // Remote Dev
  ]
}
```

### Package.json Scripts (Convenience)

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "lint:fix": "eslint . --ext .ts,.tsx --fix",
    "format": "prettier --write \"**/*.{ts,tsx,js,jsx,json,md}\"",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "analyze": "ANALYZE=true npm run build"
  }
}
```

---

## 8. Risk Mitigation Strategies

### API Rate Limiting (TMDB)

**Problem:** 10,000 requests/day = 416 requests/hour = 7 requests/minute

**Solution:**

```typescript
// lib/rateLimiter.ts
import { LRUCache } from "lru-cache";

const requestCache = new LRUCache({
  max: 500, // Store 500 recent requests
  ttl: 1000 * 60 * 5, // 5 minutes
});

export async function rateLimitedFetch(url: string) {
  const cached = requestCache.get(url);
  if (cached) return cached;

  const response = await fetch(url);
  const data = await response.json();

  requestCache.set(url, data);
  return data;
}
```

### Video Source Availability

**Problem:** VidSrc may go down or change URLs

**Solution:**

```typescript
// services/video/player.ts
const STREAMING_SOURCES = [
  { name: "VidSrc", url: "https://vidsrc.me/embed/movie/{id}" },
  { name: "VidSrc XYZ", url: "https://vidsrc.xyz/embed/movie/{id}" },
  { name: "VidSrc Pro", url: "https://vidsrc.pro/embed/movie/{id}" },
];

export function getStreamURL(tmdbId: number, sourceIndex = 0) {
  const source = STREAMING_SOURCES[sourceIndex];
  return source.url.replace("{id}", tmdbId.toString());
}
```

### Browser Compatibility

**Problem:** Older browsers may not support modern JavaScript

**Solution:**

- Next.js handles transpilation automatically
- Test in major browsers: Chrome, Firefox, Safari, Edge
- Use `@vitejs/plugin-legacy` if supporting IE11 (unlikely need)

---

## Summary of Key Decisions

| Decision Area        | Chosen Solution | Rationale                                   |
| -------------------- | --------------- | ------------------------------------------- |
| **Metadata API**     | TMDB            | Best data quality, free tier, documentation |
| **Video Streaming**  | VidSrc.me embed | Zero hosting costs, adaptive streaming      |
| **Authentication**   | None (Phase 1)  | Simplicity for personal use                 |
| **Deployment**       | Vercel          | Best Next.js support, free tier, DX         |
| **State Management** | Zustand         | Minimal boilerplate, small bundle           |
| **Data Fetching**    | TanStack Query  | Advanced caching, excellent DX              |
| **Styling**          | Tailwind CSS    | Rapid development, consistent design        |

---

## Next Steps: Implementation Phase

With planning complete, we're ready to begin Phase 1:

**Session 1 Goals:**

1. Install all dependencies
2. Configure Tailwind with custom theme
3. Set up project structure
4. Build first UI component (Button)

**Estimated Time:** 2-3 hours

---

**Document Prepared By:** GitHub Copilot  
**Review Status:** Ready for User Confirmation  
**Next Action:** Await user approval to proceed with implementation
