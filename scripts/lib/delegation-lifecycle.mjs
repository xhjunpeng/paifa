const TERMINAL_STATUSES = new Set(['done', 'failed', 'cancelled']);

function issue(code, message) {
  return { code, message };
}

function capabilityErrors(hostCapabilities = {}) {
  const errors = [];
  if (hostCapabilities.resultReturn !== true) {
    errors.push(issue('RESULT_RETURN_REQUIRED', 'The active host cannot return worker results to the parent.'));
  }
  if (hostCapabilities.parentWait !== true) {
    errors.push(issue('PARENT_WAIT_REQUIRED', 'The active host cannot wait for worker completion.'));
  }
  if (hostCapabilities.hostManagedCollection !== true) {
    errors.push(issue(
      'HOST_MANAGED_COLLECTION_REQUIRED',
      'The active host cannot collect completion results without parent polling.',
    ));
  }
  return errors;
}

export function evaluateDelegationLifecycle({ phase, hostCapabilities, workers = [] } = {}) {
  const errors = capabilityErrors(hostCapabilities);
  if (phase === 'start') return { ok: errors.length === 0, errors };
  if (phase !== 'finish') {
    return {
      ok: false,
      errors: [issue('PHASE_INVALID', 'Phase must be start or finish.')],
    };
  }

  for (const worker of workers) {
    if (!worker?.id) errors.push(issue('WORKER_ID_REQUIRED', 'Every dispatched worker needs an id.'));
    if (!TERMINAL_STATUSES.has(worker?.status)) {
      errors.push(issue('WORKER_NOT_TERMINAL', `Worker ${worker?.id ?? '<unknown>'} is still running.`));
    }
    if (worker?.resultReceived !== true) {
      errors.push(issue('WORKER_RESULT_PENDING', `Worker ${worker?.id ?? '<unknown>'} has no collected result.`));
    }
  }

  const readyToReport = errors.length === 0;
  return {
    ok: readyToReport,
    errors,
    readyToReport,
    readyToDeclareComplete: readyToReport && workers.every((worker) => worker.status === 'done'),
  };
}
