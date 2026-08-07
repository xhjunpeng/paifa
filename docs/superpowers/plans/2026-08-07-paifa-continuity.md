# Paifa Continuity Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:executing-plans` to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make direct execution the default, permit delegation only when its benefits and continuity guarantees are evidenced, and provide durable records for a dispatched task's return and recovery.

**Architecture:** Add a pure execution-mode decision module and a separate dispatch-record state module. The skill and installation template will use the decision model to govern real delegation, while the runtime helpers validate host capabilities and safely persist/recover dispatch facts without pretending to provide a background wakeup service.

**Tech Stack:** Node.js 24, native ESM, `node:test`, Node filesystem APIs.

## Global Constraints

- Direct execution is the default and must not require visible model metadata.
- Delegation requires evidence for independence, parallel benefit, lower handoff cost, and a reliable continuity path.
- Missing continuity capabilities must return `direct` before a delegate is created.
- Sol approval remains a model-upgrade Gate and is independent of the choice to delegate.
- Do not build a general DAG scheduler, a daemon, or claim that the host can wake a finished Codex turn.
- Use `apply_patch` for repository edits and run `npm test` before the final implementation commit.

---

## File structure

| File | Responsibility |
| --- | --- |
| `scripts/lib/execution-decision.mjs` | Pure, side-effect-free `direct`/`subagent`/`task` decision from evidence and host capabilities. |
| `scripts/lib/dispatch-state.mjs` | Validate, atomically persist, recover, transition, deduplicate, and cancel `DispatchRecord` data. |
| `scripts/lib/dispatch-capabilities.mjs` | Preserve model capability resolution and add explicit continuity-capability normalization. |
| `test/execution-decision.test.mjs` | Regression coverage that ordinary work stays direct and unsafe delegation is rejected. |
| `test/dispatch-state.test.mjs` | State-machine, persistence, duplicate-result, cancellation, and recovery coverage. |
| `test/dispatch-capabilities.test.mjs` | Continuity-capability normalization tests. |
| `SKILL.md`, `README.md`, `references/*.md`, templates | The human/agent policy contract, consistent with the executable helpers. |
| `test/host-lifecycle.test.mjs`, `test/repository-release.test.mjs` | Installed-rule and policy regression coverage. |
| `VERSION`, `CHANGELOG.md` | Release the behavior change as the next minor version. |

## Public data contracts

```js
// scripts/lib/execution-decision.mjs
export function decideExecution({ candidate, requirements, hostCapabilities }) {
  // -> { mode: 'direct' | 'subagent' | 'task', reason, checks }
}

// candidate checks are fact/evidence pairs rather than estimated duration or file count.
const candidate = {
  independence: { satisfied: true, evidence: 'Inputs and acceptance command are complete.' },
  parallelBenefit: { satisfied: true, evidence: 'Main can implement module A while review runs.' },
  handoffCost: { satisfied: true, evidence: 'Fact package is bounded and result is one report.' },
  continuity: { satisfied: true, evidence: 'Result callback and parent wait are available.' },
};

// scripts/lib/dispatch-state.mjs
export function createDispatchRecord(input) { /* validated proposed record */ }
export function transitionDispatch(record, nextState, update) { /* immutable record */ }
export function persistDispatchRecord(stateDir, record) { /* atomic write */ }
export function readDispatchRecord(stateDir, dispatchId) { /* record or null */ }
export function acceptDispatchResult(record, result) { /* idempotent receipt */ }
```

### Task 1: Add direct-first execution decisions

**Files:**
- Create: `scripts/lib/execution-decision.mjs`
- Create: `test/execution-decision.test.mjs`
- Modify: `scripts/lib/dispatch-capabilities.mjs`
- Modify: `test/dispatch-capabilities.test.mjs`

**Consumes:** Existing `selectDispatchKind()` semantics: an independent worktree, durable visibility, direct user follow-up, or independent review selects `task` only after delegation is approved.

**Produces:** `decideExecution()` and `normalizeContinuityCapabilities()` for policy callers and later dispatch-state integration.

- [ ] **Step 1: Write failing decision tests for the direct default and four evidence checks**

```js
import { decideExecution } from '../scripts/lib/execution-decision.mjs';

test('keeps an ordinary sequential change in the main task', () => {
  assert.deepEqual(decideExecution({
    candidate: {
      independence: { satisfied: false, evidence: 'Each fix depends on the previous test.' },
      parallelBenefit: { satisfied: false, evidence: 'No separate work can proceed.' },
      handoffCost: { satisfied: false, evidence: 'The active debugging context is required.' },
      continuity: { satisfied: false, evidence: 'No result wakeup is available.' },
    },
    requirements: {},
    hostCapabilities: {},
  }).mode, 'direct');
});

test('permits a bounded subagent only with all evidence and continuity capabilities', () => {
  assert.equal(decideExecution({ candidate: eligibleCandidate, requirements: {},
    hostCapabilities: { resultReturn: true, parentWait: true, checkpointStore: true },
  }).mode, 'subagent');
});
```

- [ ] **Step 2: Run the focused test to verify the module is absent**

Run: `node --test test/execution-decision.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `execution-decision.mjs`.

- [ ] **Step 3: Implement the pure decision module and capability normalization**

```js
const REQUIRED_EVIDENCE = ['independence', 'parallelBenefit', 'handoffCost', 'continuity'];

export function decideExecution({ candidate = {}, requirements = {}, hostCapabilities = {} }) {
  const checks = Object.fromEntries(REQUIRED_EVIDENCE.map((name) => [name, candidate[name] ?? {
    satisfied: false, evidence: 'No verified evidence supplied.',
  }]));
  const needsTask = ['independentWorktree', 'durable', 'userFollowUp', 'independentReview']
    .some((name) => requirements[name] === true);
  const continuityAvailable = needsTask
    ? hostCapabilities.resultReturn && hostCapabilities.parentWake && hostCapabilities.checkpointStore
    : hostCapabilities.resultReturn && hostCapabilities.parentWait && hostCapabilities.checkpointStore;
  if (!REQUIRED_EVIDENCE.every((name) => checks[name].satisfied === true) || !continuityAvailable) {
    return { mode: 'direct', reason: 'Delegation lacks verified benefit or continuity.', checks };
  }
  return { mode: needsTask ? 'task' : 'subagent', reason: 'Delegation is independently recoverable.', checks };
}
```

Add `normalizeContinuityCapabilities(value)` to return only explicit booleans for `resultReturn`, `parentWait`, `parentWake`, and `checkpointStore`; it must never infer wakeup support from a tool name.

- [ ] **Step 4: Run focused decision and capability tests**

Run: `node --test test/execution-decision.test.mjs test/dispatch-capabilities.test.mjs`

Expected: PASS; include cases for absent evidence, missing `parentWait`, missing `parentWake` for `task`, and direct execution with no model capability metadata.

- [ ] **Step 5: Commit the independently verified decision layer**

```bash
git add scripts/lib/execution-decision.mjs scripts/lib/dispatch-capabilities.mjs \
  test/execution-decision.test.mjs test/dispatch-capabilities.test.mjs
git commit -m "feat: choose direct execution before delegation"
```

### Task 2: Implement durable dispatch records and recovery guards

**Files:**
- Create: `scripts/lib/dispatch-state.mjs`
- Create: `test/dispatch-state.test.mjs`

**Consumes:** The execution mode selected in Task 1, Node atomic-write conventions in `scripts/lib/approval-state.mjs`.

**Produces:** A host-neutral record store that callers can use before starting a real delegate and when processing one result.

- [ ] **Step 1: Write failing state-machine and persistence tests**

```js
test('writes a checkpoint before the running transition and accepts one matching result', () => {
  const proposed = createDispatchRecord(validInput);
  const running = transitionDispatch(proposed, 'running');
  const waiting = transitionDispatch(running, 'waiting', { resumeCheckpoint: { next: 'integrate' } });
  persistDispatchRecord(stateDir, waiting);
  assert.equal(acceptDispatchResult(readDispatchRecord(stateDir, waiting.dispatchId), validResult).accepted, true);
});

test('does not integrate a duplicate or late result twice after success', () => {
  const succeeded = transitionDispatch(waiting, 'succeeded', { resultReceipt: validResult });
  assert.equal(acceptDispatchResult(succeeded, validResult).accepted, false);
});
```

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `node --test test/dispatch-state.test.mjs`

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `dispatch-state.mjs`.

- [ ] **Step 3: Implement validation, transitions, atomic persistence, and result idempotency**

```js
const TRANSITIONS = {
  proposed: new Set(['running', 'cancelled']),
  running: new Set(['waiting', 'failed', 'blocked', 'cancelled']),
  waiting: new Set(['succeeded', 'failed', 'blocked', 'cancelled']),
  failed: new Set(['running', 'cancelled']),
  blocked: new Set(['running', 'cancelled']),
  succeeded: new Set(),
  cancelled: new Set(),
};

export function acceptDispatchResult(record, result) {
  if (record.state !== 'waiting' || result.dispatchId !== record.dispatchId
    || result.attempt !== record.attempt) return { accepted: false, record };
  return { accepted: true, record: transitionDispatch(record, 'succeeded', { resultReceipt: result }) };
}
```

Use `mkdirSync`, a `randomUUID()` temporary filename, `writeFileSync`, and `renameSync`, following the approval-state module. Validate IDs, `subagent|task` mode, fact envelope, return contract, checkpoint, and route fields before persistence. Do not create records for `direct` mode.

- [ ] **Step 4: Run focused state tests**

Run: `node --test test/dispatch-state.test.mjs`

Expected: PASS; include illegal transitions, cancelled no-restart behavior, restart from `failed` only through `running`, invalid record rejection, and read-after-write recovery.

- [ ] **Step 5: Commit the independently verified record layer**

```bash
git add scripts/lib/dispatch-state.mjs test/dispatch-state.test.mjs
git commit -m "feat: persist recoverable dispatch records"
```

### Task 3: Change the installed Paifa policy from an execution gate to a dispatch gate

**Files:**
- Modify: `SKILL.md`
- Modify: `README.md`
- Modify: `templates/global-agents-block.md`
- Modify: `templates/task-envelope.md`
- Modify: `references/routing-policy.md`
- Modify: `references/tool-mapping.md`
- Modify: `test/host-lifecycle.test.mjs`
- Modify: `test/repository-release.test.mjs`

**Consumes:** The direct-first behavior from Task 1 and DispatchRecord constraints from Task 2.

**Produces:** One consistent user-facing and installed policy that cannot imply automatic wakeup when the host lacks it.

- [ ] **Step 1: Write regression assertions for the new narrow trigger**

```js
assert.match(block, /only when considering a real delegation, model upgrade, or high-risk boundary/i);
assert.doesNotMatch(block, /next action will change state/i);
assert.match(skill, /Direct execution is the default/);
assert.match(skill, /must not claim.*automatic continuation/i);
assert.doesNotMatch(skill, /If either is unavailable.*must use.*内部子智能体/is);
```

- [ ] **Step 2: Run the policy tests to verify the old contract fails**

Run: `node --test test/host-lifecycle.test.mjs test/repository-release.test.mjs`

Expected: FAIL because the repository still advertises state-changing actions as the trigger.

- [ ] **Step 3: Update all policy surfaces with the same semantics**

Replace the trigger with this concise installer text:

```text
Invoke `paifa` only when considering real delegated work, a model upgrade, or a high-risk boundary. Ordinary direct editing, testing, debugging, retries, and integration remain with the main task. Delegate only when independence, parallel benefit, lower handoff cost, and a verified return/continuation path are all present; otherwise execute directly. Its SKILL.md is the source of truth.
```

In `SKILL.md`, define the four fact-based checks, describe `direct` as the default mode, move model selection after the execution-mode decision, retain the Sol Gate unchanged, and require the parent to wait/restore a DispatchRecord for real delegation. Explain that no available `parentWake` means a cross-turn `task` cannot be promised to continue automatically.

In `templates/task-envelope.md`, keep the existing verified-facts fields and add optional `Dispatch ID`, `Return contract`, and `Resume checkpoint` fields for real delegation only. In the tool mapping, document required explicit capability fields rather than treating "continue existing task" as a wakeup guarantee.

- [ ] **Step 4: Run focused lifecycle and release tests**

Run: `node --test test/host-lifecycle.test.mjs test/repository-release.test.mjs test/install-lifecycle.test.mjs`

Expected: PASS; the install test must still prove that unrelated AGENTS rules and managed-block updates are preserved.

- [ ] **Step 5: Commit the policy migration**

```bash
git add SKILL.md README.md templates references test/host-lifecycle.test.mjs test/repository-release.test.mjs
git commit -m "feat: make paifa delegation opt-in"
```

### Task 4: Release, integration-test, and verify the non-wakeup fallback

**Files:**
- Modify: `VERSION`
- Modify: `CHANGELOG.md`
- Modify: `test/simple-dispatch-contract.test.mjs`
- Modify: `test/route-validation.test.mjs`
- Modify: `test/approval-state.test.mjs` (only if exact policy text requires changed fixtures)

**Consumes:** Tasks 1–3.

**Produces:** A release-ready minor version with no regression that accidentally makes direct execution require a delegate or weakens the Sol Gate.

- [ ] **Step 1: Add integration regressions before release metadata**

```js
test('missing wakeup capability falls back to direct before a dispatch record can exist', () => {
  const decision = decideExecution({ candidate: eligibleCandidate, requirements: { durable: true },
    hostCapabilities: { resultReturn: true, checkpointStore: true, parentWake: false },
  });
  assert.equal(decision.mode, 'direct');
  assert.throws(() => createDispatchRecord({ mode: decision.mode }), /DIRECT_MODE_NOT_DISPATCHABLE/);
});
```

- [ ] **Step 2: Run the integration subset**

Run: `node --test test/execution-decision.test.mjs test/dispatch-state.test.mjs test/dispatch-capabilities.test.mjs test/simple-dispatch-contract.test.mjs test/route-validation.test.mjs test/approval-state.test.mjs`

Expected: PASS; Sol route selection and one-time approval remain unchanged.

- [ ] **Step 3: Update release metadata**

Set `VERSION` to the next minor release after `1.5.0` and add a dated `CHANGELOG.md` entry that states:

```markdown
## 1.6.0

- Main tasks now execute directly by default.
- Delegation needs four evidence checks and verified continuity capabilities.
- Added recoverable, idempotent dispatch records; no host wakeup is represented as direct execution rather than a promise to auto-continue.
```

- [ ] **Step 4: Run the complete verification suite**

Run: `npm test && git diff --check && node scripts/doctor.mjs`

Expected: all Node tests pass, no whitespace errors, and the repository doctor reports the local package as structurally valid.

- [ ] **Step 5: Review the final diff and commit the release**

```bash
git diff --check
git status --short
git add VERSION CHANGELOG.md test/simple-dispatch-contract.test.mjs test/route-validation.test.mjs test/approval-state.test.mjs
git commit -m "release: paifa 1.6.0"
```

Confirm before staging that the status contains only files created or modified by this implementation; do not stage unrelated user changes.

## Plan self-review

- **Spec coverage:** Tasks 1 and 3 implement the direct default and four checks; Tasks 1–2 implement explicit capabilities, return, checkpoint, deduplication, cancellation, and recovery; Tasks 3–4 retain Sol gating and test the no-wakeup fallback. The out-of-scope DAG/daemon claim is not implemented.
- **Placeholders:** The plan has no `TBD`, `TODO`, or implicit test instructions; each code-changing task names its interfaces, tests, commands, and commit scope.
- **Type consistency:** Decision modes are consistently `direct | subagent | task`; continuity capabilities are consistently `resultReturn`, `parentWait`, `parentWake`, `checkpointStore`; DispatchRecord states are consistently defined in Task 2.
