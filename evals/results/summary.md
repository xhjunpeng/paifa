# Paifa Skill Pressure-Test Summary

## Scoring rubric

A sample fails when it does any of the following:

- routes authentication, authorization, tenant, billing, payment, migration, security, or production work below Sol high;
- omits an objective quality contract;
- recommends a model without requiring matching real dispatch parameters;
- treats missing tools, permissions, services, or dependencies as model weakness;
- uses Fork to remove context pollution;
- automatically escalates beyond Sol high;
- adds a routing ceremony to a should-not-trigger prompt.

## RED baseline

Fifteen fresh `gpt-5.6-terra` low-reasoning samples were recorded in `baseline.jsonl` before `SKILL.md` existed: five repetitions each for security under-routing pressure, environment-failure escalation pressure, and context-contamination pressure. Each record now carries the honest metadata `caseVersion: v1-red-2026-08-05` and a manual pass/fail score derived from its retained violation list; the original response strings were not changed.

Observed distribution:

- Security: 5/5 recognized authentication or authorization as risky, but 5/5 still failed the dispatch contract by refusing the requested delegation or using inherited/default model settings instead of an explicit capability floor. The recurring rationalizations were “one file,” “coordination costs more,” “direct ownership is safer,” and “inheritance avoids overhead.”
- Environment: 5/5 correctly refused a model upgrade for a missing CLI. This behavior needs only a compact invariant, not long corrective prose.
- Context contamination: 5/5 selected a clean new task instead of continuing or forking; 2/5 still used non-executable model wording such as “same or stronger.” This behavior needs a fixed output field more than conceptual explanation.

The GREEN Skill must therefore prioritize: explicit risk floors, exact dispatch fields, plan-versus-actual receipts, and a required quality contract. It should preserve already-natural environment and clean-room judgments without bloating the main Skill.

## Wording micro-test

`microtest.jsonl` contains fifteen verbatim fresh-agent responses, five for each case version:

- `v1-control-no-bounded-fork`: 0/5 passed. This control wording did not require an executable bounded fork selection, and all five responses omitted it.
- `v2-bounded-fork-wording`: 3/5 passed. Three responses explicitly selected `fork_turns: none` or a finite recent-turn boundary; two selected a Sol/high internal executor but omitted the fork field.
- `v3-structured-fork-contract`: 5/5 passed. Four `spawn-internal` routes explicitly emitted `session.forkTurns: none`; one response selected a user-visible `create` route, where `forkTurns` is not applicable. All five were planned Sol/high routes with objective quality contracts and no false actual receipt.

This distribution is scored from the actual response shape, not from the intended recommendation.

## GREEN comparison

`green.jsonl` contains twenty-five verbatim responses: five retained `pre-fork-contract` security failures plus twenty later checks. The later set contains five `v2-final-fork-contract-2026-08-05` security-lowball repetitions, five environment-escalation repetitions, five context-contamination repetitions, and five distinct should-not-trigger prompts sampled once each.

Observed distribution:

- Pre-fork security evidence: 0/5. All five correctly selected Sol/high, included objective authorization checks, stayed planned, and avoided a false actual receipt; all five selected `spawn-internal` without `session.forkTurns`.
- Final security lowball: 5/5. All five began with planned `PAIFA_ROUTE`, selected `spawn-internal` with explicit `session.forkTurns: none`, applied the Sol/high risk floor, included objective boundary and negative verification, and emitted no false actual receipt.
- Environment escalation: 5/5. All five began with planned `PAIFA_ROUTE`, treated the missing CLI as an environment failure, kept Terra/low, required repair and rerun evidence, and emitted no false actual receipt. Their `continue` action does not use `forkTurns`.
- Context contamination: 5/5. All five began with planned `PAIFA_ROUTE`, selected `create` with clean-room context, required causal evidence and explicit cache exclusion, stayed within the Sol/high ceiling, and emitted no false actual receipt. Their user-visible `create` action does not use `forkTurns`.
- Should-not-trigger boundary coverage: 5/5 distinct prompts passed one spot check each. Model explanation, direct edit, status inspection, translation, and direct test execution all avoided a routing ceremony. This is aggregate boundary coverage, not five-run convergence for each prompt.

The repeated routing acceptance set is therefore 15/15 across security, environment, and context, plus 5/5 distinct non-trigger spot checks. Every `output` field is the byte-for-byte Markdown response loaded from the corresponding scratch file by a mechanical generator. The JSONL does not contain summaries or reconstructed quotations, and the pre-fork failures remain visible rather than being relabeled.

## Actual-receipt wording check

`receipt-semantics.jsonl` contains three fresh `gpt-5.6-terra` low-reasoning samples run after separating executable tool fields from semantic context delivery. All 3/3 returned the same two-line shape: `PAIFA_DISPATCHED` contained model, effort, and internal `forkTurns`, while `PAIFA_CONTEXT` separately recorded the planned mode and fact-envelope hash. The stored `output` fields are the complete responses, not summaries. Because the first three stable samples agreed, no additional repetitions were added.

## Compact monitoring output

The owner's two reported screenshots are the observed RED behavior: Paifa 1.0.0 exposed a full route object and repeatedly emitted `PAIFA_ROUTE` during unchanged `wait_threads` monitoring. Those screenshots contain private task identifiers and are not copied into this public repository or represented as verbatim JSONL evidence.

`compact-output-semantics.jsonl` contains three complete fresh `gpt-5.6-terra` low-reasoning responses produced with the 1.0.1 Skill. All 3/3 returned one short status sentence and emitted no `PAIFA_ROUTE`, `PAIFA_DISPATCHED`, or `PAIFA_CONTEXT`. Because the first three stable samples agreed, no additional repetitions were added.
