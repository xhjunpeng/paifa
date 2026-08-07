# Paifa Approval Preflight Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Require one displayed route and one exact `1` before every new development package; continue normally after that, and ask again only for a justified Sol escalation.

**Architecture:** Represent direct work as `direct/current/current`, keep one pending approval for every start, and remove the uncalled dispatch-record runtime.

**Tech Stack:** Node.js 24, native ESM, node:test.

## Global Constraints

- First approval covers ordinary implementation, tests, debugging, retries, integration, and normal delegation in one package.
- A later Sol escalation needs a second `1`; no other ordinary action needs another confirmation.
- Direct work never creates a delegate or invents a model switch.

---

### Task 1: Route and approval behavior

**Files:** `scripts/lib/route-validation.mjs`, `scripts/lib/approval-state.mjs`, `test/route-validation.test.mjs`, `test/approval-state.test.mjs`.

- [x] Add red tests showing a Terra proposal remains pending until `1`, and `direct/current/current` displays “主任务直接执行 / 保持当前主任务 / 保持当前设置”.
- [x] Run `node --test test/approval-state.test.mjs test/route-validation.test.mjs`; confirm red because non-Sol routes auto-start and direct is invalid.
- [x] Add the `direct` display labels and validation bypass; make `propose()` persist every valid route instead of auto-approving Luna/Terra.
- [x] Run `node --test test/approval-state.test.mjs test/route-validation.test.mjs test/simple-dispatch-contract.test.mjs`; confirm green and preserve Sol evidence validation.
- [x] Commit the tested change as `feat: require approval for development preflight`.

### Task 2: Policy simplification

**Files:** `SKILL.md`, `README.md`, `templates/global-agents-block.md`, `templates/task-envelope.md`, `references/routing-policy.md`, `references/tool-mapping.md`, `test/host-lifecycle.test.mjs`, `test/repository-release.test.mjs`.

- [x] Add red assertions for: “Before the first material action in a new development package, show one proposal and wait for `1`”; “A later Sol escalation requires one additional `1`”; and absence of `DispatchRecord`, `parentWake`, and `checkpointStore`.
- [x] Run `node --test test/host-lifecycle.test.mjs test/repository-release.test.mjs`; confirm red.
- [x] Apply the one-time approval policy, distinguish project-specific Gates from Paifa, and delete the uncalled `scripts/lib/dispatch-state.mjs`, `scripts/lib/execution-decision.mjs`, and their tests.
- [x] Run `node --test test/host-lifecycle.test.mjs test/repository-release.test.mjs test/install-lifecycle.test.mjs`; confirm green and no remaining imports of deleted modules.
- [x] Commit the tested change as `fix: restore one-time development approval`.

### Task 3: Release and install

**Files:** `VERSION`, `CHANGELOG.md`.

- [x] Set version to `1.7.0` and document the corrected initial approval, direct execution representation, and dead-runtime removal.
- [ ] Run `npm test`, `git diff --check`, and `node scripts/doctor.mjs`.
- [ ] Commit `release: paifa 1.7.0`, update the installed skill, and run the doctor again.

## Plan self-review

- All user-visible requirements map to a task: initial `1` in Task 1, one uninterrupted envelope and Sol-only second approval in Task 2, and installation in Task 3.
- No scheduler or fabricated wakeup capability is introduced.
