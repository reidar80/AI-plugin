# Next Implementation Steps

This plan turns `README.md` into concrete execution slices that are small enough for one PR each.

## Guiding principles for every ticket

- Keep PRs to one ticket (`T*.*`) at a time.
- Keep permissions minimal (`activeTab` + explicit user action).
- Ship user-visible vertical slices early, then harden.
- Fail closed on security-sensitive logic (consent, actions, token/session handling).

---

## Phase 1 — Bootstrap the extension baseline

## Ticket T0.1: MV3 skeleton (first implementation target)

### Build checklist

- Add `manifest.json` with:
  - `manifest_version: 3`
  - `name`, `version`, `action.default_popup`
  - `background.service_worker`
  - `permissions: ["activeTab", "storage"]`
  - no `<all_urls>` host permissions
- Create minimum code structure:
  - `src/background/index.ts`
  - `src/content/index.ts`
  - `src/popup/index.html` + `src/popup/main.ts`
- Add a tiny message path:
  - popup button sends message to background
  - background requests one-shot content extraction from active tab
  - content script returns placeholder payload
- Add build output folder wired to extension load (for Edge dev mode).

### Done criteria

- Extension loads in Edge as unpacked extension.
- Popup opens without runtime errors.
- Background service worker logs startup.
- No broad host permission appears in manifest review.

### Recommended test commands

- `npm run build`
- `npm run typecheck`
- Manual: Edge extension load + popup open + message roundtrip

---

## Phase 2 — Add quality gates immediately

## Ticket T0.2: lint/type/build + CI

### Build checklist

- Strict TypeScript (`"strict": true`) and no implicit any.
- ESLint config for TS + import/order + no-unused-vars.
- Prettier config + formatting script.
- Package scripts:
  - `lint`
  - `typecheck`
  - `build`
  - `format` (optional but useful)
- CI workflow to run `lint`, `typecheck`, and `build` on push and PR.

### Done criteria

- All checks pass locally and in CI.
- CI status is required before merging.
- Repository has a short contributor note for local validation flow.

---

## Phase 3 — Security/data boundary before provider integrations

## Ticket T1.1: typed local-only storage service

### Build checklist

- `storageService` abstraction over `chrome.storage.local` only.
- Schema-validated models for:
  - settings
  - session/token records
  - consent records
  - action logs
- Add storage version field and migration runner.
- Add corruption handling:
  - parse failure -> safe default
  - schema mismatch -> migrate or reset just invalid segment
- Add unit tests for read/write/migrate/fallback behavior.

### Done criteria

- No remote persistence path exists in code.
- Data survives browser restart.
- Invalid/corrupt records do not crash runtime and are safely handled.

---

## Immediate sequence after T1.1

Follow this exact order for lowest risk:

1. **T1.2 Consent policy engine** (block extraction without consent).
2. **T1.3 Privacy controls** (clear-all, clear-per-site, optional retention).
3. **T2.1 Provider connector interface** (`login/logout/refresh/listModels/runTask`).
4. **T2.2 OAuth session manager** (state machine + refresh lifecycle).
5. **T2.3 Capability probes** (connected vs executable availability).

Reasoning: this keeps privacy and data controls in place before introducing provider complexity.

---

## Suggested first sprint PR plan (1 ticket per PR)

- **PR 1:** T0.1 extension skeleton + smoke message path.
- **PR 2:** T0.2 lint/type/build/CI hardening.
- **PR 3:** T1.1 local-only typed storage + migration + tests.
- **PR 4:** T1.2 consent enforcement in background/content boundary.
- **PR 5:** T1.3 privacy controls in settings UI.

---

## Non-negotiables (must stay true throughout MVP)

- Never add broad host permissions for convenience.
- Never execute model-generated actions without explicit user confirmation.
- Never show models that are not discovered from the active OAuth session.
- Always keep data local-only and user-clearable.
