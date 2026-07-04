# Handoff — The Graduate's Guide (landing + public face)

**Date:** 2026-07-04  
**Repo:** [KM-it-ops/graduates-guide-desktop](https://github.com/KM-it-ops/graduates-guide-desktop)  
**Branch:** `main` (iterations 8–10 merged)

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

## Current state (iteration 10)

### Landing page (`landing/index.html`)

- **Style:** Calm dark technical — system fonts, no third-party CDN, CSP meta tag
- **Copy:** Honest Phase 1 scope table, Copy-not-Send, privacy list aligned with README
- **CTA:** `Download v0.1.0` → macOS/Windows only; Linux → build from source
- **Assets:** `landing/assets/readme-hero.png`, `social-card-og.png` (1200×630, generated from `og-card.svg`)
- **A11y:** skip link, `<main>`, focus-visible, semantic pipeline `<ol>`

### App UI bridge (iteration 9)

- `src/styles/tokens.css`: `--brand`, `--brand-soft` (#22d3ee)
- `src/components/Layout.tsx`: KM-it-ops sidebar wordmark
- `src/styles/global.css`: cyan active nav rail

### Tooling

| Script | Purpose |
|--------|---------|
| `npm run privacy-audit` | No CDN on landing, CSP present, external link rel |
| `npm run privacy-audit:full` | Above + README asset paths exist |
| `npm run generate:social-card` | `og-card.svg` → `social-card-og.png` |

### Skill (reuse this workflow)

`.cursor/skills/parallel-iteration-audit/SKILL.md`

Invoke: *"Run parallel audit on landing before iteration N"*

Six lenses + optional 7th artifact subagent. Cap implementation at **8 items per iteration**.

---

## Iteration arc (do not repeat mistakes)

| # | Commit theme | Keep | Drop |
|---|--------------|------|------|
| 1–4 | Brand, honest scope, polish, bold | Phase 1 truth, section structure | Generic timid layout |
| 5 | Aurora + Fraunces | Warmth | Wrong genre (cream/editorial) |
| 6–7 | Cyber Orbitron + particles | Dark palette, holo idea | Spectacle, mobile jank |
| **8** | Calm truthful | Honest copy, a11y, no CDN | All animation layers |
| **9** | Batch polish | OG PNG, app brand bridge, skill | — |
| **10** | Pages + audit fixes | Linux CTA truth, preload hero | — |
| **11** | Handoff + live fixes | JSON-LD OS fix, README OG PNG, Pages paths filter | — |

---

## GitHub Pages

**Workflow:** `.github/workflows/pages.yml` — runs on push to `main` when `landing/**`, `app-icon.svg`, or OG script changes.

**URLs (when deploy succeeds):**

- Landing: https://km-it-ops.github.io/graduates-guide-desktop/landing/
- Root redirect: https://km-it-ops.github.io/graduates-guide-desktop/

**Status (2026-07-04):** User enabled Pages, but deploy still returns **404** from `actions/deploy-pages`. Build job succeeds; deploy job fails.

**Troubleshooting (do on phone/desktop):**

1. [Settings → Pages](https://github.com/KM-it-ops/graduates-guide-desktop/settings/pages)
2. **Source must be:** `GitHub Actions` (not "Deploy from a branch")
3. If it already says GitHub Actions, toggle to branch and back, or wait ~5 min for propagation
4. Re-run: [Actions → Deploy landing → Re-run failed jobs](https://github.com/KM-it-ops/graduates-guide-desktop/actions/workflows/pages.yml)
5. Check repo **Settings → Actions → General → Workflow permissions** = "Read and write"

**Until Pages is live:** use HTML Preview  
https://htmlpreview.github.io/?https://raw.githubusercontent.com/KM-it-ops/graduates-guide-desktop/main/landing/index.html

**Verify live:** hero PNG, favicon, no console 404s at `/landing/`.

---

## Deferred backlog (from parallel audits — iteration 11+)

Prioritized for next agent:

### Critical / high

- [ ] Confirm Pages deploy green after re-run; smoke-test hero image + favicon on live URL
- [ ] Version `0.1.0` hard-coded in landing JSON-LD + CTA — consider sync from `package.json` at build time
- [ ] `script-src 'unsafe-inline'` in landing CSP (only needed for JSON-LD) — tighten with hash or external schema file

### Medium

- [ ] Landing `--accent` vs app `--accent` naming collision (landing cyan = app `--brand`) — rename landing CSS vars to match tokens
- [ ] IBM Plex fonts on landing (app uses @fontsource; landing uses system-ui) — self-host woff2 or accept drift
- [ ] WebP variant for `readme-hero.png` (LCP payload)
- [ ] `privacy-audit.mjs`: validate CSP directives (no unsafe-inline), scan Cargo.toml for telemetry deps
- [ ] Fix `.github/workflows/release.yml` failing on every push (tag-only intent? add `paths` filter)

### Low

- [ ] README social card could use `social-card-og.png` for OG-shaped preview
- [ ] EthicalBanner / landing manifest wording already aligned — keep in sync on edits

---

## Key files map

```
PRODUCT.md              Brand personality + anti-references
README.md               GitHub face; links to Pages URL
landing/index.html      Static marketing page (self-contained)
landing/assets/         hero PNG, og-card.svg, social-card-og.png
app-icon.svg            Favicon (landing uses ../app-icon.svg)
scripts/privacy-audit.mjs
scripts/generate-social-card-og.mjs
.github/workflows/pages.yml
.cursor/skills/parallel-iteration-audit/SKILL.md
src/styles/tokens.css   App design tokens
src/components/Layout.tsx
```

---

## Commands

```bash
# Dev app
npm install && npm run tauri:dev

# Audits
npm run privacy-audit
npm run privacy-audit:full
npm run generate:social-card

# Local landing preview (phone on same WiFi)
python3 -m http.server 8080
# → http://<lan-ip>:8080/landing/
```

---

## Git notes

- PR #1 merged (iterations 8–9)
- Iteration 10 merged directly to `main`
- Stale local branches may exist: `cursor/landing-iteration-8-*`, `cursor/landing-iteration-10-*` — safe to delete

---

## Success criteria for next session

1. Pages live at `/landing/` with working hero PNG and favicon
2. Parallel audit run → iteration 11 committed to `main`
3. No brand regressions (calm, honest, no CDN, no Linux binary overclaim)
4. README + landing + PRODUCT stay aligned

---

## Contact / ownership

**Publisher:** KM-it-ops  
**License:** MIT  
**Engine submodule:** career-ops fork (see README acknowledgments)
