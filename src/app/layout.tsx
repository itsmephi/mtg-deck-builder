import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { DeckProvider } from '@/hooks/useDeckManager';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Brew',
  description: 'A minimalist Magic: The Gathering deck builder.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Project Brew',
  appleWebApp: {
    capable: true,
    title: 'Brew',
    statusBarStyle: 'black-translucent',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icons/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icons/favicon-32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [{ url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
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
              // Keep in sync with THEME_COLORS in src/lib/theme.ts.
              var colors = { 'warm-stone': '#1c1917', 'zed-dark': '#282c34', light: '#faf7f2' };
              function resolve(pref) {
                if (pref === 'system') return mq.matches ? 'warm-stone' : 'light';
                return pref;
              }
              function apply(theme) {
                if (theme === 'warm-stone') delete document.documentElement.dataset.theme;
                else document.documentElement.dataset.theme = theme;
                var meta = document.querySelector('meta[name="theme-color"]');
                if (!meta) {
                  meta = document.createElement('meta');
                  meta.name = 'theme-color';
                  document.head.appendChild(meta);
                }
                meta.content = colors[theme];
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
        <AuthProvider>
          <DeckProvider>
            {children}
          </DeckProvider>
        </AuthProvider>
      </body>
    </html>
  );
}