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

const CATEGORY_CANDIDATES = {
  simple: [
    ['gpt-5.6-luna', 'low'],
    ['gpt-5.6-luna', 'medium'],
    ['gpt-5.6-terra', 'low'],
    ['gpt-5.6-terra', 'medium'],
    ['gpt-5.6-terra', 'high'],
    ['gpt-5.6-sol', 'low'],
    ['gpt-5.6-sol', 'medium'],
    ['gpt-5.6-sol', 'high'],
  ],
  clear: [
    ['gpt-5.6-luna', 'medium'],
    ['gpt-5.6-terra', 'low'],
    ['gpt-5.6-terra', 'medium'],
    ['gpt-5.6-sol', 'low'],
    ['gpt-5.6-sol', 'medium'],
  ],
  ordinary: [
    ['gpt-5.6-terra', 'medium'],
    ['gpt-5.6-terra', 'high'],
    ['gpt-5.6-sol', 'medium'],
    ['gpt-5.6-sol', 'high'],
  ],
  complex: [
    ['gpt-5.6-terra', 'high'],
    ['gpt-5.6-sol', 'high'],
  ],
  'high-risk': [
    ['gpt-5.6-sol', 'high'],
  ],
  deep: [
    ['gpt-5.6-sol', 'xhigh'],
  ],
  maximum: [
    ['gpt-5.6-sol', 'max'],
  ],
  ultra: [
    ['gpt-5.6-sol', 'ultra'],
  ],
};

const HIGH_RISK_CATEGORIES = new Set(['high-risk', 'deep', 'maximum', 'ultra']);

const MODEL_LABELS = {
  'gpt-5.6-luna': '5.6 Luna',
  'gpt-5.6-terra': '5.6 Terra',
  'gpt-5.6-sol': '5.6 Sol',
};

const EFFORT_LABELS = {
  low: '轻度',
  medium: '中',
  high: '高',
  xhigh: '极高',
  max: '最高',
  ultra: '极高（更快消耗使用额度）',
};

function issue(code, message) {
  return { code, message };
}

function supportedEfforts(capabilities, model) {
  const entry = capabilities?.[model];
  if (Array.isArray(entry)) return entry;
  if (Array.isArray(entry?.efforts)) return entry.efforts;
  return null;
}

export function selectRoute(category, capabilities = {}) {
  const candidates = CATEGORY_CANDIDATES[category];
  if (!candidates) return null;

  for (const [model, effort] of candidates) {
    if (supportedEfforts(capabilities, model)?.includes(effort)) {
      return { model, effort };
    }
  }
  return null;
}

export function formatDispatchNotice({ model, effort, reason }) {
  const shortReason = String(reason ?? '').replace(/\s+/g, ' ').trim();
  const modelLabel = MODEL_LABELS[model] ?? model;
  const effortLabel = EFFORT_LABELS[effort] ?? effort;
  return `派发模型：${modelLabel}｜思考强度：${effortLabel}｜原因：${shortReason}`;
}

export function validateRoute(route, capabilities = {}) {
  const errors = [];
  if (!route || typeof route !== 'object' || Array.isArray(route)) {
    return {
      ok: false,
      errors: [issue('ROUTE_REQUIRED', 'Route must be an object.')],
    };
  }

  if (!Object.hasOwn(CATEGORY_CANDIDATES, route.category)) {
    errors.push(issue('CATEGORY_INVALID', 'Category is not part of the supported routing ladder.'));
  }

  const reason = typeof route.reason === 'string' ? route.reason.replace(/\s+/g, ' ').trim() : '';
  if (!reason || reason.length > 120) {
    errors.push(issue('REASON_INVALID', 'Reason must be one short sentence of 1 to 120 characters.'));
  }

  if (!route.model || !route.effort) {
    errors.push(issue('EXPLICIT_MODEL_REQUIRED', 'Route must set an explicit model and effort.'));
  }

  const risk = Array.isArray(route.risk) ? route.risk : [];
  const hasHighRisk = risk.some((value) => HIGH_RISK.has(value));
  if (hasHighRisk && !HIGH_RISK_CATEGORIES.has(route.category)) {
    errors.push(issue('HIGH_RISK_CATEGORY_REQUIRED', 'High-risk work requires Sol high or stronger.'));
  }

  const effectiveCategory = route.category;
  const expected = selectRoute(effectiveCategory, capabilities);
  if (!expected && Object.hasOwn(CATEGORY_CANDIDATES, effectiveCategory)) {
    errors.push(issue('NO_CAPABLE_ROUTE', 'No supported model and effort meet this category.'));
  }

  if (route.model && route.effort) {
    const efforts = supportedEfforts(capabilities, route.model);
    if (!efforts?.includes(route.effort)) {
      errors.push(issue(
        'UNSUPPORTED_MODEL_EFFORT',
        `Model ${route.model} does not support effort ${route.effort}.`,
      ));
    } else if (expected
      && (route.model !== expected.model || route.effort !== expected.effort)) {
      errors.push(issue(
        'NOT_LOWEST_CAPABLE',
        `Use ${expected.model}/${expected.effort}, the lowest supported route for ${effectiveCategory}.`,
      ));
    }
  }

  if ((route.irreversible === true || route.increasesHighRiskConsequences === true)
    && route.userConfirmedHighRiskBoundary !== true) {
    errors.push(issue(
      'HIGH_RISK_CONFIRMATION_REQUIRED',
      'Irreversible or increased high-risk consequences require explicit confirmation.',
    ));
  }

  const ok = errors.length === 0;
  return {
    ok,
    errors,
    ...(ok ? {
      notice: formatDispatchNotice({
        model: route.model,
        effort: route.effort,
        reason,
      }),
    } : {}),
  };
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

  return { ok: errors.length === 0, errors };
}
