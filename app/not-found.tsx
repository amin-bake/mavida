/**
 * Custom 404 Not Found Page
 * Displayed when a user navigates to a non-existent route
 */

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center flex flex-col items-center gap-4">
        {/* 404 Error Code */}
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <div className="h-1 w-32 bg-primary mx-auto rounded-full" />
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Lost Your Way?</h2>
        <p className="text-lg text-muted-foreground mb-8  mx-auto">
          Sorry, we can't find that page. You'll find lots to explore on the home page.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
          <Button size="lg" onClick={() => router.push('/')} className="min-w-[200px]">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Mavida Home
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => router.back()}
            className="min-w-[200px]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Go Back
          </Button>
        </div>

        {/* Quick Links */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground mb-4">Or try one of these:</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              href="/search"
              className="text-sm text-foreground hover:text-primary transition-colors underline"
            >
              Search Movies
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/my-list"
              className="text-sm text-foreground hover:text-primary transition-colors underline"
            >
              My List
            </Link>
            <span className="text-muted-foreground">•</span>
            <Link
              href="/movies"
              className="text-sm text-foreground hover:text-primary transition-colors underline"
            >
              Browse Movies
            </Link>
          </div>
        </div>

        {/* Error Code */}
        <p className="text-xs text-muted-foreground mt-12">
          Error Code: <span className="font-mono">PAGE_NOT_FOUND</span>
        </p>
      </div>
    </div>
  );
}
