#!/usr/bin/env node
/**
 * Privacy audit — Phase 1 must not declare http permissions or remote telemetry.
 */
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const auditReadme = process.env.PRIVACY_AUDIT_README === '1';
let failed = false;

function fail(message) {
  console.error(`FAIL: ${message}`);
  failed = true;
}

function isExternalHref(href) {
  return /^https?:\/\//i.test(href.trim());
}

function isSelfRelativeAsset(src) {
  const value = src.trim();
  if (!value) return false;
  if (/^https?:\/\//i.test(value)) return false;
  if (/^\/\//.test(value)) return false;
  if (/^data:/i.test(value)) return false;
  return true;
}

function parseTagAttrs(tag) {
  const attrs = {};
  const attrRe =
    /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g;
  let match;
  while ((match = attrRe.exec(tag)) !== null) {
    attrs[match[1].toLowerCase()] = match[3] ?? match[4] ?? match[5] ?? '';
  }
  return attrs;
}

function relTokens(rel) {
  return rel
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

function auditExternalLinkRel(html, fileLabel) {
  const anchorRe = /<a\b[^>]*>/gi;
  let match;
  while ((match = anchorRe.exec(html)) !== null) {
    const attrs = parseTagAttrs(match[0]);
    const href = attrs.href ?? '';
    if (!href || href.startsWith('#')) continue;
    if (/^(mailto:|tel:|javascript:)/i.test(href)) continue;
    if (!isExternalHref(href)) continue;

    const rel = relTokens(attrs.rel ?? '');
    if (!rel.includes('noopener')) {
      fail(`${fileLabel}: external link missing rel="noopener" (href=${href})`);
    }
    if (!rel.includes('noreferrer')) {
      fail(`${fileLabel}: external link missing rel="noreferrer" (href=${href})`);
    }
  }
}

function auditImgSrcSelfContained(html, fileLabel) {
  const imgRe = /<img\b[^>]*>/gi;
  let match;
  while ((match = imgRe.exec(html)) !== null) {
    const attrs = parseTagAttrs(match[0]);
    const src = attrs.src ?? '';
    if (!src) {
      fail(`${fileLabel}: <img> missing src attribute`);
      continue;
    }
    if (!isSelfRelativeAsset(src)) {
      fail(`${fileLabel}: <img> src must be relative/self (found ${src})`);
    }
  }
}

function collectSrcsetUrls(srcset) {
  return srcset
    .split(',')
    .map((entry) => entry.trim().split(/\s+/)[0])
    .filter(Boolean);
}

function collectLocalAssetRefs(markdown, fileLabel) {
  const refs = [];

  const mdImgRe = /!\[[^\]]*\]\(([^)]+)\)/g;
  let match;
  while ((match = mdImgRe.exec(markdown)) !== null) {
    refs.push({ path: match[1].trim(), source: `${fileLabel} markdown image` });
  }

  for (const tagRe of [/<img\b[^>]*>/gi, /<source\b[^>]*>/gi]) {
    tagRe.lastIndex = 0;
    while ((match = tagRe.exec(markdown)) !== null) {
      const attrs = parseTagAttrs(match[0]);
      if (attrs.src) {
        refs.push({ path: attrs.src.trim(), source: `${fileLabel} <img src>` });
      }
      if (attrs.srcset) {
        for (const url of collectSrcsetUrls(attrs.srcset)) {
          refs.push({ path: url, source: `${fileLabel} srcset` });
        }
      }
    }
  }

  return refs;
}

function auditReadmeAssetPaths(readmePath) {
  if (!existsSync(readmePath)) return;

  const readme = readFileSync(readmePath, 'utf-8');
  const fileLabel = 'README.md';

  for (const { path: rawPath, source } of collectLocalAssetRefs(readme, fileLabel)) {
    const path = rawPath.replace(/^<|>$/g, '').split(/[#?]/)[0].trim();
    if (!path || isExternalHref(path) || path.startsWith('#')) continue;

    const resolved = join(root, path);
    if (!existsSync(resolved)) {
      fail(`${source}: missing asset ${path}`);
    }
  }
}

const confPath = join(root, 'src-tauri', 'tauri.conf.json');
const conf = JSON.parse(readFileSync(confPath, 'utf-8'));
const csp = conf.app?.security?.csp || '';
if (/https?:\/\//.test(csp) && !/ipc\.localhost/.test(csp)) {
  fail('CSP allows remote URLs');
}

const capPath = join(root, 'src-tauri', 'capabilities', 'default.json');
if (existsSync(capPath)) {
  const caps = readFileSync(capPath, 'utf-8');
  if (/http:allow|https:allow|http:default/.test(caps)) {
    fail('capabilities grant HTTP');
  }
}

const pkg = readFileSync(join(root, 'package.json'), 'utf-8');
if (/sentry|analytics|segment|mixpanel/i.test(pkg)) {
  fail('telemetry dependency in package.json');
}

const cargoPath = join(root, 'src-tauri', 'Cargo.toml');
if (existsSync(cargoPath)) {
  const cargo = readFileSync(cargoPath, 'utf-8');
  if (/sentry|analytics|segment|mixpanel|posthog|amplitude/i.test(cargo)) {
    fail('telemetry dependency in src-tauri/Cargo.toml');
  }
}

const landingPath = join(root, 'landing', 'index.html');
if (existsSync(landingPath)) {
  const landing = readFileSync(landingPath, 'utf-8');
  const blockedHosts =
    /fonts\.googleapis\.com|fonts\.gstatic\.com|google-analytics\.com|googletagmanager\.com|cdn\.jsdelivr\.net|unpkg\.com|cdnjs\.cloudflare\.com/i;
  if (blockedHosts.test(landing)) {
    fail('landing page loads blocked third-party CDN/analytics hosts');
  }
  if (!/<meta[^>]+Content-Security-Policy/i.test(landing)) {
    fail('landing page missing Content-Security-Policy meta tag');
  }

  auditExternalLinkRel(landing, 'landing/index.html');
  auditImgSrcSelfContained(landing, 'landing/index.html');

  const jsonLdMatch = landing.match(
    /<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/i,
  );
  if (jsonLdMatch) {
    try {
      const schema = JSON.parse(jsonLdMatch[1]);
      const os = schema.operatingSystem ?? '';
      if (/linux/i.test(os)) {
        fail(
          'landing JSON-LD operatingSystem must not claim Linux binaries (build-from-source only)',
        );
      }
    } catch {
      fail('landing JSON-LD block is not valid JSON');
    }
  } else {
    fail('landing page missing JSON-LD SoftwareApplication block');
  }

  const cspMatch = landing.match(
    /Content-Security-Policy[^>]+content="([^"]+)"/i,
  );
  if (cspMatch && /script-src[^;]*'unsafe-inline'/.test(cspMatch[1])) {
    console.warn(
      'WARN: landing CSP uses script-src unsafe-inline (needed for JSON-LD until hashed)',
    );
  }
}

if (auditReadme) {
  auditReadmeAssetPaths(join(root, 'README.md'));
}

if (failed) process.exit(1);
console.log(
  `Privacy audit passed (Phase 1: no network, no telemetry deps, landing self-contained${auditReadme ? ', README assets verified' : ''})`,
);
