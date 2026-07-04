/**
 * Rasterize icon.svg into the PNG sizes the Chrome Web Store needs.
 * Run: node icons/generate-icons.mjs   (from the extension folder)
 */
import sharp from 'sharp';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const dir = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(dir, 'icon.svg'));

for (const size of [16, 32, 48, 128]) {
  await sharp(svg, { density: 512 })
    .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toFile(join(dir, `icon-${size}.png`));
  console.log(`wrote icon-${size}.png`);
}
