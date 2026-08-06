# Simple routing ladder

Use this policy only after the next action is state-changing, including creating or modifying an executable plan document. Generating or saving a plan with `writing-plans`, or starting its follow-up work, is state-changing; chatting about a plan alone is not. A route's model and effort must be the settings of the worker that actually executes it; never substitute an unknown current session for a route. Capability data must come from the actual dispatch surface: do not claim Luna merely because it appears in a general model list. Luna is usable for delegated work only when that surface explicitly lists it or the unchanged `paifa-luna-worker` custom agent is installed.

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

Luna and Terra routes start automatically and never show an approval prompt. Before a Sol dispatch show only:

`方式：独立任务｜模型：5.6 Sol｜思考强度：极高｜原因：高后果且高度不确定，需先确认。`
`准备执行：回复 1 批准`

Pass explicit capabilities in the route or with `--capabilities <capabilities.json>`. `propose` directly authorizes Luna/Terra and creates pending state only for Sol. A Sol route is approved only by the immediately following `1` or `确认`; it then consumes the pending state. No pending route, repeated confirmation, or reply with added wording must start execution.

Parent-first dispatch: the main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not run the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the user the final answer.

One started task envelope covers necessary planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Luna/Terra changes stay automatic. Reconfirm only before Sol, or when the task goal/repository changes, production, credentials, paid service, or irreversible deletion/data migration is needed.

The main task owns completion: continue safe independent work and integrate required results.
