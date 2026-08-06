import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as routing from '../scripts/lib/route-validation.mjs';

const CAPABILITIES = {
  'gpt-5.6-luna': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-terra': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-sol': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
};

test('uses an independent task when the work requires its own worktree', () => {
  assert.equal(typeof routing.selectDispatchKind, 'function');
  assert.equal(routing.selectDispatchKind({ independentWorktree: true }), 'task');
});

test('uses an internal subagent only for bounded work that can share the current directory', () => {
  assert.equal(typeof routing.selectDispatchKind, 'function');
  assert.equal(routing.selectDispatchKind({}), 'subagent');
});

test('the approval notice includes the selected dispatch kind', () => {
  assert.equal(
    routing.formatDispatchNotice({
      dispatchKind: 'task',
      model: 'gpt-5.6-terra',
      effort: 'high',
      reason: '需要独立 Worktree，但边界明确可验证。',
    }),
    '方式：独立任务｜模型：5.6 Terra 高｜原因：需要独立 Worktree，但边界明确可验证。\n准备执行：回复 1 批准',
  );
});

test('rejects an internal subagent route when an independent task is required', () => {
  const result = routing.validateRoute({
    dispatchKind: 'subagent',
    dispatchRequirements: { independentWorktree: true },
    category: 'high-risk',
    reason: '需要干净 Worktree 和独立审计。',
    model: 'gpt-5.6-sol',
    effort: 'high',
    risk: ['identity'],
  }, CAPABILITIES);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'DISPATCH_KIND_MISMATCH'));
});

test('rejects a subagent tool call after announcing an independent task', () => {
  const result = routing.validateDispatch({
    dispatchKind: 'task',
    model: 'gpt-5.6-sol',
    effort: 'high',
  }, {
    dispatchKind: 'subagent',
    model: 'gpt-5.6-sol',
    effort: 'high',
  });

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'DISPATCH_KIND_MISMATCH'));
});
