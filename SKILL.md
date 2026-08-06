---
name: paifa
description: Use when immediately before material Codex execution, including edits, state-changing commands, publishing, or delegated work.
---

# Paifa

Questions, analysis, planning, source reading, and read-only checks do not require approval.

Before material execution, choose the lowest capable model and effort, then show exactly two user-language lines:

```text
方式：当前任务｜模型：5.6 Terra 中｜原因：范围明确的普通实现
准备执行：回复 1 批准
```

For current-task work, report the actual UI-selected model and effort; never present a cheaper recommendation as if it is active. Only a standalone `1` approves the stated action. Until then, do not edit, delete, install, commit, push, publish, or dispatch. A scope, execution-kind, model, effort, or external-effect change needs a new two-line approval.

For real dispatch, choose `独立任务` for an independent Worktree, durable/sidebar work, user follow-up, or independent review; otherwise use `内部子智能体`. Mechanical/read-only -> Luna/low; small explicit -> Luna/medium; ordinary -> Terra/medium; cross-module or high-risk but verifiable -> Terra/high. Sol/high requires both high consequence and high uncertainty, or an evidenced Terra/high failure. `xhigh/max/ultra` also require explicit user confirmation. Risk keywords, file count, duration, missing facts, tools, or generic quality never justify Sol.

Use the approved dispatch kind/model/effort in the actual tool call. The main task continues safe work, integrates delegated results, and owns completion. Do not repeat the two lines while waiting or reporting status.
