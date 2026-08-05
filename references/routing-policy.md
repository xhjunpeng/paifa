# Routing policy

Use this reference for C/D routes, retries, or any decision that needs scoring or a detailed receipt.

## Lightweight scoring

Score each factor `0`, `1`, or `2`: requirement clarity (clear / minor judgment / unclear or conflicting); module coupling (isolated / same-module multiple files / cross-module or service); error consequence (recoverable / functional correctness / security, data, or production); verification (clear automation / automation plus judgment / subjective or absent); root-cause certainty (mechanical / ordinary diagnosis / unknown or architectural).

| Total | Route | Default capability |
| --- | --- | --- |
| 0–2 | A | Luna `low` or `medium` |
| 3–5 | B | Terra `medium` |
| 6–7 | C | Terra `high`; Sol `high` for a complex unknown root cause |
| 8–10 | D | Sol `high` |

Risk floors in `high-risk.md` override this table. File count and elapsed time do not raise a route: split independent mechanical work first. If an internal subagent lacks Luna capability, begin its low-risk work at Terra `low` or `medium`.

## Session and context

| Observable condition | Session action | Context |
| --- | --- | --- |
| Independent deliverable, separate evidence/worktree, different model, or only a few facts needed | `create` or `spawn-internal` | `minimal` or `compact` |
| Same goal, scope, and worktree; first or second repair of the same cause | `continue` | `recent` or `compact` |
| Two same-cause failures plus contradicted assumptions, material scope change, or polluted history | `create` | `clean-room` |
| Branch exploration genuinely needs most prior decisions and history is not polluted | `fork` | `full-required` |

Never use Fork to save tokens or to remove polluted assumptions. New or clean-room sessions receive only verified facts through the task envelope.

## Quality contract

Dispatch only with one or more objective checks. Code uses tests, type checks, builds, and exact diffs; investigation uses reproduction, sources, causal evidence, and exclusions; UI uses screenshots, real interaction, responsive checks, and necessary localization; security uses boundary and negative tests; documentation uses completeness, links, and terminology. If missing facts change risk or outcome, request them first; otherwise state the minimal check and residual risk.

## Failure and escalation

| Evidence after verification | Next action |
| --- | --- |
| Missing tool, permission, service, or dependency | Repair environment; keep capability |
| Unclear requirement or insufficient facts | Add the envelope; keep capability |
| Material scope change | Re-route |
| Clear requirements plus repeated key omissions, two same-cause failures, contradictory output, wrong-module diagnosis despite sufficient context, substantive Checker finding, or claimed completion with failed checks | Escalate one supported step |

The automatic ceiling is `gpt-5.6-sol` / `high`; confirmation rules are in `high-risk.md`.

## Internal route object and audit details

Build and validate the complete object below before dispatch. For normal user-visible output, emit only the one-line receipt returned by `validate-route.mjs`, followed by at most one short practical explanation. Do not print this YAML during ordinary progress. Show it only when the user explicitly requests audit details or route validation fails.

```yaml
PAIFA_ROUTE:
  version: v1
  phase: planned
  session: { action: spawn-internal, context: compact, forkTurns: none }
  dispatchType: task
  role: maker
  routeClass: C
  scores: { clarity: 1, coupling: 2, consequence: 1, verification: 1, rootCause: 2 }
  risk: []
  riskFloor: { model: gpt-5.6-terra, effort: high }
  model: gpt-5.6-terra
  effort: high
  qualityContract: [node --test test/target.test.mjs, git diff --check]
  autoUpgradeCeiling: { model: gpt-5.6-sol, effort: high }
  userConfirmedAboveCeiling: false
  escalationReason: unknown-root-cause
```

After successful tool execution, emit an actual tool receipt, for example: `PAIFA_DISPATCHED | model=gpt-5.6-terra | effort=high | forkTurns=none`. Validate model, effort, and internal-route `forkTurns` against the planned route. Context mode is semantic policy, not a tool receipt field; record its delivery separately, for example: `PAIFA_CONTEXT | mode=compact | delivery=envelope:sha256:<hash>`. Do not merge planned, actual, and delivery evidence into one claim.

Waiting, monitoring, polling, and status-only updates after dispatch emit no Paifa receipt. Emit another planned receipt only when a new retry, reroute, fork, continuation, or delegated task will actually be dispatched.
