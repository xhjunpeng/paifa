# One-time development approval

Before the first material action in a new development package, show one proposal and wait for `1`. Select `direct` by default; select `subagent` or `task` only for independent work whose parallel benefit exceeds the handoff cost. A direct proposal gives a concrete recommended model and effort for manual selection in the Codex UI, while execution keeps the current main-task model and setting until the user changes it.

All Codex-initiated confirmations and choices use numbered replies: put the recommended option first as `1`; for confirmation say `回复 1 执行`; for alternatives accept only the selected number. Never request confirmation, authorization, yes, or similar words.

The first approval covers normal implementation, tests, debugging, retries, integration, and necessary delegation until completion. A later Sol escalation requires one additional `1`; it needs both high consequence and high uncertainty, or evidence that Terra/high failed. Project-specific Gates are separate.

The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope, must not use the approval CLI or ask the user for confirmation, and only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once approved, the task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Direct execution is the default throughout. A later Sol escalation requires one additional `1`.

Before declaring complete, switch to the merged base branch and run `node scripts/closeout.mjs --base <base> --branch <task-branch>`. It removes only that merged task branch and stale worktree records; it must not delete unmerged, dirty, unrelated, or active worktree branches.
