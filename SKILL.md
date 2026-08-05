---
name: paifa
description: Use when preparing to create, continue, retry, fork, or spawn delegated Codex tasks or subagents, especially when model cost, reasoning effort, session isolation, context pollution, verification quality, or escalation must be decided.
---

# Paifa

Route a real delegation to the lowest-cost capability that can meet its quality and risk floor. Build the full route internally, validate it, show one compact decision, dispatch with explicit fields, then record what actually ran.

## Trigger boundary

Use before creating, continuing, retrying, forking, or spawning delegated work. Paifa does not authorize, require, or recommend delegation by itself. Do not use for an ordinary task, a model explanation without dispatch, or status-only inspection.

## Route contract

1. Confirm safe split boundaries; select `create`, `continue`, `spawn-internal`, or `fork`.
2. Apply the risk floor before cost scoring. Authentication, authorization, identity, tenant, billing, payment, migration, security, and production work are never below Sol `high`, even for one file.
3. Select the lowest capable model and effort, context, fact envelope, quality contract, and upgrade ceiling.
4. Inspect state, build and validate the internal `phase=planned` route, then emit its single-line `PAIFA_ROUTE` plus at most one sentence. Show YAML only for explicit audit details or validation failure.
5. Pass explicit model and effort; internal routes also pass `forkTurns` as `none` or a positive string. After success, emit one `PAIFA_DISPATCHED` and `PAIFA_CONTEXT`. Waiting, polling, and status updates emit no receipts; retry or reroute starts a new route.

Fast A/B receipt:

`PAIFA_ROUTE v1 | planned | create | B | gpt-5.6-terra/medium | compact | maker | checks=2 | auto<=gpt-5.6-sol/high`

## Main-task lifecycle

The main task owns completion. Continue all safe independent work while delegated work runs. If a required step depends on its result, wait, integrate it, and verify the combined outcome before the final answer. The main task must not end its turn merely because delegated work started.

## Diagnose before escalating

Repair missing tools, permissions, services, or dependencies without blaming the model. Add missing facts, and re-route scope changes. Escalate one step only for evidenced capability failure, stopping automatically at Sol `high`. Ask before higher effort, irreversible action, or increased high-risk consequences.

## Load details only when needed

- Load `references/high-risk.md` for risk, irreversible, security, or production work.
- Load `references/routing-policy.md` for C/D scoring, retries, session/context choice, quality evidence, or audit-only YAML.
- Load `references/tool-mapping.md` before a real dispatch, capability fallback, or internal-subagent model override.
- Use `templates/task-envelope.md` whenever handing facts to a new or isolated session.

## Red flags

Do not rationalize a lower floor because work is small, cheap, urgent, or directly owned. Do not dispatch without an objective quality contract. Do not use Fork to clean polluted context. Never rely on inherited defaults, report a recommendation as if it ran, or invent `verifying`, `dispatched`, or `monitoring` route phases.
