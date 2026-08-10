#!/usr/bin/env node

import { spawnSync } from 'node:child_process';

import { planCloseout } from './lib/closeout.mjs';

function parseArgs(values) {
  const options = { base: 'main', remote: 'origin', dryRun: false };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--base' || value === '--branch' || value === '--remote') {
      const next = values[index + 1];
      if (!next) throw new Error(`ARGUMENT_REQUIRED: ${value} needs a branch or remote name.`);
      options[value.slice(2)] = next;
      index += 1;
    } else if (value === '--dry-run') {
      options.dryRun = true;
    } else {
      throw new Error(`UNKNOWN_ARGUMENT: ${value}`);
    }
  }
  if (!options.branch) throw new Error('ARGUMENT_REQUIRED: --branch needs the completed task branch.');
  return options;
}

function git(args, { allowFailure = false } = {}) {
  const result = spawnSync('git', args, { encoding: 'utf8' });
  if (result.error) throw result.error;
  if (result.status !== 0 && !allowFailure) {
    throw new Error(`GIT_COMMAND_FAILED: git ${args.join(' ')}\n${result.stderr.trim()}`);
  }
  return {
    ok: result.status === 0,
    output: result.stdout.trim(),
  };
}

function refExists(ref) {
  return git(['show-ref', '--verify', '--quiet', ref], { allowFailure: true }).ok;
}

function isAncestor(ancestor, descendant) {
  return git(['merge-base', '--is-ancestor', ancestor, descendant], { allowFailure: true }).ok;
}

function branchHasWorktree(branch) {
  const needle = `branch refs/heads/${branch}`;
  return git(['worktree', 'list', '--porcelain']).output
    .split(/\r?\n\r?\n/)
    .some((entry) => entry.split(/\r?\n/).includes(needle));
}

function receipt(options) {
  const currentBranch = git(['branch', '--show-current']).output;
  const worktreeClean = git(['status', '--porcelain']).output === '';
  if (currentBranch !== options.base || !worktreeClean) {
    return planCloseout({
      baseBranch: options.base,
      taskBranch: options.branch,
      currentBranch,
      worktreeClean,
      taskBranchMerged: false,
      taskBranchInWorktree: false,
      remoteBranchExists: false,
      remoteBranchMerged: false,
    });
  }

  git(['fetch', options.remote, '--prune']);
  git(['pull', '--ff-only', options.remote, options.base]);

  const localRef = `refs/heads/${options.branch}`;
  const remoteRef = `refs/remotes/${options.remote}/${options.branch}`;
  const remoteBaseRef = `refs/remotes/${options.remote}/${options.base}`;
  const localBranchExists = refExists(localRef);
  const remoteBranchExists = refExists(remoteRef);
  const result = planCloseout({
    baseBranch: options.base,
    taskBranch: options.branch,
    currentBranch: git(['branch', '--show-current']).output,
    worktreeClean: git(['status', '--porcelain']).output === '',
    taskBranchMerged: !localBranchExists || isAncestor(localRef, options.base),
    taskBranchInWorktree: localBranchExists && branchHasWorktree(options.branch),
    remoteBranchExists,
    remoteBranchMerged: !remoteBranchExists || isAncestor(remoteRef, remoteBaseRef),
  });
  return { ...result, localBranchExists };
}

try {
  const options = parseArgs(process.argv.slice(2));
  const result = receipt(options);
  if (!result.ok || options.dryRun) {
    process.stdout.write(`${JSON.stringify({ ...result, dryRun: options.dryRun }, null, 2)}\n`);
    process.exitCode = result.ok ? 0 : 1;
  } else {
    if (result.localBranchExists) git(['branch', '-d', options.branch]);
    if (result.actions.includes('delete-remote-branch')) {
      git(['push', options.remote, '--delete', options.branch]);
    }
    git(['worktree', 'prune']);
    process.stdout.write(`${JSON.stringify({ ...result, cleaned: true }, null, 2)}\n`);
  }
} catch (error) {
  process.stdout.write(`${JSON.stringify({
    ok: false,
    error: { code: String(error.message).split(':', 1)[0], message: error.message },
  }, null, 2)}\n`);
  process.exitCode = 2;
}
