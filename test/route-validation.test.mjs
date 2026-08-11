import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import {
  selectRoute,
  validateDispatch,
  validateRoute,
} from '../scripts/lib/route-validation.mjs';

const CAPABILITIES = {
  'gpt-5.6-luna': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-terra': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-sol': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
};

function validRoute(overrides = {}) {
  return {
    dispatchKind: 'subagent',
    dispatchRequirements: {},
    category: 'ordinary',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    reason: '任务边界清晰，属于普通实现。',
    risk: [],
    hostCapabilities: { resultReturn: true, parentWait: true, hostManagedCollection: true },
    ...overrides,
  };
}

function directRoute(overrides = {}) {
  return {
    dispatchKind: 'direct',
    dispatchRequirements: {},
    category: 'ordinary',
    model: 'current',
    effort: 'current',
    recommendedModel: 'gpt-5.6-terra',
    recommendedEffort: 'medium',
    reason: '主任务保留当前上下文，直接连续执行。',
    risk: [],
    ...overrides,
  };
}

function errorCodes(result) {
  return result.errors.map((error) => error.code);
}

describe('selectRoute', () => {
  test('uses Terra for development workers and reserves Luna for mechanical acceptance', () => {
    assert.deepEqual(selectRoute('simple', CAPABILITIES), {
      model: 'gpt-5.6-terra', effort: 'medium',
    });
    assert.deepEqual(selectRoute('clear', CAPABILITIES), {
      model: 'gpt-5.6-terra', effort: 'medium',
    });
    assert.deepEqual(selectRoute('simple', CAPABILITIES, {}, 'mechanical-acceptance'), {
      model: 'gpt-5.6-luna', effort: 'low',
    });
    assert.deepEqual(selectRoute('clear', CAPABILITIES, {}, 'mechanical-acceptance'), {
      model: 'gpt-5.6-luna', effort: 'medium',
    });
  });

  test('uses the fastest suitable development route for each category', () => {
    assert.deepEqual(selectRoute('simple', CAPABILITIES), {
      model: 'gpt-5.6-terra', effort: 'medium',
    });
    assert.deepEqual(selectRoute('clear', CAPABILITIES), {
      model: 'gpt-5.6-terra', effort: 'medium',
    });
    assert.deepEqual(selectRoute('ordinary', CAPABILITIES), {
      model: 'gpt-5.6-terra', effort: 'medium',
    });
    assert.deepEqual(selectRoute('complex', CAPABILITIES), {
      model: 'gpt-5.6-terra', effort: 'high',
    });
    assert.deepEqual(selectRoute('high-risk', CAPABILITIES), {
      model: 'gpt-5.6-terra', effort: 'high',
    });
    assert.deepEqual(selectRoute('deep', CAPABILITIES, { terraHighFailed: true }), {
      model: 'gpt-5.6-sol', effort: 'xhigh',
    });
    assert.deepEqual(selectRoute('maximum', CAPABILITIES, { terraHighFailed: true }), {
      model: 'gpt-5.6-sol', effort: 'max',
    });
    assert.deepEqual(selectRoute('ultra', CAPABILITIES, { terraHighFailed: true }), {
      model: 'gpt-5.6-sol', effort: 'ultra',
    });
  });

  test('falls forward without dropping below the category floor', () => {
    const onlySol = { 'gpt-5.6-sol': ['high'] };
    assert.equal(selectRoute('ordinary', onlySol), null);
    assert.deepEqual(selectRoute('ordinary', onlySol, { terraHighFailed: true }), {
      model: 'gpt-5.6-sol', effort: 'high',
    });
    assert.deepEqual(selectRoute('high-risk', { 'gpt-5.6-terra': ['high'] }), {
      model: 'gpt-5.6-terra', effort: 'high',
    });
  });
});

describe('validateRoute', () => {
  test('shows a concrete manual model recommendation for direct work without inventing a switch', () => {
    const result = validateRoute(directRoute());

    assert.equal(result.ok, true);
    assert.equal(
      result.notice,
      '方式：主任务直接执行｜推荐模型：5.6 Terra｜推荐思考强度：中｜执行：保持当前主任务设置（可在 Codex UI 手动切换）｜原因：主任务保留当前上下文，直接连续执行。\n准备执行：回复 1 批准',
    );
  });

  test('rejects a direct recommendation that is not the lowest suitable route', () => {
    const result = validateRoute(directRoute({
      recommendedModel: 'gpt-5.6-sol',
      recommendedEffort: 'high',
    }));

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('DIRECT_RECOMMENDATION_MISMATCH'));
  });

  test('returns the compact two-line approval notice for a valid route', () => {
    const result = validateRoute(validRoute(), CAPABILITIES);

    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
    assert.equal(
      result.notice,
      '方式：内部子智能体｜模型：5.6 Terra｜思考强度：中｜原因：任务边界清晰，属于普通实现。\n准备执行：回复 1 批准',
    );
    assert.equal(result.notice.split('\n').length, 2);
    assert.equal(result.receipt, undefined);
  });

  test('rejects Luna for a development worker but accepts it for mechanical acceptance', () => {
    const development = validateRoute(validRoute({
      category: 'simple',
      model: 'gpt-5.6-luna',
      effort: 'low',
    }), CAPABILITIES);
    assert.ok(errorCodes(development).includes('NOT_FASTEST_SUITABLE'));

    const acceptance = validateRoute(validRoute({
      category: 'simple',
      model: 'gpt-5.6-luna',
      effort: 'low',
      workType: 'mechanical-acceptance',
    }), CAPABILITIES);
    assert.equal(acceptance.ok, true);
  });

  test('returns the immediate-start notice when task-level execution is already approved', () => {
    const result = validateRoute(validRoute({ executionApproved: true }), CAPABILITIES);

    assert.equal(result.ok, true);
    assert.match(result.notice, /\n开始执行：已获授权$/);
  });

  test('keeps model and reasoning effort as separate fields without legacy session wording', () => {
    const notice = validateRoute(validRoute(), CAPABILITIES).notice;

    assert.match(notice, /^方式：内部子智能体｜模型：5\.6 Terra｜思考强度：中｜原因：/);
    assert.doesNotMatch(notice, /GPT-5|当前会话|强度未暴露/);
  });

  test('rejects a route that is slower than the fastest suitable worker route', () => {
    const result = validateRoute(validRoute({
      model: 'gpt-5.6-sol',
      effort: 'high',
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('NOT_FASTEST_SUITABLE'));
  });

  test('requires the high-risk category without upgrading on the keyword alone', () => {
    const rejected = validateRoute(validRoute({
      category: 'ordinary',
      risk: ['security'],
    }), CAPABILITIES);
    assert.ok(errorCodes(rejected).includes('HIGH_RISK_CATEGORY_REQUIRED'));

    const accepted = validateRoute(validRoute({
      category: 'high-risk',
      model: 'gpt-5.6-terra',
      effort: 'high',
      risk: ['security'],
    }), CAPABILITIES);
    assert.equal(accepted.ok, true);

    const deeper = validateRoute(validRoute({
      category: 'deep',
      model: 'gpt-5.6-sol',
      effort: 'xhigh',
      risk: ['security'],
      solGate: { terraHighFailed: true },
    }), CAPABILITIES);
    assert.equal(deeper.ok, true);
  });

  test('requires a short reason and a supported category', () => {
    assert.ok(errorCodes(validateRoute(validRoute({ reason: '' }), CAPABILITIES)).includes('REASON_INVALID'));
    assert.ok(errorCodes(validateRoute(validRoute({ category: 'D' }), CAPABILITIES)).includes('CATEGORY_INVALID'));
  });

  test('requires confirmation for irreversible or increased high-risk consequences', () => {
    for (const field of ['irreversible', 'increasesHighRiskConsequences']) {
      const rejected = validateRoute(validRoute({ [field]: true }), CAPABILITIES);
      assert.ok(errorCodes(rejected).includes('HIGH_RISK_CONFIRMATION_REQUIRED'));

      const accepted = validateRoute(validRoute({
        [field]: true,
        userConfirmedHighRiskBoundary: true,
      }), CAPABILITIES);
      assert.equal(accepted.ok, true);
    }
  });
});

describe('validateDispatch', () => {
  test('accepts matching dispatch kind, model, and effort', () => {
    assert.equal(validateDispatch(validRoute(), {
      dispatchKind: 'subagent',
      model: 'gpt-5.6-terra',
      effort: 'medium',
    }).ok, true);
  });

  test('rejects missing or mismatched dispatch settings', () => {
    const missing = validateDispatch(validRoute(), {
      dispatchKind: 'subagent',
      effort: 'medium',
    });
    const mismatched = validateDispatch(validRoute(), {
      dispatchKind: 'subagent',
      model: 'gpt-5.6-terra',
      effort: 'low',
    });

    assert.ok(errorCodes(missing).includes('DISPATCH_MODEL_MISMATCH'));
    assert.ok(errorCodes(mismatched).includes('DISPATCH_EFFORT_MISMATCH'));
  });
});

describe('validate-route CLI', () => {
  function runCli(contents) {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'paifa-route-cli-'));
    const inputPath = path.join(directory, 'route.json');
    writeFileSync(inputPath, contents, 'utf8');
    const result = spawnSync(process.execPath, ['scripts/validate-route.mjs', inputPath], {
      cwd: path.resolve(import.meta.dirname, '..'),
      encoding: 'utf8',
    });
    rmSync(directory, { recursive: true, force: true });
    return result;
  }

  test('prints the plain notice for a valid route', () => {
    const result = runCli(JSON.stringify(validRoute({ capabilities: CAPABILITIES })));
    const output = JSON.parse(result.stdout);

    assert.equal(result.status, 0, result.stderr);
    assert.equal(output.ok, true);
    assert.match(output.notice, /^方式：内部子智能体｜模型：5\.6 Terra｜思考强度：中｜原因：/);
    assert.match(output.notice, /\n准备执行：回复 1 批准$/);
    assert.equal(output.receipt, undefined);
  });

  test('returns structured errors for invalid input', () => {
    const invalid = runCli(JSON.stringify(validRoute({ reason: '', capabilities: CAPABILITIES })));
    assert.equal(invalid.status, 1);
    assert.ok(JSON.parse(invalid.stdout).errors.some((error) => error.code === 'REASON_INVALID'));

    const malformed = runCli('{not-json');
    assert.equal(malformed.status, 2);
    assert.equal(JSON.parse(malformed.stdout).error.code, 'MALFORMED_INPUT');
  });
});
