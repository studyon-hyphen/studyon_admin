/**
 * Generate PWA icons from SVG.
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install sharp (dev dependency)
 *
 * If sharp is not available, you can manually create icons:
 * 1. Open public/icon.svg in a browser
 * 2. Screenshot at 192x192 and 512x512
 * 3. Save as icon-192.png, icon-512.png, icon-maskable-192.png, icon-maskable-512.png
 */
import { readFileSync, writeFileSync } from 'fs';

try {
  const sharp = (await import('sharp')).default;
  const svg = readFileSync(new URL('../public/icon.svg', import.meta.url));

  const sizes = [192, 512];
  for (const size of sizes) {
    await sharp(svg).resize(size, size).png().toFile(
      new URL(`../public/icon-${size}.png`, import.meta.url).pathname
    );
    await sharp(svg).resize(size, size).png().toFile(
      new URL(`../public/icon-maskable-${size}.png`, import.meta.url).pathname
    );
    console.log(`Generated ${size}x${size} icons`);
  }
  console.log('Done!');
} catch (e) {
  console.log('sharp not installed. Install with: npm install -D sharp');
  console.log('Or manually create PNG icons from public/icon.svg');
  process.exit(1);
}
