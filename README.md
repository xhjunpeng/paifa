# Paifa

Paifa gives one visible execution proposal before a new development package starts. The user replies `1` or `确认` once; then the main task continues implementation, tests, debugging, retries, integration, and normal delegation without repeated approval prompts. A later Sol escalation requires one additional `1`.

Direct execution is the default and displays the current main task rather than fabricating a model switch. Delegation remains exceptional: use it only for genuinely independent, useful parallel work with a clear return path. The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope, must not use the approval CLI or ask the user for confirmation, and only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once approved, the task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Direct execution is the default throughout. A later Sol escalation requires one additional `1`.

## Install

```bash
./scripts/install.sh
node scripts/doctor.mjs
```

## License

Paifa is available under the [PolyForm Noncommercial License 1.0.0](LICENSE). Commercial use requires a separate written license from the copyright holder before use. Commercial terms and fees are agreed separately. To request a commercial license, open a [GitHub issue](https://github.com/xhjunpeng/paifa/issues/new/).
