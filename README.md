# Paifa

Paifa is a small Codex execution gate. It loads only when the next action will change state: edit/delete files, install dependencies, commit, push, publish/deploy, create/retry real delegated work, or create or modify an executable plan document. Creating or modifying an executable plan document with `writing-plans`, or starting its follow-up work, triggers Paifa; chatting about a plan alone does not. Questions, explanations, planning discussion, source reading, and read-only inspection do not load Paifa.

Only Sol needs a user-facing approval. Luna and Terra start automatically and show no approval prompt. A Sol notice contains no route code, score, YAML, JSON, or follow-up receipt:

```text
方式：当前任务｜模型：5.6 Sol｜思考强度：极高｜原因：高后果且高度不确定，需先确认
准备执行：回复 1 批准
```

Luna/Terra 路线直接开始。只有 Sol 路线会生成待确认方案，等待用户紧接着回复内容在去除首尾空白后等于 `1` 或 `确认`。能力必须来自实际执行入口；只有入口明确支持 Luna，或 Paifa 管理的 Luna worker 已安装且未被修改，才会提议 Luna，绝不会先承诺 Luna 再改用 Terra。用户可见通知固定包含独立的 `模型` 与 `思考强度` 字段。

Parent-first dispatch: the main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not run the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the user the final answer.

One started task envelope covers necessary planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Luna/Terra changes stay automatic. Reconfirm only before Sol, or when the task goal/repository changes, production, credentials, paid service, or irreversible deletion/data migration is needed.

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

The installer links the Skill into Codex, adds one versioned managed block to global `AGENTS.md`, and installs `~/.codex/agents/paifa-luna-worker.toml` with Luna/medium. It preserves unrelated global rules and will not delete a Luna worker that you changed.

## Maintain

```bash
git pull --ff-only
./scripts/install.sh --update
node scripts/doctor.mjs
./scripts/uninstall.sh
```

After dispatch, the main task remains responsible for continuing independent work, integrating required delegated results, and completing the user's goal. Waiting and status messages do not repeat the model line.

## Approval executor

The dependency-free local executor prevents confirmation order from drifting. It stores only the pending route in Codex's private state directory; users see the two-line notice, never the state file or its internals.

```bash
node scripts/approval.mjs propose route.json --capabilities capabilities.json --scope task-123
node scripts/approval.mjs approve 1 --scope task-123
```

The commands return JSON for automation. A successful approval consumes the route, so it cannot be approved twice. Use `--state-dir` only for isolated testing or an explicitly managed private state location.

Version 1 supports macOS and common Linux POSIX shell environments with Node.js 24. Windows installation is not supported. Paifa has no third-party runtime dependencies and performs no automatic network updates.

## License

Paifa is available under the [PolyForm Noncommercial License 1.0.0](LICENSE).
Noncommercial use is permitted under that license. Commercial use requires a separate written license from the copyright holder before use. Commercial terms and fees are agreed separately. To request a commercial license, open a [GitHub issue](https://github.com/xhjunpeng/paifa/issues/new/).
