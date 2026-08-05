const EFFORT_ORDER = new Map([
  ['none', 0],
  ['minimal', 1],
  ['low', 2],
  ['medium', 3],
  ['high', 4],
  ['xhigh', 5],
  ['max', 6],
  ['ultra', 7],
]);

const HIGH_RISK = new Set([
  'authentication',
  'authorization',
  'identity',
  'tenant',
  'security',
  'billing',
  'payment',
  'migration',
  'production',
]);

function issue(code, message) {
  return { code, message };
}

function modelTier(model) {
  if (typeof model !== 'string') return 0;
  if (model.includes('sol')) return 3;
  if (model.includes('terra')) return 2;
  if (model.includes('luna')) return 1;
  return 0;
}

function effortRank(effort) {
  return EFFORT_ORDER.get(effort) ?? -1;
}

function aboveSolHigh(model, effort) {
  return modelTier(model) > 3
    || (modelTier(model) === 3 && effortRank(effort) > effortRank('high'));
}

function ceilingAboveSolHigh(ceiling) {
  if (!ceiling || typeof ceiling !== 'object') return false;
  const tier = modelTier(ceiling.model);
  return tier > 3
    || (tier === 3 && effortRank(ceiling.effort) > effortRank('high'));
}

function supportedEfforts(capabilities, model) {
  const entry = capabilities?.[model];
  if (Array.isArray(entry)) return entry;
  if (Array.isArray(entry?.efforts)) return entry.efforts;
  return null;
}

export function validateRoute(route, capabilities = {}) {
  const errors = [];

  if (!route || typeof route !== 'object' || Array.isArray(route)) {
    return {
      ok: false,
      errors: [issue('ROUTE_REQUIRED', 'Route must be an object.')],
    };
  }

  if (!route.model || !route.effort) {
    errors.push(issue(
      'EXPLICIT_MODEL_REQUIRED',
      'Route must set an explicit model and effort; inheritance is not auditable.',
    ));
  }

  if (!route.session?.action || !route.session?.context) {
    errors.push(issue(
      'SESSION_REQUIRED',
      'Route must set both session action and context mode.',
    ));
  }

  if (!Array.isArray(route.qualityContract) || route.qualityContract.length === 0) {
    errors.push(issue(
      'QUALITY_CONTRACT_REQUIRED',
      'Route must include at least one objective completion check.',
    ));
  }

  const efforts = supportedEfforts(capabilities, route.model);
  if (route.model && route.effort && (!efforts || !efforts.includes(route.effort))) {
    errors.push(issue(
      'UNSUPPORTED_MODEL_EFFORT',
      `Model ${route.model} does not support effort ${route.effort}.`,
    ));
  }

  const risk = Array.isArray(route.risk) ? route.risk : [];
  const hasHighRisk = risk.some((value) => HIGH_RISK.has(value));
  if (hasHighRisk
    && (modelTier(route.model) < modelTier('gpt-5.6-sol')
      || effortRank(route.effort) < effortRank('high'))) {
    errors.push(issue(
      'RISK_FLOOR',
      'High-risk work requires Sol high or stronger with explicit parameters.',
    ));
  }

  if (aboveSolHigh(route.model, route.effort) && !route.userConfirmedAboveCeiling) {
    errors.push(issue(
      'USER_CONFIRMATION_REQUIRED',
      'Effort above Sol high requires explicit user confirmation.',
    ));
  }

  if (ceilingAboveSolHigh(route.autoUpgradeCeiling)) {
    errors.push(issue(
      'AUTO_UPGRADE_CEILING',
      'Automatic escalation cannot exceed Sol high.',
    ));
  }

  if (route.role === 'checker'
    && route.independent === true
    && (route.session?.action !== 'create' || route.session?.context !== 'clean-room')) {
    errors.push(issue(
      'CHECKER_ISOLATION',
      'An independent checker requires a clean new task.',
    ));
  }

  if (Number(route.pollutionRisk) >= 2 && route.session?.action === 'fork') {
    errors.push(issue(
      'FORK_PRESERVES_POLLUTION',
      'Fork preserves completed history and cannot clean polluted context.',
    ));
  }

  return { ok: errors.length === 0, errors };
}

export function validateDispatch(route, dispatch) {
  const errors = [];
  const actual = dispatch && typeof dispatch === 'object' ? dispatch : {};

  if (actual.model !== route?.model) {
    errors.push(issue(
      'DISPATCH_MODEL_MISMATCH',
      `Actual model ${actual.model ?? '<missing>'} does not match route ${route?.model ?? '<missing>'}.`,
    ));
  }

  if (actual.effort !== route?.effort) {
    errors.push(issue(
      'DISPATCH_EFFORT_MISMATCH',
      `Actual effort ${actual.effort ?? '<missing>'} does not match route ${route?.effort ?? '<missing>'}.`,
    ));
  }

  if (actual.context !== route?.session?.context) {
    errors.push(issue(
      'DISPATCH_CONTEXT_MISMATCH',
      `Actual context ${actual.context ?? '<missing>'} does not match route ${route?.session?.context ?? '<missing>'}.`,
    ));
  }

  return { ok: errors.length === 0, errors };
}
