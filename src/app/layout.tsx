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
          (function() {
            try {
              var mq = window.matchMedia('(prefers-color-scheme: dark)');
              function resolve(pref) {
                if (pref === 'system') return mq.matches ? 'warm-stone' : 'light';
                return pref;
              }
              function apply(theme) {
                if (theme === 'warm-stone') delete document.documentElement.dataset.theme;
                else document.documentElement.dataset.theme = theme;
              }
              function pref() {
                var v = localStorage.getItem('mtg-theme');
                return (v === 'warm-stone' || v === 'zed-dark' || v === 'light') ? v : 'system';
              }
              apply(resolve(pref()));
              // Live-follow the OS while preference is 'system'.
              mq.addEventListener('change', function() {
                if (pref() === 'system') apply(resolve('system'));
              });
            } catch(e) {}
          })();
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