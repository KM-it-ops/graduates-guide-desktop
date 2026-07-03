#!/usr/bin/env node
/**
 * Privacy audit — Phase 1 must not declare http permissions or remote telemetry.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
let failed = false;

const confPath = join(root, 'src-tauri', 'tauri.conf.json');
const conf = JSON.parse(readFileSync(confPath, 'utf-8'));
const csp = conf.app?.security?.csp || '';
if (/https?:\/\//.test(csp) && !/ipc\.localhost/.test(csp)) {
  console.error('FAIL: CSP allows remote URLs');
  failed = true;
}

const capPath = join(root, 'src-tauri', 'capabilities', 'default.json');
if (existsSync(capPath)) {
  const caps = readFileSync(capPath, 'utf-8');
  if (/http:allow|https:allow|http:default/.test(caps)) {
    console.error('FAIL: capabilities grant HTTP');
    failed = true;
  }
}

const pkg = readFileSync(join(root, 'package.json'), 'utf-8');
if (/sentry|analytics|segment|mixpanel/i.test(pkg)) {
  console.error('FAIL: telemetry dependency in package.json');
  failed = true;
}

const landingPath = join(root, 'landing', 'index.html');
if (existsSync(landingPath)) {
  const landing = readFileSync(landingPath, 'utf-8');
  const blockedHosts =
    /fonts\.googleapis\.com|fonts\.gstatic\.com|google-analytics\.com|googletagmanager\.com|cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com/i;
  if (blockedHosts.test(landing)) {
    console.error('FAIL: landing page loads blocked third-party CDN/analytics hosts');
    failed = true;
  }
  if (!/<meta[^>]+Content-Security-Policy/i.test(landing)) {
    console.error('FAIL: landing page missing Content-Security-Policy meta tag');
    failed = true;
  }
}

if (failed) process.exit(1);
console.log('Privacy audit passed (Phase 1: no network, no telemetry deps, landing self-contained)');
