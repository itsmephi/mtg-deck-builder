import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { DeckProvider } from '@/hooks/useDeckManager';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MTG Deck Builder',
  description: 'Minimalist MTG Deck Builder',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
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