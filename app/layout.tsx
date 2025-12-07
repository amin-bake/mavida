import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { QueryProvider } from '@/components/providers/QueryProvider';
import { StoreHydration } from '@/components/providers';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastProvider } from '@/contexts/ToastContext';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Mavida - Your Personal Movie Streaming Platform',
  description: 'Stream and discover movies with a Netflix-inspired experience',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <QueryProvider>
            <StoreHydration>
              <ToastProvider>{children}</ToastProvider>
            </StoreHydration>
          </QueryProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
