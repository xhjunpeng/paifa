# Execution mode mapping

Before the first material action in a new development package, show one proposal and wait for `1`. Use `direct` for the main task, `subagent` for bounded independent work, and `task` only when independent worktree, durable visibility, direct user follow-up, or independent review is necessary.

The first approval covers normal implementation, tests, debugging, retries, integration, and necessary delegation until completion. A later Sol escalation requires one additional `1`. Do not claim a model switch when the main task keeps its current settings.

The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope, must not use the approval CLI or ask the user for confirmation, and only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once approved, the task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Direct execution is the default throughout. A later Sol escalation requires one additional `1`.
