# Paifa

Paifa is a small Codex execution gate. It loads only when the next action will change state: edit/delete files, install dependencies, commit, push, publish/deploy, create/retry real delegated work, or create or modify an executable plan document. Creating or modifying an executable plan document with `writing-plans`, or starting its follow-up work, triggers Paifa; chatting about a plan alone does not. Questions, explanations, planning discussion, source reading, and read-only inspection do not load Paifa.

Normal output contains no route code, score, YAML, JSON, or follow-up receipt:

```text
方式：当前任务｜模型：5.6 Terra｜思考强度：中｜原因：范围明确的普通实现
准备执行：回复 1 批准
```

每项实际执行都先生成待确认方案，再等待用户紧接着单独回复 `1` 或 `确认`。本地审批器只会批准上一条仍待确认的方案；没有待确认方案、重复确认或其他文字都不能启动执行。批准后第二行显示 `开始执行：已获授权`，并开始工作。用户可见通知固定包含独立的 `模型` 与 `思考强度` 字段；模型仅可为 `5.6 Luna`、`5.6 Terra` 或 `5.6 Sol`，不得输出 `GPT-5`，也不得以“当前会话”或“强度未暴露”代替任一字段。`当前任务` 仅在模型与思考强度均可见且实际用于执行时使用；否则必须选择可指定精确路由的子智能体或独立任务。

Parent-first dispatch: the main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not run the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the user the final answer.

One approved task envelope covers necessary planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. These stages must not propose again or ask for confirmation. Reconfirm only when the task goal or target repository/workspace materially changes; model or effort increases; production, credentials, or paid service is needed; or irreversible deletion/data migration is needed.

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

## Approval executor

The dependency-free local executor prevents confirmation order from drifting. It stores only the pending route in Codex's private state directory; users see the two-line notice, never the state file or its internals.

```bash
node scripts/approval.mjs propose route.json --scope task-123
node scripts/approval.mjs approve 1 --scope task-123
```

The commands return JSON for automation. A successful approval consumes the route, so it cannot be approved twice. Use `--state-dir` only for isolated testing or an explicitly managed private state location.

Version 1 supports macOS and common Linux POSIX shell environments with Node.js 24. Windows installation is not supported. Paifa has no third-party runtime dependencies and performs no automatic network updates.

## License

Paifa is available under the [PolyForm Noncommercial License 1.0.0](LICENSE).
Noncommercial use is permitted under that license. Commercial use requires a separate written license from the copyright holder before use. Commercial terms and fees are agreed separately. To request a commercial license, open a [GitHub issue](https://github.com/xhjunpeng/paifa/issues/new/).
