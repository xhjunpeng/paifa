---
name: paifa
description: Use when preparing to create, continue, retry, fork, or spawn delegated Codex tasks or subagents, especially when model cost, reasoning effort, session isolation, context pollution, verification quality, or escalation must be decided.
---

# Paifa

Route a real delegation to the lowest-cost capability that can meet its quality and risk floor. Build the full route internally, validate it, show one compact decision, dispatch with explicit fields, then record what actually ran.

## Trigger boundary

Use before creating, continuing, retrying, forking, or spawning a delegated task or internal subagent, including a request for lowest-cost routing. Do not use for one ordinary task, a model explanation with no dispatch, or status-only inspection. Waiting or monitoring already-dispatched work stays status-only until a new retry or reroute decision is required.

## Route contract

1. Confirm delegation and safe split boundaries; select `create`, `continue`, `spawn-internal`, or `fork`.
2. Apply the risk floor before cost scoring. Authentication, authorization, identity, tenant, billing, payment, migration, security, and production work are never below Sol `high`, even for one file.
3. Select the lowest capable model and effort, context mode, fact-only envelope, objective quality contract, and automatic-upgrade ceiling.
4. Inspect task state first. Build the structured route internally at `phase=planned` and validate it. Immediately before the real dispatch decision, emit exactly the validator's one-line `PAIFA_ROUTE` receipt plus at most one short explanation. Use this compact shape for A/B/C/D, high-risk, and retry routes. Show raw route YAML only when the user explicitly requests audit details or validation fails.
5. Do not repeat Paifa receipts during waiting, monitoring, polling, or status updates. A materially new dispatch, retry, or reroute repeats step 4 once. Pass matching model and effort explicitly; internal routes also pass `forkTurns` as `none` or a quoted positive integer. After tool success, emit one `PAIFA_DISPATCHED` and one `PAIFA_CONTEXT`.

Fast A/B receipt:

`PAIFA_ROUTE v1 | planned | create | B | gpt-5.6-terra/medium | compact | maker | checks=2 | auto<=gpt-5.6-sol/high`

## Diagnose before escalating

Repair missing tools, permissions, services, or dependencies; do not blame the model. Add a fact envelope when requirements or context are insufficient. Re-route when scope changes. Escalate one step only for evidenced capability failure; automatic escalation stops at Sol `high`. Ask the user before a higher effort, an irreversible action, or changed high-risk consequences.

## Load details only when needed

- Load `references/high-risk.md` for risk, irreversible, security, or production work.
- Load `references/routing-policy.md` for C/D scoring, retries, session/context choice, quality evidence, or audit-only YAML.
- Load `references/tool-mapping.md` before a real dispatch, capability fallback, or internal-subagent model override.
- Use `templates/task-envelope.md` whenever handing facts to a new or isolated session.

## Red flags

Do not rationalize a lower floor because work is small, cheap, urgent, or directly owned. Do not dispatch without an objective quality contract. Do not use Fork to clean polluted context. Never rely on inherited defaults, report a recommendation as if it ran, or invent `verifying`, `dispatched`, or `monitoring` route phases.
