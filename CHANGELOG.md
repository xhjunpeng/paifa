# Changelog

All notable changes follow semantic versioning.

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
