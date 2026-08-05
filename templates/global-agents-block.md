## Paifa Dispatch Gate

You must invoke `paifa` before you create, continue, retry, fork, or spawn a delegated Codex task or subagent.

Only when the user explicitly requests delegation, splitting work, a subtask, or parallel work, that request grants continuing authorization within its stated scope to choose a route and to pass the model, reasoning effort, and session/context mode explicitly. You must not expand the goal, files, or permission scope.

High-risk work at its risk floor may be dispatched without additional user confirmation. Explicit user confirmation is required only for work above Sol high, irreversible operations, or changes that increase high-risk consequences. Every successful dispatch must emit `PAIFA_DISPATCHED`. `PAIFA_DISPATCHED` must record actual model, effort, and context values. Each actual value must match its corresponding `PAIFA_ROUTE` value.
