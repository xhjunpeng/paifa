# Paifa

Paifa is a small Codex dispatch helper. Immediately before delegated work starts, it chooses the execution kind, lowest capable model, and reasoning effort, explains the choice in one short line, and uses the same values in the dispatch tool.

Normal output contains no route code, score, YAML, JSON, or follow-up receipt:

```text
派发方式：独立任务｜派发模型：5.6 Terra｜思考强度：高｜原因：跨模块任务，但边界明确且可验证。
```

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

MIT licensed. See [LICENSE](LICENSE).
