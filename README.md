# AI Plugin Build Backlog (Vibe-Coded Edition)

This project is a Chromium (Edge-first) browser extension that lets a user connect their **existing subscriptions** (via OAuth) and use available models to assist with web page tasks.

## Product guardrails (locked decisions)

- Chromium only (Edge first).
- OAuth sign-in only for providers.
- Local-only data storage.
- `activeTab` on-demand access where possible.
- Per-site consent model with optional always-on.
- MVP = read + assisted actions (not full autonomy).
- Provider/model selection is user-controlled and persistent until changed.
- Show only models discovered from the active OAuth session.

---

## Execution strategy for Codex / Claude Code

Use small, mergeable slices:

1. Complete one ticket.
2. Run checks.
3. Commit.
4. Move to next ticket.

Each ticket below includes:

- **Goal**
- **Deliverables**
- **Acceptance criteria**
- **Suggested prompt for coding agent**

---

## Epic 0 — Repo bootstrap and standards

### T0.1 Initialize extension skeleton (MV3)

**Goal**  
Create the base structure for popup, background service worker, and content script.

**Deliverables**

- `manifest.json`
- `src/background/*`
- `src/content/*`
- `src/popup/*`
- minimal build tooling (Vite or plain TS build)

**Acceptance criteria**

- Extension loads in Edge dev mode.
- Popup opens.
- Background script starts.
- No `<all_urls>` permission requested.

**Agent prompt**

"Create an MV3 extension skeleton for Edge with popup + background + content script. Use `activeTab` and no broad host permissions. Keep TypeScript strict and code minimal."

### T0.2 Project quality setup

**Goal**  
Add linting, formatting, type checks, and CI basics.

**Deliverables**

- ESLint config
- Prettier config
- TypeScript config
- npm scripts (`lint`, `typecheck`, `build`)
- CI workflow for lint/typecheck/build

**Acceptance criteria**

- `npm run lint`, `npm run typecheck`, and `npm run build` pass locally.
- CI runs on push/PR.

**Agent prompt**

"Set up ESLint + Prettier + strict TypeScript + CI for this extension repo. Add scripts and make sure all checks pass."

---

## Epic 1 — Security and data boundary foundation

### T1.1 Local-only storage module

**Goal**  
Implement one storage API abstraction with explicit local-only behavior.

**Deliverables**

- `storageService` wrapper around `chrome.storage.local`
- typed schemas for settings, tokens, consents, action logs
- migration/versioning field

**Acceptance criteria**

- No remote storage endpoints exist.
- Data survives browser restarts.
- Corrupt/invalid data is handled safely.

**Agent prompt**

"Implement a typed local-only storage service for extension settings/tokens/consents/logs with schema validation and safe defaults."

### T1.2 Consent policy engine

**Goal**  
Implement per-site consent with optional always-on.

**Deliverables**

- consent states: `ask_every_time`, `allow_for_site`, `always_on`
- UI flow to set/update per-site consent
- background guard that blocks capture without consent

**Acceptance criteria**

- Data capture is impossible without consent.
- Consent state is visible and editable.
- Site matching handles subdomains correctly.

**Agent prompt**

"Build consent engine and UI for ask-every-time / allow-for-site / always-on and enforce it before context extraction."

### T1.3 Privacy controls in settings

**Goal**  
Give users direct control over retained local data.

**Deliverables**

- clear all data
- clear per-site history
- optional auto-delete interval

**Acceptance criteria**

- Controls are reachable from settings UI.
- Deletion actually removes records.
- No hidden persistence remains.

**Agent prompt**

"Add privacy settings UI and backend actions for clearing local data globally or per-site, plus optional TTL cleanup."

---

## Epic 2 — Provider connector platform (OAuth-only)

### T2.1 Provider abstraction contract

**Goal**  
Build one interface for all providers.

**Deliverables**

- `ProviderConnector` interface:
  - `login()`
  - `logout()`
  - `refresh()`
  - `listModels()`
  - `runTask()`
- capability flags per provider
- normalized error types

**Acceptance criteria**

- App can switch connectors without UI rewrites.
- Errors shown to user are consistent across providers.

**Agent prompt**

"Create a provider connector interface and capability model for OAuth login, model listing, and task execution with normalized errors."

### T2.2 OAuth session manager

**Goal**  
Centralize token lifecycle and session state.

**Deliverables**

- session state machine (signed_out, connecting, active, expired, failed)
- token refresh orchestration
- secure token-at-rest handling in local storage

**Acceptance criteria**

- Expired sessions recover gracefully.
- UI reflects state transitions reliably.

**Agent prompt**

"Implement OAuth session manager with deterministic state machine and refresh handling for extension providers."

### T2.3 Provider capability probes (Gemini, Copilot, ChatGPT, Claude)

**Goal**  
Detect if account can authenticate, list models, and execute tasks.

**Deliverables**

- capability probe routine per provider
- provider status UI badges
- "connected but execution unavailable" state

**Acceptance criteria**

- Users see exactly what is and is not available per provider.
- No fake success state.

**Agent prompt**

"Add provider capability probe flow and status UI for Gemini/Copilot/ChatGPT/Claude, including partial-support states."

---

## Epic 3 — UX for model/provider selection

### T3.1 Persistent provider + model selector

**Goal**  
Let user choose provider/model and keep selection until changed.

**Deliverables**

- provider dropdown filtered by connected+supported
- model dropdown populated from `listModels()`
- persistent active selection state

**Acceptance criteria**

- Selection persists across popup closes and browser restarts.
- If selected model disappears, user gets prompted to reselect.

**Agent prompt**

"Build persistent provider/model picker that reads runtime models from OAuth session and handles stale selections gracefully."

### T3.2 Task composer UX

**Goal**  
Simple task entry with reusable quick actions.

**Deliverables**

- free-text task input
- quick actions: summarize page, fill form draft, explain section
- recent prompts list (local only)

**Acceptance criteria**

- One-click execution path from popup.
- Recent prompts can be deleted individually.

**Agent prompt**

"Create popup task composer with quick actions and local-only recent prompts management."

---

## Epic 4 — Context extraction + safety boundaries

### T4.1 Context extraction pipeline

**Goal**  
Extract only relevant user-approved page context.

**Deliverables**

- extract modes: selected text, focused form, visible section
- metadata: URL, title, domain, timestamp
- preview panel of outbound context

**Acceptance criteria**

- User can inspect context before send.
- Hidden sensitive fields are excluded by default.

**Agent prompt**

"Implement context extraction (selection/form/visible section) with preview and redaction-first defaults before send."

### T4.2 Redaction and policy filters

**Goal**  
Reduce risk of leaking sensitive values.

**Deliverables**

- PII/secret pattern masking (configurable)
- denylist selectors (`input[type=password]`, token fields)
- per-domain strict mode toggle

**Acceptance criteria**

- Password and obvious token fields are never sent.
- Masking can be reviewed in preview.

**Agent prompt**

"Add redaction filters and denylist selectors so sensitive inputs never leave the page context payload."

---

## Epic 5 — Assisted action system (MVP core)

### T5.1 Structured action schema

**Goal**  
Only allow safe, typed action plans from models.

**Deliverables**

- JSON schema for actions (`focus`, `type`, `select`, `click`, `wait`)
- validator rejecting unknown actions/fields
- parser with deterministic error reporting

**Acceptance criteria**

- Arbitrary JS/code from model is never executable.
- Invalid plans fail closed.

**Agent prompt**

"Design and enforce a strict JSON action schema for assisted browser actions. Reject everything non-conforming."

### T5.2 Human-in-the-loop execution UI

**Goal**  
Require explicit user confirmation before action execution.

**Deliverables**

- step-by-step review drawer
- approve single step / approve batch
- high-risk action warning gate (submit/delete/security)

**Acceptance criteria**

- No action executes without confirmation.
- Risky actions require extra confirmation.

**Agent prompt**

"Build assisted action review and confirmation UX with extra safeguards for risky actions."

### T5.3 Action runtime + audit log

**Goal**  
Execute approved actions and keep local audit trail.

**Deliverables**

- content-script executor with retries/timeouts
- execution results and failures
- local action log viewer

**Acceptance criteria**

- Failed steps provide clear recovery hints.
- Logs are local and removable from settings.

**Agent prompt**

"Implement action executor and local audit log with robust error capture and user-readable outcomes."

---

## Epic 6 — Domain packs (forms, LinkedIn, Azure, Entra)

### T6.1 Generic forms pack

**Goal**  
High-value baseline for common web forms.

**Deliverables**

- field detection heuristics
- draft fill suggestions
- validation hinting

**Acceptance criteria**

- Improves completion speed on representative forms.
- No automatic final submit.

### T6.2 LinkedIn assist pack

**Goal**  
Safe assistance for drafting and profile edits.

**Deliverables**

- compose box detection
- profile field assistant mappings
- conservative click policy

**Acceptance criteria**

- Draft quality is useful.
- High-risk actions remain manual.

### T6.3 Azure + Entra read-first packs

**Goal**  
Start in low-risk mode for admin portals.

**Deliverables**

- navigation guidance mode
- config explanation mode
- strict mode defaults enabled

**Acceptance criteria**

- No destructive action primitives enabled initially.
- Clear warning banner on admin domains.

---

## Epic 7 — Future autonomous mode (scaffold only)

### T7.1 Policy engine for eventual autonomy

**Goal**  
Build scaffolding now; keep disabled in MVP.

**Deliverables**

- trust-level policies by domain
- step budget and fail-safe stop conditions
- mandatory checkpoint rules

**Acceptance criteria**

- Feature flag exists and defaults OFF.
- No path enables autonomy without explicit dev config.

---

## Epic 8 — Test plan and release readiness

### T8.1 Automated tests

**Deliverables**

- unit tests: storage, policy engine, action validator
- integration tests: provider selector, consent flow
- e2e smoke tests in Edge profile

**Acceptance criteria**

- Baseline CI coverage on critical modules.

### T8.2 Manual validation matrix

**Deliverables**

- matrix for providers × domains × consent modes
- checklist for error states and token expiry
- install/upgrade regression checks

**Acceptance criteria**

- MVP sign-off checklist complete.

### T8.3 Beta release package

**Deliverables**

- install docs for Edge
- known limitations by provider/account type
- troubleshooting guide

**Acceptance criteria**

- Non-technical tester can install and run first task unassisted.

---

## Suggested build order (small-step sequence)

1. T0.1 → T0.2
2. T1.1 → T1.2 → T1.3
3. T2.1 → T2.2 → T2.3
4. T3.1 → T3.2
5. T4.1 → T4.2
6. T5.1 → T5.2 → T5.3
7. T6.1 → T6.2 → T6.3
8. T8.1 → T8.2 → T8.3
9. T7.1 (scaffold only, keep off)

---

## Definition of MVP done

MVP is done when all statements are true:

- User can sign in with at least one supported provider via OAuth.
- User can select available model discovered from session.
- User can approve per-site consent and run read + assisted actions.
- All storage is local-only and user-clearable.
- No unconfirmed action executes.
- Extension works in Edge with documented setup.

---

## Notes for vibe-coding workflow

- Keep PRs small (1 ticket each).
- Prefer deleting complexity over adding abstraction too early.
- Ship visible UX early, harden in parallel, then expand providers.
- Be explicit about unsupported provider/account combinations.
