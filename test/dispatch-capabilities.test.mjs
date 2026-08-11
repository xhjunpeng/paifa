import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  normalizeContinuityCapabilities,
  resolveDispatchCapabilities,
} from '../scripts/lib/dispatch-capabilities.mjs';

test('keeps only explicitly supplied continuity capabilities', () => {
  assert.deepEqual(normalizeContinuityCapabilities({
    resultReturn: true,
    parentWait: 1,
    parentWake: false,
    checkpointStore: true,
    inferredWakeup: true,
  }), {
    resultReturn: true,
    parentWait: false,
    hostManagedCollection: false,
    parentWake: false,
    checkpointStore: true,
  });
});

test('does not claim Luna from host capabilities that do not explicitly offer it', () => {
  const result = resolveDispatchCapabilities({
    hostCapabilities: { 'gpt-5.6-terra': ['medium'] },
    codexHome: mkdtempSync(path.join(os.tmpdir(), 'paifa-capabilities-')),
  });
  assert.deepEqual(result, { 'gpt-5.6-terra': ['medium'] });
  assert.equal(result['gpt-5.6-luna'], undefined);
});

test('adds Luna only when the managed Luna worker is recognizable', () => {
  const codexHome = mkdtempSync(path.join(os.tmpdir(), 'paifa-capabilities-'));
  try {
    const agents = path.join(codexHome, 'agents');
    mkdirSync(agents);
    writeFileSync(path.join(agents, 'paifa-luna-worker.toml'), [
      'name = "Paifa Luna Worker"',
      'model = "gpt-5.6-luna"',
      'model_reasoning_effort = "medium"',
      '',
    ].join('\n'));
    const result = resolveDispatchCapabilities({
      hostCapabilities: { 'gpt-5.6-terra': ['medium'] }, codexHome,
    });
    assert.deepEqual(result['gpt-5.6-luna'], ['medium']);
  } finally {
    rmSync(codexHome, { recursive: true, force: true });
  }
});

test('does not treat an edited worker as a Luna capability', () => {
  const codexHome = mkdtempSync(path.join(os.tmpdir(), 'paifa-capabilities-'));
  try {
    const agents = path.join(codexHome, 'agents');
    mkdirSync(agents);
    writeFileSync(path.join(agents, 'paifa-luna-worker.toml'), 'model = "gpt-5.6-terra"\n');
    const result = resolveDispatchCapabilities({ hostCapabilities: {}, codexHome });
    assert.equal(result['gpt-5.6-luna'], undefined);
  } finally {
    rmSync(codexHome, { recursive: true, force: true });
  }
});
