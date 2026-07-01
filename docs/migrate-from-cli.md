# Migrate from career-ops CLI

Your existing career-ops folder **is** a valid vault.

## Import

1. Launch The Graduate's Guide desktop
2. **Import vault** → select your career-ops root (contains `data/applications.md`, `interview-prep/`, `cv.md`)
3. **Today** runs `graduates-guide-daily.mjs` against your tracker
4. **Queue** reads `applications.md`
5. **Script Reader** opens packs with Part tabs + copy buttons

## What stays the same

- Cursor / Claude Code / Gemini CLI still work against the same vault
- Tracker source of truth remains `data/applications.md`
- New rows still go through TSV + `merge-tracker.mjs` (CLI/agent) — desktop Phase 2 only updates **existing** row notes

## vault.json

On first import the app writes `vault.json` in your vault (metadata only — safe to gitignore):

```json
{
  "version": 1,
  "appVersion": "0.1.0",
  "engineVersion": "1.11.0",
  "importedAt": "...",
  "lastOpenedAt": "..."
}
```

## Engine pin

`engine/` submodule tracks career-ops version. User vault is never touched by engine updates.
