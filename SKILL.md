---
name: paifa
description: Use when the next action will change state: edit/delete files, install dependencies, commit, push, publish/deploy, create/retry real delegated work, or create or modify an executable plan document. Do not use for questions, explanations, planning discussion, source reading, or read-only inspection.
---

# Paifa

This is not a conversational preflight. Load it only after the next action meets the description's state-changing trigger. Creating or modifying an executable plan document—including generating or saving one with `writing-plans`, or starting work that follows it—does trigger Paifa. Chatting about a plan alone does not invoke Paifa; neither do questions, explanations, source reading, or read-only inspection.

Before material execution, choose the lowest capable model and effort, then show exactly two user-language lines. If the user has not yet authorized execution, wait:

```text
方式：当前任务｜模型：5.6 Terra｜思考强度：中｜原因：范围明确的普通实现
准备执行：回复 1 批准
```

`当前任务` is valid only when the exact model and effort are visible and will actually execute the work; never output `GPT-5` as a model, or `当前会话` / `强度未暴露` as a substitute for either field. If either is unavailable and model selection matters, must use `内部子智能体` or `独立任务` with an exact route. A clear execution intent—`执行`, `开始`, `继续`, `按建议执行`, `确认`, or `1`—approves the stated task. Show the same first line, then `开始执行：已获授权`, and start immediately.

一次任务级授权 covers the normal closed loop: project-local 依赖安装, 测试/build, 小修复, 重试, and 验证. Do not interrupt for those steps. Ask again only for a 更贵模型 or 思考强度, 跨项目 or another workspace, 生产/凭据/付费服务, 不可逆 deletion or data migration, an unapproved 发布/推送/部署, or a material change to the task goal.

For real dispatch, choose `独立任务` for an independent Worktree, durable/sidebar work, user follow-up, or independent review; otherwise use `内部子智能体`. Mechanical/read-only -> Luna/low; small explicit -> Luna/medium; ordinary -> Terra/medium; cross-module or high-risk but verifiable -> Terra/high. Sol/high requires both high consequence and high uncertainty, or an evidenced Terra/high failure. `xhigh/max/ultra` also require explicit user confirmation. Risk keywords, file count, duration, missing facts, tools, or generic quality never justify Sol.

Use the approved dispatch kind/model/effort in the actual tool call. The main task continues safe work, integrates delegated results, and owns completion. Do not repeat the two lines while waiting or reporting status.
