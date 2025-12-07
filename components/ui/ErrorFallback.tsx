/**
 * Error Fallback Component
 * Reusable error UI for API failures with retry functionality
 */

'use client';

import { AlertCircle, RefreshCw, Home, WifiOff, ServerCrash } from 'lucide-react';
import { Button } from './Button';

export type ErrorType = 'network' | 'server' | 'not-found' | 'generic';

interface ErrorFallbackProps {
  error?: Error | null;
  errorType?: ErrorType;
  title?: string;
  message?: string;
  onRetry?: () => void;
  onGoHome?: () => void;
  showHomeButton?: boolean;
  className?: string;
}

const errorConfig = {
  network: {
    icon: WifiOff,
    title: 'Connection Error',
    message: 'Unable to connect to the server. Please check your internet connection.',
    color: 'text-orange-500',
  },
  server: {
    icon: ServerCrash,
    title: 'Server Error',
    message: 'Something went wrong on our end. Please try again later.',
    color: 'text-red-500',
  },
  'not-found': {
    icon: AlertCircle,
    title: 'Not Found',
    message: "The content you're looking for doesn't exist.",
    color: 'text-yellow-500',
  },
  generic: {
    icon: AlertCircle,
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Please try again.',
    color: 'text-destructive',
  },
};

/**
 * Determines error type from error object
 */
function getErrorType(error?: Error | null): ErrorType {
  if (!error) return 'generic';

  const message = error.message?.toLowerCase() || '';

  if (message.includes('network') || message.includes('fetch') || message.includes('timeout')) {
    return 'network';
  }

  if (message.includes('500') || message.includes('server')) {
    return 'server';
  }

  if (message.includes('404') || message.includes('not found')) {
    return 'not-found';
  }

  return 'generic';
}

/**
 * Main error fallback component for displaying API errors
 */
export function ErrorFallback({
  error,
  errorType,
  title,
  message,
  onRetry,
  onGoHome,
  showHomeButton = true,
  className = '',
}: ErrorFallbackProps) {
  const type = errorType || getErrorType(error);
  const config = errorConfig[type];
  const Icon = config.icon;

  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`}
      role="alert"
      aria-live="polite"
    >
      <Icon className={`w-16 h-16 mb-4 ${config.color}`} aria-hidden="true" />

      <h2 className="text-2xl font-bold text-foreground mb-2">{displayTitle}</h2>

      <p className="text-muted-foreground mb-6 max-w-md">{displayMessage}</p>

      <div className="flex flex-col sm:flex-row gap-3">
        {onRetry && (
          <Button onClick={onRetry} variant="default" className="gap-2">
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try Again
          </Button>
        )}

        {showHomeButton && onGoHome && (
          <Button onClick={onGoHome} variant="outline" className="gap-2">
            <Home className="w-4 h-4" aria-hidden="true" />
            Go Home
          </Button>
        )}
      </div>

      {process.env.NODE_ENV === 'development' && error && (
        <details className="mt-8 w-full max-w-2xl text-left">
          <summary className="cursor-pointer text-sm text-muted-foreground hover:text-foreground">
            Error Details (Development Only)
          </summary>
          <div className="mt-4 p-4 bg-card border border-border rounded-md">
            <p className="text-xs font-mono text-destructive break-all mb-2">{error.message}</p>
            {error.stack && (
              <pre className="text-xs text-muted-foreground overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

/**
 * Compact error fallback for inline usage (e.g., in movie rows)
 */
export function InlineErrorFallback({
  error,
  onRetry,
  message = 'Failed to load content',
}: {
  error?: Error | null;
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <div
      className="flex items-center justify-center p-4 bg-card/50 border border-border rounded-md"
      role="alert"
      aria-live="polite"
    >
      <div className="flex items-center gap-3 text-sm">
        <AlertCircle className="w-5 h-5 text-destructive shrink-0" aria-hidden="true" />
        <span className="text-muted-foreground">{message}</span>
        {onRetry && (
          <Button
            onClick={onRetry}
            variant="ghost"
            size="sm"
            className="gap-2 text-xs"
            aria-label="Retry loading content"
          >
            <RefreshCw className="w-3 h-3" aria-hidden="true" />
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

/**
 * Empty state fallback (for when data is successfully loaded but empty)
 */
export function EmptyStateFallback({
  title = 'No Results Found',
  message = 'Try adjusting your filters or search terms.',
  icon: Icon = AlertCircle,
  action,
  actionLabel,
}: {
  title?: string;
  message?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: () => void;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
      <Icon className="w-12 h-12 mb-4 text-muted-foreground" aria-hidden="true" />
      <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      {action && actionLabel && (
        <Button onClick={action} variant="outline" className='cursor-pointer hover:bg-accent-hover'>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
