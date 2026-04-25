#!/usr/bin/env node
/**
 * Generate PNG PWA icons from the source SVGs in `public/`.
 *
 * Chrome's installability heuristic specifically requires PNG icons at
 * 192×192 and 512×512 (SVG icons in the manifest are not enough). We also
 * emit a 180×180 apple-touch icon since iOS prefers PNG.
 *
 * Run with `npm run icons` after editing the source SVGs.
 */
import { readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const here = dirname(fileURLToPath(import.meta.url));
const publicDir = join(here, '..', 'public');

const targets = [
  // Regular icon — used as the address-bar / tab favicon and the "any" purpose entry.
  { src: 'icon.svg', out: 'icon-192.png', size: 192 },
  { src: 'icon.svg', out: 'icon-512.png', size: 512 },
  // Apple touch icon. iOS rounds it; plain background is fine.
  { src: 'icon.svg', out: 'apple-touch-icon.png', size: 180 },
  // Maskable variant — Android adaptive icons crop into a circle / rounded square.
  { src: 'icon-maskable.svg', out: 'icon-maskable-192.png', size: 192 },
  { src: 'icon-maskable.svg', out: 'icon-maskable-512.png', size: 512 },
];

for (const { src, out, size } of targets) {
  const svgPath = join(publicDir, src);
  const outPath = join(publicDir, out);
  const svg = await readFile(svgPath);
  const png = await sharp(svg)
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9 })
    .toBuffer();
  await writeFile(outPath, png);
  console.log(`✓ ${out} (${size}×${size}, ${(png.length / 1024).toFixed(1)} KB)`);
}

console.log('\nDone. Commit the new PNGs in public/ alongside any SVG changes.');
