/**
 * Main Layout
 * Layout for main application pages with navbar and footer
 */

import { Navbar, Footer } from '@/components/layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      {/* Main content - Hero overflows to navbar, other pages need padding */}
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
