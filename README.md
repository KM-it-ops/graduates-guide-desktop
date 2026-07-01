# The Graduate's Guide

**Your job search lives in a folder you own.**

A privacy-first desktop cockpit by **[KM-it-ops](https://github.com/KM-it-ops)** — Phase 1 ships the shell around your local vault: Today, Queue, script reader with **Copy**, and follow-ups. Evaluation packs still flow through the bundled engine / CLI where noted below.

**[Landing page](landing/index.html)** · **[Releases](https://github.com/KM-it-ops/graduates-guide-desktop/releases)**

<picture>
  <img src="landing/assets/hero-ui.svg" alt="Layout illustration of the Today screen using sanitized fixture data — not a live screenshot" width="960" />
</picture>

<p align="center"><sub>Layout illustration (sanitized fixture data). The app has <strong>Copy</strong> and <strong>Open script</strong> — you Send/Submit in your own mail client or job portal.</sub></p>

## Phase 1 — what works today

| Feature | Status |
|---------|--------|
| Import local vault | Shipped |
| **Today** missions (engine daily) | Shipped |
| **Queue** (ranked applications) | Shipped |
| **Script reader** + clipboard Copy | Shipped |
| **Follow-ups** list + script links | Shipped |
| **Apply assist** (script + open job portal) | Shipped |
| **Evaluate** / **Generate** in-app | Stub — use engine CLI + vault for now |
| Auto-apply / in-app Send button | **Not offered** (by design) |

## What you get

- **Today** — one screen for what matters right now (max 5 missions)
- **Queue** — ranked opportunities from your vault
- **Script reader** — paste-ready blocks via **Copy**, not an in-app Send button
- **Apply assist** — script beside the job portal; **you** click Submit on the site
- **Local vault** — markdown on disk; zip, encrypt, or sync yourself

## What this is not

- Auto-apply or a bot that submits for you
- A hosted account storing your CV
- A screenshot-perfect clone of every career-ops CLI feature inside Tauri yet

## Privacy

- Vault path is yours — CV, tracker, scripts stay in a folder you pick
- No mandatory account, no telemetry in Phase 1
- Optional API keys in the OS keychain, not in vault files
- Crash reports opt-in (off by default) — see Settings

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

First launch → **Import vault** → your local job-search data directory (or `fixtures/sanitized-vault/` for a safe demo).

## Commands

| Command | Purpose |
|---------|---------|
| `npm run tauri:dev` | Dev shell + hot reload |
| `npm run tauri:build` | Release `.msi` / `.dmg` |
| `npm test` | Vitest |
| `npm run privacy-audit` | No HTTP permissions / telemetry deps |

## More

- [Migrate from CLI workflow](docs/migrate-from-cli.md)
- [Engine updates](docs/engine-update.md)

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

Bundled evaluation engine includes MIT-licensed code from the [career-ops](https://github.com/santifer/career-ops) open-source project. **The Graduate's Guide** is an independent application and is not affiliated with or endorsed by that project.
