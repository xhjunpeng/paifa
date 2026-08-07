import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import {
  acceptDispatchResult,
  createDispatchRecord,
  persistDispatchRecord,
  readDispatchRecord,
  transitionDispatch,
} from '../scripts/lib/dispatch-state.mjs';

function validInput(overrides = {}) {
  return {
    runId: 'run-123',
    dispatchId: 'dispatch-123',
    parentId: 'parent-123',
    mode: 'subagent',
    route: { dispatchKind: 'subagent', model: 'gpt-5.6-terra', effort: 'medium' },
    factEnvelope: { goal: 'Inspect a bounded implementation.', acceptance: 'node --test test/file.test.mjs' },
    returnContract: { format: 'summary and test output', source: 'result-return' },
    resumeCheckpoint: { next: 'integrate-result' },
    attempt: 1,
    ...overrides,
  };
}

function validResult(overrides = {}) {
  return {
    dispatchId: 'dispatch-123',
    attempt: 1,
    evidence: { summary: 'completed', command: 'node --test test/file.test.mjs' },
    ...overrides,
  };
}

test('writes a checkpoint before waiting and accepts one matching result', () => {
  const stateDir = mkdtempSync(path.join(os.tmpdir(), 'paifa-dispatch-state-'));
  try {
    const proposed = createDispatchRecord(validInput());
    const running = transitionDispatch(proposed, 'running');
    const waiting = transitionDispatch(running, 'waiting', {
      resumeCheckpoint: { next: 'integrate-result', saved: true },
    });

    persistDispatchRecord(stateDir, waiting);
    const restored = readDispatchRecord(stateDir, waiting.dispatchId);
    const result = acceptDispatchResult(restored, validResult());

    assert.equal(restored.state, 'waiting');
    assert.equal(restored.resumeCheckpoint.saved, true);
    assert.equal(result.accepted, true);
    assert.equal(result.record.state, 'succeeded');
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
  }
});

test('does not accept a duplicate or late result after success', () => {
  const proposed = createDispatchRecord(validInput());
  const waiting = transitionDispatch(transitionDispatch(proposed, 'running'), 'waiting');
  const succeeded = acceptDispatchResult(waiting, validResult()).record;

  const duplicate = acceptDispatchResult(succeeded, validResult());
  const late = acceptDispatchResult(succeeded, validResult({ attempt: 2 }));

  assert.equal(duplicate.accepted, false);
  assert.equal(late.accepted, false);
  assert.equal(duplicate.record, succeeded);
});

test('rejects illegal transitions and never restarts a cancelled dispatch', () => {
  const proposed = createDispatchRecord(validInput());
  const cancelled = transitionDispatch(proposed, 'cancelled');

  assert.throws(() => transitionDispatch(proposed, 'succeeded'), /INVALID_TRANSITION/);
  assert.throws(() => transitionDispatch(cancelled, 'running'), /INVALID_TRANSITION/);
});

test('allows a failed dispatch to restart only through running', () => {
  const proposed = createDispatchRecord(validInput());
  const failed = transitionDispatch(transitionDispatch(proposed, 'running'), 'failed');
  const retried = transitionDispatch(failed, 'running', { attempt: 2 });

  assert.equal(retried.state, 'running');
  assert.equal(retried.attempt, 2);
  assert.throws(() => transitionDispatch(failed, 'waiting'), /INVALID_TRANSITION/);
});

test('rejects direct execution and invalid persistence inputs', () => {
  assert.throws(() => createDispatchRecord(validInput({ mode: 'direct' })), /DIRECT_MODE_NOT_DISPATCHABLE/);
  assert.throws(() => createDispatchRecord(validInput({ returnContract: {} })), /RETURN_CONTRACT_INVALID/);
});

test('returns null when no checkpoint exists for the dispatch id', () => {
  const stateDir = mkdtempSync(path.join(os.tmpdir(), 'paifa-dispatch-state-'));
  try {
    assert.equal(readDispatchRecord(stateDir, 'missing-dispatch'), null);
  } finally {
    rmSync(stateDir, { recursive: true, force: true });
  }
});
