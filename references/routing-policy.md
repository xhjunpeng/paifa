# Simple routing ladder

Use this policy only after the next action is state-changing, including creating or modifying an executable plan document. Generating or saving a plan with `writing-plans`, or starting its follow-up work, is state-changing; chatting about a plan alone is not. A route's model and effort must be the settings of the worker that actually executes it; never substitute an unknown current session for a route.

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

`方式：独立任务｜模型：5.6 Terra｜思考强度：高｜原因：跨模块任务，但边界明确且可验证。`
`准备执行：回复 1 批准`

Store the route as pending with `node scripts/approval.mjs propose <route-file> --scope <task-scope>`, then show only those two lines. Only the immediately following reply exactly `1` or `确认` can be approved with `node scripts/approval.mjs approve <reply> --scope <task-scope>`. It consumes the pending route and returns the second line as `开始执行：已获授权`. No pending route, repeated confirmation, or any other reply must not start execution. Re-proposing replaces the prior pending route.

Parent-first dispatch: the main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not run the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the user the final answer.

One approved task envelope covers necessary planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. These stages must not propose again or ask for confirmation. Reconfirm only when the task goal or target repository/workspace materially changes; model or effort increases; production, credentials, or paid service is needed; or irreversible deletion/data migration is needed.

The main task owns completion: continue safe independent work and integrate required results.
