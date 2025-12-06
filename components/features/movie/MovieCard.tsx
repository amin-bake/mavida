/**
 * Movie Card Component
 * Displays a movie poster with hover effects and info
 */

'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { getPosterUrl } from '@/lib/tmdb/images';
import type { Movie } from '@/types/movie';

interface MovieCardProps {
  movie: Movie;
  className?: string;
}

export function MovieCard({ movie, className = '' }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const posterUrl = getPosterUrl(movie.posterPath, 'lg');

  return (
    <Link
      href={`/movie/${movie.id}`}
      className={`group relative block overflow-hidden rounded-lg bg-tertiary transition-transform hover:scale-105 ${className}`}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] w-full">
        {posterUrl && !imageError ? (
          <Image
            src={posterUrl}
            alt={movie.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <svg
              className="h-16 w-16 text-text-secondary"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <h3 className="font-semibold text-white line-clamp-2 mb-2">{movie.title}</h3>
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              {movie.releaseDate && <span>{new Date(movie.releaseDate).getFullYear()}</span>}
              {movie.rating > 0 && (
                <div className="flex items-center space-x-1">
                  <svg className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  <span>{movie.rating.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Title (visible on mobile when not hovering) */}
      <div className="p-3 md:hidden">
        <h3 className="font-semibold text-text-primary text-sm line-clamp-2">{movie.title}</h3>
        {movie.releaseDate && (
          <p className="text-xs text-text-secondary mt-1">
            {new Date(movie.releaseDate).getFullYear()}
          </p>
        )}
      </div>
    </Link>
  );
}
