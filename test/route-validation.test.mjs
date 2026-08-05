import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import {
  validateDispatch,
  validateRoute,
} from '../scripts/lib/route-validation.mjs';

const CAPABILITIES = {
  'gpt-5.6-luna': ['low', 'medium', 'high', 'xhigh', 'max'],
  'gpt-5.6-terra': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-sol': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
};

function validRoute(overrides = {}) {
  return {
    version: 'v1',
    routeClass: 'B',
    role: 'maker',
    independent: false,
    risk: [],
    model: 'gpt-5.6-terra',
    effort: 'medium',
    session: {
      action: 'create',
      context: 'compact',
    },
    qualityContract: ['focused tests pass'],
    autoUpgradeCeiling: {
      model: 'gpt-5.6-sol',
      effort: 'high',
    },
    userConfirmedAboveCeiling: false,
    pollutionRisk: 0,
    ...overrides,
  };
}

function errorCodes(result) {
  return result.errors.map((error) => error.code);
}

describe('validateRoute', () => {
  test('accepts a complete ordinary route', () => {
    const result = validateRoute(validRoute(), CAPABILITIES);

    assert.equal(result.ok, true);
    assert.deepEqual(result.errors, []);
  });

  test('requires a quality contract', () => {
    const result = validateRoute(validRoute({ qualityContract: [] }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('QUALITY_CONTRACT_REQUIRED'));
  });

  test('rejects incomplete or unknown route schema values', () => {
    for (const route of [
      validRoute({ version: 'v2' }),
      validRoute({ routeClass: 'Z' }),
      validRoute({ role: 'oracle' }),
      validRoute({ session: { action: 'teleport', context: 'compact' } }),
      validRoute({ session: { action: 'create', context: 'garbage' } }),
      validRoute({ autoUpgradeCeiling: undefined }),
    ]) assert.equal(validateRoute(route, CAPABILITIES).ok, false);
  });

  test('requires confirmation for irreversible or increased high-risk consequences', () => {
    for (const field of ['irreversible', 'increasesHighRiskConsequences']) {
      const rejected = validateRoute(validRoute({ [field]: true }), CAPABILITIES);
      assert.ok(errorCodes(rejected).includes('HIGH_RISK_CONFIRMATION_REQUIRED'));
      assert.equal(validateRoute(validRoute({
        [field]: true,
        userConfirmedHighRiskBoundary: true,
      }), CAPABILITIES).ok, true);
    }
  });

  test('rejects security work below sol high', () => {
    const result = validateRoute(validRoute({
      risk: ['security'],
      model: 'gpt-5.6-terra',
      effort: 'high',
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('RISK_FLOOR'));
  });

  test('accepts security work at sol high', () => {
    const result = validateRoute(validRoute({
      risk: ['security'],
      model: 'gpt-5.6-sol',
      effort: 'high',
    }), CAPABILITIES);

    assert.equal(result.ok, true);
  });

  test('requires confirmation above sol high', () => {
    const result = validateRoute(validRoute({
      model: 'gpt-5.6-sol',
      effort: 'xhigh',
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('USER_CONFIRMATION_REQUIRED'));
  });

  test('allows confirmed effort above sol high', () => {
    const result = validateRoute(validRoute({
      model: 'gpt-5.6-sol',
      effort: 'xhigh',
      userConfirmedAboveCeiling: true,
    }), CAPABILITIES);

    assert.equal(result.ok, true);
  });

  test('rejects unsupported model effort combinations', () => {
    const result = validateRoute(validRoute({
      model: 'gpt-5.6-luna',
      effort: 'ultra',
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('UNSUPPORTED_MODEL_EFFORT'));
  });

  test('requires an independent checker to use a clean new task', () => {
    const result = validateRoute(validRoute({
      role: 'checker',
      independent: true,
      session: { action: 'continue', context: 'recent' },
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('CHECKER_ISOLATION'));
  });

  test('accepts an independent checker in a clean new task', () => {
    const result = validateRoute(validRoute({
      role: 'checker',
      independent: true,
      model: 'gpt-5.6-sol',
      effort: 'high',
      session: { action: 'create', context: 'clean-room' },
    }), CAPABILITIES);

    assert.equal(result.ok, true);
  });

  test('requires an explicit forkTurns plan for an internal subagent', () => {
    const result = validateRoute(validRoute({
      session: { action: 'spawn-internal', context: 'compact' },
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('INTERNAL_FORK_TURNS_REQUIRED'));
  });

  test('accepts only none or a finite positive recent-turn count for an internal subagent', () => {
    for (const forkTurns of ['none', '3']) {
      const result = validateRoute(validRoute({
        session: { action: 'spawn-internal', context: 'compact', forkTurns },
      }), CAPABILITIES);

      assert.equal(result.ok, true, `expected ${forkTurns} to be accepted`);
    }

    for (const forkTurns of ['all', 3, 0, -1, 1.5, Number.POSITIVE_INFINITY]) {
      const result = validateRoute(validRoute({
        session: { action: 'spawn-internal', context: 'compact', forkTurns },
      }), CAPABILITIES);

      assert.equal(result.ok, false, `expected ${forkTurns} to be rejected`);
      assert.ok(errorCodes(result).includes('INTERNAL_FORK_TURNS_INVALID'));
    }
  });

  test('rejects fork as a pollution cleanup strategy', () => {
    const result = validateRoute(validRoute({
      pollutionRisk: 2,
      session: { action: 'fork', context: 'full-required' },
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('FORK_PRESERVES_POLLUTION'));
  });

  test('rejects an automatic ceiling above sol high', () => {
    const result = validateRoute(validRoute({
      autoUpgradeCeiling: {
        model: 'gpt-5.6-sol',
        effort: 'xhigh',
      },
    }), CAPABILITIES);

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('AUTO_UPGRADE_CEILING'));
  });
});

describe('validateDispatch', () => {
  test('accepts executable dispatch parameters that match the route', () => {
    const route = validRoute();
    const result = validateDispatch(route, {
      model: 'gpt-5.6-terra',
      effort: 'medium',
    });

    assert.equal(result.ok, true);
  });

  test('rejects inherited or missing actual model parameters', () => {
    const result = validateDispatch(validRoute(), {
      effort: 'medium',
    });

    assert.equal(result.ok, false);
    assert.ok(errorCodes(result).includes('DISPATCH_MODEL_MISMATCH'));
  });

  test('rejects actual effort without inventing a context tool field', () => {
    const result = validateDispatch(validRoute(), {
      model: 'gpt-5.6-terra',
      effort: 'low',
    });

    assert.equal(result.ok, false);
    assert.deepEqual(errorCodes(result), ['DISPATCH_EFFORT_MISMATCH']);
  });

  test('rejects semantic context when presented as an actual tool field', () => {
    const result = validateDispatch(validRoute(), {
      model: 'gpt-5.6-terra',
      effort: 'medium',
      context: 'compact',
    });

    assert.equal(result.ok, false);
    assert.deepEqual(errorCodes(result), ['DISPATCH_FIELD_UNSUPPORTED']);
  });

  test('requires actual forkTurns to match an internal-subagent route', () => {
    const route = validRoute({
      session: { action: 'spawn-internal', context: 'compact', forkTurns: 'none' },
    });

    const matching = validateDispatch(route, {
      model: 'gpt-5.6-terra',
      effort: 'medium',
      forkTurns: 'none',
    });
    const missing = validateDispatch(route, {
      model: 'gpt-5.6-terra',
      effort: 'medium',
    });
    const mismatched = validateDispatch(route, {
      model: 'gpt-5.6-terra',
      effort: 'medium',
      forkTurns: 3,
    });

    assert.equal(matching.ok, true);
    assert.ok(errorCodes(missing).includes('DISPATCH_FORK_TURNS_MISMATCH'));
    assert.ok(errorCodes(mismatched).includes('DISPATCH_FORK_TURNS_MISMATCH'));
  });
});

describe('validate-route CLI', () => {
  function runCli(contents) {
    const directory = mkdtempSync(path.join(os.tmpdir(), 'paifa-route-cli-'));
    const inputPath = path.join(directory, 'route.json');
    writeFileSync(inputPath, contents, 'utf8');

    const result = spawnSync(
      process.execPath,
      ['scripts/validate-route.mjs', inputPath],
      { cwd: path.resolve(import.meta.dirname, '..'), encoding: 'utf8' },
    );

    rmSync(directory, { recursive: true, force: true });
    return result;
  }

  test('exits zero and prints JSON for a valid route', () => {
    const result = runCli(JSON.stringify(validRoute()));

    assert.equal(result.status, 0, result.stderr);
    assert.equal(JSON.parse(result.stdout).ok, true);
  });

  test('exits one and prints violations for an invalid route', () => {
    const result = runCli(JSON.stringify(validRoute({
      risk: ['security'],
      model: 'gpt-5.6-terra',
      effort: 'high',
    })));

    assert.equal(result.status, 1, result.stderr);
    assert.ok(JSON.parse(result.stdout).errors.some((error) => error.code === 'RISK_FLOOR'));
  });

  test('exits two with structured output for malformed JSON', () => {
    const result = runCli('{not-json');

    assert.equal(result.status, 2, result.stderr);
    assert.equal(JSON.parse(result.stdout).error.code, 'MALFORMED_INPUT');
  });
});
