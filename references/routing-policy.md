# Simple routing ladder

Choose one observable task profile. Do not calculate scores.

First choose the dispatch kind: an independent task for an independent Worktree, durable/sidebar visibility, direct user follow-up, or independent review; otherwise an internal subagent for bounded work that may share the current directory.

| Profile | Task shape | Preferred route |
| --- | --- | --- |
| `simple` | Mechanical or read-only | Luna / `low` |
| `clear` | Small, explicit, easy to verify | Luna / `medium` |
| `ordinary` | Normal implementation, bug fix, investigation, review | Terra / `medium` |
| `complex` | Unclear root cause or cross-module reasoning | Terra / `high` |
| `high-risk` | Security, identity, tenant, billing, migration, production, final acceptance | Sol / `high` |
| `deep` | Unusually complex or high-consequence reasoning | Sol / `xhigh` |
| `maximum` | Repeated non-convergence or major architecture | Sol / `max` |
| `ultra` | Exceptional hardest case where lower levels are insufficient | Sol / `ultra` |

If the preferred combination is unavailable, use the first supported combination at the same or stronger level. Missing tools, facts, permissions, or services do not justify an upgrade.

Before dispatch show only:

`派发方式：独立任务｜派发模型：5.6 Sol｜思考强度：高｜原因：需要干净 Worktree 和独立审计。`

The main task owns completion: continue safe independent work and integrate required results.
