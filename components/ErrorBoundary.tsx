'use client';

import React from 'react';
import { Button } from '@/components/ui';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // In production, you could log to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      // If a custom fallback is provided, use it
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
      }

      // Default fallback UI
      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// Default error fallback component
function DefaultErrorFallback({ error, resetError }: { error: Error; resetError: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background">
      <div className="max-w-2xl w-full text-center">
        {/* Error Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 rounded-full bg-destructive/10 flex items-center justify-center">
            <svg
              className="w-12 h-12 text-destructive"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Error Message */}
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>

        {/* Error Details (Development only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-8 p-4 rounded-lg bg-card border border-border text-left">
            <h2 className="text-sm font-semibold text-destructive mb-2">Error Details:</h2>
            <p className="text-sm text-muted-foreground font-mono break-all">{error.message}</p>
            {error.stack && (
              <details className="mt-4">
                <summary className="text-sm text-muted-foreground cursor-pointer hover:text-foreground">
                  Stack Trace
                </summary>
                <pre className="mt-2 text-xs text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={resetError} variant="default" size="lg" className="min-w-40">
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = '/')}
            variant="outline"
            size="lg"
            className="min-w-40"
          >
            Go to Homepage
          </Button>
        </div>

        {/* Additional Help */}
        <p className="mt-8 text-sm text-muted-foreground">
          If this problem persists, please{' '}
          <a href="/" className="text-primary hover:underline">
            refresh the page
          </a>{' '}
          or contact support.
        </p>
      </div>
    </div>
  );
}

export { ErrorBoundary, DefaultErrorFallback };
export type { ErrorBoundaryProps };
