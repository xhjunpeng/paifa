## Paifa Execution Gate

Before material execution—editing or deleting files, a state-changing command, installation, commit, push, publishing, or real delegated work—choose the lowest capable model and effort. Questions, analysis, planning, source reading, and read-only checks do not require approval.

Show exactly these two lines in the user's language:

```text
方式：当前任务｜模型：5.6 Terra 中｜原因：范围明确的普通实现
准备执行：回复 1 批准
```

For direct work, replace the example with the actual UI-selected model and effort; never call a cheaper recommendation the active current-task model. For delegated work, use `内部子智能体` or `独立任务` as the first value. A clear execution intent—`执行`, `开始`, `继续`, `按建议执行`, `确认`, or `1`—approves the stated task. Then show the same first line followed by `开始执行：已获授权` and start. Without that intent, show `准备执行：回复 1 批准` and wait.

一次任务级授权 covers the normal closed loop: project-local 依赖安装, 测试/build, 小修复, 重试, and 验证. Do not interrupt for those steps. Ask again only for a 更贵模型 or 思考强度, 跨项目 or another workspace, 生产/凭据/付费服务, 不可逆 deletion or data migration, an unapproved 发布/推送/部署, or a material change to the task goal.

For real dispatch, invoke `paifa` immediately before the tool call. It selects an independent task for an independent Worktree, durable/sidebar work, user follow-up, or independent review; otherwise an internal subagent. Ordinary work uses Terra medium; cross-module or high-risk-but-verifiable work uses Terra high. Sol requires both high consequence and high uncertainty, or evidenced Terra high failure. Risk keywords alone do not justify Sol. `xhigh`, `max`, and `ultra` require explicit confirmation.

Use the approved dispatch kind, model, and effort in the actual tool call. Do not show scores, YAML, JSON, route objects, context hashes, or receipts. Do not repeat the two lines while waiting or reporting status. After dispatch, the main task continues safe independent work, integrates required delegated results, and owns completion.
