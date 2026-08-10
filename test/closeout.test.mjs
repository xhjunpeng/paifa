import assert from 'node:assert/strict';
import { test } from 'node:test';

import { planCloseout } from '../scripts/lib/closeout.mjs';

function ready(overrides = {}) {
  return {
    baseBranch: 'main',
    taskBranch: 'codex/example-task',
    currentBranch: 'main',
    worktreeClean: true,
    taskBranchMerged: true,
    taskBranchInWorktree: false,
    remoteBranchExists: true,
    remoteBranchMerged: true,
    ...overrides,
  };
}

test('plans cleanup only for the current task branch after a clean merge', () => {
  assert.deepEqual(planCloseout(ready()), {
    ok: true,
    actions: ['pull-base', 'delete-local-branch', 'delete-remote-branch', 'prune-worktrees'],
  });
});

test('refuses cleanup when the base checkout is dirty, wrong, unmerged, or active', () => {
  for (const [overrides, code] of [
    [{ currentBranch: 'codex/example-task' }, 'BASE_BRANCH_REQUIRED'],
    [{ worktreeClean: false }, 'WORKTREE_DIRTY'],
    [{ taskBranchMerged: false }, 'BRANCH_NOT_MERGED'],
    [{ taskBranchInWorktree: true }, 'BRANCH_IN_WORKTREE'],
    [{ remoteBranchMerged: false }, 'REMOTE_BRANCH_NOT_MERGED'],
  ]) {
    assert.deepEqual(planCloseout(ready(overrides)), {
      ok: false,
      error: { code },
    });
  }
});

test('never deletes a remote branch that does not exist', () => {
  assert.deepEqual(planCloseout(ready({ remoteBranchExists: false })), {
    ok: true,
    actions: ['pull-base', 'delete-local-branch', 'prune-worktrees'],
  });
});
