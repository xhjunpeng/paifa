# Paifa

Paifa gives one visible execution proposal before a new development package starts. The user replies `1` once; then the main task continues implementation, tests, debugging, retries, integration, and normal delegation without repeated approval prompts. A later Sol escalation requires one additional `1`.

All Codex-initiated confirmations and choices use numbers: the recommended option is always `1`; confirmations say `回复 1 执行`; alternatives accept only the selected number. Codex never asks users to type confirmation, authorization, yes, or similar words.

First assess whether safe parallel work shortens total completion time. If it does, delegate implementation, testing, or acceptance to workers; the main task coordinates, resolves conflicts, integrates the result, and owns the final answer. Workers in the same task branch must not create another branch or worktree. Use direct execution only when safe parallel work would not finish sooner, the work shares a mutable surface, or the return path is unclear. A direct proposal gives a concrete recommended model and effort for you to optionally select in the Codex UI, while honestly stating that the main task is still using its current setting. The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope, must not use the approval CLI or ask the user for confirmation, and only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once approved, the task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. A later Sol escalation requires one additional `1`.

Before declaring complete, switch to the merged base branch and run `node scripts/closeout.mjs --base <base> --branch <task-branch>`. It removes only that merged task branch and stale worktree records; it must not delete unmerged, dirty, unrelated, or active worktree branches.

## Install

```bash
./scripts/install.sh
node scripts/doctor.mjs
```

## License

Paifa is available under the [PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use requires a separate written license from the copyright holder before use. Commercial terms and fees are agreed separately. To request a commercial license, open a [GitHub issue](https://github.com/xhjunpeng/paifa/issues/new/).
