---
name: paifa
description: Use when considering real delegated work, a model upgrade, or a high-risk boundary. Do not use for ordinary direct execution.
---

# Paifa

Direct execution is the default. Ordinary direct editing, testing, debugging, retries, and integration remain with the main task. Direct execution does not require visible model metadata and must never be converted into delegation merely because the host does not expose a model or thinking setting.

Invoke Paifa only when considering real delegated work, a model upgrade, or a high-risk boundary. Delegate only when independence, parallel benefit, lower handoff cost, and a verified return/continuation path are all present. The decision must cite verified facts for all four checks; duration, file count, risk keywords, missing facts, and generic quality requests are not substitutes. If a check or required host capability is missing, choose `direct` and continue in the main task.

For a real delegation, require explicit `resultReturn` and `checkpointStore`. An internal subagent also requires `parentWait`; an independent task also requires `parentWake`. Do not infer these capabilities from a tool name. Without a verified wakeup path, do not claim automatic continuation and do not create a cross-turn task. Save a DispatchRecord before launch; the main task owns completion and waits for or restores a DispatchRecord before integrating delegated results. Deduplicate late results by dispatch ID and attempt, and never restart a cancelled dispatch.

After delegation is justified, choose `task` only for an independent worktree, durable/sidebar work, direct user follow-up, or independent review; otherwise choose `subagent`. Only actual delegated work receives a model/effort route. Mechanical/read-only work uses Luna/low when the actual dispatch surface supports it; small explicit work uses Luna/medium; ordinary work uses Terra/medium; complex or high-risk-but-verifiable work uses Terra/high. Do not claim Luna unless the dispatch surface supports it or the unchanged managed Luna worker exists.

Sol requires both high consequence and high uncertainty, or evidenced Terra/high failure. Only Sol needs a user-facing approval notice:

```text
方式：当前任务｜模型：5.6 Sol｜思考强度：极高｜原因：高后果且高度不确定，需先确认
准备执行：回复 1 批准
```

Use the local approval executor for Sol only. A Sol route is approved only when the immediately following reply equals `1` or `确认` after trimming. Luna and Terra routes start directly. The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not use the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once work begins, its task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Direct execution is the default throughout this envelope. Reconfirm only before Sol, or when the task goal, repository, production, credentials, paid service, irreversible deletion, or data migration changes.

Luna/Terra upgrades remain automatic and must not propose confirmation.
