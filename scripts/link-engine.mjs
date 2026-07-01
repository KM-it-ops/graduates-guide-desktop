#!/usr/bin/env node
/** Ensure engine/ exists — junction to sibling career-ops in dev, submodule in CI */
import { existsSync, symlinkSync, lstatSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = dirname(fileURLToPath(import.meta.url));
const engine = join(root, '..', 'engine');
const sibling = join(root, '..', '..', 'career-ops');

if (existsSync(engine)) {
  console.log('engine/ present');
  process.exit(0);
}

if (existsSync(sibling)) {
  try {
    symlinkSync(sibling, engine, 'junction');
    console.log('Linked engine/ -> career-ops');
  } catch (e) {
    console.warn('Could not link engine:', e.message);
  }
}
