#!/usr/bin/env node

import { readFileSync } from 'node:fs';

import { approve, propose } from './lib/approval-state.mjs';

function parseOptions(args) {
  const options = { scope: 'default' };
  for (let index = 0; index < args.length; index += 2) {
    const flag = args[index];
    const value = args[index + 1];
    if (!['--scope', '--state-dir', '--capabilities'].includes(flag) || value === undefined) {
      throw new Error(`Unknown or incomplete option: ${flag ?? ''}`);
    }
    options[flag === '--scope' ? 'scope' : flag === '--state-dir' ? 'stateDir' : 'capabilitiesPath'] = value;
  }
  return options;
}

function usage() {
  throw new Error('Usage: approval.mjs propose <route-file> [--capabilities FILE] [--scope X] [--state-dir DIR] | approve <1|确认> [--scope X] [--state-dir DIR]');
}

try {
  const [command, value, ...optionArgs] = process.argv.slice(2);
  if (!command || value === undefined) usage();
  const options = parseOptions(optionArgs);
  let result;
  if (command === 'propose') {
    const route = JSON.parse(readFileSync(value, 'utf8'));
    if (options.capabilitiesPath) {
      route.capabilities = JSON.parse(readFileSync(options.capabilitiesPath, 'utf8'));
    }
    result = propose(options.scope, route, options);
  } else if (command === 'approve') {
    result = approve(options.scope, value, options);
  } else {
    usage();
  }
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
