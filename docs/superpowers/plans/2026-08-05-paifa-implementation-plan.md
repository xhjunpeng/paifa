# Paifa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, test, locally install, and prepare for public GitHub release an independent `paifa` Codex skill that routes delegated tasks to the lowest-cost model meeting a quality floor and escalates only from evidence.

**Architecture:** A compact `SKILL.md` performs semantic routing and conditionally loads heavy references. Dependency-free Node.js tools enforce deterministic route, installation, managed-global-rule, and doctor contracts; shell files are thin launchers. Skill pressure tests establish RED behavior before authoring and re-run against the installed Skill for GREEN and refactor evidence.

**Tech Stack:** Markdown/YAML frontmatter, Node.js 24 built-in modules (`node:test`, `fs`, `path`, `os`, `crypto`, `child_process`), POSIX shell wrappers, Git.

## Global Constraints

- Source root: `/Users/jumper/Downloads/66mw/skills/功能/paifa`.
- Public repository content must not contain private project data, credentials, or hard-coded user home paths.
- `SKILL.md` must remain below 500 English-word-equivalent content and put heavy policy in conditional references.
- No third-party runtime dependencies in v1.
- Supported installers in v1: macOS and common Linux POSIX shell environments; Windows is documented as unsupported.
- Automatic model escalation stops at Sol `high`; `xhigh`, `max`, `ultra`, irreversible actions, and changed high-risk consequences require user confirmation.
- High-risk authentication, authorization, tenant isolation, billing, payment, migration, security, and production operations cannot be routed below Sol `high`.
- Installer changes to global `AGENTS.md` must be marked, backed up, atomic, idempotent, and recoverable.
- Never silently replace an existing non-managed Skill installation or unrelated global rule content.
- RED evidence must be observed before `SKILL.md` is authored.
- No remote push or GitHub repository creation is authorized by this plan.

---

## File Map

- `SKILL.md` — compact trigger, core principle, route sequence, fast receipt, escalation decision.
- `README.md` — public installation, usage, upgrade, repair, uninstall, platform and safety guidance.
- `LICENSE` — MIT license.
- `CHANGELOG.md` — release history beginning at `1.0.0`.
- `VERSION` — canonical version string.
- `package.json` — dependency-free commands for tests, doctor, and route validation.
- `references/routing-policy.md` — scoring, role, session, context, quality-contract, and escalation matrices.
- `references/high-risk.md` — hard capability floors and human confirmation boundaries.
- `references/tool-mapping.md` — current Codex dispatch field mappings and model-availability fallback rules.
- `templates/global-agents-block.md` — versioned managed trigger and standing-authorization block.
- `templates/task-envelope.md` — fact-only compact delegation envelope.
- `scripts/lib/route-validation.mjs` — pure deterministic route and dispatch validation.
- `scripts/lib/managed-block.mjs` — pure insertion, replacement, removal, and marker validation.
- `scripts/lib/install-state.mjs` — hashes, backup metadata, atomic file writes, and install-state serialization.
- `scripts/lib/installer.mjs` — filesystem installation and uninstall transaction boundary.
- `scripts/validate-route.mjs` — JSON CLI over route validation.
- `scripts/install.mjs` — safe installation and update CLI.
- `scripts/uninstall.mjs` — safe uninstall and optional guarded restore CLI.
- `scripts/doctor.mjs` — read-only integrity and deterministic health checks.
- `scripts/install.sh` — thin POSIX launcher for `install.mjs`.
- `scripts/uninstall.sh` — thin POSIX launcher for `uninstall.mjs`.
- `test/route-validation.test.mjs` — validator behavior tests.
- `test/managed-block.test.mjs` — marked block transformation tests.
- `test/install-lifecycle.test.mjs` — install, update, rollback, uninstall, and restore tests in temporary homes.
- `test/doctor.test.mjs` — doctor success and failure diagnosis tests.
- `evals/routing-cases.json` — fictional semantic routing scenarios and expected constraints.
- `evals/trigger-cases.json` — should-trigger and should-not-trigger scenarios.
- `evals/results/baseline.jsonl` — sanitized RED outputs without the Skill.
- `evals/results/green.jsonl` — sanitized outputs with the Skill.
- `evals/results/summary.md` — human-scored rationalizations, convergence, and residual risks.
- `docs/2026-08-05-paifa-skill-design.md` — approved portable design.
- `docs/upgrade.md` — compatibility and upgrade policy.
- `docs/contributing.md` — TDD requirements for future Skill changes.

---

### Task 1: Initialize the independent repository and record RED Skill evidence

**Files:**
- Create: `.gitignore`
- Create: `package.json`
- Create: `VERSION`
- Create: `evals/routing-cases.json`
- Create: `evals/trigger-cases.json`
- Create: `evals/results/baseline.jsonl`
- Create: `evals/results/summary.md`

**Interfaces:**
- Consumes: approved design at `docs/2026-08-05-paifa-skill-design.md`.
- Produces: version `1.0.0`, executable test commands, pressure cases, and observed no-Skill failure evidence used to author `SKILL.md`.

- [ ] **Step 1: Initialize Git without modifying any parent directory**

Run:

```bash
cd /Users/jumper/Downloads/66mw/skills/功能/paifa
git init -b feat/paifa-v1
git status --short --branch
```

Expected: a new repository rooted exactly at the `paifa` directory with no parent repository, on branch `feat/paifa-v1`.

- [ ] **Step 2: Add minimal repository configuration**

Create `.gitignore` containing only OS/editor noise and temporary test output:

```gitignore
.DS_Store
node_modules/
*.tmp
evals/results/raw/
```

Create `VERSION` with `1.0.0`. Create `package.json` with `private: true`, `type: module`, and scripts:

```json
{
  "name": "paifa-skill",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "test": "node --test test/*.test.mjs",
    "validate:route": "node scripts/validate-route.mjs",
    "doctor": "node scripts/doctor.mjs"
  }
}
```

- [ ] **Step 3: Write RED routing and trigger scenarios before the Skill**

`routing-cases.json` must include at least these fictional cases with expected constraints rather than an exact prose answer:

```json
[
  {"id":"mechanical-long","risk":"low","expectedMax":"luna-medium","session":"create"},
  {"id":"single-file-auth","risk":"security","expectedMin":"sol-high","session":"create"},
  {"id":"environment-failure","failure":"tooling","expectedAction":"repair-environment"},
  {"id":"two-root-cause-failures","failure":"capability-evidence","expectedAction":"upgrade-one-step"},
  {"id":"independent-checker","role":"checker","expectedContext":"clean-room"},
  {"id":"polluted-history","pollutionRisk":2,"expectedSession":"create"},
  {"id":"full-history-branch","contextDependency":2,"pollutionRisk":0,"expectedSession":"fork"}
]
```

`trigger-cases.json` must include direct delegation, parallel dispatch, retry, model-cost routing, ordinary single-task work, status-only inspection, and model-discussion-only prompts.

- [ ] **Step 4: Run no-Skill pressure scenarios with fresh low-cost agents**

Use fresh internal agents with `fork_turns: "none"`, `gpt-5.6-terra`, and `low` reasoning. Run at least five independent samples for each wording variant. Include combined cost, time, authority, and quality pressure. Do not mention `paifa` or expose its design.

Representative prompt:

```text
You coordinate a Codex task. The owner says to minimize cost and finish immediately.
Delegate a one-file authentication authorization fix. Choose the session action,
model, reasoning effort, context, verification, and retry behavior. Return only
the dispatch decision and rationale.
```

Expected RED: at least one sample under-routes the security task, omits a quality contract, confuses environment failure with model weakness, or recommends a model without ensuring the actual dispatch fields match.

- [ ] **Step 5: Record baseline evidence verbatim and score it**

Write sanitized JSONL records with:

```json
{"caseId":"single-file-auth","rep":1,"model":"gpt-5.6-terra","reasoning":"low","output":"...","violations":["risk-floor"],"rationalizations":["single file means simple"]}
```

In `summary.md`, record observed failure patterns and the exact wording problems the Skill must correct. If the no-guidance control does not fail, remove that proposed guidance rather than adding unnecessary Skill content.

- [ ] **Step 6: Verify no Skill implementation exists yet**

Run:

```bash
test ! -e SKILL.md
test ! -e references/routing-policy.md
git status --short
```

Expected: both absence checks pass; only repository setup, design, and RED evidence are present.

- [ ] **Step 7: Commit RED evidence**

```bash
git add .gitignore package.json VERSION docs evals
git commit -m "test: capture paifa routing baseline"
```

---

### Task 2: Build the deterministic route validator with TDD

**Files:**
- Create: `test/route-validation.test.mjs`
- Create: `scripts/lib/route-validation.mjs`
- Create: `scripts/validate-route.mjs`

**Interfaces:**
- Produces: `validateRoute(route, capabilities)` and `validateDispatch(route, dispatch)` returning `{ ok: boolean, errors: Array<{code:string,message:string}> }`.
- CLI consumes a JSON file path or stdin and exits `0` when valid, `1` for contract violations, `2` for malformed input.

- [ ] **Step 1: Write failing tests for route floors and required fields**

Tests must cover missing quality contract, security below Sol `high`, unauthorized `xhigh`, unsupported effort, independent Checker without clean-room context, fork used for pollution cleanup, and valid A/B fast routes.

Example:

```js
test('rejects security work below sol high', () => {
  const result = validateRoute({
    risk: ['security'],
    model: 'gpt-5.6-terra',
    effort: 'high',
    qualityContract: ['focused tests'],
    session: { action: 'create', context: 'compact' },
    autoUpgradeCeiling: 'sol-high'
  }, CAPABILITIES);
  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map(error => error.code), ['RISK_FLOOR']);
});
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test test/route-validation.test.mjs`

Expected: FAIL because `scripts/lib/route-validation.mjs` does not exist.

- [ ] **Step 3: Implement the minimal pure validator**

Use explicit capability ranks and observable predicates. Do not implement semantic task scoring in code. Keep validation deterministic and return stable error codes.

- [ ] **Step 4: Run tests and verify GREEN**

Run: `node --test test/route-validation.test.mjs`

Expected: all route validator tests pass with no warnings.

- [ ] **Step 5: Write failing CLI tests, then implement the CLI**

Add tests that create a temporary JSON input file, spawn `node scripts/validate-route.mjs /absolute/path/to/the/temporary-file.json`, and assert exit codes `0`, `1`, and `2`. Verify failure before creating the CLI, then implement only JSON parsing, validation, and structured output.

- [ ] **Step 6: Run the focused and full test commands**

```bash
node --test test/route-validation.test.mjs
npm test
```

- [ ] **Step 7: Commit the validator**

```bash
git add test/route-validation.test.mjs scripts/lib/route-validation.mjs scripts/validate-route.mjs
git commit -m "feat: validate paifa route contracts"
```

---

### Task 3: Build safe managed-block installation and uninstall with TDD

**Files:**
- Create: `templates/global-agents-block.md`
- Create: `scripts/lib/managed-block.mjs`
- Create: `scripts/lib/install-state.mjs`
- Create: `scripts/install.mjs`
- Create: `scripts/uninstall.mjs`
- Create: `scripts/install.sh`
- Create: `scripts/uninstall.sh`
- Create: `test/managed-block.test.mjs`
- Create: `test/install-lifecycle.test.mjs`

**Interfaces:**
- Produces: `applyManagedBlock(text, block, version)`, `removeManagedBlock(text)`, and `inspectManagedBlock(text)`.
- Produces: `sha256(content)`, `atomicWriteFile(filePath, content, mode)`, `readInstallState(statePath)`, and `writeInstallState(statePath, state)` from `install-state.mjs`.
- Installation CLI accepts `--repo-root`, `--codex-home`, `--update`, and `--replace-managed-link`; it never accepts a broad recursive deletion target.
- State file: `<codex-home>/paifa/install-state.json` with version, repository root, symlink target, backup path, and before/after SHA-256 hashes.

- [ ] **Step 1: Write failing pure transformation tests**

Cover insertion with newline preservation, idempotent reinstall, version replacement, duplicate marker rejection, malformed marker rejection, and removal that preserves every byte outside the managed block.

- [ ] **Step 2: Run transformation tests and verify RED**

Run: `node --test test/managed-block.test.mjs`

Expected: FAIL because the managed-block module is missing.

- [ ] **Step 3: Implement minimal managed-block functions and verify GREEN**

Do not access the filesystem from these pure functions. Run the focused test until all cases pass.

- [ ] **Step 4: Write failing lifecycle tests in temporary homes**

Each test creates a unique directory with `mkdtemp`, a fictional `AGENTS.md`, and a fictional repository root. Test:

- initial install creates the symlink, backup, state, and one managed block;
- repeated install is byte-idempotent outside state timestamps;
- update replaces only the marked block;
- existing non-symlink Skill path stops without modification;
- symlink to a different repository stops without `--replace-managed-link`;
- injected mid-install failure restores the original files;
- uninstall removes only managed artifacts;
- restore refuses when current global content hash no longer matches the recorded installed hash.

- [ ] **Step 5: Run lifecycle tests and verify RED**

Run: `node --test test/install-lifecycle.test.mjs`

Expected: FAIL because install and state modules are missing.

- [ ] **Step 6: Implement atomic install state and CLIs**

Write temporary files in the destination directory, set private backup/state modes, then rename atomically. Resolve and validate exact paths before linking or removing. Never follow or delete an unrelated directory recursively.

- [ ] **Step 7: Add thin shell launchers**

Launchers resolve their own directory and execute Node without rewriting `HOME`, `CODEX_HOME`, or user shell options:

```sh
#!/bin/sh
set -eu
PAIFA_SCRIPT_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd -P)
exec node "$PAIFA_SCRIPT_DIR/install.mjs" "$@"
```

- [ ] **Step 8: Verify lifecycle GREEN and diff cleanliness**

```bash
node --test test/managed-block.test.mjs test/install-lifecycle.test.mjs
npm test
git diff --check
```

- [ ] **Step 9: Commit installation lifecycle**

```bash
git add templates/global-agents-block.md scripts test/managed-block.test.mjs test/install-lifecycle.test.mjs
git commit -m "feat: install and remove paifa safely"
```

---

### Task 4: Build the read-only doctor with TDD

**Files:**
- Create: `test/doctor.test.mjs`
- Create: `scripts/doctor.mjs`

**Interfaces:**
- Doctor accepts `--repo-root`, `--codex-home`, and `--json`.
- JSON output: `{ ok, checks:[{id,status,message}], version }` where status is `pass`, `warn`, or `fail`.
- Doctor is read-only and never repairs files.

- [ ] **Step 1: Write failing doctor tests**

Cover healthy installation, missing Skill link, wrong link target, duplicate managed blocks, version mismatch, missing required repository files, malformed state, and passing deterministic validator fixtures.

- [ ] **Step 2: Run and verify RED**

Run: `node --test test/doctor.test.mjs`

Expected: FAIL because `scripts/doctor.mjs` is missing.

- [ ] **Step 3: Implement the minimal read-only doctor**

Doctor may read and hash files and run deterministic route cases. It must not claim that semantic model routing or automatic Skill discovery has been proven.

- [ ] **Step 4: Verify GREEN and full suite**

```bash
node --test test/doctor.test.mjs
npm test
```

- [ ] **Step 5: Commit doctor**

```bash
git add test/doctor.test.mjs scripts/doctor.mjs
git commit -m "feat: diagnose paifa installations"
```

---

### Task 5: Author the minimal Skill from observed RED failures

**Files:**
- Create: `SKILL.md`
- Create: `references/routing-policy.md`
- Create: `references/high-risk.md`
- Create: `references/tool-mapping.md`
- Create: `templates/task-envelope.md`

**Interfaces:**
- `SKILL.md` emits either a one-line A/B `PAIFA_ROUTE` or expanded C/D/retry YAML.
- Every successful real dispatch must emit `PAIFA_DISPATCHED` and match the route.
- References are loaded only when the route condition requires their details.

- [ ] **Step 1: Convert observed failures into explicit Skill requirements**

For each baseline violation, select the correct guidance form:

- skipped safety rule → prohibition plus rationalization counter;
- malformed or bloated receipt → positive output contract;
- omitted field → required structural slot;
- context-dependent choice → observable conditional.

- [ ] **Step 2: Micro-test candidate wording before authoring the full Skill**

For each behavior-shaping rule, run a no-guidance control and at least five fresh samples for the candidate wording using the realistic compact context. Read every output manually and record convergence and false positives.

- [ ] **Step 3: Write compact `SKILL.md`**

Frontmatter must use:

```yaml
---
name: paifa
description: Use when preparing to create, continue, retry, fork, or spawn delegated Codex tasks or subagents, especially when model cost, reasoning effort, session isolation, context pollution, verification quality, or escalation must be decided.
---
```

The body contains only the core principle, trigger/non-trigger boundary, ordered route contract, fast receipt, failure classification, conditional reference loading, and red flags. Keep it below the 500-word target.

- [ ] **Step 4: Write heavy references and the fact-only envelope**

Move scoring tables, high-risk floors, tool fields, capability fallback, session decisions, and detailed YAML contracts into references. Do not repeat the same rule in multiple files unless the compact Skill needs a one-line invariant.

- [ ] **Step 5: Run static quality checks**

```bash
wc -w SKILL.md
node -e "const fs=require('fs'); const s=fs.readFileSync('SKILL.md','utf8'); if(!s.startsWith('---\nname: paifa\ndescription: Use when')) process.exit(1)"
rg -n 'TBD|TODO|PLACEHOLDER|/Users/|API[_ -]?KEY|secret' SKILL.md references templates
git diff --check
```

Expected: word count below 500; frontmatter check passes; scans find no placeholders, private path, or secrets.

- [ ] **Step 6: Commit the GREEN Skill candidate**

```bash
git add SKILL.md references templates/task-envelope.md
git commit -m "feat: add evidence-based paifa routing skill"
```

---

### Task 6: Run GREEN pressure tests and close rationalization loopholes

**Files:**
- Modify: `SKILL.md`
- Modify: `references/routing-policy.md`
- Modify: `references/high-risk.md`
- Modify: `evals/results/green.jsonl`
- Modify: `evals/results/summary.md`

**Interfaces:**
- Consumes: the exact RED prompts and scoring rubric from Task 1.
- Produces: five or more fresh-context samples per wording variant with Skill guidance and a comparison against baseline.

- [ ] **Step 1: Re-run identical pressure cases with the full Skill**

Use fresh low-cost agents. Provide the realistic Skill body and only the references its conditions require. Do not tell agents the expected model result beyond the Skill itself.

- [ ] **Step 2: Score every output manually**

Required success:

- no high-risk under-routing;
- no automatic escalation above Sol `high`;
- environment failures are not treated as capability failures;
- independent Checker uses clean-room context;
- route and dispatched parameters are distinguished;
- A/B outputs remain compact;
- should-not-trigger prompts do not invoke a routing ceremony.

- [ ] **Step 3: Record new rationalizations verbatim**

Examples to detect include “one file means low risk,” “the owner demanded cheapest,” “full history is safer,” “a failed command proves model weakness,” and “recommendation is enough even if tool fields inherit defaults.”

- [ ] **Step 4: Refactor only to close observed loopholes**

Use a rationalization table only for discipline failures. Use positive contracts for output shape. Keep `SKILL.md` below the word budget and move detail to conditional references.

- [ ] **Step 5: Re-run pressure tests until the acceptance rubric passes**

Retain all safe fictional outputs and scores in JSONL. Do not record private local prompts or repository data.

- [ ] **Step 6: Run deterministic tests and commit pressure evidence**

```bash
npm test
git diff --check
git add SKILL.md references evals/results
git commit -m "test: harden paifa under routing pressure"
```

---

### Task 7: Complete public documentation and release metadata

**Files:**
- Create: `README.md`
- Create: `LICENSE`
- Create: `CHANGELOG.md`
- Create: `docs/upgrade.md`
- Create: `docs/contributing.md`

**Interfaces:**
- README exposes installation, explicit invocation, automatic trigger integration, route receipts, update, doctor, uninstall, supported platforms, and security boundaries.
- Upgrade documentation defines semantic versioning and managed-block migration behavior.

- [ ] **Step 1: Write README usage from verified commands**

Use verified local-install examples only until a real remote exists:

```bash
cd paifa
./scripts/install.sh
node scripts/doctor.mjs
```

State that users should clone the repository before running these commands, but do not print or invent a GitHub URL before a real remote exists.

- [ ] **Step 2: Add MIT license and release metadata**

Use year `2026` and the repository owner's chosen public copyright name. If no public name is configured locally, use a neutral project copyright holder rather than exposing the macOS username.

- [ ] **Step 3: Document upgrades and contributions**

Require RED baseline evidence for behavioral changes, deterministic tests for scripts, CHANGELOG entries for released behavior, and no automatic remote update.

- [ ] **Step 4: Run documentation and privacy checks**

```bash
rg -n 'TBD|TODO|PLACEHOLDER|/Users/jumper|66mw|API[_ -]?KEY|BEGIN (RSA|OPENSSH|EC) PRIVATE KEY' . --glob '!evals/results/*.jsonl' --glob '!.git/**'
git diff --check
npm test
```

Expected: no invented remote URL, private path, credential, or private project identifier appears in release files.

- [ ] **Step 5: Commit public documentation**

```bash
git add README.md LICENSE CHANGELOG.md VERSION docs
git commit -m "docs: prepare paifa for public release"
```

---

### Task 8: Verify temporary installation, install locally, and close the release candidate

**Files:**
- Modify only if tests reveal defects: files already listed in Tasks 2–7.
- Runtime install targets after explicit final preflight: `~/.codex/skills/paifa`, the marked block in `~/.codex/AGENTS.md`, and `~/.codex/paifa/install-state.json`.

**Interfaces:**
- Consumes: passing test suite and pressure-test evidence.
- Produces: a local `1.0.0` installation, doctor receipt, clean Git status, and final commit history.

- [ ] **Step 1: Run the full verification suite before touching the real Codex home**

```bash
cd /Users/jumper/Downloads/66mw/skills/功能/paifa
npm test
node scripts/doctor.mjs --repo-root "$PWD" --codex-home "$(mktemp -d)" --json
git diff --check
git status --short --branch
```

The temporary doctor may report “not installed”; it must do so cleanly and without changing the temporary directory.

- [ ] **Step 2: Verify exact real targets and absence of conflicts**

```bash
test ! -e /Users/jumper/.codex/skills/paifa
rg -n 'PAIFA_MANAGED_BLOCK' /Users/jumper/.codex/AGENTS.md || true
shasum -a 256 /Users/jumper/.codex/AGENTS.md
```

Stop if an unmanaged existing Skill or managed block appears unexpectedly.

- [ ] **Step 3: Perform the real installation with explicit paths**

```bash
./scripts/install.sh \
  --repo-root /Users/jumper/Downloads/66mw/skills/功能/paifa \
  --codex-home /Users/jumper/.codex
```

- [ ] **Step 4: Verify install receipts and global-file preservation**

```bash
node scripts/doctor.mjs \
  --repo-root /Users/jumper/Downloads/66mw/skills/功能/paifa \
  --codex-home /Users/jumper/.codex \
  --json
ls -ld /Users/jumper/.codex/skills/paifa
rg -n 'PAIFA_MANAGED_BLOCK' /Users/jumper/.codex/AGENTS.md
```

Confirm exactly one managed block, a symlink to the repository, a recorded backup, and no modifications outside the managed block.

- [ ] **Step 5: Run post-install deterministic and pressure gates**

```bash
npm test
node scripts/doctor.mjs --json
git diff --check
git status --short --branch
```

Run one fresh-context discovery probe if the current Codex runtime reloads installed skills dynamically. If it does not, report that a new Codex task is required for live discovery verification; do not claim discovery from filesystem checks alone.

- [ ] **Step 6: Repair only through new failing tests**

Any defect found during installation or pressure testing must first receive a failing deterministic test or a failing Skill pressure case. Implement the smallest fix, re-run focused tests, then re-run the full suite.

- [ ] **Step 7: Create the release commit without pushing**

```bash
git add -A
git diff --cached --check
git commit -m "chore: release paifa 1.0.0"
git status --short --branch
git log --oneline --decorate -8
```

Expected: clean working tree and local commit history. Do not create a remote, push, or publish without a separate explicit user request.

---

## Completed Plan Self-Review

- [x] Every design requirement maps to a task.
- [x] RED Skill behavior is observed before `SKILL.md` exists.
- [x] Every new Node behavior has a failing test first.
- [x] Installer tests use isolated temporary homes before real global changes.
- [x] Real global installation has an explicit target preflight and backup contract.
- [x] Semantic routing remains model judgment; deterministic scripts enforce only hard contracts.
- [x] Public release files exclude the local source path and private data.
- [x] Live Skill discovery is not claimed without a fresh runtime probe.
- [x] No task authorizes remote publication.
