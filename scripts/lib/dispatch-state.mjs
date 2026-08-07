import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';

const STATES = new Set([
  'proposed',
  'running',
  'waiting',
  'succeeded',
  'failed',
  'blocked',
  'cancelled',
]);

const TRANSITIONS = {
  proposed: new Set(['running', 'cancelled']),
  running: new Set(['waiting', 'failed', 'blocked', 'cancelled']),
  waiting: new Set(['succeeded', 'failed', 'blocked', 'cancelled']),
  failed: new Set(['running', 'cancelled']),
  blocked: new Set(['running', 'cancelled']),
  succeeded: new Set(),
  cancelled: new Set(),
};

const DISPATCH_ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,127}$/;

function fail(code, message) {
  const error = new Error(`${code}: ${message}`);
  error.code = code;
  throw error;
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function object(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function assertIdentifier(value, field) {
  if (!nonEmptyString(value) || !DISPATCH_ID.test(value)) {
    fail('DISPATCH_RECORD_INVALID', `${field} must be a safe non-empty identifier.`);
  }
}

function assertRoute(route) {
  if (!object(route) || !nonEmptyString(route.dispatchKind)
    || !nonEmptyString(route.model) || !nonEmptyString(route.effort)) {
    fail('ROUTE_INVALID', 'A dispatch record requires an explicit dispatch route.');
  }
}

function assertReturnContract(contract) {
  if (!object(contract) || !nonEmptyString(contract.format) || !nonEmptyString(contract.source)) {
    fail('RETURN_CONTRACT_INVALID', 'A dispatch record requires a result format and source.');
  }
}

function assertRecord(record) {
  if (!object(record)) fail('DISPATCH_RECORD_INVALID', 'Dispatch record must be an object.');
  assertIdentifier(record.runId, 'runId');
  assertIdentifier(record.dispatchId, 'dispatchId');
  assertIdentifier(record.parentId, 'parentId');
  if (record.mode === 'direct') {
    fail('DIRECT_MODE_NOT_DISPATCHABLE', 'Direct execution must not create a dispatch record.');
  }
  if (record.mode !== 'subagent' && record.mode !== 'task') {
    fail('DISPATCH_RECORD_INVALID', 'mode must be subagent or task.');
  }
  if (!STATES.has(record.state)) fail('DISPATCH_RECORD_INVALID', 'state is invalid.');
  if (!Number.isInteger(record.attempt) || record.attempt < 1) {
    fail('DISPATCH_RECORD_INVALID', 'attempt must be a positive integer.');
  }
  if (!object(record.factEnvelope)) fail('FACT_ENVELOPE_INVALID', 'factEnvelope must be an object.');
  if (!object(record.resumeCheckpoint)) fail('CHECKPOINT_INVALID', 'resumeCheckpoint must be an object.');
  assertRoute(record.route);
  assertReturnContract(record.returnContract);
}

function recordPath(stateDir, dispatchId) {
  assertIdentifier(dispatchId, 'dispatchId');
  if (!nonEmptyString(stateDir)) fail('STATE_DIRECTORY_INVALID', 'stateDir must be a non-empty path.');
  return path.join(stateDir, `${dispatchId}.json`);
}

function timestamp() {
  return new Date().toISOString();
}

export function createDispatchRecord(input = {}) {
  const createdAt = timestamp();
  const record = {
    ...input,
    state: 'proposed',
    createdAt,
    updatedAt: createdAt,
  };
  assertRecord(record);
  return record;
}

export function transitionDispatch(record, nextState, update = {}) {
  assertRecord(record);
  if (!STATES.has(nextState) || !TRANSITIONS[record.state].has(nextState)) {
    fail('INVALID_TRANSITION', `Cannot transition from ${record.state} to ${nextState}.`);
  }
  const next = {
    ...record,
    ...update,
    state: nextState,
    createdAt: record.createdAt,
    updatedAt: timestamp(),
  };
  assertRecord(next);
  return next;
}

export function persistDispatchRecord(stateDir, record) {
  assertRecord(record);
  const filePath = recordPath(stateDir, record.dispatchId);
  mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(record)}\n`, { encoding: 'utf8', mode: 0o600 });
    renameSync(temporaryPath, filePath);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
  return record;
}

export function readDispatchRecord(stateDir, dispatchId) {
  const filePath = recordPath(stateDir, dispatchId);
  if (!existsSync(filePath)) return null;
  try {
    const record = JSON.parse(readFileSync(filePath, 'utf8'));
    assertRecord(record);
    return record;
  } catch (error) {
    if (error?.code) throw error;
    fail('DISPATCH_RECORD_INVALID', 'Stored dispatch record is malformed.');
  }
}

export function acceptDispatchResult(record, result) {
  assertRecord(record);
  if (!object(result) || record.state !== 'waiting'
    || result.dispatchId !== record.dispatchId || result.attempt !== record.attempt
    || !object(result.evidence)) {
    return { accepted: false, record };
  }
  return {
    accepted: true,
    record: transitionDispatch(record, 'succeeded', { resultReceipt: result }),
  };
}
