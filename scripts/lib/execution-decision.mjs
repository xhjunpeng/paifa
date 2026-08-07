const EVIDENCE_CHECKS = [
  'independence',
  'parallelBenefit',
  'handoffCost',
  'continuity',
];

const TASK_REQUIREMENTS = [
  'independentWorktree',
  'durable',
  'userFollowUp',
  'independentReview',
];

function normalizeCheck(value) {
  if (!value || typeof value !== 'object') {
    return { satisfied: false, evidence: 'No verified evidence supplied.' };
  }
  return {
    satisfied: value.satisfied === true,
    evidence: typeof value.evidence === 'string' && value.evidence.trim()
      ? value.evidence.trim()
      : 'No verified evidence supplied.',
  };
}

function requiresIndependentTask(requirements) {
  return TASK_REQUIREMENTS.some((name) => requirements?.[name] === true);
}

function hasContinuityCapabilities(hostCapabilities, needsTask) {
  if (!hostCapabilities?.resultReturn || !hostCapabilities?.checkpointStore) return false;
  return needsTask ? hostCapabilities.parentWake === true : hostCapabilities.parentWait === true;
}

export function decideExecution({ candidate = {}, requirements = {}, hostCapabilities = {} } = {}) {
  const checks = Object.fromEntries(
    EVIDENCE_CHECKS.map((name) => [name, normalizeCheck(candidate[name])]),
  );
  const needsTask = requiresIndependentTask(requirements);
  const evidenceComplete = EVIDENCE_CHECKS.every((name) => checks[name].satisfied);
  const continuityAvailable = hasContinuityCapabilities(hostCapabilities, needsTask);

  if (!evidenceComplete || !continuityAvailable) {
    return {
      mode: 'direct',
      reason: 'Delegation lacks verified benefit or continuity.',
      checks,
    };
  }

  return {
    mode: needsTask ? 'task' : 'subagent',
    reason: 'Delegation is independently recoverable.',
    checks,
  };
}
