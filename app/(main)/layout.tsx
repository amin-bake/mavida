/**
 * Main Layout
 * Layout for main application pages with navbar and footer
 */

import { Navbar, Footer } from '@/components/layout';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />

      {/* Main content with top padding to account for fixed navbar */}
      <main className="flex-1 pt-16">{children}</main>

      <Footer />
    </div>
  );
}
