# Paifa

Paifa is a small Codex dispatch helper. Immediately before delegated work starts, it chooses the execution kind, lowest capable model, and reasoning effort, explains the choice in one short line, and uses the same values in the dispatch tool.

Normal output contains no route code, score, YAML, JSON, or follow-up receipt:

```text
派发方式：独立任务｜派发模型：5.6 Sol｜思考强度：高｜原因：需要干净 Worktree 和独立审计。
```

Use an independent task for an independent Worktree, durable/sidebar visibility, direct user follow-up, or independent review. Use an internal subagent only for bounded work that can share the current directory and return its result to the main task.

## Routing

Paifa uses a short capability ladder across the three 5.6 models and six reasoning levels:

- Mechanical or read-only: Luna / `low`.
- Small, explicit, easy to verify: Luna / `medium`.
- Ordinary implementation, bug fixing, investigation, or review: Terra / `medium`.
- Cross-module or unclear-root-cause work: Terra / `high`.
- Security-sensitive, production-impacting, or final acceptance: Sol / `high`.
- Unusually complex or high-consequence reasoning: Sol / `xhigh`.
- Repeated non-convergence or major architecture: Sol / `max`.
- Exceptional hardest cases after lower levels prove insufficient: Sol / `ultra`.

Missing tools, missing facts, permissions, and environment failures do not cause a model upgrade. Paifa does nothing when no real dispatch is happening, and it never starts another task merely to choose a model.

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
