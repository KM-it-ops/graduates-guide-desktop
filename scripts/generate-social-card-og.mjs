#!/usr/bin/env node
/**
 * Export landing/assets/og-card.svg → social-card-og.png (1200×630) for OG/Twitter.
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'landing/assets/og-card.svg');
const out = join(root, 'landing/assets/social-card-og.png');
const docsDir = join(root, 'docs/assets');
const docsOut = join(docsDir, 'social-card-og.png');

const svg = readFileSync(src, 'utf-8');
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 1200 },
});
const rendered = resvg.render();
const png = rendered.asPng();

writeFileSync(out, png);
mkdirSync(docsDir, { recursive: true });
writeFileSync(docsOut, png);

console.log(`Wrote ${out} (${rendered.width}×${rendered.height}, ${png.length} bytes)`);
console.log(`Wrote ${docsOut}`);
