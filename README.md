# Paifa

Paifa is a Codex delegation-routing Skill. It chooses the lowest-cost model, reasoning effort, session strategy, context envelope, and verification contract that still meets a task's quality and risk floor.

It does not execute business work or calculate live provider prices. It makes the dispatch decision auditable through separate planned and actual receipts:

```text
PAIFA_ROUTE v1 | planned | create | B | gpt-5.6-terra/medium | compact | focused-tests | auto<=gpt-5.6-sol/high
PAIFA_DISPATCHED | model=gpt-5.6-terra | effort=medium
PAIFA_CONTEXT | mode=compact | delivery=envelope:sha256:<hash>
```

## Install

Clone this repository, enter its root, then run:

```bash
./scripts/install.sh
node scripts/doctor.mjs
```

The installer creates a symlink at the current Codex Home's `skills/paifa` path and adds one versioned managed block to the global `AGENTS.md`. It backs up that file, writes atomically, preserves unrelated content, and records install state. Existing unmanaged Skill paths or conflicting managed state stop the installation.

The managed block makes Paifa run before a requested delegation, split, retry, fork, or subagent spawn. You can also invoke `paifa` explicitly when choosing the lowest-cost reliable route.

Filesystem installation and Doctor checks do not prove that an already-running Codex task dynamically discovered the Skill. Start a new Codex task when runtime discovery is not dynamic.

## Use

Ask Codex to delegate normally, for example:

```text
Split these independent checks into delegated tasks and use the lowest-cost reliable models.
```

Paifa applies hard floors before cost scoring. Authentication, authorization, identity, tenant isolation, security, billing, payment, migration, and production work cannot route below Sol `high`. Automatic escalation stops at Sol `high`; higher effort, irreversible operations, and increased high-risk consequences require explicit confirmation.

Internal subagent overrides must pass `model`, `reasoning_effort`, and `fork_turns` explicitly. `fork_turns` is `"none"` or a quoted positive integer such as `"3"`; it is never `"all"` when overriding the model.

`PAIFA_DISPATCHED` records only values the dispatch tool actually received: model, effort, and internal-route `forkTurns`. Context mode remains part of `PAIFA_ROUTE`; its fact-envelope delivery is recorded separately as `PAIFA_CONTEXT`, not claimed as a tool-returned field.

## Maintain

```bash
git pull --ff-only
./scripts/install.sh --update
node scripts/doctor.mjs
./scripts/uninstall.sh
```

Use `./scripts/uninstall.sh --restore-backup` only when global `AGENTS.md` has not changed since installation; the hash guard refuses an unsafe restore. See [upgrade guidance](docs/upgrade.md) and [contribution rules](docs/contributing.md).

## Support and security

Version 1 supports macOS and common Linux POSIX shell environments with Node.js 24. Windows installation is not supported in v1. Paifa has no third-party runtime dependencies and never performs automatic network updates.

Doctor verifies deterministic repository and installation contracts. Semantic routing and trigger behavior are evaluated separately with recorded fresh-agent pressure cases; Doctor does not claim those behaviors are universally guaranteed.

MIT licensed. See [LICENSE](LICENSE).
