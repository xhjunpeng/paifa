import assert from 'node:assert/strict';
import { test } from 'node:test';

import { decideExecution } from '../scripts/lib/execution-decision.mjs';

const ELIGIBLE_CANDIDATE = {
  independence: { satisfied: true, evidence: 'Inputs and acceptance command are complete.' },
  parallelBenefit: { satisfied: true, evidence: 'Main can implement another module while this runs.' },
  handoffCost: { satisfied: true, evidence: 'The fact package and result are bounded.' },
  continuity: { satisfied: true, evidence: 'The host can return and recover this result.' },
};

test('keeps an ordinary sequential change in the main task', () => {
  const decision = decideExecution({
    candidate: {
      independence: { satisfied: false, evidence: 'Each fix depends on the previous test.' },
      parallelBenefit: { satisfied: false, evidence: 'No separate work can proceed.' },
      handoffCost: { satisfied: false, evidence: 'The active debugging context is required.' },
      continuity: { satisfied: false, evidence: 'No result wakeup is available.' },
    },
    requirements: {},
    hostCapabilities: {},
  });

  assert.equal(decision.mode, 'direct');
  assert.match(decision.reason, /lacks verified benefit or continuity/i);
});

test('keeps the work direct when a candidate omits one evidence check', () => {
  const candidate = { ...ELIGIBLE_CANDIDATE };
  delete candidate.handoffCost;

  const decision = decideExecution({
    candidate,
    requirements: {},
    hostCapabilities: { resultReturn: true, parentWait: true, checkpointStore: true },
  });

  assert.equal(decision.mode, 'direct');
  assert.equal(decision.checks.handoffCost.satisfied, false);
});

test('permits a bounded subagent only with all evidence and continuity capabilities', () => {
  const decision = decideExecution({
    candidate: ELIGIBLE_CANDIDATE,
    requirements: {},
    hostCapabilities: { resultReturn: true, parentWait: true, checkpointStore: true },
  });

  assert.equal(decision.mode, 'subagent');
});

test('requires parent wakeup before selecting an independent task', () => {
  const decision = decideExecution({
    candidate: ELIGIBLE_CANDIDATE,
    requirements: { durable: true },
    hostCapabilities: { resultReturn: true, checkpointStore: true, parentWake: false },
  });

  assert.equal(decision.mode, 'direct');
});

test('selects an independent task only with a durable return path', () => {
  const decision = decideExecution({
    candidate: ELIGIBLE_CANDIDATE,
    requirements: { durable: true },
    hostCapabilities: { resultReturn: true, checkpointStore: true, parentWake: true },
  });

  assert.equal(decision.mode, 'task');
});
