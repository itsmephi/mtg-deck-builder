import type { MetadataRoute } from 'next';

// PWA web app manifest. Next.js App Router serves this at /manifest.webmanifest
// and links it automatically. Icons live in /public/icons (regenerate them from
// the SVG sources via `node assets/icons/generate.mjs`). theme/background colors
// match the Warm Stone surface-base (see THEME_COLORS in src/lib/theme.ts).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'The Brew Lab',
    short_name: 'Brew Lab',
    description: 'A minimalist Magic: The Gathering deck builder.',
    start_url: '/',
    display: 'standalone',
    background_color: '#1c1917',
    theme_color: '#1c1917',
    orientation: 'any',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
