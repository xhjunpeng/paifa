# Changelog

All notable changes follow semantic versioning.

## 1.7.5 - 2026-08-11

- Made worker model routing time-first: development workers route to Terra, while Luna is reserved for bounded mechanical acceptance work that completes sooner.
- Preserved the Sol evidence gate and a separate numeric `1` approval for every Sol escalation.

## 1.7.4 - 2026-08-11

- Made delegation time-first: when safe parallel work shortens total completion time, the main task delegates bounded implementation, testing, or acceptance work instead of defaulting to direct execution.
- Kept one branch per task: workers share the task branch and may not create branches or worktrees; the main task coordinates, integrates, and gives the final answer.

## 1.7.3 - 2026-08-10

- Unified every Codex-initiated confirmation and choice around numbered replies: the recommended option is always `1`, and a confirmation accepts only `1`.
- Removed user-facing requests to type “确认”, “授权”, “yes”, or similar words; operating-system, browser, and third-party prompts remain outside Paifa's control.

## 1.7.2 - 2026-08-10

- Added a mandatory, safe task-closeout command: after merge it updates the base branch, removes only the verified task branch, and prunes stale worktree records.
- Refuses cleanup for dirty, unmerged, unrelated, or active-worktree branches so unfinished work is never silently removed.

## 1.7.1 - 2026-08-07

- Added a concrete model and reasoning recommendation to every main-task direct proposal, while clearly marking it as a manual Codex UI choice rather than an automatic switch.

## 1.7.0 - 2026-08-07

- Restored one explicit approval before each new development package: the initial proposal now shows the execution mode, model plan, reasoning level, and reason, then waits for `1` or `确认`.
- Made that approval cover normal implementation, tests, debugging, retries, integration, and necessary delegation; only an evidence-based Sol escalation or changed high-risk boundary asks for another approval.
- Represented main-task work as `direct/current/current`, so direct execution preserves the current task settings instead of forcing a model switch or a delegate merely to show a route.
- Removed the unused DispatchRecord/checkpoint/wakeup runtime and its tests, which were never connected to the actual dispatch entry point.

## 1.6.0 - 2026-08-07

- Made main-task direct execution the default; visible model metadata is no longer required to edit, test, debug, retry, or integrate work.
- Restricted Paifa to real delegation, model upgrades, and high-risk boundaries; delegation now requires factual evidence of independence, parallel benefit, lower handoff cost, and a verified return/continuation path.
- Added explicit continuity capabilities and durable, idempotent DispatchRecords so missing wakeup support falls back to direct work instead of promising automatic continuation.

## 1.5.0 - 2026-08-07

- Made Luna/Terra routes automatic; only Sol now shows the two-line approval and waits for `1` or `确认`.
- Required explicit dispatch capabilities before proposing a model, preventing a Luna proposal when the real dispatch surface cannot run Luna.
- Added safe installation, detection, update, and user-modification preservation for the managed Luna/medium worker.

## 1.4.2 - 2026-08-06

- Accepted `1` and `确认` after trimming leading and trailing ASCII or Unicode whitespace, while continuing to reject added wording.
- Made invalid-approval guidance neutral and prohibited unsupported claims that a user reply contains whitespace.

## 1.4.1 - 2026-08-06

- Made approval parent-first: the main task proposes and confirms before any real delegate exists.
- Made workers inherit the approved route and scope, return only to the main task, and never repeat the approval conversation.

## 1.4.0 - 2026-08-06

- Added a dependency-free local approval executor that records one pending route per task scope.
- Execution now requires a prior proposal and a following exact `1` or `确认`; approvals are consumed once and cannot drift to a later task.
- Replaced pending routes atomically and kept approved normal work in one uninterrupted closed loop.

## 1.3.3 - 2026-08-06

- Separated every user-visible route into explicit `模型` and `思考强度` fields.
- Forbid `GPT-5`, `当前会话`, and `强度未暴露` as a routing substitute.
- Require Paifa before creating or modifying an executable plan document, while leaving plan discussion uninterrupted.

## 1.3.2 - 2026-08-06

- Narrowed discovery to the next state-changing action so ordinary conversation does not load Paifa.
- Made a current-task route invalid when its exact model or effort is unavailable; cost-controlled work must use a worker with an exact route.
- Reduced the installed global rule to one trigger sentence and kept routing policy in the Skill.

## 1.3.1 - 2026-08-06

- Treat clear execution intent as task-level approval and start without requiring a second standalone reply.
- Keep the two-line notice while covering normal dependency, test, repair, retry, and verification work under one approval.
- Require a new approval only when cost, workspace, high-impact external effects, or the task goal materially changes.

## 1.3.0 - 2026-08-06

- Added a two-line, user-approved execution gate for direct changes and delegated work; only a standalone `1` permits the stated action.
- Kept questions, analysis, planning, source reading, and read-only checks free of approval prompts.

## Unreleased

- Replaced the MIT license with PolyForm Noncommercial 1.0.0 and reserved commercial use for separately agreed written licenses.

## 1.2.0 - 2026-08-06

- Made Terra the default for implementation, review, planning, and high-risk work with clear boundaries and verification.
- Added a strict Sol gate: both high consequence and high uncertainty, or evidenced Terra/high failure.
- Required explicit confirmation for `xhigh`, `max`, and `ultra`, and blocked keyword-, duration-, file-count-, environment-, and generic-quality-based Sol upgrades.

## 1.1.1 - 2026-08-06

- Added a two-way execution choice: independent task for isolated or durable work, internal subagent for bounded shared-directory work.
- Added the dispatch kind to the same single user-visible line and validated that the actual tool kind matches.
- Prevented internal subagents from claiming an independent Worktree they do not provide.

## 1.1.0 - 2026-08-06

- Reduced routing to one plain ladder covering 5.6 Luna, Terra, Sol and `low` through `ultra` reasoning.
- Replaced all user-visible route objects and coded receipts with one human-readable model, effort, and reason line.
- Matched the user-visible model and reasoning labels to the Codex UI while keeping tool parameters internal.
- Removed scoring, YAML, context hashes, and repeated waiting/status output from the runtime contract.
- Kept the Sol `high` floor for security-sensitive and production-impacting work.

## 1.0.2 - 2026-08-05

- Clarified that Paifa never authorizes or requires delegation for ordinary main-task work.
- Made the main task retain completion ownership after dispatch: continue independent work, then wait for and integrate required delegated results before the final answer.
- Added deterministic lifecycle contracts and three fresh Terra/low semantic samples for the premature-stop regression.

## 1.0.1 - 2026-08-05

- Changed every normal route class to one validator-generated compact `PAIFA_ROUTE` line.
- Stopped waiting, monitoring, polling, and status-only updates from repeating Paifa receipts.
- Kept expanded route YAML available only for explicit audit details or validation failures.

## 1.0.0 - 2026-08-05

- Added evidence-based model, reasoning, session, context, and escalation routing.
- Added Sol `high` floors for security-sensitive and production-impacting work.
- Added separate planned, actual-tool, and context-delivery receipts with internal `fork_turns` validation.
- Added safe managed global-rule installation, original backup preservation across updates, file-mode preservation, update authorization, uninstall, and recovery guards.
- Added read-only Doctor checks and dependency-free route validation.
- Added fresh-context RED/GREEN pressure evidence and trigger-boundary cases.
