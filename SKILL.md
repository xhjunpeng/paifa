---
name: paifa
description: Use when beginning a new development package before its first material action, or when evidence requires a Sol escalation or a changed high-risk boundary.
---

# Paifa

Before the first material action in a new development package, show one proposal and wait for `1`. State the execution mode, model plan, reasoning level, and a short reason. That approval covers normal implementation, tests, debugging, retries, integration, and necessary delegation until completion.

All Codex-initiated confirmations and choices use numbered replies: place the recommended option first as `1`; for a confirmation say `回复 1 执行`; for alternatives, ask for only the selected number. Never ask users to type confirmation, authorization, yes, or similar words. This cannot alter operating-system, browser, or third-party permission prompts.

Direct execution is the default. For a direct proposal, use `方式：主任务直接执行｜推荐模型：<具体模型>｜推荐思考强度：<具体强度>｜执行：保持当前主任务设置（可在 Codex UI 手动切换）｜原因：<短原因>`. Select the recommendation from the task category, then state that execution keeps the current main-task settings and that the user may manually switch in the Codex UI. The recommendation is a plan, not a claim that the main task has switched. Do not create a delegate merely to name a model. Delegate only when the work is genuinely independent, has useful parallel benefit, and has a clear return path.

Direct execution does not require visible model metadata. Its recommendation still follows the same lowest-suitable routing ladder: simple work Luna/low, clear work Luna/medium, ordinary work Terra/medium, and complex or high-risk-but-verifiable work Terra/high. A direct Sol recommendation requires the same evidence gate and second `1` as an actual Sol escalation.

For actual delegation, select the lowest capable route from the current execution surface. Mechanical work may use Luna, ordinary work Terra, and complex or high-risk-but-verifiable work Terra/high. Sol requires both high consequence and high uncertainty, or evidence that Terra/high failed. A later Sol escalation requires one additional `1`; ordinary progress after the first approval never needs another confirmation.

The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope, must not use the approval CLI or ask the user for confirmation, and only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once approved, the task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Keep business-direction, production, credentials, paid-service, irreversible-operation, and project-specific Gates separate from Paifa; they may still need their own authorization.

Before declaring complete, switch to the merged base branch and run `node scripts/closeout.mjs --base <base> --branch <task-branch>`. It pulls the base, removes only that merged task branch locally and remotely, then prunes stale worktree records. It must not delete unmerged, dirty, unrelated, or active worktree branches; report those blockers instead of calling the task complete.

Ask again only for an evidence-based Sol escalation or a changed high-risk boundary.
