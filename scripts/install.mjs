#!/usr/bin/env node

import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { performInstall } from './lib/installer.mjs';

function parseArgs(values) {
  const options = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--repo-root' || value === '--codex-home') {
      const next = values[index + 1];
      if (!next) throw new Error(`ARGUMENT_REQUIRED: ${value} needs a path.`);
      options[value === '--repo-root' ? 'repoRoot' : 'codexHome'] = next;
      index += 1;
    } else if (value === '--update') {
      options.update = true;
    } else if (value === '--replace-managed-link') {
      options.replaceManagedLink = true;
    } else {
      throw new Error(`UNKNOWN_ARGUMENT: ${value}`);
    }
  }
  return options;
}

try {
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const parsed = parseArgs(process.argv.slice(2));
  const receipt = performInstall({
    repoRoot: parsed.repoRoot ?? path.resolve(scriptDirectory, '..'),
    codexHome: parsed.codexHome ?? process.env.CODEX_HOME ?? path.join(os.homedir(), '.codex'),
    update: parsed.update,
    replaceManagedLink: parsed.replaceManagedLink,
  });
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
} catch (error) {
  process.stderr.write(`${JSON.stringify({
    ok: false,
    error: {
      code: error.code ?? String(error.message).split(':', 1)[0],
      message: error.message,
    },
  }, null, 2)}\n`);
  process.exitCode = String(error.message).startsWith('UNKNOWN_ARGUMENT')
    || String(error.message).startsWith('ARGUMENT_REQUIRED') ? 2 : 1;
}
