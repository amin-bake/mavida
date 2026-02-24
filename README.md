# Mavida

A Netflix-inspired personal movie streaming application built with Next.js 16, featuring a modern, performant interface for browsing and watching movies.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

![Project Image](</public/Screenshot 2025-12-08 185654.png>)

## ✨ Features

### 🎬 Movie Discovery

- **Hero Section** - Featured movie showcase with backdrop and auto-rotation
- **Trending Now** - Latest trending movies from TMDB
- **Popular Movies** - Most popular titles with lazy loading
- **Top Rated** - Highest-rated movies of all time
- **Now Playing** - Currently playing in theaters

### 🔍 Advanced Search

- **Smart Search Bar** - Debounced search with 300ms delay
- **Real-time Results** - Instant search results as you type
- **Recent Searches** - Quick access to previous searches
- **Search Filters** - Filter by year, genre, and rating
- **Empty States** - Helpful guidance when no results found

### 📺 Video Player

- **Seamless Playback** - VidSrc integration for smooth streaming
- **Watch Progress** - Automatic tracking of playback position
- **Resume Feature** - Continue watching from where you left off
- **Fullscreen Support** - Native fullscreen for immersive viewing
- **Responsive Player** - Adapts to all screen sizes

### ⭐ Personal Library

- **My List** - Save favorites with one click
- **Continue Watching** - Resume incomplete movies
- **Watch History** - Track all viewed content
- **Persistent Storage** - Data saved to localStorage
- **Quick Actions** - Add/remove from list anywhere in the app

### 🎨 User Experience

- **Netflix-Inspired Design** - Familiar, polished interface
- **Dark Theme** - Easy on the eyes, perfect for movie browsing
- **Smooth Animations** - Transitions and hover effects
- **Toast Notifications** - Feedback for all user actions
- **Error Handling** - Graceful fallbacks for failed requests
- **Skeleton Loaders** - No blank screens during loading

### ♿ Accessibility

- **WCAG 2.1 AA Compliant** - Accessible to all users
- **Keyboard Navigation** - Full keyboard support
- **Screen Reader Friendly** - ARIA labels and semantic HTML
- **Focus Indicators** - Clear visual focus states
- **Skip to Content** - Quick navigation for keyboard users

### ⚡ Performance

- **Image Optimization** - Next.js Image with blur placeholders
- **Code Splitting** - Lazy loading for optimal bundle size
- **Prefetching** - Movie details prefetched on hover
- **Caching Strategy** - Smart caching with TanStack Query
- **Core Web Vitals** - LCP < 2.5s, CLS < 0.1, FID < 100ms

### 📱 Responsive Design

- **Mobile First** - Optimized for smartphones
- **Tablet Support** - Perfect for iPads and tablets
- **Desktop Experience** - Full-featured desktop interface
- **Touch Gestures** - Swipe navigation for touch devices
- **Adaptive Layouts** - Content reflows for any screen size

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** [TypeScript 5+](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query)
- **APIs:**
  - [TMDB API](https://www.themoviedb.org/documentation/api) - Movie metadata
  - [VidSrc API](https://vidsrcme.ru/api/) - Video streaming

## 📋 Prerequisites

- Node.js 20.x or higher
- npm, yarn, pnpm, or bun
- TMDB API Key ([Get one here](https://www.themoviedb.org/settings/api))

## 🛠️ Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/amin-bake/mavida.git
   cd mavida
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables:**

   Create a `.env.local` file in the root directory:

   ```bash
   TMDB_API_KEY=your_tmdb_api_key_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
mavida/
├── app/                    # Next.js App Router
│   ├── (main)/            # Main application routes
│   │   ├── page.tsx       # Homepage
│   │   ├── search/        # Search page
│   │   ├── movie/         # Movie detail & watch pages
│   │   └── my-list/       # User's favorites
│   ├── api/               # API routes
│   ├── globals.css        # Global styles & Tailwind config
│   └── layout.tsx         # Root layout
├── components/
│   ├── ui/                # Base UI components
│   ├── layout/            # Layout components
│   └── features/          # Feature-specific components
├── lib/                   # Utilities & configurations
├── services/              # API integrations
│   ├── tmdb/             # TMDB API client
│   └── video/            # Video player logic
├── stores/               # Zustand state stores
├── types/                # TypeScript definitions
├── hooks/                # Custom React hooks
└── styles/               # Additional styles
```

## 🎯 Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler check
```

## 📚 Documentation

- **[Technical Specification](./TECHNICAL_SPECIFICATION.md)** - Comprehensive architecture documentation
- **[Task Breakdown](./TASK_BREAKDOWN.md)** - Detailed implementation roadmap
- **[Recommendations](./RECOMMENDATIONS.md)** - Technology choices and strategic decisions

## 🎨 Design System

Mavida uses Tailwind CSS v4 with a Netflix-inspired theme:

- **Colors:** Dark backgrounds with Netflix red accents
- **Typography:** Inter font family with responsive sizing
- **Spacing:** 8px grid system for consistent layouts
- **Animations:** Smooth transitions and hover effects

Theme configuration is in `app/globals.css` using the `@theme` directive.

## 🔑 Environment Variables

Create a `.env.local` file in the root directory with the following variables:

| Variable              | Description                                     | Required | Default                 | Example                     |
| --------------------- | ----------------------------------------------- | -------- | ----------------------- | --------------------------- |
| `TMDB_API_KEY`        | Your TMDB API key                               | Yes      | -                       | `a1b2c3d4e5f6g7h8i9j0`      |
| `NEXT_PUBLIC_APP_URL` | Application URL for metadata and social sharing | Yes      | `http://localhost:3000` | `https://mavida.vercel.app` |

### Getting Your TMDB API Key

1. Create a free account at [TMDB](https://www.themoviedb.org/signup)
2. Navigate to [API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key (select "Developer" option)
4. Copy your API key to `.env.local`

**Note:** The free tier includes 40 requests per 10 seconds, which is sufficient for personal use.

## 🔌 API Integration

### TMDB API

Mavida uses [The Movie Database (TMDB) API](https://www.themoviedb.org/documentation/api) for all movie metadata:

**Endpoints Used:**

- `/movie/trending` - Trending movies
- `/movie/popular` - Popular movies
- `/movie/top_rated` - Top-rated movies
- `/movie/now_playing` - Now playing in theaters
- `/movie/{id}` - Movie details
- `/movie/{id}/credits` - Cast and crew
- `/movie/{id}/videos` - Trailers and videos
- `/movie/{id}/similar` - Similar movie recommendations
- `/search/movie` - Search movies

**Features:**

- TypeScript interfaces for type safety
- Automatic request retrying with TanStack Query
- Response caching to minimize API calls
- Error handling with user-friendly messages
- Image optimization with Next.js Image

**Rate Limiting:**

- Free tier: 40 requests per 10 seconds
- Caching strategy reduces redundant calls
- Prefetching on hover for better UX

### VidSrc Integration

Video playback powered by [VidSrc](https://vidsrcme.ru/):

**How It Works:**

- Iframe embed for seamless playback
- URL format: `https://vidsrcme.su/embed/movie?tmdb={tmdb_id}&autoplay={0|1}`
- TV format: `https://vidsrcme.su/embed/tv?tmdb={tmdb_id}&season={season}&episode={episode}&autoplay={0|1}&autonext={0|1}`
- No authentication required
- Supports fullscreen and responsive sizing

**Features:**

- Automatic source selection
- Multiple quality options
- Subtitle support
- Mobile-optimized player

**Usage:**

```tsx
<iframe
  src={`https://vidsrc.me/embed/movie/${movieId}`}
  allowFullScreen
  className="w-full h-full"
/>
```

## 🐛 Troubleshooting

### Common Issues

**1. "TMDB API Key Invalid" Error**

- Verify your API key is correct in `.env.local`
- Ensure you copied the API key, not the API Read Access Token
- Restart the development server after adding the key

**2. Images Not Loading**

- Check TMDB image configuration in `next.config.ts`
- Verify `remotePatterns` includes `image.tmdb.org`
- Clear Next.js cache: `rm -rf .next`

**3. Build Errors**

- Run `npm run type-check` to identify TypeScript errors
- Ensure all dependencies are installed: `npm install`
- Check Node.js version (requires 20.x or higher)

**4. Slow Performance**

- Enable TanStack Query devtools to check cache hits
- Verify image optimization is working (blur placeholders)
- Check Network tab for redundant API calls

**5. Video Player Not Working**

- VidSrc may have temporary outages
- Check browser console for iframe errors
- Ensure third-party cookies are enabled
- Try a different browser

### Development Tips

**Hot Reload Issues:**

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
npm run dev
```

**Type Errors:**

```bash
# Check all TypeScript errors
npm run type-check

# Fix auto-fixable issues
npm run lint -- --fix
```

**Performance Debugging:**

```bash
# Analyze bundle size
npm run build

# Check build output in terminal
```

## 🧪 Testing

While this project doesn't include automated tests, you can manually test:

**Homepage:**

- ✅ Hero section loads featured movie
- ✅ All movie rows display correctly
- ✅ Horizontal scrolling works smoothly
- ✅ Favorite buttons toggle state

**Search:**

- ✅ Search bar accepts input
- ✅ Results update as you type
- ✅ Filters narrow results
- ✅ Recent searches persist

**Movie Detail:**

- ✅ All movie information displays
- ✅ Similar movies section loads
- ✅ Watch Now button navigates correctly
- ✅ Favorite button works

**Video Player:**

- ✅ Video embeds and plays
- ✅ Fullscreen mode works
- ✅ Progress saves to localStorage
- ✅ Resume from last position works

**My List:**

- ✅ Favorited movies display
- ✅ Can remove from favorites
- ✅ Empty state shows when no favorites

## 🤝 Contributing

This is a personal project, but suggestions and improvements are welcome:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

**Contribution Guidelines:**

- Follow existing code style
- Add TypeScript types for all new code
- Test on mobile, tablet, and desktop
- Update documentation as needed
- Keep commits focused and atomic

## 🚢 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Add environment variables in project settings
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amin-bake/mavida)

### Manual Deployment

```bash
npm run build
npm run start
```

## 📝 License

This project is built for personal use. Please ensure you comply with TMDB's [Terms of Use](https://www.themoviedb.org/terms-of-use) and respect copyright laws when using video streaming services.

## 🙏 Acknowledgments

- [The Movie Database (TMDB)](https://www.themoviedb.org/) for comprehensive movie data
- [VidSrc](https://vidsrc.me/) for video streaming capabilities
- [Vercel](https://vercel.com/) for hosting and Next.js framework
- Netflix for design inspiration

## 📧 Contact

For questions or feedback, please open an issue on GitHub.

---

**Note:** This is a personal project for educational purposes. All movie data and imagery are provided by TMDB under their API terms of use.
