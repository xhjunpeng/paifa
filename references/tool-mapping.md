# Tool mapping and capability fallback

Check the currently available dispatch tool and its accepted capabilities immediately before a real dispatch. Do not treat this file as a permanent model-price or capability list.

| Dispatch action | Explicit fields | Execution rule |
| --- | --- | --- |
| New user-visible task | model and thinking/reasoning effort | Pass both fields explicitly |
| Continue an existing task | model and thinking/reasoning effort for the next turn when changing capability | Pass the selected override explicitly |
| Internal subagent | `model`, `reasoning_effort`, and `fork_turns` | Set `fork_turns` to `"none"` or a quoted positive integer such as `"3"`, and provide a compact fact envelope |
| Fork | follow-up model and effort fields, if supported | Fork preserves history and is not a clean-room mechanism |

Use the exact names exposed by the current tool. Immediately before dispatch, tell the user the selected model, effort, and one-sentence reason. Then pass the same model and effort to the tool. Internal tool mechanics such as `fork_turns` stay internal and are not added to the user-facing line.

## Fallback

When a recommended model or effort is unavailable, choose the lowest-cost currently supported combination that still meets the same capability and risk floor. Do not silently choose a lower floor. If no supported combination meets the floor, stop and request user direction.

## Internal-subagent fact package

An overridden internal subagent gets only the compact verified facts needed to act: goal, scope, allowed and forbidden changes, worktree, verified observations, unresolved facts, acceptance commands, stopping conditions, and return format. Do not pass private repository data, credentials, or unverified root-cause theories.
