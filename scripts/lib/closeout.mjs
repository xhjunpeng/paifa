function failure(code) {
  return { ok: false, error: { code } };
}

export function planCloseout({
  baseBranch,
  taskBranch,
  currentBranch,
  worktreeClean,
  taskBranchMerged,
  taskBranchInWorktree,
  remoteBranchExists,
  remoteBranchMerged,
}) {
  if (!baseBranch || !taskBranch || baseBranch === taskBranch) {
    return failure('BRANCH_TARGET_INVALID');
  }
  if (currentBranch !== baseBranch) return failure('BASE_BRANCH_REQUIRED');
  if (worktreeClean !== true) return failure('WORKTREE_DIRTY');
  if (taskBranchMerged !== true) return failure('BRANCH_NOT_MERGED');
  if (taskBranchInWorktree === true) return failure('BRANCH_IN_WORKTREE');
  if (remoteBranchExists === true && remoteBranchMerged !== true) {
    return failure('REMOTE_BRANCH_NOT_MERGED');
  }

  return {
    ok: true,
    actions: [
      'pull-base',
      'delete-local-branch',
      ...(remoteBranchExists === true ? ['delete-remote-branch'] : []),
      'prune-worktrees',
    ],
  };
}
