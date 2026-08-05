#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import { validateRoute } from './lib/route-validation.mjs';

const DEFAULT_CAPABILITIES = {
  'gpt-5.6-luna': ['low', 'medium', 'high', 'xhigh', 'max'],
  'gpt-5.6-terra': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
  'gpt-5.6-sol': ['low', 'medium', 'high', 'xhigh', 'max', 'ultra'],
};

function readInput(inputPath) {
  return inputPath
    ? readFileSync(inputPath, 'utf8')
    : readFileSync(0, 'utf8');
}

try {
  const route = JSON.parse(readInput(process.argv[2]));
  const result = validateRoute(route, DEFAULT_CAPABILITIES);
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
