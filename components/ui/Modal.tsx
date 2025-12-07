import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, title, className }) => {
  const modalRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  // Focus trap effect
  React.useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before opening modal
    previousFocusRef.current = document.activeElement as HTMLElement;

    const modal = modalRef.current;
    if (!modal) return;

    // Get all focusable elements within the modal
    const getFocusableElements = () => {
      const focusableSelectors = [
        'a[href]',
        'button:not([disabled])',
        'textarea:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        '[tabindex]:not([tabindex="-1"])',
      ];
      return modal.querySelectorAll<HTMLElement>(focusableSelectors.join(', '));
    };

    // Focus first element
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Handle tab key for focus trap
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab: Moving backwards
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: Moving forwards
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleTabKey);
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleTabKey);
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';

      // Restore focus to the element that opened the modal
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(
          'relative z-10 w-full max-w-lg rounded-lg bg-bg-secondary p-6 shadow-xl animate-[scale-in_0.2s_ease-out]',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1 text-text-secondary hover:bg-bg-tertiary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Title */}
        {title && (
          <h2 id="modal-title" className="mb-4 text-2xl font-semibold text-text-primary">
            {title}
          </h2>
        )}

        {/* Content */}
        <div className="text-text-secondary">{children}</div>
      </div>
    </div>
  );
};

Modal.displayName = 'Modal';

export { Modal };
