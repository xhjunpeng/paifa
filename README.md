# Paifa

Paifa gives one visible execution proposal before a new development package starts. The user replies with the exact `1` once; then the main task continues the approved task envelope—planning, implementation, tests, debugging, retries, integration, and normal delegation—until verified completion. A later evidence-based Sol escalation requires one additional `1`. This numbered reply applies only to the Paifa development gate and Sol escalation, not to ordinary conversation choices or project-specific Gates.

After the user replies with the exact `1`, the main task calls `get_goal`: if an active Goal already covers the same task, it keeps or resumes it; otherwise it calls `create_goal` with an objective for the approved task envelope. While the Goal is active, it does not send `final_answer`; it reports meaningful progress through commentary and continues execution. Before sending a final answer, it calls `get_goal`. After compaction, it calls `get_goal` and continues any active Goal. Only after verified completion does it call `update_goal` with `complete` and send the final answer. For a genuine blocker meeting the host's blocked threshold, it calls `update_goal` with `blocked`; a changed high-risk boundary remains a separate approval.

First assess whether safe parallel work shortens total completion time. If it does, delegate implementation, testing, or acceptance to workers; the main task coordinates, resolves conflicts, integrates the result, and owns the final answer. Workers in the same task branch must not create another branch or worktree. Use direct execution only when safe parallel work would not finish sooner, the work shares a mutable surface, or the return path is unclear. A direct proposal gives a concrete recommended model and effort for you to optionally select in the Codex UI, while honestly stating that the main task is still using its current setting. The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. Before actual delegation, verify that the active host provides host-managed collection of every worker result; if it does not, use direct execution. The main task records every worker id, then lets the host collect and return terminal results. The main task must not poll status or send waiting commentary or updates, and must not give a final answer until the host returns every worker result. On a host-reported timeout or blocked state, it gives one status update; otherwise it integrates every worker result, then sends a final answer only when the Goal lifecycle permits it. A worker inherits the approved route and scope, must not use the approval CLI or ask the user for confirmation, and only returns a short result to the main task. The host UI may show a worker panel, but only the main task integrates results and gives the final answer.

Worker model routing is time-first: development workers use Terra; Luna is only for mechanical acceptance that it can finish sooner. Sol still requires the evidence gate and one additional `1`.

Once approved, the task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. A later Sol escalation requires one additional `1`.

Before declaring complete, switch to the merged base branch and run `node scripts/closeout.mjs --base <base> --branch <task-branch>`. It removes only that merged task branch and stale worktree records; it must not delete unmerged, dirty, unrelated, or active worktree branches.

## Install

```bash
./scripts/install.sh
node scripts/doctor.mjs
```

## License

Paifa is available under the [PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use requires a separate written license from the copyright holder before use. Commercial terms and fees are agreed separately. To request a commercial license, open a [GitHub issue](https://github.com/xhjunpeng/paifa/issues/new/).
