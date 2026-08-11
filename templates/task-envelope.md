# Fact-only task envelope

Use this only for a real delegated worker. Direct work remains with the main task.

```text
Goal:
Worktree or repository:
Allowed changes:
Forbidden changes:
Verified facts:
Unresolved facts:
Risk boundary:
Acceptance commands and expected evidence:
Stopping conditions:
Return format:
```

The return must state terminal status, changed files or commit, test evidence, and any blocker. The main task records the worker id before dispatch and collects this result before it can finish.

Keep only verified facts, label uncertainty, and exclude credentials or unrelated history.
