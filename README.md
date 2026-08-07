# Paifa

Paifa is a small Codex delegation gate. Direct execution is the default: ordinary direct editing, testing, debugging, retries, and integration remain with the main task. Invoke Paifa only when considering real delegated work, a model upgrade, or a high-risk boundary.

Delegate only when independence, parallel benefit, lower handoff cost, and a verified return/continuation path are all present. Actual delegation needs explicit return and checkpoint capabilities; a subagent additionally needs parent wait, and a cross-turn task additionally needs parent wakeup. If any condition is absent, work stays `direct`. Paifa never treats missing model metadata as a reason to delegate and must not promise automatic continuation without a verified wakeup path.

The main task owns completion. It checkpoints before delegation, waits for or restores a DispatchRecord before integrating delegated results, ignores duplicate or late results, and does not restart cancelled work. The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not use the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Only actual delegation receives a model route. Luna and Terra start directly; Sol requires the existing single approval when both high consequence and high uncertainty are present, or Terra/high has evidenced failure. Luna/Terra upgrades remain automatic and must not propose confirmation.

Once work begins, its task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Direct execution is the default throughout the envelope. Reconfirm only before Sol, or when the task goal, repository, production, credentials, paid service, irreversible deletion, or data migration changes.

## Install

```bash
./scripts/install.sh
node scripts/doctor.mjs
```

The installer links the skill, updates only its managed block in global `AGENTS.md`, and installs an unchanged managed Luna worker. To update an existing installation, run `./scripts/install.sh --update`.

## License

Paifa is available under the [PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use requires a separate written license from the copyright holder before use. Commercial terms and fees are agreed separately. To request a commercial license, open a [GitHub issue](https://github.com/xhjunpeng/paifa/issues/new/).
