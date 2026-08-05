# Paifa Compact Output Design

## Goal

Keep Paifa's complete routing and validation contract while reducing ordinary user-visible output to one final compact route line plus one short plain-language explanation.

## Root cause

Paifa 1.0.0 requires every triggered reply to begin with `PAIFA_ROUTE` and requires C/D, high-risk, and retry routes to expose the full YAML route object. Codex commentary is visible, so a preliminary route followed by a post-inspection route leaves both receipts in the conversation. The screenshot reported by the owner is the expected result of those rules, not an application rendering fault.

## Confirmed behavior

1. Inspect task state and gather the facts needed for routing before emitting a planned receipt.
2. Build the complete structured route internally and run deterministic validation.
3. On successful validation, emit exactly one compact planned receipt immediately before the real dispatch action:

   ```text
   PAIFA_ROUTE v1 | planned | create | D | gpt-5.6-sol/high | clean-room | checker | checks=4 | auto<=gpt-5.6-sol/high
   ```

4. Follow it with at most one short plain-language sentence explaining the practical reason.
5. Ordinary status and progress commentary must not repeat the receipt or expose the raw YAML object.
6. Show expanded YAML only when the user explicitly requests audit details or when deterministic validation fails and the invalid object is needed for diagnosis.
7. If facts materially change before dispatch, recompute silently and emit only the final route. A later, separate dispatch attempt may emit one replacement receipt after revalidation.
8. After a successful dispatch, retain the existing compact `PAIFA_DISPATCHED` and `PAIFA_CONTEXT` receipts.

## Deterministic contract

`validateRoute()` returns a compact receipt only for a valid route. The receipt is generated from the validated fields rather than copied from free-form model text. Invalid routes return errors and no compact receipt. Internal subagent receipts include `forkTurns`; other actions omit it.

The supported route schema remains `version: v1`, route classes `A` through `D`, roles `maker`, `checker`, and `investigator`, and the existing session, risk-floor, quality, and escalation rules.

## Public and installed behavior

- `SKILL.md` uses the compact receipt for every normal route class.
- `references/routing-policy.md` keeps the expanded YAML as audit-only reference material.
- The global managed block requires one validated compact route before dispatch and forbids raw YAML during ordinary progress.
- README and the main design document describe compact-by-default behavior.
- Release version becomes `1.0.1`; the local installation is updated with `--update` after repository verification.

## Verification

- Preserve the owner's screenshot as the observed RED baseline; do not reconstruct it as fresh output evidence.
- Add deterministic tests for compact receipt generation, invalid-route suppression, internal `forkTurns`, and CLI output.
- Run three fresh `gpt-5.6-terra` low-reasoning semantic samples against the updated Skill. Expand to five only if the first three disagree or fail.
- Run the complete test suite, Doctor, word-count, format, evidence-integrity, and privacy checks before updating the real installation.

## Non-goals

- No automatic receipt log or new background state.
- No change to risk floors, model selection, escalation ceilings, session isolation, or authorization boundaries.
- No second independent Reviewer for this narrow output fix.
