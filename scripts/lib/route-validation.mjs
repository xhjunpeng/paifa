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
const ROUTE_CLASSES = new Set(['A', 'B', 'C', 'D']);
const ROLES = new Set(['maker', 'checker', 'investigator']);
const SESSION_ACTIONS = new Set(['create', 'continue', 'spawn-internal', 'fork']);
const CONTEXT_MODES = new Set(['minimal', 'compact', 'recent', 'full-required', 'clean-room']);

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

function validInternalForkTurns(forkTurns) {
  return forkTurns === 'none'
    || (typeof forkTurns === 'string' && /^[1-9]\d*$/.test(forkTurns));
}

export function compactRouteReceipt(route) {
  const parts = [
    `PAIFA_ROUTE ${route.version}`,
    'planned',
    route.session.action,
    route.routeClass,
    `${route.model}/${route.effort}`,
    route.session.context,
    route.role,
  ];
  if (route.session.action === 'spawn-internal') {
    parts.push(`forkTurns=${route.session.forkTurns}`);
  }
  parts.push(
    `checks=${route.qualityContract.length}`,
    `auto<=${route.autoUpgradeCeiling.model}/${route.autoUpgradeCeiling.effort}`,
  );
  return parts.join(' | ');
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

  if (route.version !== 'v1' || !ROUTE_CLASSES.has(route.routeClass) || !ROLES.has(route.role)) {
    errors.push(issue('ROUTE_SCHEMA_INVALID', 'Route version, routeClass, or role is invalid.'));
  }

  if (!route.session?.action || !route.session?.context) {
    errors.push(issue(
      'SESSION_REQUIRED',
      'Route must set both session action and context mode.',
    ));
  }
  if (route.session && (!SESSION_ACTIONS.has(route.session.action)
    || !CONTEXT_MODES.has(route.session.context))) {
    errors.push(issue('SESSION_INVALID', 'Session action or context mode is unsupported.'));
  }

  if (!route.autoUpgradeCeiling?.model || !route.autoUpgradeCeiling?.effort) {
    errors.push(issue('AUTO_UPGRADE_CEILING_REQUIRED', 'Route must set an automatic upgrade ceiling.'));
  }

  if (route.session?.action === 'spawn-internal') {
    if (route.session.forkTurns === undefined) {
      errors.push(issue(
        'INTERNAL_FORK_TURNS_REQUIRED',
        'An internal-subagent route must explicitly plan forkTurns.',
      ));
    } else if (!validInternalForkTurns(route.session.forkTurns)) {
      errors.push(issue(
        'INTERNAL_FORK_TURNS_INVALID',
        'Internal forkTurns must be "none" or a quoted positive integer.',
      ));
    }
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

  if ((route.irreversible === true || route.increasesHighRiskConsequences === true)
    && route.userConfirmedHighRiskBoundary !== true) {
    errors.push(issue(
      'HIGH_RISK_CONFIRMATION_REQUIRED',
      'Irreversible or increased high-risk consequences require explicit confirmation.',
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

  const ok = errors.length === 0;
  return {
    ok,
    errors,
    ...(ok ? { receipt: compactRouteReceipt(route) } : {}),
  };
}

export function validateDispatch(route, dispatch) {
  const errors = [];
  const actual = dispatch && typeof dispatch === 'object' ? dispatch : {};
  const allowedFields = new Set(['model', 'effort']);
  if (route?.session?.action === 'spawn-internal') allowedFields.add('forkTurns');
  const unsupportedFields = Object.keys(actual).filter((field) => !allowedFields.has(field));

  if (unsupportedFields.length > 0) {
    errors.push(issue(
      'DISPATCH_FIELD_UNSUPPORTED',
      `Actual receipt contains unsupported tool fields: ${unsupportedFields.join(', ')}.`,
    ));
  }

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

  if (route?.session?.action === 'spawn-internal'
    && actual.forkTurns !== route.session.forkTurns) {
    errors.push(issue(
      'DISPATCH_FORK_TURNS_MISMATCH',
      `Actual forkTurns ${actual.forkTurns ?? '<missing>'} does not match route ${route.session.forkTurns ?? '<missing>'}.`,
    ));
  }

  return { ok: errors.length === 0, errors };
}
