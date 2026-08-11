import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as routing from '../scripts/lib/route-validation.mjs';

const CAPABILITIES = {
  'gpt-5.6-luna': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-terra': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-sol': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
};

test('chooses the fastest suitable model from the full model and effort ladder', () => {
  assert.equal(typeof routing.selectRoute, 'function');

  assert.deepEqual(routing.selectRoute('simple', CAPABILITIES), {
    model: 'gpt-5.6-terra',
    effort: 'medium',
  });
  assert.deepEqual(routing.selectRoute('clear', CAPABILITIES), {
    model: 'gpt-5.6-terra',
    effort: 'medium',
  });
  assert.deepEqual(routing.selectRoute('ordinary', CAPABILITIES), {
    model: 'gpt-5.6-terra',
    effort: 'medium',
  });
  assert.deepEqual(routing.selectRoute('complex', CAPABILITIES), {
    model: 'gpt-5.6-terra',
    effort: 'high',
  });
  assert.deepEqual(routing.selectRoute('high-risk', CAPABILITIES), {
    model: 'gpt-5.6-terra',
    effort: 'high',
  });
  assert.deepEqual(routing.selectRoute('deep', CAPABILITIES, { terraHighFailed: true }), {
    model: 'gpt-5.6-sol',
    effort: 'xhigh',
  });
  assert.deepEqual(routing.selectRoute('maximum', CAPABILITIES, { terraHighFailed: true }), {
    model: 'gpt-5.6-sol',
    effort: 'max',
  });
  assert.deepEqual(routing.selectRoute('ultra', CAPABILITIES, { terraHighFailed: true }), {
    model: 'gpt-5.6-sol',
    effort: 'ultra',
  });
});

test('shows dispatch kind, model, effort, and a short reason in two compact approval lines', () => {
  assert.equal(typeof routing.formatDispatchNotice, 'function');

  const notice = routing.formatDispatchNotice({
    dispatchKind: 'subagent',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    reason: '任务边界清晰，属于普通实现。',
  });

  assert.equal(
    notice,
    '方式：内部子智能体｜模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。\n准备执行：回复 1 批准',
  );
  assert.equal(notice.split('\n').length, 2);
  assert.equal(notice.includes('PAIFA_'), false);
  assert.equal(notice.includes('{'), false);
});

test('shows the same two-line notice but starts immediately after task-level execution approval', () => {
  const notice = routing.formatDispatchNotice({
    dispatchKind: 'subagent',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    reason: '任务边界清晰，属于普通实现。',
    executionApproved: true,
  });

  assert.equal(
    notice,
    '方式：内部子智能体｜模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。\n开始执行：已获授权',
  );
  assert.equal(notice.split('\n').length, 2);
});

test('uses the six reasoning labels shown in the Codex UI', () => {
  const expected = {
    low: '轻度',
    medium: '中',
    high: '高',
    xhigh: '极高',
    max: '最高',
    ultra: 'Ultra',
  };

  for (const [effort, label] of Object.entries(expected)) {
    assert.match(
      routing.formatDispatchNotice({
        dispatchKind: 'subagent',
        model: 'gpt-5.6-sol',
        effort,
        reason: '匹配当前任务。',
      }),
      new RegExp(`^方式：内部子智能体｜模型：5\\.6 Sol｜思考强度：${label}｜原因：`),
    );
  }
});

test('rejects a route that is slower than the fastest suitable worker route', () => {
  const result = routing.validateRoute({
    dispatchKind: 'subagent',
    dispatchRequirements: {},
    version: 'v1',
    routeClass: 'A',
    role: 'maker',
    category: 'ordinary',
    reason: '任务边界清晰。',
    model: 'gpt-5.6-sol',
    effort: 'high',
    session: { action: 'create', context: 'compact' },
    qualityContract: ['focused test'],
    autoUpgradeCeiling: { model: 'gpt-5.6-sol', effort: 'high' },
    risk: [],
  }, CAPABILITIES);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'NOT_FASTEST_SUITABLE'));
});

test('a valid route returns the plain dispatch notice and no machine receipt', () => {
  const result = routing.validateRoute({
    dispatchKind: 'subagent',
    dispatchRequirements: {},
    category: 'ordinary',
    reason: '任务边界清晰，属于普通实现。',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    risk: [],
  }, CAPABILITIES);

  assert.equal(result.ok, true);
  assert.equal(
    result.notice,
    '方式：内部子智能体｜模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。\n准备执行：回复 1 批准',
  );
  assert.equal(result.receipt, undefined);
});

test('a task-level approved route returns the immediate-start notice', () => {
  const result = routing.validateRoute({
    dispatchKind: 'subagent',
    dispatchRequirements: {},
    category: 'ordinary',
    reason: '任务边界清晰，属于普通实现。',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    risk: [],
    executionApproved: true,
  }, CAPABILITIES);

  assert.equal(result.ok, true);
  assert.match(result.notice, /\n开始执行：已获授权$/);
});
