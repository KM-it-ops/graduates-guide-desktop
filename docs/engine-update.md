# Engine updates

The desktop app bundles career-ops as `engine/` (git submodule).

## Versioning

- **App semver** — `graduates-guide-desktop` releases (0.1.0, …)
- **Engine pin** — `engineVersion` in `vault.json` + submodule tag

## Update flow (Phase 4)

1. Settings → **Update engine** (runs `update-system.mjs apply` pattern)
2. Only `engine/` system layer updates
3. User vault (`cv.md`, `applications.md`, `interview-prep/`) is **never** auto-modified

## Manual update

```bash
cd engine
git fetch --tags
git checkout v1.12.0
npm install
cd ..
npm run tauri:build
```

## Verify after update

```bash
cd engine && npm run graduates-guide-verify
```

Settings → **Engine health** runs `doctor --json` + `graduates-guide-verify`.
