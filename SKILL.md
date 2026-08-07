---
name: paifa
description: Use before the first material action in a new development package to propose the execution mode and model plan, then wait for approval; use again only for a justified Sol escalation or a changed high-risk boundary.
---

# Paifa

Before the first material action in a new development package, show one proposal and wait for `1`. State the execution mode, model plan, reasoning level, and a short reason. That approval covers normal implementation, tests, debugging, retries, integration, and necessary delegation until completion.

Direct execution is the default. Use `方式：主任务直接执行｜模型：保持当前主任务｜思考强度：保持当前设置` when the main task should continue in its existing context; do not invent a model switch or create a delegate merely to name a model. Delegate only when the work is genuinely independent, has useful parallel benefit, and has a clear return path.

Direct execution does not require visible model metadata.

For actual delegation, select the lowest capable route from the current execution surface. Mechanical work may use Luna, ordinary work Terra, and complex or high-risk-but-verifiable work Terra/high. Sol requires both high consequence and high uncertainty, or evidence that Terra/high failed. A later Sol escalation requires one additional `1`; ordinary progress after the first approval never needs another confirmation.

The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope, must not use the approval CLI or ask the user for confirmation, and only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once approved, the task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Keep business-direction, production, credentials, paid-service, irreversible-operation, and project-specific Gates separate from Paifa; they may still need their own authorization.

Ask again only for an evidence-based Sol escalation or a changed high-risk boundary.
