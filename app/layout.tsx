import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Topo Athletic Shoe Finder",
  description:
    "Find your perfect Topo Athletic shoe in 60 seconds. Answer 6 quick questions and get personalized recommendations.",
  openGraph: {
    title: "Topo Athletic Shoe Finder",
    description: "Find your perfect Topo Athletic shoe in 60 seconds.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <header className="border-b border-warm-gray-200 bg-white px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between">
            <a href="/finder" aria-label="Topo Athletic Shoe Finder home">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/topo-logo-horizontal.jpg"
                alt="Topo Athletic"
                className="h-8 w-auto md:h-10"
              />
            </a>
            <span className="rounded-full bg-navy/10 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy">Shoe Finder</span>
          </div>
        </header>
        <main id="main-content">{children}</main>
        <footer className="mt-6 border-t border-warm-gray-200 bg-warm-gray-100 px-4 py-6">
          <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 text-center text-sm text-warm-gray-600">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/topo-logo-stacked.jpeg"
              alt="Topo Athletic"
              className="h-12 w-auto opacity-60"
            />
            <p>&copy; {new Date().getFullYear()} Topo Athletic. All rights reserved.</p>
            <a
              href="https://www.topoathletic.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal hover:text-teal-dark underline"
            >
              topoathletic.com
            </a>
          </div>
        </footer>
      </body>
    </html>
  );
}
