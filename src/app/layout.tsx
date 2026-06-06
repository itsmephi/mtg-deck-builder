import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DeckProvider } from '@/hooks/useDeckManager';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Brew',
  description: 'Minimalist MTG Deck Builder',
};

// Explicit viewport so iPad/notched devices get safe-area insets (Next.js
// otherwise injects a default without viewport-fit). See ARCHITECTURE.md.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: `
          try {
            var t = localStorage.getItem('mtg-theme');
            if (t) document.documentElement.dataset.theme = t;
          } catch(e) {}
        `}} />
      </head>
      <body className={inter.className}>
        <DeckProvider>
          {children}
        </DeckProvider>
      </body>
    </html>
  );
}