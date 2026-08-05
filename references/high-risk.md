# High-risk floors and confirmation

Apply this reference before scoring cost whenever work touches an item below. These are hard floors, not a preference that file size, urgency, a user request for low cost, or direct ownership can lower.

| Work domain | Minimum route | Additional completion evidence |
| --- | --- | --- |
| Authentication, authorization, identity, tenant isolation, security | `gpt-5.6-sol` / `high` | Boundary and negative tests; independent review when appropriate |
| Billing, payment, migration, production operation | `gpt-5.6-sol` / `high` | Recovery or rollback evidence and relevant operational checks |
| Architecture decision or complex cross-module unknown root cause | `gpt-5.6-terra` / `high`; normally Sol `high` | Causal evidence and affected-module verification |
| Frozen candidate, final Gate, independent security acceptance | `gpt-5.6-sol` / `high` checker | Clean-room session and independent evidence |

Use the strongest applicable row. An independent Checker must be a new clean-room task; it cannot inherit the Maker's assumptions.

## Confirmation boundary

Automatic escalation may not pass `gpt-5.6-sol` / `high`. Require explicit user confirmation before Sol `xhigh`, `max`, or `ultra`, any irreversible operation, or a change that increases high-risk consequences. Record the confirmation in the expanded route before dispatch.

If the user specifies a model below a floor, explain the minimum and route at that floor. If no model combination can meet the floor, stop and request direction rather than silently downgrade.
