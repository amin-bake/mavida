/**
 * Footer Component
 * Application footer with links and information
 */

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card mt-auto">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 py-16">
        {/* Bottom Section */}
        <div className="mt-16 pt-8 border-t-2 border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6 sm:gap-0">
            <p className="text-base text-muted-foreground bg-">
              © {currentYear} Mavida. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
