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

## GREEN comparison

GREEN samples will reuse the exact RED prompts and rubric after the Skill is authored.
