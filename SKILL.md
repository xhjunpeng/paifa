---
name: paifa
description: Use when preparing to create, continue, retry, fork, or spawn delegated Codex tasks or subagents, especially when model cost, reasoning effort, session isolation, context pollution, verification quality, or escalation must be decided.
---

# Paifa

Route a real delegation to the lowest-cost capability that can meet its quality and risk floor. A recommendation is not a dispatch: record the planned route, validate it, explicitly pass its fields to the dispatch tool, then record what actually ran.

## Trigger boundary

Use before creating, continuing, retrying, forking, or spawning a delegated task or internal subagent, including a request for lowest-cost routing. Do not use for one ordinary task with no delegation, a model explanation with no dispatch, or status-only inspection.

## Route contract

1. Confirm delegation and safe split boundaries; select `create`, `continue`, `spawn-internal`, or `fork`.
2. Apply the risk floor before cost scoring. Authentication, authorization, identity, tenant, billing, payment, migration, security, and production work are never below Sol `high`, even for one file.
3. Select the lowest capable model and effort, context mode, fact-only envelope, objective quality contract, and automatic-upgrade ceiling.
4. Every reply after a trigger begins with `PAIFA_ROUTE`. The receipt is the decision, including when the user asks for only a decision or rationale. A/B routes use the fast receipt below; C/D, high-risk, and retry routes use the YAML contract in `references/routing-policy.md`.
5. Start every route at `phase=planned`. Validate before dispatch and pass matching model, effort, and context explicitly. Internal routes also carry `forkTurns` set to `none` or a finite positive recent-turn count in both planned and actual receipts. Change to `PAIFA_DISPATCHED` only after the real tool succeeds; its fields must match the route.

Fast A/B receipt:

`PAIFA_ROUTE v1 | planned | create | B | gpt-5.6-terra/medium | compact | focused-tests | auto<=gpt-5.6-sol/high`

## Diagnose before escalating

Repair missing tools, permissions, services, or dependencies; do not blame the model. Add a fact envelope when requirements or context are insufficient. Re-route when scope changes. Escalate one step only for evidenced capability failure; automatic escalation stops at Sol `high`. Ask the user before a higher effort, an irreversible action, or changed high-risk consequences.

## Load details only when needed

- Load `references/high-risk.md` for risk, irreversible, security, or production work.
- Load `references/routing-policy.md` for C/D scoring, retries, session/context choice, quality evidence, or expanded YAML.
- Load `references/tool-mapping.md` before a real dispatch, capability fallback, or internal-subagent model override.
- Use `templates/task-envelope.md` whenever handing facts to a new or isolated session.

## Red flags

Do not rationalize a lower floor because work is small, cheap, urgent, or directly owned. Do not dispatch without an objective quality contract. Do not use Fork to clean polluted context. Never rely on inherited defaults or report a recommendation as if it ran.
