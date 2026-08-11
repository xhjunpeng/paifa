import assert from 'node:assert/strict';
import { test } from 'node:test';

import { evaluateDelegationLifecycle } from '../scripts/lib/delegation-lifecycle.mjs';

test('refuses delegation when the active host cannot wait for and receive worker results', () => {
  const result = evaluateDelegationLifecycle({
    phase: 'start',
    hostCapabilities: { resultReturn: true, parentWait: false, hostManagedCollection: true },
    workers: [],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.code), ['PARENT_WAIT_REQUIRED']);
});

test('refuses delegation when the host cannot collect completion results without parent polling', () => {
  const result = evaluateDelegationLifecycle({
    phase: 'start',
    hostCapabilities: { resultReturn: true, parentWait: true },
    workers: [],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.code), ['HOST_MANAGED_COLLECTION_REQUIRED']);
});

test('does not let a parent finish while a dispatched worker lacks a collected result', () => {
  const result = evaluateDelegationLifecycle({
    phase: 'finish',
    hostCapabilities: { resultReturn: true, parentWait: true, hostManagedCollection: true },
    workers: [{ id: 'worker-a', status: 'done', resultReceived: false }],
  });

  assert.equal(result.ok, false);
  assert.deepEqual(result.errors.map((error) => error.code), ['WORKER_RESULT_PENDING']);
});

test('permits completion only after every worker is terminal and its result is collected', () => {
  const result = evaluateDelegationLifecycle({
    phase: 'finish',
    hostCapabilities: { resultReturn: true, parentWait: true, hostManagedCollection: true },
    workers: [
      { id: 'worker-a', status: 'done', resultReceived: true },
      { id: 'worker-b', status: 'done', resultReceived: true },
    ],
  });

  assert.equal(result.ok, true);
  assert.equal(result.readyToDeclareComplete, true);
});

test('permits a parent to report a collected worker failure but not to claim completion', () => {
  const result = evaluateDelegationLifecycle({
    phase: 'finish',
    hostCapabilities: { resultReturn: true, parentWait: true, hostManagedCollection: true },
    workers: [{ id: 'worker-a', status: 'failed', resultReceived: true }],
  });

  assert.equal(result.ok, true);
  assert.equal(result.readyToDeclareComplete, false);
});
