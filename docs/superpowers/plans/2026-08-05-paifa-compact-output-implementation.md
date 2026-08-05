# Paifa Compact Output Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for deterministic implementation. Use fresh subagents only for the three semantic behavior samples required by the confirmed lightweight mode.

**Goal:** Make Paifa emit one validated compact route per real dispatch decision and never repeat it during ordinary waiting, monitoring, or status updates.

**Architecture:** The existing structured route remains the source of truth. `validateRoute()` will generate a canonical one-line receipt only after all schema and risk checks pass; Skill prose will require agents to emit that receipt immediately before dispatch and keep expanded YAML audit-only. Monitoring is explicitly outside the routing trigger unless it creates a new dispatch, retry, or reroute decision.

**Tech Stack:** Node.js 24, `node:test`, Markdown Skill instructions, POSIX installation scripts.

## Global Constraints

- Default user-visible output is one `PAIFA_ROUTE` line plus at most one short plain-language sentence.
- Waiting, monitoring, and status-only updates emit no `PAIFA_ROUTE`, `PAIFA_DISPATCHED`, or `PAIFA_CONTEXT`.
- Expanded YAML appears only on explicit audit-detail request or route-validation failure.
- Existing Sol `high` risk floors, confirmation boundaries, session isolation, and quality contracts remain unchanged.
- Main thread performs implementation and deterministic verification; semantic behavior uses three fresh `gpt-5.6-terra` / `low` samples and expands to five only on disagreement or failure.
- Release version is `1.0.1`; do not push or create a remote.

---

### Task 1: Canonical compact receipt

**Files:**
- Modify: `scripts/lib/route-validation.mjs`
- Modify: `scripts/validate-route.mjs`
- Test: `test/route-validation.test.mjs`

**Interfaces:**
- Consumes: the current validated route object.
- Produces: `compactRouteReceipt(route): string` and `validateRoute(...).receipt` for valid routes only.

- [ ] **Step 1: Write failing tests**

Add literal expectations proving that a valid D route returns one line, an internal route includes `forkTurns`, an invalid route has no receipt, and CLI JSON includes the canonical receipt.

- [ ] **Step 2: Verify RED**

Run: `node --test test/route-validation.test.mjs`

Expected: receipt assertions fail because the current validator returns only `ok` and `errors`.

- [ ] **Step 3: Implement the minimal renderer**

Generate this shape only after validation succeeds:

```text
PAIFA_ROUTE v1 | planned | create | D | gpt-5.6-sol/high | clean-room | checker | checks=4 | auto<=gpt-5.6-sol/high
```

Append `| forkTurns=<value>` only for `spawn-internal`.

- [ ] **Step 4: Verify GREEN**

Run: `node --test test/route-validation.test.mjs`

Expected: all route and CLI tests pass.

### Task 2: Compact-by-default Skill contract

**Files:**
- Modify: `SKILL.md`
- Modify: `references/routing-policy.md`
- Modify: `templates/global-agents-block.md`
- Modify: `README.md`
- Modify: `docs/2026-08-05-paifa-skill-design.md`
- Modify: `test/repository-release.test.mjs`

**Interfaces:**
- Consumes: the canonical receipt returned by the validator.
- Produces: one final route line for new dispatch decisions and no route receipt for status-only monitoring.

- [ ] **Step 1: Write the failing release behavior assertion**

Require the installed managed block to say that normal routes use one validated compact line, status/monitoring does not repeat receipts, and raw YAML is audit-only.

- [ ] **Step 2: Verify RED**

Run: `node --test test/repository-release.test.mjs`

Expected: the installed 1.0.0 template lacks the compact and monitoring boundaries.

- [ ] **Step 3: Update the minimal guidance**

Replace “every reply begins with `PAIFA_ROUTE`” with the positive output recipe from the approved design. Keep the structured YAML as an internal/audit reference and remove the C/D default-expansion rule.

- [ ] **Step 4: Verify GREEN and word count**

Run: `node --test test/repository-release.test.mjs && wc -w SKILL.md`

Expected: test passes and `SKILL.md` remains below 500 words.

### Task 3: Release metadata and semantic evidence

**Files:**
- Modify: `VERSION`
- Modify: `package.json`
- Modify: `CHANGELOG.md`
- Create: `evals/results/compact-output-semantics.jsonl`
- Modify: `evals/results/summary.md`

**Interfaces:**
- Consumes: three fresh responses to one already-dispatched active-task monitoring scenario.
- Produces: three verbatim records with `caseVersion`, model, effort, output, manual score, and violations.

- [ ] **Step 1: Update version metadata to 1.0.1**

Describe compact default output and no-repeat monitoring behavior without rewriting historical evidence.

- [ ] **Step 2: Run three fresh semantic samples**

Each sample reads the complete updated Skill and receives an already-dispatched active high-risk Checker monitoring scenario. A pass contains no routing receipt and only a short status update.

- [ ] **Step 3: Store verbatim evidence**

Copy each complete response into the new JSONL file. Stop at three if all agree; expand to five only on disagreement or failure.

### Task 4: Full verification and local update

**Files:**
- Local installation: `/Users/jumper/.codex/skills/paifa`
- Global managed block: `/Users/jumper/.codex/AGENTS.md`

- [ ] **Step 1: Run repository verification**

Run:

```bash
npm test
node scripts/doctor.mjs --json
wc -w SKILL.md
git diff --check
```

Also parse every JSONL record and run the existing privacy scan.

- [ ] **Step 2: Update the real installation**

Run `./scripts/install.sh --update` with the explicit repository root and Codex Home only after the backup and managed-block preflight passes.

- [ ] **Step 3: Verify installed invariants**

Require Doctor success, one managed block matching the repository template, preserved original backup hash, and byte-identical non-Paifa global content.

- [ ] **Step 4: Commit the implementation**

Create one narrow follow-up commit. Do not amend prior history and do not push.
