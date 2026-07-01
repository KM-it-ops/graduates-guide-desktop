<div align="center">

# The Graduate's Guide

**Your job search lives in a folder you own.**

Privacy-first desktop cockpit by **[KM-it-ops](https://github.com/KM-it-ops)** · Phase 1

[![Releases](https://img.shields.io/github/v/release/KM-it-ops/graduates-guide-desktop?label=release)](https://github.com/KM-it-ops/graduates-guide-desktop/releases)
[![License](https://img.shields.io/github/license/KM-it-ops/graduates-guide-desktop)](LICENSE)
[![Tauri](https://img.shields.io/badge/desktop-Tauri-24C8DB)](https://tauri.app/)

<img src="docs/assets/readme-hero.png" alt="Layout illustration of the Today screen (sanitized fixture data, not a live screenshot)" width="720" />

*Illustration only — sanitized fixture data. The app has **Copy** and **Open script**; you Send or Submit in your mail client or job portal.*

[Download](https://github.com/KM-it-ops/graduates-guide-desktop/releases) · [Landing](landing/index.html) · [Develop](#develop)

</div>

---

## What ships in Phase 1

| Feature | Status |
|---------|--------|
| Import local vault | Shipped |
| Today missions | Shipped |
| Queue & follow-ups | Shipped |
| Script reader + **Copy** | Shipped |
| Apply assist (portal + script) | Shipped |
| Evaluate / Generate in-app | Stub — engine CLI for now |
| In-app Send / auto-apply | **Not offered** (by design) |

## Why it exists

You need the words before the interview — not another agent chewing through your machine. Graduate's Guide is a calm shell around a **local markdown vault**: what to do today, ranked queue, paste-ready scripts.

## What it is not

- Auto-apply or bots that submit for you  
- A hosted account storing your CV  
- A pixel-perfect in-app clone of every engine CLI workflow yet  

## Privacy

- Vault path is yours — CV, tracker, scripts stay on disk  
- No mandatory account; no telemetry in Phase 1  
- API keys optional, OS keychain only  
- Crash reports opt-in (off by default)  

## Develop

**Needs:** Node 20+, Rust, npm

```bash
git clone https://github.com/KM-it-ops/graduates-guide-desktop.git
cd graduates-guide-desktop
git submodule update --init --recursive
cd engine && npm install && cd ..
npm install
npm run tauri:dev
```

First launch → **Import vault** → your job-search folder, or `fixtures/sanitized-vault/` for a safe demo.

| Command | Purpose |
|---------|---------|
| `npm run tauri:dev` | Dev shell |
| `npm run tauri:build` | Release installer |
| `npm test` | Vitest |
| `npm run privacy-audit` | No HTTP caps / telemetry deps |

## More

- [Migrate from CLI](docs/migrate-from-cli.md)
- [Engine updates](docs/engine-update.md)

## License

MIT — see [LICENSE](LICENSE).

## Acknowledgments

Bundled evaluation engine includes MIT-licensed code from [career-ops](https://github.com/santifer/career-ops). **The Graduate's Guide** is independent and not affiliated with that project.
