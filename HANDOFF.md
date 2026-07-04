# Handoff — The Graduate's Guide (landing + public face)

**Date:** 2026-07-04  
**Repo:** [KM-it-ops/graduates-guide-desktop](https://github.com/KM-it-ops/graduates-guide-desktop)  
**Branch:** `main` (iterations 8–12)

---

## Paste this into a new conversation

```
Continue iterating on The Graduate's Guide public face (landing page, README, GitHub Pages).

Context: Read /HANDOFF.md in the repo first.

Workflow: Use the parallel-iteration-audit skill (.cursor/skills/parallel-iteration-audit/SKILL.md).
Launch 5–6 read-only subagents (brand, perf/a11y, SEO/Pages, git regression, app coherence, privacy).
Synthesize → max 8 fixes → one iteration → commit to main.

Live URL (after Pages deploy): https://km-it-ops.github.io/graduates-guide-desktop/landing/

Brand: PRODUCT.md — direct, honest, technical, calm. No hype. Phase 1 scope explicit.
Do not reintroduce: Google Fonts CDN, particles, cyber showboat, fake Send buttons, Linux binary claims.
```

---

## What this project is

**The Graduate's Guide** — privacy-first Tauri desktop app for a local markdown job-search vault.

| Shipped (Phase 1) | Stub / not offered |
|-------------------|-------------------|
| Vault import, Today, Queue, Follow-ups | Evaluate / Generate in-app (CLI only) |
| Script reader + Copy, Apply assist | In-app Send / auto-apply (by design) |

**Product truth source:** `PRODUCT.md`  
**Public copy source:** `README.md` + `landing/index.html` (must match)

---

## Current state (iteration 12)

### Landing page (`landing/index.html`)

- **Style:** Calm dark technical — system fonts, no third-party CDN, CSP meta tag
- **Tokens:** Landing CSS vars aligned with app (`--brand` cyan, `--accent` teal)
- **Copy:** Honest Phase 1 scope table, Copy-not-Send, privacy list aligned with README
- **Hero:** `readme-hero.png` from `hero-ui.svg` (Evaluate labeled “preview” in illustration)
- **CTA:** `Download v0.1.0` → macOS/Windows only; footer repeat CTA; Linux → build from source
- **A11y:** skip link, focusable `<main>`, keyboard-scrollable scope table, scroll-padding-top, secondary CTA underline
- **Perf:** hero `loading="lazy"` + `decoding="async"`; desktop preload retained
- **SEO:** enriched JSON-LD; root redirect OG parity in Pages workflow

### App UI bridge

- `src/lib/packRoutes.ts`: apply packs route to `/apply/` from Queue + Today
- `Layout.tsx`: Evaluate nav shows “preview” badge
- `src/styles/tokens.css`: `--brand`, `--brand-soft` (#22d3ee)

### Tooling

| Script | Purpose |
|--------|---------|
| `npm run privacy-audit` | No CDN on landing, CSP present, external link rel, Cargo.toml telemetry scan |
| `npm run privacy-audit:full` | Above + README asset paths exist |
| `npm run generate:social-card` | `og-card.svg` → `social-card-og.png` |
| `npm run generate:hero` | `hero-ui.svg` → `readme-hero.png` |

Pages workflow runs `privacy-audit:full` before deploy.

### Skill (reuse this workflow)

`.cursor/skills/parallel-iteration-audit/SKILL.md`

---

## Iteration arc (do not repeat mistakes)

| # | Commit theme | Keep | Drop |
|---|--------------|------|------|
| 8 | Calm truthful | Honest copy, a11y, no CDN | All animation layers |
| 9 | Batch polish | OG PNG, app brand bridge, skill | — |
| 10 | Pages + audit fixes | Linux CTA truth, preload hero | — |
| 11 | Truthful hero + audit fixes | hero-ui PNG, scoped privacy copy | cyber readme-hero.png |
| **12** | Apply assist + deploy gates | token alignment, CLI doc links, Pages audit gate | — |

---

## GitHub Pages

**Workflow:** `.github/workflows/pages.yml` — runs `privacy-audit:full` then builds on push to `main`.

**URLs (when deploy succeeds):**

- Landing: https://km-it-ops.github.io/graduates-guide-desktop/landing/
- Root redirect: https://km-it-ops.github.io/graduates-guide-desktop/

**Status (2026-07-04):** Deploy may still 404 until Settings → Pages → Source = **GitHub Actions**. Re-run failed deploy job after enabling.

**Until Pages is live:** HTML Preview  
https://htmlpreview.github.io/?https://raw.githubusercontent.com/KM-it-ops/graduates-guide-desktop/main/landing/index.html

---

## Deferred backlog (iteration 13+)

### Critical / high

- [ ] Confirm Pages deploy green; smoke-test hero PNG + favicon on live URL
- [ ] Version `0.1.0` hard-coded in landing JSON-LD + CTA — sync from `package.json` at build time
- [ ] `script-src 'unsafe-inline'` in landing CSP — tighten with hash or external schema file

### Medium

- [ ] IBM Plex fonts on landing (app uses @fontsource; landing uses system-ui) — self-host woff2 or accept drift
- [ ] WebP variant for `readme-hero.png` (LCP payload)
- [ ] Fix `.github/workflows/release.yml` if still noisy on push
- [ ] Generate nav entry for onboarding wizard in marketing copy

### Low

- [ ] Formal privacy policy page (marketing claims are strong but link nowhere)
- [ ] README shields.io third-party disclosure in privacy section

---

## Key files map

```
PRODUCT.md              Brand personality + anti-references
README.md               GitHub face; links to Pages URL
landing/index.html      Static marketing page (self-contained)
landing/assets/         hero PNG, og-card.svg, social-card-og.png
scripts/privacy-audit.mjs
.github/workflows/pages.yml
src/lib/packRoutes.ts   Apply vs script routing
src/components/Layout.tsx
```

---

## Success criteria for next session

1. Pages live at `/landing/` with working hero PNG and favicon
2. Parallel audit run → iteration 13 committed to `main`
3. No brand regressions (calm, honest, no CDN, no Linux binary overclaim)
4. README + landing + PRODUCT stay aligned

---

## Contact / ownership

**Publisher:** KM-it-ops  
**License:** MIT
