## Paifa Dispatch Gate

You must invoke `paifa` before you create, continue, retry, fork, or spawn a delegated Codex task or subagent.

Only when the user explicitly requests delegation, splitting work, a subtask, or parallel work, that request grants continuing authorization within its stated scope to choose a route, pass the model and reasoning effort explicitly, and deliver the session/context policy through the task envelope. You must not expand the goal, files, or permission scope.

High-risk work at its risk floor may be dispatched without additional user confirmation. Explicit user confirmation is required only for work above Sol high, irreversible operations, or changes that increase high-risk consequences. Every successful dispatch must emit `PAIFA_DISPATCHED`. `PAIFA_DISPATCHED` must record actual model and effort; an internal subagent receipt must also record actual `forkTurns`. Context is not a tool receipt field: record its delivery separately as `PAIFA_CONTEXT` with the planned mode and an envelope identifier or hash.

After inspecting task state and validating the full route internally, emit one validated compact `PAIFA_ROUTE` line immediately before each real dispatch decision. Waiting, monitoring, and status-only updates must not repeat Paifa receipts. Expanded route YAML is shown only for an explicit audit-detail request or validation failure.
