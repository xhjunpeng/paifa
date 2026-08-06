# Tool mapping and capability fallback

Check the currently available dispatch tool and its accepted capabilities immediately before a real dispatch. Do not treat this file as a permanent model-price or capability list.

| Dispatch action | Explicit fields | Execution rule |
| --- | --- | --- |
| New user-visible task | model and thinking/reasoning effort | Use when independent Worktree, durability, direct follow-up, or independent review is required |
| Continue an existing task | model and thinking/reasoning effort for the next turn when changing capability | Pass the selected override explicitly |
| Internal subagent | `model`, `reasoning_effort`, and `fork_turns` | Use only when sharing the current directory is acceptable; provide a compact fact envelope |
| Fork | follow-up model and effort fields, if supported | Fork preserves history and is not a clean-room mechanism |

Use the exact names exposed by the current tool. First store and show the selected dispatch kind, model, effort, and one-sentence reason through the approval executor. Only after it returns the approved route for the user's reply whose content equals `1` or `确认` after leading and trailing whitespace is removed may the matching tool be used with those parameters. An internal subagent cannot by itself provide a new independent Worktree.

Parent-first dispatch: the main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not run the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the user the final answer.

One approved task envelope covers necessary planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. These stages must not propose again or ask for confirmation. Reconfirm only when the task goal or target repository/workspace materially changes; model or effort increases; production, credentials, or paid service is needed; or irreversible deletion/data migration is needed.

## Fallback

When a recommended model or effort is unavailable, choose the lowest-cost currently supported combination that still meets the same capability and risk floor. Do not silently choose a lower floor. If no supported combination meets the floor, stop and request user direction.

## Internal-subagent fact package

An overridden internal subagent gets only the compact verified facts needed to act: goal, scope, allowed and forbidden changes, worktree, verified observations, unresolved facts, acceptance commands, stopping conditions, and return format. Do not pass private repository data, credentials, or unverified root-cause theories.
