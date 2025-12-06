/**
 * Homepage
 * Main landing page with hero and movie rows
 */

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Temporary homepage content - will be replaced with hero and movie rows */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h1 className="text-5xl font-bold text-text-primary">
            Welcome to <span className="text-accent">Mavida</span>
          </h1>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            Your personal movie streaming platform. Discover and watch your favorite movies.
          </p>
          <div className="text-text-secondary space-y-4">
            <p>✅ Phase 1 Complete - Foundation & Setup</p>
            <p>🚧 Phase 2 In Progress - Layout & Navigation</p>
            <p className="text-sm mt-8 text-text-tertiary">
              Next: Hero section and movie rows coming soon!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
