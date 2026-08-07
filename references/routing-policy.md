# Direct-first routing policy

Direct execution is the default. Ordinary direct editing, testing, debugging, retries, and integration remain with the main task. Evaluate delegation only when there is a concrete candidate: all of independence, parallel benefit, lower handoff cost, and a verified return/continuation path must have factual evidence. A missing check returns `direct`.

For actual delegation, require `resultReturn` and `checkpointStore`; `subagent` also needs `parentWait`, while `task` needs `parentWake`. Without the applicable capability, return `direct`; do not promise automatic continuation. The main task owns completion: it must continue direct work and integrate delegated results only after it waits for or restores a DispatchRecord.

Choose `task` only for an independent worktree, durable visibility, direct user follow-up, or independent review. Otherwise choose `subagent`. Then choose the lowest supported actual route: mechanical/read-only Luna/low, clear Luna/medium, ordinary Terra/medium, complex or high-risk Terra/high. Model metadata is required only for actual dispatch and never forces direct work into a delegate.

Sol is available only for both high consequence and high uncertainty, or evidenced Terra/high failure; its one approval follows the existing approval executor. The main task is the only actor for proposal, approve, and user interaction. Before approval it must not create a real delegate. A worker inherits the approved route and scope. A worker must not use the approval CLI, show a model notice, reply to the user, or request confirmation; it only returns a short result to the main task. The host UI may show a worker panel, but the main task gives the final answer.

Once work begins, its task envelope covers planning, implementation, tests, retries, branch, push, PR, checks, merge, and closeout. Direct execution is the default throughout the envelope. Reconfirm only before Sol, or when the task goal, repository, production, credentials, paid service, irreversible deletion, or data migration changes.

Luna/Terra upgrades remain automatic and must not propose confirmation.
