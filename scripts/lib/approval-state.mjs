import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import { createHash, randomUUID } from 'node:crypto';
import os from 'node:os';
import path from 'node:path';

import { formatDispatchNotice, validateRoute } from './route-validation.mjs';

export const DEFAULT_CAPABILITIES = {
  'gpt-5.6-luna': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-terra': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-sol': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
};

function failure(code, message) {
  return { ok: false, error: { code, message } };
}

function resolveStateDir(stateDir) {
  return stateDir ?? path.join(os.homedir(), '.codex', 'paifa', 'approval');
}

function normalizedScope(scope) {
  return typeof scope === 'string' && scope.length > 0 ? scope : 'default';
}

function pendingPath(scope, stateDir) {
  const hash = createHash('sha256').update(normalizedScope(scope)).digest('hex');
  return path.join(resolveStateDir(stateDir), `${hash}.json`);
}

function writePending(filePath, pending) {
  mkdirSync(path.dirname(filePath), { recursive: true, mode: 0o700 });
  const temporaryPath = `${filePath}.${process.pid}.${randomUUID()}.tmp`;
  try {
    writeFileSync(temporaryPath, `${JSON.stringify(pending)}\n`, { encoding: 'utf8', mode: 0o600 });
    renameSync(temporaryPath, filePath);
  } finally {
    rmSync(temporaryPath, { force: true });
  }
}

function readPending(filePath, scope) {
  try {
    const pending = JSON.parse(readFileSync(filePath, 'utf8'));
    if (!pending || pending.scope !== normalizedScope(scope) || !pending.route) {
      return failure('PENDING_STATE_INVALID', 'Pending approval state is invalid. Propose the route again.');
    }
    return { ok: true, pending };
  } catch (error) {
    return failure('PENDING_STATE_INVALID', 'Pending approval state is invalid. Propose the route again.');
  }
}

function validateProposedRoute(route) {
  if (route?.executionApproved === true) {
    return failure(
      'EXECUTION_APPROVAL_NOT_ALLOWED',
      'A pending route cannot already be approved for execution.',
    );
  }
  const validation = validateRoute(route, DEFAULT_CAPABILITIES);
  return validation.ok
    ? { ok: true, validation }
    : { ok: false, error: { code: 'ROUTE_INVALID', message: 'Route validation failed.', details: validation.errors } };
}

export function propose(scope, route, { stateDir } = {}) {
  const checked = validateProposedRoute(route);
  if (!checked.ok) return checked;

  const filePath = pendingPath(scope, stateDir);
  const replaced = existsSync(filePath);
  writePending(filePath, {
    version: 1,
    scope: normalizedScope(scope),
    route: { ...route, executionApproved: false },
  });

  return {
    ok: true,
    replaced,
    notice: checked.validation.notice,
  };
}

export function approve(scope, reply, { stateDir } = {}) {
  if (reply !== '1' && reply !== '确认') {
    return failure('APPROVAL_REPLY_INVALID', 'Reply with exactly 1 or 确认 to approve the pending route.');
  }

  const filePath = pendingPath(scope, stateDir);
  if (!existsSync(filePath)) {
    return failure('NO_PENDING_APPROVAL', 'There is no pending route to approve.');
  }

  const claimPath = `${filePath}.${process.pid}.${randomUUID()}.approving`;
  try {
    try {
      renameSync(filePath, claimPath);
    } catch (error) {
      return failure('NO_PENDING_APPROVAL', 'There is no pending route to approve.');
    }

    const state = readPending(claimPath, scope);
    if (!state.ok) return state;

    const checked = validateProposedRoute(state.pending.route);
    if (!checked.ok) {
      return failure('PENDING_ROUTE_INVALID', 'The pending route is no longer valid. Propose it again.');
    }

    const route = { ...state.pending.route, executionApproved: true };
    return {
      ok: true,
      route,
      notice: formatDispatchNotice({ ...route, executionApproved: true }),
    };
  } finally {
    rmSync(claimPath, { force: true });
  }
}
