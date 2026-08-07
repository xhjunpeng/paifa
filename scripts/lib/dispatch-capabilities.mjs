import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

const LUNA_WORKER_NAME = 'Paifa Luna Worker';
const LUNA_MODEL = 'gpt-5.6-luna';
const LUNA_EFFORT = 'medium';
const CONTINUITY_CAPABILITIES = [
  'resultReturn',
  'parentWait',
  'parentWake',
  'checkpointStore',
];

function cloneCapabilities(capabilities) {
  const result = {};
  for (const [model, efforts] of Object.entries(capabilities ?? {})) {
    const values = Array.isArray(efforts) ? efforts : efforts?.efforts;
    if (Array.isArray(values)) result[model] = [...values];
  }
  return result;
}

export function hasManagedLunaWorker(codexHome) {
  const workerPath = path.join(codexHome, 'agents', 'paifa-luna-worker.toml');
  if (!existsSync(workerPath)) return false;
  try {
    const content = readFileSync(workerPath, 'utf8');
    return content.includes(`name = "${LUNA_WORKER_NAME}"`)
      && content.includes(`model = "${LUNA_MODEL}"`)
      && content.includes(`model_reasoning_effort = "${LUNA_EFFORT}"`);
  } catch {
    return false;
  }
}

export function normalizeContinuityCapabilities(capabilities = {}) {
  return Object.fromEntries(
    CONTINUITY_CAPABILITIES.map((name) => [name, capabilities?.[name] === true]),
  );
}

// `hostCapabilities` must come from the dispatch surface that will actually run the task.
// This module deliberately does not infer UI support or invent a Luna default.
export function resolveDispatchCapabilities({ hostCapabilities, codexHome }) {
  const capabilities = cloneCapabilities(hostCapabilities);
  if (!capabilities[LUNA_MODEL] && codexHome && hasManagedLunaWorker(codexHome)) {
    capabilities[LUNA_MODEL] = [LUNA_EFFORT];
  }
  return capabilities;
}
