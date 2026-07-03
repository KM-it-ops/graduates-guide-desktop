---
name: parallel-iteration-audit
description: Run 5–6 parallel audit subagents with distinct lenses before a multi-iteration polish pass, synthesize findings, and ship one focused iteration. Use when continuing vN→vN+1 work on landing pages, marketing sites, or cross-surface product UI.
argument-hint: "[Target surface or path, e.g. apps/web/app/(marketing)/page.tsx] [iteration label, e.g. v7]"
---

# Parallel Iteration Audit

Run a **multi-lens audit in parallel**, synthesize into one prioritized backlog, implement **one iteration** that addresses the highest-signal items across lenses, then optionally generate artifacts (checklist, skill, PR body).

## When to Use

- User asks to **continue iterating** on a multi-version project (v1→v7, landing page polish, marketing refresh).
- A surface is "mostly done" but needs a **quality pass** before ship or PR.
- Changes span **marketing + app** and need coherence checks.
- You want **file:line evidence** before editing, not gut feel.

**Skip when:** greenfield scaffold, single obvious bug, or no git/repo access for regression lens.

## Parent Workflow

### Phase 0 — Scope (2 min)

1. Identify **target surface**: paths, routes, components, prior iteration tags (`v6`, `landing-v5`).
2. Capture **iteration goal** in one sentence (e.g. "v7: tighten hero CTA hierarchy + fix OG regressions").
3. Confirm subagents can **read files** and **run git** (`git log`, `git diff`, `git blame`).

### Phase 1 — Parallel dispatch (5–6 subagents)

Launch **one subagent per lens** below. Each subagent is **read-only** (audit only, no edits). Dispatch all in **one parallel batch**.

Required output from every subagent:

```markdown
## [Lens Name] Audit — [Target]

### Critical
- [ ] Finding — `path:line` — why it matters — suggested fix (1 line)

### Medium
- [ ] ...

### Low
- [ ] ...

### Positive (keep)
- ...

### Unknowns / needs product input
- ...
```

### Phase 2 — Synthesis (parent only)

1. Collect all subagent reports.
2. Apply **Synthesis Rubric** (below).
3. Produce **Iteration Backlog** (max 8 items): rank-ordered, each tagged with lens(es) and severity.
4. **Do not** implement low-signal churn; prefer fixes that satisfy multiple lenses.

### Phase 3 — Implement one iteration

1. Work top-down on backlog until time/scope cap hit (typically 5–8 fixes).
2. Match existing code conventions; minimal diff.
3. Run lint/typecheck/tests relevant to touched paths.
4. Re-check only affected lenses (quick parent pass, not full re-audit).

### Phase 4 — Ship + optional artifacts

1. Commit with message: `feat(marketing): iteration vN — <theme>`.
2. Open PR using **Iteration PR template** (below).
3. **Optional 7th subagent**: generate checklist, update skill, or draft PR body from synthesis.

---

## Subagent Lenses & Copy-Paste Prompts

Replace `{TARGET}`, `{PATHS}`, `{ITERATION}`, `{PRIOR_TAG}` before dispatch.

### 1. Brand / Product Alignment

```
You are a brand/product alignment auditor. READ ONLY — do not edit files.

Target: {TARGET}
Paths: {PATHS}
Iteration: {ITERATION}

Audit messaging, visual hierarchy, tone, value prop clarity, CTA placement, and trust signals against what the product actually does. Flag overclaims, vague copy, weak differentiation, and hero/section flow issues.

Return findings in Critical / Medium / Low with `file:line` refs and one-line fixes. Note what already works (Positive).
```

### 2. Performance + Accessibility

```
You are a performance and accessibility auditor. READ ONLY.

Target: {TARGET}
Paths: {PATHS}

Check: LCP/CLS risks (images, fonts, layout shift), unnecessary client JS, bundle heaviness, keyboard nav, focus order, contrast, aria labels, semantic headings, reduced-motion, form labels.

Cite `file:line` for each issue. Prioritize user-facing blockers (Critical) vs polish (Low).
```

### 3. SEO + Social Sharing

```
You are an SEO and social sharing auditor. READ ONLY.

Target: {TARGET}
Paths: {PATHS}

Audit: title/description, canonical, robots, hreflang if applicable, Open Graph, Twitter cards, structured data, heading structure, internal links, alt text, indexability.

Return `file:line` refs. Flag regressions vs typical Next/metadata patterns.
```

### 4. Git History / Iteration Regression Matrix

```
You are a git regression auditor. READ ONLY — use git commands.

Target: {TARGET}
Paths: {PATHS}
Prior iteration tag or commit range: {PRIOR_TAG}..HEAD

Run: git log, git diff, git blame on {PATHS}. Build a regression matrix: what improved, what regressed, what flipped between iterations (copy, layout, metadata, a11y).

Return Critical/Medium/Low with commit refs AND `file:line`. Do not implement fixes.
```

### 5. Cross-Surface Coherence

```
You are a cross-surface coherence auditor. READ ONLY.

Target: {TARGET}
Compare marketing surface vs in-app UI (nav labels, pricing claims, feature names, auth CTAs, design tokens, tone).

List mismatches with `file:line` on both sides where possible. Critical = user confusion or broken promise; Medium = visual/terminology drift.
```

### 6. Security + Privacy Marketing Accuracy

```
You are a security/privacy marketing auditor. READ ONLY.

Target: {TARGET}
Paths: {PATHS}

Check public copy for accurate security/privacy claims (encryption, compliance badges, data retention, third parties, cookie/consent). Flag misleading stats, missing disclosures, unsafe patterns (exposed keys in client, PII in URLs).

Cite `file:line`. Critical = legal/reputation risk or exposed secret.
```

### 7. Optional — Artifact Crafter (post-implementation)

```
Using the parent synthesis backlog and implemented changes for {TARGET} iteration {ITERATION}, produce:
1) A reusable pre-ship checklist (markdown)
2) Optional PR body (see template)
3) Optional skill delta if a repeatable pattern emerged

Do not re-audit from scratch; synthesize provided reports only.
```

---

## Synthesis Rubric

**Dedupe:** merge same root cause across lenses (max severity); drop findings without `file:line`; defer Low items that touch 5+ files.

**Priority:** (1) Critical + multi-lens → (2) Critical security/a11y → (3) Medium with git regression proof → (4) other Medium by file proximity → (5) Low only if same file already open.

**Cap:** max **8 backlog items**; if >8 Critical, escalate with top 8 + deferred list.

---

## Iteration PR Template

```markdown
## {ITERATION}: {One-line theme}

### Summary
{Brief narrative: what this iteration improves and why now.}

### Audit lenses
- [x] Brand/product
- [x] Performance + a11y
- [x] SEO + social
- [x] Git regression matrix ({PRIOR_TAG}..HEAD)
- [x] Cross-surface coherence
- [x] Security + privacy accuracy

### Changes (by priority)
1. **[Critical]** {change} — `{file}` — lenses: {a, b}
2. ...

### Deferred
- {item} — reason — suggested {ITERATION+1}

### Verification
- [ ] `npm run lint` / typecheck
- [ ] Manual: keyboard nav on {route}
- [ ] OG preview / Lighthouse (if applicable)

### Regression notes
{From git lens: what we intentionally kept vs restored}
```

---

## Anti-Patterns

- **Same lens twice** — duplicate noise; one agent per lens only.
- **No git on regression lens** — parent verifies shell access first.
- **Subagents implement** — conflicting diffs; audits are read-only, parent ships.
- **Vague findings** — reject without `file:line`.
- **Full backlog implementation** — cap at 8; defer rest.
- **Skip Positive section** — causes fix regressions; keep wins in PR.
- **Full re-audit after tiny fix** — spot-check affected lens only.
- **Parallel writers** — parent is sole implementer.

---

## Example Invocation

User: **"Run parallel audit on the marketing landing page before iteration v7."**

Parent:

1. Scope: `apps/web/app/(marketing)/page.tsx`, metadata layout, hero components; prior tag `v6`.
2. Dispatch lenses 1–6 in parallel with shared `{TARGET}` / `{PATHS}`.
3. Synthesize → backlog of 6 items (2 Critical, 3 Medium, 1 Low deferred).
4. Implement: OG image regression, hero heading order, contrast fix, CTA copy alignment.
5. PR: `feat(marketing): iteration v7 — hero clarity + OG restore`.
6. Optional agent 7: export checklist to `docs/checklists/marketing-ship.md`.

**Done when:** every shipped Critical/Medium cites `file:line`; ≥3 lenses contributed; Deferred section exists; one coherent theme per iteration.

---

## Mobile / device preview (static landing)

After implementing a landing iteration, offer these preview paths:

1. **DevTools (fastest)** — Chrome/Edge/Firefox → device toolbar (Ctrl+Shift+M). Not a real device but catches layout/type issues.
2. **Real phone, same WiFi** — from repo root:
   ```bash
   python3 -m http.server 8080
   ```
   On phone: `http://<laptop-lan-ip>:8080/landing/` (find IP: `ip addr` / `ifconfig`).
3. **GitHub Pages** — after merge: `https://km-it-ops.github.io/graduates-guide-desktop/landing/`
4. **PR branch Pages** — if repo enables Pages from branch, use that preview URL.

Cloud agents cannot expose LAN IPs to the user's phone; give the user the commands above rather than claiming live mobile preview from the agent VM.
