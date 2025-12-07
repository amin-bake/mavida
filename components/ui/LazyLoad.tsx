/**
 * Lazy Load Component
 * Uses Intersection Observer to lazy load below-fold content
 */

'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

interface LazyLoadProps {
  children: ReactNode;
  className?: string;
  /**
   * Threshold for when to trigger loading (0-1)
   * 0 = as soon as any part is visible
   * 0.1 = when 10% is visible
   */
  threshold?: number;
  /**
   * Root margin for triggering before element enters viewport
   * e.g., '200px' will trigger 200px before element is visible
   */
  rootMargin?: string;
  /**
   * Placeholder component to show while loading
   */
  placeholder?: ReactNode;
}

export function LazyLoad({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '100px',
  placeholder = null,
}: LazyLoadProps) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          // Once loaded, stop observing
          if (ref.current) {
            observer.unobserve(ref.current);
          }
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [threshold, rootMargin]);

  return (
    <div ref={ref} className={className}>
      {isIntersecting ? children : placeholder}
    </div>
  );
}
