---
name: paifa
description: Use when immediately before material Codex execution, including edits, state-changing commands, publishing, or delegated work.
---

# Paifa

Questions, analysis, planning, source reading, and read-only checks do not require approval.

Before material execution, choose the lowest capable model and effort, then show exactly two user-language lines. If the user has not yet authorized execution, wait:

```text
方式：当前任务｜模型：5.6 Terra 中｜原因：范围明确的普通实现
准备执行：回复 1 批准
```

For current-task work, report the actual UI-selected model and effort; never present a cheaper recommendation as if it is active. A clear execution intent—`执行`, `开始`, `继续`, `按建议执行`, `确认`, or `1`—approves the stated task. Show the same first line, then `开始执行：已获授权`, and start immediately.

一次任务级授权 covers the normal closed loop: project-local 依赖安装, 测试/build, 小修复, 重试, and 验证. Do not interrupt for those steps. Ask again only for a 更贵模型 or 思考强度, 跨项目 or another workspace, 生产/凭据/付费服务, 不可逆 deletion or data migration, an unapproved 发布/推送/部署, or a material change to the task goal.

For real dispatch, choose `独立任务` for an independent Worktree, durable/sidebar work, user follow-up, or independent review; otherwise use `内部子智能体`. Mechanical/read-only -> Luna/low; small explicit -> Luna/medium; ordinary -> Terra/medium; cross-module or high-risk but verifiable -> Terra/high. Sol/high requires both high consequence and high uncertainty, or an evidenced Terra/high failure. `xhigh/max/ultra` also require explicit user confirmation. Risk keywords, file count, duration, missing facts, tools, or generic quality never justify Sol.

Use the approved dispatch kind/model/effort in the actual tool call. The main task continues safe work, integrates delegated results, and owns completion. Do not repeat the two lines while waiting or reporting status.
