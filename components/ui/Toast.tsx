/**
 * Toast Notification Component
 * Displays temporary notification messages for user actions
 */

'use client';

import { useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastProps {
  toast: Toast;
  onDismiss: (id: string) => void;
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-green-900/90',
    borderColor: 'border-green-700',
    iconColor: 'text-green-400',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-red-900/90',
    borderColor: 'border-red-700',
    iconColor: 'text-red-400',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-yellow-900/90',
    borderColor: 'border-yellow-700',
    iconColor: 'text-yellow-400',
  },
  info: {
    icon: Info,
    bgColor: 'bg-blue-900/90',
    borderColor: 'border-blue-700',
    iconColor: 'text-blue-400',
  },
};

/**
 * Individual toast notification component
 */
export function ToastNotification({ toast, onDismiss }: ToastProps) {
  const config = toastConfig[toast.type];
  const Icon = config.icon;

  useEffect(() => {
    if (toast.duration === 0) return; // Don't auto-dismiss

    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 5000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg backdrop-blur-sm',
        'transform transition-all duration-300 ease-in-out',
        'animate-in slide-in-from-right-full',
        config.bgColor,
        config.borderColor
      )}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className="flex items-start gap-3 p-4">
        {/* Icon */}
        <Icon className={cn('h-5 w-5 shrink-0 mt-0.5', config.iconColor)} aria-hidden="true" />

        {/* Content */}
        <div className="flex-1 space-y-1">
          <h4 className="text-sm font-semibold text-foreground">{toast.title}</h4>
          {toast.description && (
            <p className="text-sm text-muted-foreground">{toast.description}</p>
          )}
        </div>

        {/* Close button */}
        <button
          onClick={() => onDismiss(toast.id)}
          className={cn(
            'shrink-0 rounded-sm opacity-70 transition-opacity hover:opacity-100',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
            'focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          )}
          aria-label="Close notification"
        >
          <X className="h-4 w-4 text-foreground" aria-hidden="true" />
        </button>
      </div>

      {/* Progress bar for timed toasts */}
      {toast.duration && toast.duration > 0 && (
        <div className="h-1 bg-black/20 overflow-hidden">
          <div
            className={cn('h-full', config.iconColor.replace('text-', 'bg-'))}
            style={{
              animation: `progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

/**
 * Toast container component
 */
interface ToastContainerProps {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed top-0 right-0 z-50 flex flex-col gap-3 p-4 pointer-events-none"
      aria-label="Notifications"
      role="region"
    >
      {toasts.map((toast) => (
        <ToastNotification key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
