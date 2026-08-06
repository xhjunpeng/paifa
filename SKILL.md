---
name: paifa
description: Use when the next action will change state: edit/delete files, install dependencies, commit, push, publish/deploy, create/retry real delegated work, or create or modify an executable plan document. Do not use for questions, explanations, planning discussion, source reading, or read-only inspection.
---

# Paifa

This is not a conversational preflight. Load it only after the next action meets the description's state-changing trigger. Creating or modifying an executable plan document—including generating or saving one with `writing-plans`, or starting work that follows it—does trigger Paifa. Chatting about a plan alone does not invoke Paifa; neither do questions, explanations, source reading, or read-only inspection.

Before material execution, choose the lowest capable model and effort from the execution surface's explicit capabilities. Do not infer that Luna is available. Luna is allowed only when that surface explicitly supports it or the managed `paifa-luna-worker` is installed unchanged. Terra and Luna work starts directly; only Sol requires a user approval notice:

```text
方式：当前任务｜模型：5.6 Sol｜思考强度：极高｜原因：高后果且高度不确定，需先确认
准备执行：回复 1 批准
```

`当前任务` is valid only when the exact model and effort are visible and will actually execute the work; never output `GPT-5` as a model, or `当前会话` / `强度未暴露` as a substitute for either field. If either is unavailable and model selection matters, must use `内部子智能体` or `独立任务` with an exact route.

Use the local approval executor for Sol only: call `node scripts/approval.mjs propose <route-file> --scope <task-scope>` and show its two lines. Luna/Terra routes return direct authorization and must not show a prompt or wait for `1`. For Sol, only the user's immediately following reply whose content equals `1` or `确认` after trimming may be passed to `approve`; execute only when approved. Internal state is never shown to the user.

Parent-first dispatch: the main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not run the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the user the final answer.

Once a route starts, its task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Luna/Terra upgrades remain automatic. Reconfirm only before Sol, or when the task goal/repository changes, production, credentials, paid service, or irreversible deletion/data migration is needed.

For real dispatch, choose `独立任务` for an independent Worktree, durable/sidebar work, user follow-up, or independent review; otherwise use `内部子智能体`. Mechanical/read-only -> Luna/low; small explicit -> Luna/medium; ordinary -> Terra/medium; cross-module or high-risk but verifiable -> Terra/high. Sol requires both high consequence and high uncertainty, or evidenced Terra/high failure, and always requires the single approval above. Risk keywords, file count, duration, missing facts, tools, or generic quality never justify Sol.

Use the approved dispatch kind/model/effort in the actual tool call. The main task continues safe work, integrates delegated results, and owns completion. Do not repeat the two lines while waiting or reporting status.
