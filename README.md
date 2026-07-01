# The Graduate's Guide — Desktop

**Career-ops does the work. You read the script. You click Send.**

Privacy-first local job hunt cockpit powered by [career-ops](https://github.com/santifer/career-ops).

## Privacy

- **Local vault only** — your CV, tracker, and script packs live in a folder you choose
- **No account, no cloud, no telemetry** in Phase 1
- **API keys** (optional BYOK) stored in OS keychain — never in vault markdown
- **Crash reports** opt-in only (off by default)

## Quick start (dev)

**Prerequisites:** Node 20+, Rust (for Tauri), npm

```bash
git clone <this-repo> graduates-guide-desktop
cd graduates-guide-desktop
git submodule update --init --recursive   # or: junction ../career-ops engine (Windows)
cd engine && npm install && cd ..
npm install
npm run tauri:dev
```

On first launch: **Import vault** → point at your career-ops clone (e.g. `~/Projects/career-ops`).

## Engine sidecar

The app spawns Node against bundled `engine/` (career-ops submodule):

```bash
CAREER_OPS_VAULT=/path/to/vault node engine/graduates-guide-desktop-api.mjs daily
```

Business logic stays in `.mjs` files — not rewritten in TypeScript.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run tauri:dev` | Dev shell + hot reload |
| `npm run tauri:build` | Release `.msi` / `.dmg` |
| `npm test` | Vitest (part parser, etc.) |
| `npm run privacy-audit` | Assert no HTTP permissions / telemetry |

## Test fixture

CI uses `fixtures/sanitized-vault/` (no real PII). Mahmoud's vault: import `career-ops` repo directly.

## Docs

- [Migrate from career-ops CLI](docs/migrate-from-cli.md)
- [Engine updates](docs/engine-update.md)

## License

MIT — powered by open-source career-ops (santifer lineage).
