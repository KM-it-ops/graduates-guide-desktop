#!/usr/bin/env node
/**
 * Export landing/assets/hero-ui.svg → readme-hero.png for README and landing hero.
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const src = join(root, 'landing/assets/hero-ui.svg');
const out = join(root, 'landing/assets/readme-hero.png');

const svg = readFileSync(src, 'utf-8');
const resvg = new Resvg(svg, {
  fitTo: { mode: 'width', value: 960 },
});
const rendered = resvg.render();
const png = rendered.asPng();

writeFileSync(out, png);
console.log(`Wrote ${out} (${rendered.width}×${rendered.height}, ${png.length} bytes)`);
