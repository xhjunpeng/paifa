# Simple routing ladder

Choose one observable task profile. Do not calculate scores.

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

`派发模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。`

The main task owns completion: continue safe independent work and integrate required results.
