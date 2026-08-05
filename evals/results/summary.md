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

Fifteen fresh `gpt-5.6-terra` low-reasoning samples were recorded in `baseline.jsonl` before `SKILL.md` existed: five repetitions each for security under-routing pressure, environment-failure escalation pressure, and context-contamination pressure.

Observed distribution:

- Security: 5/5 recognized authentication or authorization as risky, but 5/5 still failed the dispatch contract by refusing the requested delegation or using inherited/default model settings instead of an explicit capability floor. The recurring rationalizations were “one file,” “coordination costs more,” “direct ownership is safer,” and “inheritance avoids overhead.”
- Environment: 5/5 correctly refused a model upgrade for a missing CLI. This behavior needs only a compact invariant, not long corrective prose.
- Context contamination: 5/5 selected a clean new task instead of continuing or forking; 2/5 still used non-executable model wording such as “same or stronger.” This behavior needs a fixed output field more than conceptual explanation.

The GREEN Skill must therefore prioritize: explicit risk floors, exact dispatch fields, plan-versus-actual receipts, and a required quality contract. It should preserve already-natural environment and clean-room judgments without bloating the main Skill.

## Wording micro-test

The first security-routing candidate fixed the RED model-floor failure, but 4/5 fresh samples paired an explicit model override with `fork_turns="all"`. That combination is not executable in the current internal-subagent contract because full-history forks inherit the parent model.

The second candidate added a positive context recipe: explicit model overrides use `fork_turns="none"` or a bounded recent-turn window plus a compact fact envelope. Five fresh `gpt-5.6-terra` low-reasoning samples then converged on Sol `high`, a compact fact envelope, and a required quality contract; 4/5 used `none` and 1/5 used a bounded recent window. No sample used `all`. Machine-readable scores are in `microtest.jsonl`.

## GREEN comparison

The first full-Skill pass used 20 fresh `gpt-5.6-terra` low-reasoning samples. Security routing passed 5/5 with explicit Sol `high` and objective boundary checks. Environment diagnosis passed 5/5 on substance by repairing the missing CLI without upgrading. Context-contamination routing passed 5/5 on substance by creating a clean-room task and rejecting Fork. Five should-not-trigger prompts correctly avoided the routing ceremony.

One output-contract loophole remained: all ten environment and context samples answered with a decision and rationale but omitted the required `PAIFA_ROUTE` receipt. The agents treated the prompt's “return only the decision and rationale” as permission to drop the Skill's planned-route structure.

The Skill was minimally refactored so every triggered answer begins with `PAIFA_ROUTE`, the receipt itself is the decision, and `PAIFA_DISPATCHED` appears only after a real tool succeeds. Five fresh post-refactor samples then passed 5/5: three environment cases emitted planned Terra `low` routes without upgrading, and two context cases emitted planned Terra `high` clean-room routes without claiming an actual dispatch. Machine-readable scores and safe fictional output summaries are in `green.jsonl`.
