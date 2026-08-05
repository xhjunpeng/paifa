---
name: paifa
description: Use when choosing the model and reasoning effort immediately before real delegated Codex work.
---

# Paifa

For real dispatch only. Paifa does not decide whether to delegate or start extra work. Choose the lowest capable combination.

## Choose

Match the task once:

- Mechanical/read-only -> 5.6 Luna / `low`.
- Small, explicit, verifiable -> 5.6 Luna / `medium`.
- Normal implementation/bug/investigation/review -> 5.6 Terra / `medium`.
- Unknown root cause/cross-module reasoning -> 5.6 Terra / `high`.
- Security/identity/tenant/billing/migration/production/final acceptance -> 5.6 Sol / `high`.
- Unusually complex/high-consequence -> 5.6 Sol / `xhigh`.
- Repeated non-convergence or major architecture -> 5.6 Sol / `max`.
- Hardest exceptional case after lower levels fail -> 5.6 Sol / `ultra`.

UI: `low=轻度`, `medium=中`, `high=高`, `xhigh=极高`, `max=最高`, `ultra=极高（更快消耗使用额度）`. If unavailable, use the next supported route at or above the task floor. Missing tools/facts/services never upgrade.

## Tell and dispatch

Before the tool call, show one user-language line:

`派发模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。`

Pass matching internal values. Show nothing else; never repeat during waits/status.

No dispatch: skip Paifa/waiting. The main task continues independent work, integrates required results, and owns completion.
