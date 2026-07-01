# The Graduate's Guide

**Your job search lives in a folder you own.**

A privacy-first desktop cockpit by **[KM-it-ops](https://github.com/KM-it-ops)** — for people who need the words *before* the interview, not another agent terminal on their machine.

**[Preview the landing page](landing/index.html)** · **[Download releases](https://github.com/KM-it-ops/graduates-guide-desktop/releases)**

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="landing/assets/social-card.png" />
  <img src="landing/assets/hero-ui.svg" alt="Graduate's Guide app preview — Today view with mission queue and Send" width="960" />
</picture>

Open **Today**. Read the script. Copy the line. Click **Send**. You stay in control.

## What you get

- **Today** — one screen for what matters right now
- **Queue** — ranked opportunities with context, not spreadsheet guilt
- **Script reader** — paste-ready blocks for forms, email, and follow-ups
- **Apply assist** — field-by-field prep; you submit, not a bot
- **Local vault** — markdown on disk; zip it, encrypt it, Syncthing it — your call

## What this is not

- Auto-apply
- A hosted account with your CV on someone else's servers
- A cloud rewrite of your job search

## Privacy

- Vault path is yours — CV, tracker, scripts stay in a folder you pick
- No mandatory account, no telemetry in Phase 1
- Optional API keys live in the OS keychain, not in vault files
- Crash reports are opt-in (off by default)

## Develop

**Needs:** Node 20+, Rust (Tauri), npm

```bash
git clone https://github.com/KM-it-ops/graduates-guide-desktop.git
cd graduates-guide-desktop
git submodule update --init --recursive
cd engine && npm install && cd ..
npm install
npm run tauri:dev
```

First launch → **Import vault** → point at your local job-search data directory.

Sidecar (headless):

```bash
CAREER_OPS_VAULT=/path/to/vault node engine/graduates-guide-desktop-api.mjs daily
```

## Commands

| Command | Purpose |
|---------|---------|
| `npm run tauri:dev` | Dev shell + hot reload |
| `npm run tauri:build` | Release `.msi` / `.dmg` |
| `npm test` | Vitest |
| `npm run privacy-audit` | No HTTP permissions / telemetry |

## Fixtures

CI uses `fixtures/sanitized-vault/` — synthetic data only. Never commit a real vault.

## More

- [Migrate from CLI workflow](docs/migrate-from-cli.md)
- [Engine updates](docs/engine-update.md)

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

Bundled evaluation engine includes MIT-licensed code from the [career-ops](https://github.com/santifer/career-ops) open-source project. **The Graduate's Guide** is an independent application and is not affiliated with or endorsed by that project.
