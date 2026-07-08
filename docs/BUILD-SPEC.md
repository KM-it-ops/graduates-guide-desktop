# The Graduate's Guide — Build Specification

Greenfield spec for building **The Graduate's Guide** from scratch.

---

## 1. Product Summary

| Field | Value |
|---|---|
| **Name** | The Graduate's Guide |
| **Publisher** | KM-it-ops |
| **Type** | Privacy-first desktop job-search cockpit |
| **Platform** | macOS + Windows (Tauri 2) |
| **License** | MIT |
| **App identifier** | `guide.graduates.desktop` |

**One-liner:** A calm desktop shell around a **local markdown vault** — daily missions, ranked queue, paste-ready scripts. **Copy in app; you Send on the portal or in your mail client.**

**Users:** Job seekers who want structured scripts and daily focus without cloud accounts, hosted CVs, or auto-apply bots.

**Brand personality:** Direct, honest, technical, calm. No hype. Ship scope is explicit in UI and marketing.

**Do not build:**
- Fake in-app Send buttons
- Auto-apply bots
- Hosted CV storage
- Telemetry / analytics
- SaaS hero metrics
- Real employer names in fixtures or mocks
- Linux binary claims (document build-from-source only)

---

## 2. Strategic Principles

1. **Copy in app; Send outside** — clipboard only, never in-app email or submit.
2. **Local vault ownership** — user picks a folder; all data is plain files on disk.
3. **Marketing matches shipped features** — unfinished features labeled clearly (e.g. "preview").
4. **Engine sidecar** — a Node.js evaluation/script engine runs as a bundled subprocess; the Rust shell spawns it.
5. **No network by default** — no HTTP permissions, no telemetry, no required accounts.

---

## 3. Build Phases

Define phases up front. Ship the first phase completely before marketing later phases.

### Phase 1 — Core (ship first)

- Vault import (folder picker)
- New-vault onboarding wizard
- Today screen (daily missions, max 5)
- Queue screen (ranked applications)
- Follow-ups screen
- Script reader with Copy buttons
- Apply assist (script + open job portal in system browser)
- Settings (theme, vault path, engine health check, tracker note updates)
- Static landing page + GitHub Pages deploy
- Privacy audit tooling

### Phase 2 — Evaluate (preview UI, wire later)

- Evaluate offer screen (job URL input)
- BYOK API keys stored in OS keychain
- Headless evaluate via engine (deferred until engine integration is ready)

### Phase 3 — Generate (preview UI, wire later)

- Generate script packs: apply, outreach, interview, followup, negotiate
- PDF export path via engine

### Phase 4 — Deferred

- Crash report opt-in (save preference locally; no reporter until explicitly built)
- Formal privacy policy page

### Never (by design)

- In-app Send / auto-apply
- Cloud accounts
- Hosted CV storage
- Telemetry

---

## 4. Tech Stack

### Frontend

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Router | react-router-dom 7 |
| Build | Vite 6 |
| Markdown | react-markdown + remark-gfm |
| Fonts | @fontsource/ibm-plex-sans, @fontsource/ibm-plex-mono (bundled, no CDN) |
| Tests | Vitest |

### Desktop shell

| Layer | Choice |
|---|---|
| Shell | Tauri 2 |
| Language | Rust (edition 2021) |
| Plugins | dialog, fs, shell, clipboard-manager |
| Secrets | `keyring` crate → OS keychain |
| App config | `~/.config/graduates-guide/config.json` |

### Engine (bundled sidecar)

| Layer | Choice |
|---|---|
| Runtime | Node.js (system `node` / `node.exe`) |
| API entry | `engine/graduates-guide-desktop-api.mjs` |
| Vault env | `CAREER_OPS_VAULT=/path/to/vault` |
| Override env | `GG_ENGINE_PATH`, `GG_NODE_PATH` |

The engine can be a git submodule, vendored copy, or separate package. It must implement the API contract in §7.

### Marketing

| Layer | Choice |
|---|---|
| Landing | Static `landing/index.html` |
| Deploy | GitHub Pages via Actions |
| Assets | Self-hosted PNG/SVG only — no third-party CDN fonts or scripts |

---

## 5. Architecture

```
┌─────────────────────────────────────────────────────────┐
│  React UI (Vite)                                        │
│  Routes: /today, /queue, /script/*, /apply/*, etc.      │
└────────────────────┬────────────────────────────────────┘
                     │ Tauri invoke()
┌────────────────────▼────────────────────────────────────┐
│  Rust backend                                         │
│  - App config (vault path, theme)                     │
│  - Vault file read/write (allowlist)                  │
│  - OS keychain (API keys, crash opt-in)                 │
│  - EngineService → spawns Node sidecar                  │
└────────────────────┬────────────────────────────────────┘
                     │ node graduates-guide-desktop-api.mjs <cmd>
┌────────────────────▼────────────────────────────────────┐
│  Node engine (bundled in app resources)               │
│  Commands: health, daily, queue, pack-meta,           │
│            followups, tracker-update-note             │
└────────────────────┬────────────────────────────────────┘
                     │ reads/writes
┌────────────────────▼────────────────────────────────────┐
│  User vault (local folder on disk)                    │
│  cv.md, config/, data/, interview-prep/, modes/, etc. │
└─────────────────────────────────────────────────────────┘
```

### Engine path resolution (implement in Rust)

1. `GG_ENGINE_PATH` environment variable
2. `./engine/` relative to dev working directory
3. `engine/` next to the packaged executable
4. `resources/engine/` inside the Tauri bundle

### Tauri window defaults

- Title: `The Graduate's Guide`
- Size: 1200×800
- Min size: 900×600
- Resizable: yes

---

## 6. Vault Data Model

The vault is a folder the user owns. Plain markdown and YAML files. Compatible with career-ops-style layouts.

### Directory layout

```
vault/
├── vault.json              # App metadata (written on first import)
├── cv.md                   # User CV
├── config/
│   └── profile.yml         # Name, email, targets, salary range
├── modes/
│   └── _profile.md         # Guide profile flags
├── data/
│   ├── applications.md     # Tracker table (source of truth)
│   ├── follow-ups.md       # Follow-up cadence data
│   └── daily-mission-YYYY-MM-DD.md   # Generated daily missions
└── interview-prep/
    ├── *-apply.md          # Apply script packs
    ├── *-interview.md      # Interview prep packs
    └── *-followup.md       # Follow-up scripts
```

### vault.json

Written on vault import. Metadata only — safe to gitignore.

```json
{
  "version": 1,
  "appVersion": "<app-version>",
  "engineVersion": "<engine-version>",
  "importedAt": "<ISO-8601>",
  "lastOpenedAt": "<ISO-8601>"
}
```

Update `lastOpenedAt` on each vault open.

### applications.md (tracker)

Markdown table — source of truth for the queue:

| # | Date | Company | Role | Score | Status | PDF | Report | Notes |
|---|------|---------|------|-------|--------|-----|--------|-------|

- **Notes column:** markdown links to script packs, e.g. `[apply](../interview-prep/foo-apply.md)`
- **Status values:** Evaluated, Interview, Applied, Offer, Skip, Rejected
- **Score format:** e.g. `4.0/5`

### Script packs (`interview-prep/*.md`)

Multi-part markdown documents:

```markdown
# Company — Apply Script

# PART 0 — Decoder
Plain English decoder for the portal.

# PART 1 — Checklist
- [ ] Step 1

# PART 2 — Verbatim scripts
```
Dear hiring team,
I am applying for...
```

# PART 5 — Cheat sheet
1. Paste cover letter
2. Upload PDF
3. You click Submit
```

**Part numbering:**

| Part | Label in UI |
|---|---|
| 0 | Decoder |
| 1–4 | Part N |
| 5 | Cheat sheet |

**Metadata to extract from content:**

- `**Job URL:** https://...` — used by Apply assist to open the portal
- Company / role from filename or inline headings

### Daily missions (`data/daily-mission-*.md`)

```markdown
# Daily Mission — 2026-06-25

> **If you only do one thing:** Interview prep: Sample Bank

## Missions (max 5)

### Mission 1 — Title (~30 min)
| | |
|---|---|
| **Who** | YOU read aloud |
| **Action** | Open Part 5 in `interview-prep/foo.md` |
| **Done when** | You have read Part 2 aloud |
```

Engine parses missions and returns structured JSON (see §7).

### profile.yml

```yaml
name: Your Name
email: you@example.com
location: City, Country
timezone: America/New_York

targets:
  roles:
    - Junior SOC Analyst
  salary_min: 70000
  salary_max: 95000
  currency: USD
```

### Onboarding templates

Ship starter templates for:

- `cv.md` — basic CV skeleton
- `config/profile.yml` — profile fields above
- `modes/_profile.md` — guide flags, e.g. `graduates_guide.enabled: true`

---

## 7. Engine API Contract

Build or bundle a Node CLI that the Rust shell invokes.

**Invocation:**

```bash
CAREER_OPS_VAULT=/path/to/vault node engine/graduates-guide-desktop-api.mjs <command> [args...]
```

**Output:** JSON on stdout. Errors on stderr or as `{ "error": "message" }`.

### Commands

| Command | Args | Response shape |
|---|---|---|
| `health` | — | `{ ok, vault, engine, doctor: { onboardingNeeded, missing[], warnings[] }, verify: { ok, errors[], warnings[] } }` |
| `daily` | — | `{ ok, date, oneThing, path, missions: [{ priority, title, time, who, action, done, scriptPaths?[] }] }` |
| `queue` | — | `{ ok, entries: [{ num, date, company, role, score, status, notes, scoreNum, packLinks[] }], count }` |
| `pack-meta` | `relPath` | `{ ok, path, name, meta: {}, parts: [{num, title}], content?, partsFull?: [{num, title, content}], error? }` |
| `followups` | — | `{ entries: [{ num, company, role, urgency?, nextFollowupDate? }], error? }` |
| `tracker-update-note` | `num` `notes` | Updates notes on an **existing** row in `applications.md` |

`packLinks` and `scriptPaths` are vault-relative paths like `interview-prep/foo-apply.md`.

---

## 8. Tauri Backend

### Commands to implement

| Command | Params | Returns | Notes |
|---|---|---|---|
| `get_config` | — | `AppConfig` | |
| `set_vault_path` | `path: string` | `AppConfig` | Also write/update `vault.json` |
| `pick_vault_folder` | — | `string \| null` | Native folder dialog |
| `set_theme` | `theme: string` | `AppConfig` | `"dark"` or `"light"` |
| `engine_command` | `command, args[]` | `serde_json::Value` | Spawn Node sidecar |
| `read_vault_file` | `relPath` | `string` | Canonicalize; reject path traversal |
| `write_vault_file_cmd` | `relPath, content` | `()` | Allowlist only (see below) |
| `store_api_key` | `provider, key` | `()` | OS keychain |
| `get_api_key` | `provider` | `string \| null` | |
| `set_crash_reports` | `enabled: bool` | `()` | Keychain preference |
| `get_crash_reports` | — | `bool` | Default `false` |

### App config

Path: `~/.config/graduates-guide/config.json`

```json
{
  "vault_path": "/Users/you/job-hunt",
  "theme": "dark",
  "engine_version": "<pinned-engine-version>",
  "app_version": "<app-version>"
}
```

### Vault write allowlist

Only these paths may be written from the app:

- `cv.md`
- `config/*`
- `modes/_profile.md`
- `data/applications.md`
- `data/follow-ups.md`

Reject any path that escapes the vault root after canonicalization.

### Keychain

Service name: `graduates-guide-desktop`

| Key | Purpose |
|---|---|
| `api-key-openai` | BYOK evaluate/generate |
| `api-key-anthropic` | BYOK evaluate/generate |
| `api-key-gemini` | BYOK evaluate/generate |
| `crash-reports-opt-in` | `"true"` / `"false"` |

Never store API keys in vault files.

### Tauri capabilities (no network)

```json
{
  "permissions": [
    "core:default",
    "dialog:default",
    "fs:default",
    "shell:allow-spawn",
    "shell:allow-execute",
    "clipboard-manager:default"
  ]
}
```

### Content Security Policy

```
default-src 'self';
style-src 'self' 'unsafe-inline';
font-src 'self' data:;
img-src 'self' data:;
connect-src 'self' ipc: http://ipc.localhost https://ipc.localhost;
```

Bundle the engine in Tauri resources:

```json
"resources": { "../engine": "engine" }
```

---

## 9. Frontend Routes

| Route | Screen | Requires vault | Phase |
|---|---|---|---|
| `/` | Redirect → `/today` or `/vault/import` | — | 1 |
| `/vault/import` | Vault import | No | 1 |
| `/onboarding` | 4-step new-vault wizard | No | 1 |
| `/today` | Daily missions | Yes | 1 |
| `/queue` | Application queue | Yes | 1 |
| `/followups` | Follow-up nudges | Yes | 1 |
| `/script/*` | Script reader | Yes | 1 |
| `/apply/:packPath` | Apply assist | Yes | 1 |
| `/settings` | Settings | No | 1 |
| `/evaluate` | Evaluate offer | Yes | 2 preview |
| `/generate/:packType` | Generate pack | Yes | 3 preview |

**Pack routing:**

- Filename contains `apply` (case-insensitive) → `/apply/{encoded-path}`
- Otherwise → `/script/{encoded-path}`

Gate vault-required routes: redirect to `/vault/import` if no vault is configured.

---

## 10. Screen Specifications

### 10.1 Vault import

- Native folder picker
- On select: save vault path → run `health` command
- Show non-blocking warnings for missing files
- Redirect to `/today`
- Copy: *"All data stays on your machine — no cloud, no account."*

### 10.2 Onboarding (4 steps)

1. Choose vault folder (empty or new)
2. Edit `cv.md` from template
3. Edit `config/profile.yml` from template
4. Edit `modes/_profile.md` from template

On finish: write allowed files → set vault path → navigate to `/today`.

### 10.3 Today

- Load via `daily` engine command
- Hero block: **"If you only do one thing"** + `oneThing` text
- Up to 5 mission cards
- Each card: title, time estimate, who, action, done-when
- Per-mission checkbox → persist in `localStorage` as `gg-mission-checks-{date}`
- If mission has `scriptPaths[0]`:
  - Apply pack → **Apply assist** + **Open script** links
  - Other packs → **Open script** only

### 10.4 Queue

- Table columns: #, Company/Role, Score, Status, Packs
- Click row → open primary pack (apply or script route)
- Status badges color-coded by status

### 10.5 Script reader

- Load pack via `pack-meta` command
- Part tabs across top; default to Part 5 (cheat sheet) if present, else first part
- Extract copyable blocks from:
  - Fenced code blocks (```) longer than ~20 chars
  - Blockquotes (`>`) longer than ~20 chars
- Each block: **Copy** button → system clipboard + toast *"Copied to clipboard"*
- Render remaining markdown below copy blocks
- Show dial-in callout if `meta.dialIn` is set

### 10.6 Apply assist

- Top: title, ethical copy, optional **Open job portal** button
- Extract `**Job URL:**` from pack content → `window.open(url, '_blank', 'noopener,noreferrer')`
- Link to full-width script reader
- Embed script reader for the same pack below
- Copy: *"Script in-app · portal in your browser · **you click Submit**"*

### 10.7 Follow-ups

- Load via `followups` engine command
- Card per entry: company, role, urgency, next follow-up date
- Link to follow-up script pack in `interview-prep/`

### 10.8 Settings

- Vault path display + change folder
- Theme toggle: dark / light (set `data-theme` on `<html>`)
- **Run health check** → display engine/vault status, errors, warnings
- Tracker note update: row number + notes text → `tracker-update-note` (existing rows only)
- Crash reports opt-in checkbox (off by default; no reporter required in early phases)
- Link to onboarding wizard
- Privacy statement: no network, no telemetry, vault is plain files

### 10.9 Evaluate (Phase 2 preview)

- Job URL input
- **Evaluate (BYOK)** button — show message directing user to CLI/engine until headless path is wired
- API key section: provider select (openai / anthropic / gemini) + save to keychain
- Nav badge: **preview**

### 10.10 Generate pack (Phase 3 preview)

Pack types and engine module names:

| Route param | Title | Engine module |
|---|---|---|
| `apply` | Apply script pack | `apply-script-pack` |
| `outreach` | Outreach script pack | `outreach-script-pack` |
| `interview` | Interview script pack | `interview-script-prep` |
| `followup` | Follow-up script pack | `followup-script-pack` |
| `negotiate` | Negotiation script pack | `negotiation-script-pack` |

**Generate (BYOK)** → alert with CLI fallback until wired.

---

## 11. UI Layout

```
┌──────────────────────────────────────────────────────────────┐
│ ETHICAL BANNER: Copy in the app. You send in mail/portal.  │
├────────────┬─────────────────────────────────────────────────┤
│ SIDEBAR    │ MAIN CONTENT                                    │
│            │                                                 │
│ KM-it-ops  │  <h1> Page title                                │
│ Graduate's │  ...                                            │
│ Guide      │                                                 │
│            │                                                 │
│ Today      │                                                 │
│ Queue      │                                                 │
│ Follow-ups │                                                 │
│ Evaluate   │                                                 │
│  [preview] │                                                 │
│ Settings   │                                                 │
│            │                                                 │
│ — or —     │                                                 │
│ Import     │                                                 │
│ vault      │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

### Persistent ethical banner

> Copy in the app. **You send in your mail client or job portal.** No auto-apply.

---

## 12. Design System

### Color tokens

```css
:root {
  --navy: #0f172a;
  --navy-mid: #1e293b;
  --slate: #334155;
  --muted: #64748b;
  --paper: #f8fafc;
  --white: #ffffff;
  --primary: #1d4ed8;
  --accent: #0f766e;
  --accent-light: #ccfbf1;
  --brand: #22d3ee;
  --brand-soft: #67e8f9;
  --success: #15803d;
  --warning: #b45309;
  --warning-light: #fef3c7;
  --danger: #b91c1c;
  --danger-light: #fee2e2;
  --border: #e2e8f0;
  --script-bg: #f1f5f9;
  --font-sans: 'IBM Plex Sans', system-ui, sans-serif;
  --font-mono: 'IBM Plex Mono', monospace;
  --radius: 6px;
}
```

### Themes

**Dark** (`data-theme="dark"`):

- `--bg: var(--navy)`
- `--bg-elevated: var(--navy-mid)`
- `--text: #f1f5f9`
- `--text-muted: #94a3b8`

**Light** (`data-theme="light"`):

- `--bg: var(--paper)`
- `--bg-elevated: var(--white)`
- `--text: var(--navy)`
- `--text-muted: var(--muted)`

### Typography

- Base: 15px, line-height 1.5
- Sidebar brand: IBM Plex Mono, uppercase publisher label in `--brand`

### Shared components to build

| Component | Responsibility |
|---|---|
| `Layout` | Ethical banner + sidebar nav + `<Outlet />` |
| `EthicalBanner` | Copy-not-Send message |
| `MissionCard` | Today mission with checkbox and script links |
| `QueueRow` | Clickable table row + status badge |
| `ScriptBlock` | Preformatted text + Copy button |
| `CopyToast` | Transient "Copied to clipboard" feedback |
| `StatusBadge` | Color-coded application status |

### Status badge mapping

| Status | CSS class |
|---|---|
| Interview | `status-interview` |
| Offer | `status-offer` |
| Applied | `status-applied` |
| Evaluated | `status-evaluated` |
| Skip | `status-skip` |
| Rejected | `status-rejected` |

---

## 13. TypeScript Types

```typescript
interface AppConfig {
  vault_path: string | null;
  theme: string;
  engine_version: string;
  app_version: string;
}

interface Mission {
  priority: number;
  title: string;
  time: string;
  who: string;
  action: string;
  done: string;
  scriptPaths?: string[];
}

interface DailyResponse {
  ok: boolean;
  date: string;
  oneThing: string;
  path: string;
  missions: Mission[];
}

interface QueueEntry {
  num: number;
  date: string;
  company: string;
  role: string;
  score: string;
  status: string;
  notes: string;
  scoreNum: number;
  packLinks: string[];
}

interface QueueResponse {
  ok: boolean;
  entries: QueueEntry[];
  count: number;
}

interface PackPart {
  num: number;
  title: string;
  content?: string;
}

interface PackMetaResponse {
  ok: boolean;
  path: string;
  name: string;
  meta: Record<string, string>;
  parts: PackPart[];
  content?: string;
  partsFull?: PackPart[];
  error?: string;
}

interface HealthResponse {
  ok: boolean;
  vault: string;
  engine: string;
  doctor: {
    onboardingNeeded: boolean;
    missing: string[];
    warnings: string[];
  };
  verify: {
    ok: boolean;
    errors: string[];
    warnings: string[];
  };
}

interface ParsedPart {
  num: number;
  title: string;
  content: string;
}
```

### Part parsing (frontend)

Parse markdown headings matching:

```
/^#{1,2}\s*(?:PART|Part)\s+(\d+)\s*[—–-]?\s*(.*)$/i
```

UI labels: Part 0 → "Decoder", Part 5 → "Cheat sheet", else `Part N`.

---

## 14. Privacy & Security

### Guarantees to uphold

| Claim | Implementation |
|---|---|
| Vault on disk | User picks folder; app never uploads it |
| No accounts | No login, no cloud identity |
| No telemetry | No HTTP in Phase 1; no analytics dependencies |
| API keys | OS keychain only |
| Crash reports | Opt-in preference only until a reporter exists |
| Job portals | User opens in system browser; submit happens outside the app |

### Privacy audit script

Build `scripts/privacy-audit.mjs` that fails CI if:

- Landing page loads third-party CDN fonts or scripts
- CSP meta tag is missing from landing HTML
- External `<a href="https://...">` links lack `rel="noopener noreferrer"`
- `<img src>` points off-origin
- Rust/Cargo deps include known telemetry crates

Run via `npm run privacy-audit` in CI and before Pages deploy.

---

## 15. Testing

### Unit tests (Vitest)

- Part parsing from markdown (`parseParts`)
- Status → CSS class mapping
- Pack routing: apply filename → `/apply/...`, else `/script/...`

### Integration smoke (CI)

Against a **synthetic fixture vault** (no real employer data):

```bash
CAREER_OPS_VAULT=./fixtures/sanitized-vault node engine/graduates-guide-desktop-api.mjs daily
CAREER_OPS_VAULT=./fixtures/sanitized-vault node engine/graduates-guide-desktop-api.mjs queue
```

### Fixture vault

Ship `fixtures/sanitized-vault/` with fictional companies only (e.g. "Example Corp", "Sample Bank").

---

## 16. CI / Release

### GitHub Pages workflow

On push to `main` (landing paths):

1. `npm ci`
2. `npm run privacy-audit:full`
3. Generate hero + OG card PNGs from SVG sources
4. Upload `_site/` artifact → deploy Pages

Landing URL pattern: `https://<org>.github.io/<repo>/landing/`

Root `index.html` redirects to `/landing/` with matching OG tags.

### Release workflow (on version tag)

1. Checkout with engine submodule / vendored engine
2. `npm test` + `privacy-audit`
3. Engine smoke against fixture vault
4. Build Tauri installers:
   - Windows: `x86_64-pc-windows-msvc`
   - macOS: `aarch64-apple-darwin`
5. Publish draft GitHub Release

Document Linux as build-from-source only.

---

## 17. Landing Page Requirements

Self-contained static page. No framework required.

**Must include:**

- Honest feature scope table (what ships vs preview vs never)
- Copy-not-Send messaging
- Privacy bullet list aligned with app Settings copy
- Download CTA → GitHub Releases (macOS + Windows)
- Build-from-source note for Linux
- Skip link, keyboard-focusable nav, scroll-padding for anchor targets
- CSP meta tag (no third-party scripts)
- JSON-LD `SoftwareApplication` schema
- Self-hosted OG/Twitter card PNG (1200×630)

**Must not include:**

- Google Fonts or other CDN assets
- Fake Send buttons
- Animated particle backgrounds
- Claims for features not yet built

---

## 18. Project Structure

```
graduates-guide-desktop/
├── .github/workflows/
│   ├── pages.yml
│   └── release.yml
├── docs/
│   └── BUILD-SPEC.md          # this file
├── engine/                    # Node sidecar (submodule or vendored)
│   └── graduates-guide-desktop-api.mjs
├── fixtures/sanitized-vault/
├── landing/
│   ├── index.html
│   └── assets/
├── scripts/
│   ├── link-engine.mjs
│   ├── privacy-audit.mjs
│   ├── generate-hero-png.mjs
│   └── generate-social-card-og.mjs
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── components/
│   ├── lib/
│   ├── screens/
│   └── styles/
├── src-tauri/
│   ├── src/
│   │   ├── lib.rs
│   │   ├── main.rs
│   │   ├── config.rs
│   │   ├── engine.rs
│   │   └── secrets.rs
│   ├── capabilities/default.json
│   └── tauri.conf.json
├── PRODUCT.md                 # brand personality
├── package.json
├── vite.config.ts
├── vitest.config.ts
└── tsconfig.json
```

---

## 19. npm Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Vite dev server only |
| `npm run tauri:dev` | Full desktop dev shell |
| `npm run tauri:build` | Release installer |
| `npm test` | Vitest |
| `npm run privacy-audit` | Privacy checks |
| `npm run privacy-audit:full` | Privacy + README asset path checks |
| `npm run generate:hero` | SVG → readme-hero.png |
| `npm run generate:social-card` | SVG → social-card-og.png |

`postinstall`: ensure `engine/` is present (submodule init or symlink to sibling checkout).

---

## 20. First-Run Flow

```
Launch app
  → no vault_path in config?
      → /vault/import
  → user picks folder OR /onboarding for new vault
  → health check (show warnings, don't block)
  → /today
```

---

## 21. Acceptance Criteria (Phase 1 complete)

- [ ] Import a vault folder → Today shows missions from engine
- [ ] Queue lists applications parsed from `applications.md`
- [ ] Queue row click opens correct pack (apply assist vs script reader)
- [ ] Script reader shows part tabs; Copy puts text on clipboard
- [ ] Apply assist opens job URL in system browser
- [ ] Follow-ups lists entries with links to follow-up packs
- [ ] Onboarding writes starter files to a new folder
- [ ] Settings: theme persists, health check runs, vault can be changed
- [ ] Tracker note update works on existing rows only
- [ ] No network calls during normal Phase 1 usage
- [ ] Privacy audit passes in CI
- [ ] macOS + Windows installers build on release tag
- [ ] Landing page deploys with honest scope copy
- [ ] Evaluate / Generate screens labeled preview with CLI fallback messaging

---

## 22. Out of Scope (document, don't build silently)

- In-app Send or auto-apply
- New tracker rows from desktop (CLI/agent adds rows; app updates notes on existing rows only)
- Hosted CV or cloud sync
- Telemetry and crash reporting backend (until Phase 4+)
- Linux release binaries (source build instructions only)
- Full engine parity inside Tauri on day one — ship read/browse/copy first, wire evaluate/generate later

---

## 23. Acknowledgments

If the bundled engine derives from [career-ops](https://github.com/santifer/career-ops) or similar MIT-licensed tooling, credit it in README. **The Graduate's Guide** is an independent product.
