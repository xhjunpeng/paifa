import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import { approve, propose } from '../scripts/lib/approval-state.mjs';

function validRoute(overrides = {}) {
  return {
    dispatchKind: 'subagent',
    dispatchRequirements: {},
    category: 'ordinary',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    reason: '任务边界清晰，属于普通实现。',
    risk: [],
    ...overrides,
  };
}

function withStateDir(callback) {
  const stateDir = mkdtempSync(path.join(os.tmpdir(), 'paifa-approval-'));
  try {
    callback(stateDir);
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
  }
}

describe('approval state', () => {
  test('proposes a valid route with only the compact two-line notice', () => {
    withStateDir((stateDir) => {
      const result = propose('workspace-a', validRoute(), { stateDir });

      assert.equal(result.ok, true);
      assert.equal(result.replaced, false);
      assert.equal(
        result.notice,
        '方式：内部子智能体｜模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。\n准备执行：回复 1 批准',
      );
      assert.equal(result.notice.split('\n').length, 2);
      assert.doesNotMatch(result.notice, /\{|\}|nonce|json|path|\/tmp/i);
    });
  });

  test('rejects an execution-approved route before it can become pending', () => {
    withStateDir((stateDir) => {
      const result = propose('workspace-a', validRoute({ executionApproved: true }), { stateDir });

      assert.equal(result.ok, false);
      assert.equal(result.error.code, 'EXECUTION_APPROVAL_NOT_ALLOWED');
    });
  });

  test('rejects a confirmation when no route is pending', () => {
    withStateDir((stateDir) => {
      const result = approve('workspace-a', '1', { stateDir });

      assert.equal(result.ok, false);
      assert.equal(result.error.code, 'NO_PENDING_APPROVAL');
    });
  });

  test('approves 1 or 确认 after trimming only leading and trailing whitespace', () => {
    withStateDir((stateDir) => {
      for (const reply of ['1', ' 1 ', '\n1\n', '\u30001\u3000', '确认', ' 确认 ', '\n确认\n', '\u3000确认\u3000']) {
        propose('workspace-a', validRoute(), { stateDir });
        const approved = approve('workspace-a', reply, { stateDir });

        assert.equal(approved.ok, true, `expected ${JSON.stringify(reply)} to approve`);
        assert.equal(approved.route.executionApproved, true);
        assert.equal(
          approved.notice,
          '方式：内部子智能体｜模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。\n开始执行：已获授权',
        );
        assert.equal(approve('workspace-a', '1', { stateDir }).error.code, 'NO_PENDING_APPROVAL');
      }
    });
  });

  test('rejects confirmation text with added content without consuming the pending route', () => {
    withStateDir((stateDir) => {
      for (const reply of ['1, 按照最新 Paifa 标准', '1 说明', '确认，请继续', '', '   ', '\n\t']) {
        propose('workspace-a', validRoute(), { stateDir });
        const result = approve('workspace-a', reply, { stateDir });

        assert.equal(result.ok, false, `expected ${JSON.stringify(reply)} to be rejected`);
        assert.equal(result.error.code, 'APPROVAL_REPLY_INVALID');
        assert.equal(approve('workspace-a', '1', { stateDir }).ok, true);
      }
    });
  });

  test('replaces a pending route and approves only the replacement', () => {
    withStateDir((stateDir) => {
      propose('workspace-a', validRoute({ reason: '旧方案。' }), { stateDir });
      const replacement = propose('workspace-a', validRoute({
        model: 'gpt-5.6-luna',
        effort: 'medium',
        category: 'clear',
        reason: '新方案范围更小，易于验证。',
      }), { stateDir });
      const approved = approve('workspace-a', '1', { stateDir });

      assert.equal(replacement.ok, true);
      assert.equal(replacement.replaced, true);
      assert.equal(approved.route.model, 'gpt-5.6-luna');
      assert.equal(approved.route.reason, '新方案范围更小，易于验证。');
    });
  });

  test('keeps pending routes isolated by scope and state directory', () => {
    withStateDir((stateDir) => {
      withStateDir((otherStateDir) => {
        propose('workspace-a', validRoute(), { stateDir });

        assert.equal(approve('workspace-b', '1', { stateDir }).error.code, 'NO_PENDING_APPROVAL');
        assert.equal(approve('workspace-a', '1', { stateDir: otherStateDir }).error.code, 'NO_PENDING_APPROVAL');
        assert.equal(approve('workspace-a', '1', { stateDir }).ok, true);
      });
    });
  });
});

describe('approval CLI', () => {
  test('proposes and approves a route through JSON input and output', () => {
    withStateDir((stateDir) => {
      const root = path.resolve(import.meta.dirname, '..');
      const routePath = path.join(stateDir, 'route.json');
      writeFileSync(routePath, JSON.stringify(validRoute()), 'utf8');

      const proposed = spawnSync(process.execPath, [
        'scripts/approval.mjs', 'propose', routePath, '--scope', 'workspace-a', '--state-dir', stateDir,
      ], { cwd: root, encoding: 'utf8' });
      const approved = spawnSync(process.execPath, [
        'scripts/approval.mjs', 'approve', '1', '--scope', 'workspace-a', '--state-dir', stateDir,
      ], { cwd: root, encoding: 'utf8' });

      assert.equal(proposed.status, 0, proposed.stderr);
      assert.equal(JSON.parse(proposed.stdout).notice.split('\n').length, 2);
      assert.equal(approved.status, 0, approved.stderr);
      assert.equal(JSON.parse(approved.stdout).route.executionApproved, true);
    });
  });
});
