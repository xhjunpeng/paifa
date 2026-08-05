## Paifa Dispatch Gate

Invoke `paifa` immediately before creating, continuing, retrying, forking, or spawning real delegated Codex work. If no real dispatch is happening, the main task proceeds normally without Paifa or waiting.

Paifa only chooses the delegated task's model and reasoning effort. It does not authorize delegation, create extra tasks, or expand the requested scope.

Immediately before each dispatch tool call, show exactly one short line in the user's language:

`派发模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。`

Use the same model and effort in the actual tool call. Do not show scores, YAML, JSON, route objects, context hashes, or coded receipts. Waiting, monitoring, and status updates do not repeat the line.

After dispatch, the main task continues safe independent work and remains responsible for integrating required results and completing the user's goal.
