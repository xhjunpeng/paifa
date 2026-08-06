# Paifa

Paifa is a small Codex execution gate. Immediately before a real change or delegated task, it chooses the lowest capable model and reasoning effort, then waits for explicit approval.

Normal output contains no route code, score, YAML, JSON, or follow-up receipt:

```text
方式：当前任务｜模型：5.6 Terra 中｜原因：范围明确的普通实现
准备执行：回复 1 批准
```

Questions, analysis, planning, source reading, and read-only checks are uninterrupted. A standalone `1` approves only the displayed execution; a scope or model change needs a fresh approval. Current-task model labels always reflect the UI selection, never a cheaper recommendation.

Use an independent task for an independent Worktree, durable/sidebar visibility, direct user follow-up, or independent review. Use an internal subagent only for bounded work that can share the current directory and return its result to the main task.

## Routing

Paifa uses a short capability ladder across the three 5.6 models and six reasoning levels:

- Mechanical or read-only: Luna / `low`.
- Small, explicit, easy to verify: Luna / `medium`.
- Ordinary implementation, review, or planning: Terra / `medium`.
- Cross-module, unclear-root-cause, complex planning, or high-risk but verifiable work: Terra / `high`.
- Sol / `high`: only both high consequence and high uncertainty, or evidenced Terra/high failure.
- Sol above `high`: only after lower effort is insufficient and the user explicitly confirms.

Risk keywords, file count, duration, missing tools or facts, environment failures, and generic quality requests do not justify Sol. Paifa does nothing when no real dispatch is happening, and it never starts another task merely to choose a model.

## Install

Clone this repository, enter its root, then run:

```bash
./scripts/install.sh
node scripts/doctor.mjs
```

The installer links the Skill into Codex and adds one versioned managed block to the global `AGENTS.md`. It preserves unrelated global rules, keeps a backup, and supports safe updates and removal.

## Maintain

```bash
git pull --ff-only
./scripts/install.sh --update
node scripts/doctor.mjs
./scripts/uninstall.sh
```

After dispatch, the main task remains responsible for continuing independent work, integrating required delegated results, and completing the user's goal. Waiting and status messages do not repeat the model line.

Version 1 supports macOS and common Linux POSIX shell environments with Node.js 24. Windows installation is not supported. Paifa has no third-party runtime dependencies and performs no automatic network updates.

## License

Paifa is available under the [PolyForm Noncommercial License 1.0.0](LICENSE).
Noncommercial use is permitted under that license. Commercial use requires a separate written license from the copyright holder before use. Commercial terms and fees are agreed separately. To request a commercial license, open a [GitHub issue](https://github.com/xhjunpeng/paifa/issues/new/).
