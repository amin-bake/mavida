# Mavida

A Netflix-inspired personal movie streaming application built with Next.js 16, featuring a modern, performant interface for browsing and watching movies.

![Next.js](https://img.shields.io/badge/Next.js-16.0.7-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38bdf8?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🎬 **Browse Movies** - Trending, popular, and top-rated movies from TMDB
- 🔍 **Smart Search** - Fast, debounced search with filters
- 📺 **Streaming Player** - Seamless video playback with VidSrc integration
- ⭐ **My List** - Save and manage your favorite movies
- 📖 **Watch History** - Continue watching where you left off
- 🎨 **Netflix-Inspired UI** - Dark theme with smooth animations
- 📱 **Fully Responsive** - Optimized for mobile, tablet, and desktop
- ⚡ **Lightning Fast** - Built with Next.js 16 App Router and Tailwind CSS v4

## 🚀 Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Language:** [TypeScript 5+](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Zustand](https://zustand-demo.pmnd.rs/)
- **Data Fetching:** [TanStack Query (React Query)](https://tanstack.com/query)
- **APIs:**
  - [TMDB API](https://www.themoviedb.org/documentation/api) - Movie metadata
  - [VidSrc API](https://vidsrc.me/) - Video streaming

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

| Variable              | Description       | Required |
| --------------------- | ----------------- | -------- |
| `TMDB_API_KEY`        | Your TMDB API key | Yes      |
| `NEXT_PUBLIC_APP_URL` | Application URL   | Yes      |

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
