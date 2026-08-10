# High-risk routing and confirmation

High-risk keywords select the `high-risk` profile, not Sol by themselves.

| Work domain | Minimum route | Additional completion evidence |
| --- | --- | --- |
| Authentication, authorization, identity, tenant isolation, security with clear boundaries | `gpt-5.6-terra` / `high` | Boundary and negative tests; independent review when appropriate |
| Billing, payment, migration, production operation with clear recovery | `gpt-5.6-terra` / `high` | Recovery or rollback evidence and relevant operational checks |
| Architecture or cross-module planning with known constraints | `gpt-5.6-terra` / `high` | Trade-offs and affected-module verification |
| High consequence plus high uncertainty, or evidenced Terra/high failure | `gpt-5.6-sol` / `high` | State the exact unresolved consequence or failure evidence |

Use Sol only when the last row applies. An independent Checker must be a new clean-room task; it cannot inherit the Maker's assumptions.

## Stronger reasoning and confirmation

Use Sol `xhigh`, `max`, or `ultra` only after Sol/high is insufficient and the user replies `1` to the explicit numeric proposal. Irreversible operations or changes that increase high-risk consequences use the same numeric confirmation.

If the user specifies a model below a floor, explain the minimum and route at that floor. If no model combination can meet the floor, stop and request direction rather than silently downgrade.
