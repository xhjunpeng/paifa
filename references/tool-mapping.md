# Execution mode mapping

Before the first material action in a new development package, show one proposal and wait for `1`. First assess whether safe parallel work shortens total completion time. If it does, delegate implementation, testing, or acceptance to workers; the main task coordinates, resolves conflicts, integrates the result, and owns the final answer. Workers in the same task branch must not create another branch or worktree. Use direct execution only when safe parallel work would not finish sooner, the work shares a mutable surface, or the return path is unclear. Use `subagent` for bounded work in the same task branch and `task` only when independent worktree, durable visibility, direct user follow-up, or independent review is necessary.

Worker model routing is time-first: development workers use Terra; Luna is only for mechanical acceptance that it can finish sooner. Sol requires the evidence gate and one additional `1`.

All Codex-initiated confirmations and choices use numbered replies: put the recommended option first as `1`; for confirmation say `回复 1 执行`; for alternatives accept only the selected number. Never request confirmation, authorization, yes, or similar words.

The first approval covers normal implementation, tests, debugging, retries, integration, and necessary delegation until completion. A direct proposal must show a concrete recommended model and effort, but must label it as a manual Codex UI choice rather than claim the main task already switched. A later Sol escalation requires one additional `1`.

The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. Before actual delegation, verify that the active host can wait for workers and return each worker result; if the return path is unclear or unavailable, use direct execution. Record every dispatched worker id, wait with the host primitive, and collect every terminal result. The main task must not give a final answer until every worker result is collected. A worker inherits the approved route and scope, must not use the approval CLI or ask the user for confirmation, and only returns a short result to the main task. The host UI may show a worker panel, but only the main task integrates the results and gives the final answer.

Once approved, the task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. A later Sol escalation requires one additional `1`.

Before declaring complete, switch to the merged base branch and run `node scripts/closeout.mjs --base <base> --branch <task-branch>`. It removes only that merged task branch and stale worktree records; it must not delete unmerged, dirty, unrelated, or active worktree branches.
