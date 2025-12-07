/**
 * Main Layout
 * Layout for main application pages with navbar and footer
 */

import { Navbar, Footer } from '@/components/layout';
import { SkipToContent } from '@/components/ui';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Navbar />
      {/* Main content - Hero overflows to navbar, other pages need padding */}
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
