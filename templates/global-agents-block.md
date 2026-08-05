## Paifa Dispatch Gate

Invoke `paifa` immediately before creating, continuing, retrying, forking, or spawning real delegated Codex work. If no real dispatch is happening, the main task proceeds normally without Paifa or waiting.

Paifa chooses the dispatch kind, model, and reasoning effort. It does not authorize delegation, create extra work, or expand the requested scope.

Use an independent task when the work needs an independent Worktree, durable/sidebar visibility, direct user follow-up, or independent review. Use an internal subagent only for bounded work that may share the current directory and returns to the main task.

Immediately before each dispatch tool call, show exactly one short line in the user's language:

`派发方式：独立任务｜派发模型：5.6 Sol｜思考强度：高｜原因：需要干净 Worktree 和独立审计。`

Use the same dispatch kind, model, and effort in the actual tool call. Do not show scores, YAML, JSON, route objects, context hashes, or coded receipts. Waiting, monitoring, and status updates do not repeat the line.

After dispatch, the main task continues safe independent work and remains responsible for integrating required results and completing the user's goal.
