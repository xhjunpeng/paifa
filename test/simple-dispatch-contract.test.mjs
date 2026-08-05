import assert from 'node:assert/strict';
import { test } from 'node:test';

import * as routing from '../scripts/lib/route-validation.mjs';

const CAPABILITIES = {
  'gpt-5.6-luna': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-terra': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-sol': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
};

test('chooses the lowest capable model from the full model and effort ladder', () => {
  assert.equal(typeof routing.selectRoute, 'function');

  assert.deepEqual(routing.selectRoute('simple', CAPABILITIES), {
    model: 'gpt-5.6-luna',
    effort: 'low',
  });
  assert.deepEqual(routing.selectRoute('clear', CAPABILITIES), {
    model: 'gpt-5.6-luna',
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
    model: 'gpt-5.6-sol',
    effort: 'high',
  });
  assert.deepEqual(routing.selectRoute('deep', CAPABILITIES), {
    model: 'gpt-5.6-sol',
    effort: 'xhigh',
  });
  assert.deepEqual(routing.selectRoute('maximum', CAPABILITIES), {
    model: 'gpt-5.6-sol',
    effort: 'max',
  });
  assert.deepEqual(routing.selectRoute('ultra', CAPABILITIES), {
    model: 'gpt-5.6-sol',
    effort: 'ultra',
  });
});

test('shows only model, effort, and a short reason in one human-readable line', () => {
  assert.equal(typeof routing.formatDispatchNotice, 'function');

  const notice = routing.formatDispatchNotice({
    model: 'gpt-5.6-terra',
    effort: 'medium',
    reason: '任务边界清晰，属于普通实现。',
  });

  assert.equal(
    notice,
    '派发模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。',
  );
  assert.equal(notice.includes('\n'), false);
  assert.equal(notice.includes('PAIFA_'), false);
  assert.equal(notice.includes('{'), false);
});

test('uses the six reasoning labels shown in the Codex UI', () => {
  const expected = {
    low: '轻度',
    medium: '中',
    high: '高',
    xhigh: '极高',
    max: '最高',
    ultra: '极高（更快消耗使用额度）',
  };

  for (const [effort, label] of Object.entries(expected)) {
    assert.match(
      routing.formatDispatchNotice({
        model: 'gpt-5.6-sol',
        effort,
        reason: '匹配当前任务。',
      }),
      new RegExp(`^派发模型：5\\.6 Sol｜思考强度：${label}`),
    );
  }
});

test('rejects a more expensive route when a cheaper capable route exists', () => {
  const result = routing.validateRoute({
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
  assert.ok(result.errors.some((error) => error.code === 'NOT_LOWEST_CAPABLE'));
});

test('a valid route returns the plain dispatch notice and no machine receipt', () => {
  const result = routing.validateRoute({
    category: 'ordinary',
    reason: '任务边界清晰，属于普通实现。',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    risk: [],
  }, CAPABILITIES);

  assert.equal(result.ok, true);
  assert.equal(
    result.notice,
    '派发模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。',
  );
  assert.equal(result.receipt, undefined);
});
