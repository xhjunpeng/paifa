# Tool mapping and continuity requirements

Direct execution is the default. Do not dispatch merely because the current task does not expose model metadata. Before an actual dispatch, inspect the dispatch surface for its explicit model/effort support and for these continuity capabilities: `resultReturn`, `parentWait`, `parentWake`, and `checkpointStore`. A tool name or a displayed worker panel does not establish wakeup support.

| Mode | Required capabilities | Rule |
| --- | --- | --- |
| `direct` | None | Main task continues directly. |
| `subagent` | `resultReturn`, `parentWait`, `checkpointStore` | Parent stays active, checkpoints first, waits for one result. |
| `task` | `resultReturn`, `parentWake`, `checkpointStore` | Parent can restore the checkpoint after a cross-turn result event. |

If a required capability is missing, choose `direct` before creating a delegate. The main task owns completion and waits for or restores a DispatchRecord before integrating delegated results. Do not claim automatic continuation without a verified return path.

The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not use the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once work begins, its task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Direct execution is the default throughout the envelope. Reconfirm only before Sol, or when the task goal, repository, production, credentials, paid service, irreversible deletion, or data migration changes.

Luna/Terra upgrades remain automatic and must not propose confirmation.
