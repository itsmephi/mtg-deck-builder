// Regenerate all PWA/favicon raster assets from the SVG sources in this folder.
// Run:  node assets/icons/generate.mjs
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const out = join(here, '..', '..', 'public', 'icons');
const src = (name) => join(here, name);

const jobs = [
  ['icon.svg', 'icon-192.png', 192],
  ['icon.svg', 'icon-512.png', 512],
  ['icon-maskable.svg', 'icon-maskable-192.png', 192],
  ['icon-maskable.svg', 'icon-maskable-512.png', 512],
  ['apple-icon.svg', 'apple-touch-icon.png', 180],
  ['icon.svg', 'favicon-32.png', 32],
  ['icon.svg', 'favicon-16.png', 16],
];

await mkdir(out, { recursive: true });

for (const [from, to, size] of jobs) {
  await sharp(src(from), { density: 384 })
    .resize(size, size, { fit: 'cover' })
    .png()
    .toFile(join(out, to));
  console.log(`✓ ${to} (${size}px)`);
}

// Multi-resolution favicon.ico (16 + 32 + 48) lives at the app-router root.
const icoSizes = [16, 32, 48];
const buffers = await Promise.all(
  icoSizes.map((s) =>
    sharp(src('icon.svg'), { density: 384 }).resize(s, s, { fit: 'cover' }).png().toBuffer()
  )
);
const { default: pngToIco } = await import('png-to-ico');
const ico = await pngToIco(buffers);
const { writeFile } = await import('node:fs/promises');
await writeFile(join(here, '..', '..', 'src', 'app', 'favicon.ico'), ico);
console.log('✓ src/app/favicon.ico (16/32/48)');
