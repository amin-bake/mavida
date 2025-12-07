/**
 * Toast Context Provider
 * Provides toast notification functionality throughout the application
 */

'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, Toast, ToastType } from '@/components/ui/Toast';

interface ToastContextType {
  showToast: (type: ToastType, title: string, description?: string, duration?: number) => void;
  success: (title: string, description?: string, duration?: number) => void;
  error: (title: string, description?: string, duration?: number) => void;
  info: (title: string, description?: string, duration?: number) => void;
  warning: (title: string, description?: string, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Toast Provider Component
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (type: ToastType, title: string, description?: string, duration: number = 5000) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const newToast: Toast = { id, type, title, description, duration };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  const success = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast('success', title, description, duration);
    },
    [showToast]
  );

  const error = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast('error', title, description, duration);
    },
    [showToast]
  );

  const info = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast('info', title, description, duration);
    },
    [showToast]
  );

  const warning = useCallback(
    (title: string, description?: string, duration?: number) => {
      showToast('warning', title, description, duration);
    },
    [showToast]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  const value: ToastContextType = {
    showToast,
    success,
    error,
    info,
    warning,
    dismiss,
    dismissAll,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

/**
 * Hook to use toast notifications
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
