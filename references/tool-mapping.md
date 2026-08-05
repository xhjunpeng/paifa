# Tool mapping and capability fallback

Check the currently available dispatch tool and its accepted capabilities immediately before a real dispatch. Do not treat this file as a permanent model-price or capability list.

| Dispatch action | Explicit fields | Execution rule |
| --- | --- | --- |
| New user-visible task | model and thinking/reasoning effort | Record actual fields after the tool succeeds |
| Continue an existing task | model and thinking/reasoning effort for the next turn when changing capability | Preserve the route and record the override actually applied |
| Internal subagent | `model`, `reasoning_effort`, and `fork_turns` | Set `fork_turns` to `"none"` or a finite positive recent-turn count and provide a compact fact envelope |
| Fork | follow-up model and effort fields, if supported | Fork preserves history and is not a clean-room mechanism |

Use the exact names exposed by the current tool. `PAIFA_ROUTE` is the recommendation and validation record; `PAIFA_DISPATCHED` is the successful tool receipt. Keep them separate and compare model, effort, context, and internal-route `forkTurns`.

## Fallback

When a recommended model or effort is unavailable, choose the lowest-cost currently supported combination that still meets the same capability and risk floor, then revalidate and record the substitution. Do not silently choose a lower floor. If no supported combination meets the floor, stop and request user direction.

## Internal-subagent fact package

An overridden internal subagent gets only the compact verified facts needed to act: goal, scope, allowed and forbidden changes, worktree, verified observations, unresolved facts, acceptance commands, stopping conditions, and return format. Do not pass private repository data, credentials, or unverified root-cause theories.
