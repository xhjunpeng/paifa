import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  selectRoute,
  validateRoute,
} from '../scripts/lib/route-validation.mjs';

const CAPABILITIES = {
  'gpt-5.6-luna': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-terra': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-sol': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
};

function route(overrides = {}) {
  return {
    dispatchKind: 'subagent',
    dispatchRequirements: {},
    category: 'high-risk',
    model: 'gpt-5.6-terra',
    effort: 'high',
    reason: '高风险领域，但边界明确且可验证。',
    risk: ['identity'],
    solGate: {},
    ...overrides,
  };
}

test('a high-risk keyword alone stays on Terra high', () => {
  assert.deepEqual(selectRoute('high-risk', CAPABILITIES, {}), {
    model: 'gpt-5.6-terra',
    effort: 'high',
  });
});

test('ordinary and cross-module planning stay on Terra', () => {
  assert.deepEqual(selectRoute('ordinary', CAPABILITIES, { planning: true }), {
    model: 'gpt-5.6-terra',
    effort: 'medium',
  });
  assert.deepEqual(selectRoute('complex', CAPABILITIES, { planning: true }), {
    model: 'gpt-5.6-terra',
    effort: 'high',
  });
});

test('Sol high requires both high consequence and high uncertainty', () => {
  assert.deepEqual(selectRoute('high-risk', CAPABILITIES, {
    highConsequence: true,
  }), {
    model: 'gpt-5.6-terra',
    effort: 'high',
  });

  assert.deepEqual(selectRoute('high-risk', CAPABILITIES, {
    highConsequence: true,
    highUncertainty: true,
  }), {
    model: 'gpt-5.6-sol',
    effort: 'high',
  });
});

test('evidenced Terra high failure allows Sol high', () => {
  assert.deepEqual(selectRoute('complex', CAPABILITIES, {
    terraHighFailed: true,
  }), {
    model: 'gpt-5.6-sol',
    effort: 'high',
  });
});

test('route validation rejects Sol when the gate is not met', () => {
  const result = validateRoute(route({
    model: 'gpt-5.6-sol',
    effort: 'high',
  }), CAPABILITIES);

  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.code === 'SOL_GATE_REQUIRED'));
});

test('xhigh, max, and ultra require explicit user confirmation', () => {
  for (const [category, effort] of [
    ['deep', 'xhigh'],
    ['maximum', 'max'],
    ['ultra', 'ultra'],
  ]) {
    const result = validateRoute(route({
      category,
      model: 'gpt-5.6-sol',
      effort,
      risk: [],
      solGate: { terraHighFailed: true },
      userConfirmedAboveHigh: false,
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(result.errors.some(
      (error) => error.code === 'STRONG_REASONING_CONFIRMATION_REQUIRED',
    ));
  }
});
