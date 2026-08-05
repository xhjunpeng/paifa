# High-risk floors and confirmation

Apply this reference whenever work touches an item below. These are hard floors that file size, urgency, or a request for low cost cannot lower.

| Work domain | Minimum route | Additional completion evidence |
| --- | --- | --- |
| Authentication, authorization, identity, tenant isolation, security | `gpt-5.6-sol` / `high` | Boundary and negative tests; independent review when appropriate |
| Billing, payment, migration, production operation | `gpt-5.6-sol` / `high` | Recovery or rollback evidence and relevant operational checks |
| Architecture decision or complex cross-module unknown root cause | `gpt-5.6-terra` / `high`; normally Sol `high` | Causal evidence and affected-module verification |
| Frozen candidate, final Gate, independent security acceptance | `gpt-5.6-sol` / `high` checker | Clean-room session and independent evidence |

Use the strongest applicable row. An independent Checker must be a new clean-room task; it cannot inherit the Maker's assumptions.

## Stronger reasoning and confirmation

Use Sol `xhigh`, `max`, or `ultra` only when the task matches the `deep`, `maximum`, or `ultra` profile and state the practical reason in the one-line dispatch notice. Irreversible operations or changes that increase high-risk consequences still require explicit user confirmation.

If the user specifies a model below a floor, explain the minimum and route at that floor. If no model combination can meet the floor, stop and request direction rather than silently downgrade.
