/**
 * Specialized Skeleton Loader Components
 * Provides pre-built skeleton screens for common UI patterns
 */

'use client';

import { Skeleton } from './Skeleton';

/**
 * Skeleton for MovieCard component
 */
export function MovieCardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {/* Poster skeleton */}
      <Skeleton className="aspect-2/3 w-full rounded-md" />
      {/* Title skeleton */}
      <Skeleton className="h-4 w-3/4" />
      {/* Info skeleton */}
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

/**
 * Skeleton for MovieRow component
 */
export function MovieRowSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`px-4 md:px-8 ${className}`}>
      {/* Row title skeleton */}
      <Skeleton className="h-8 w-48 mb-4" />
      {/* Movie cards skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div key={`movie-skeleton-${i}`} className="shrink-0 w-40">
            <MovieCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton for MovieGrid component
 */
export function MovieGridSkeleton({
  count = 10,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div
      className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}
    >
      {[...Array(count)].map((_, i) => (
        <MovieCardSkeleton key={`grid-skeleton-${i}`} />
      ))}
    </div>
  );
}

/**
 * Skeleton for MovieHero component
 */
export function MovieHeroSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`relative h-[85vh] w-full animate-pulse bg-card ${className}`}>
      {/* Backdrop skeleton */}
      <Skeleton className="absolute inset-0" />
      {/* Content skeleton */}
      <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16 z-10">
        <div className="container mx-auto max-w-7xl">
          {/* Title skeleton */}
          <Skeleton className="h-12 w-2/3 mb-4" />
          {/* Info skeleton */}
          <Skeleton className="h-6 w-1/2 mb-2" />
          <Skeleton className="h-6 w-1/3 mb-6" />
          {/* Description skeleton */}
          <Skeleton className="h-4 w-full max-w-2xl mb-2" />
          <Skeleton className="h-4 w-5/6 max-w-2xl mb-6" />
          {/* Buttons skeleton */}
          <div className="flex gap-3">
            <Skeleton className="h-12 w-32" />
            <Skeleton className="h-12 w-32" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for MovieDetail page
 */
export function MovieDetailSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Backdrop hero skeleton */}
      <div className="relative h-[70vh] md:h-[80vh]">
        <Skeleton className="absolute inset-0" />
        {/* Content overlay skeleton */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 lg:p-16">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Poster skeleton */}
              <Skeleton className="w-48 h-72 shrink-0 rounded-md hidden md:block" />
              {/* Info skeleton */}
              <div className="flex-1 flex flex-col gap-4">
                <Skeleton className="h-12 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <div className="flex gap-3 mt-4">
                  <Skeleton className="h-12 w-32" />
                  <Skeleton className="h-12 w-32" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="container mx-auto px-4 md:px-8 py-12 flex flex-col gap-12">
        {/* Overview skeleton */}
        <div>
          <Skeleton className="h-8 w-32 mb-4" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-3/4" />
        </div>

        {/* Cast skeleton */}
        <div>
          <Skeleton className="h-8 w-24 mb-4" />
          <div className="flex gap-4 overflow-hidden">
            {[...Array(5)].map((_, i) => (
              <div key={`cast-skeleton-${i}`} className="flex flex-col items-center gap-2 shrink-0">
                <Skeleton className="w-24 h-24 rounded-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            ))}
          </div>
        </div>

        {/* Similar movies skeleton */}
        <MovieRowSkeleton />
      </div>
    </div>
  );
}

/**
 * Skeleton for Search results
 */
export function SearchResultsSkeleton({
  count = 10,
  className = '',
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {/* Results count skeleton */}
      <Skeleton className="h-5 w-48 mb-4" />
      {/* Grid skeleton */}
      <MovieGridSkeleton count={count} />
    </div>
  );
}

/**
 * Skeleton for Navbar search
 */
export function NavbarSearchSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  );
}

/**
 * Skeleton for Cast member card
 */
export function CastMemberSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-2 shrink-0 ${className}`}>
      <Skeleton className="w-24 h-24 rounded-full" />
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

/**
 * Skeleton for Video player
 */
export function VideoPlayerSkeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`relative w-full aspect-video bg-card animate-pulse flex items-center justify-center ${className}`}
    >
      <div className="flex flex-col items-center gap-4">
        <Skeleton className="w-16 h-16 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Comment/Review section
 */
export function CommentSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`flex gap-4 ${className}`}>
      <Skeleton className="w-10 h-10 rounded-full shrink-0" />
      <div className="flex-1 flex flex-col gap-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
      </div>
    </div>
  );
}

/**
 * Skeleton for Table row
 */
export function TableRowSkeleton({
  columns = 4,
  className = '',
}: {
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`flex gap-4 py-3 ${className}`}>
      {[...Array(columns)].map((_, i) => (
        <Skeleton key={`table-skeleton-${i}`} className="h-5 flex-1" />
      ))}
    </div>
  );
}

/**
 * Full page loading skeleton with multiple sections
 */
export function PageLoadingSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`min-h-screen bg-background pt-20 ${className}`}>
      <div className="container mx-auto px-4 py-8 flex flex-col gap-8">
        {/* Header */}
        <div>
          <Skeleton className="h-10 w-64 mb-4" />
          <Skeleton className="h-6 w-96" />
        </div>
        {/* Content */}
        <div className="flex flex-col gap-6">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
