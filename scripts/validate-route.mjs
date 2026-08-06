#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import { validateRoute } from './lib/route-validation.mjs';

function readInput(inputPath) {
  return inputPath
    ? readFileSync(inputPath, 'utf8')
    : readFileSync(0, 'utf8');
}

try {
  const args = process.argv.slice(2);
  const capabilityFlag = args.indexOf('--capabilities');
  const capabilityPath = capabilityFlag === -1 ? null : args[capabilityFlag + 1];
  if (capabilityFlag !== -1 && !capabilityPath) throw new Error('ARGUMENT_REQUIRED: --capabilities needs a path.');
  const routePath = capabilityFlag === -1
    ? args[0]
    : args.find((value, index) => index !== capabilityFlag && index !== capabilityFlag + 1);
  const route = JSON.parse(readInput(routePath));
  const capabilities = capabilityPath
    ? JSON.parse(readFileSync(capabilityPath, 'utf8'))
    : route.capabilities;
  if (!capabilities || typeof capabilities !== 'object' || Array.isArray(capabilities)) {
    throw new Error('CAPABILITIES_REQUIRED: Supply route.capabilities or --capabilities FILE.');
  }
  const result = validateRoute(route, capabilities);
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  process.exitCode = result.ok ? 0 : 1;
} catch (error) {
  process.stdout.write(`${JSON.stringify({
    ok: false,
    error: {
      code: 'MALFORMED_INPUT',
      message: error instanceof Error ? error.message : String(error),
    },
  }, null, 2)}\n`);
  process.exitCode = 2;
}
