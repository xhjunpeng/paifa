# Simple routing ladder

Choose one observable task profile. Do not calculate scores.

First choose the dispatch kind: an independent task for an independent Worktree, durable/sidebar visibility, direct user follow-up, or independent review; otherwise an internal subagent for bounded work that may share the current directory.

| Profile | Task shape | Preferred route |
| --- | --- | --- |
| `simple` | Mechanical or read-only | Luna / `low` |
| `clear` | Small, explicit, easy to verify | Luna / `medium` |
| `ordinary` | Normal implementation, bug fix, review, ordinary planning | Terra / `medium` |
| `complex` | Unclear root cause, cross-module reasoning, complex planning | Terra / `high` |
| `high-risk` | Security, identity, tenant, billing, migration, production, final acceptance with clear boundaries and evidence | Terra / `high` |
| Sol gate | Both high consequence and high uncertainty, or evidenced Terra/high failure | Sol / `high` |
| `deep` / `maximum` / `ultra` | Sol/high proved insufficient and the user confirms | Sol / `xhigh`, `max`, or `ultra` |

Risk keywords alone do not justify Sol. File count, duration, missing tools, facts, permissions, services, or a generic quality request do not justify an upgrade. If the preferred combination is unavailable, never lower the task floor.

Before dispatch show only:

`方式：独立任务｜模型：5.6 Terra 高｜原因：跨模块任务，但边界明确且可验证。`
`准备执行：回复 1 批准`

明确执行意图（`执行`、`开始`、`继续`、`按建议执行`、`确认` 或 `1`）已授权时，第二行改为：

`开始执行：已获授权`

一次任务级授权覆盖依赖安装、测试/构建、小修复、重试与验证。仅在成本、项目/工作区、生产或不可逆外部影响，或任务目标实质升级时重新确认。

The main task owns completion: continue safe independent work and integrate required results.
