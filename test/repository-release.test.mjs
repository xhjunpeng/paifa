import assert from 'node:assert/strict';
import {
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';

import { performInstall } from '../scripts/lib/installer.mjs';
import { inspectManagedBlock } from '../scripts/lib/managed-block.mjs';

const REPOSITORY_ROOT = path.resolve(import.meta.dirname, '..');
const ORIGINAL_AGENTS = '# Existing global rule\n\nPreserve this content exactly.\n';

test('released repository installs one dispatch gate without replacing existing AGENTS rules', () => {
  const root = mkdtempSync(path.join(os.tmpdir(), 'paifa-release-'));
  const codexHome = path.join(root, 'codex');
  try {
    mkdirSync(path.join(codexHome, 'skills'), { recursive: true });
    writeFileSync(path.join(codexHome, 'AGENTS.md'), ORIGINAL_AGENTS, 'utf8');

    performInstall({
      repoRoot: REPOSITORY_ROOT,
      codexHome,
      now: () => new Date('2026-08-05T12:00:00.000Z'),
    });

    const agents = readFileSync(path.join(codexHome, 'AGENTS.md'), 'utf8');
    const managed = inspectManagedBlock(agents);

    assert.ok(agents.startsWith(ORIGINAL_AGENTS));
    assert.equal(managed.count, 1);
    assert.match(agents, /must invoke `paifa` before .*?(?:create|continue|retry|fork|spawn)/is);
    assert.match(agents, /only when the user explicitly requests .*?(?:delegate|split|subtask|parallel)/is);
    assert.match(agents, /must not expand .*?(?:goal|file|permission) scope/is);
    assert.match(agents, /must not bypass .*?(?:high-risk|above Sol high|irreversible).*?confirmation/is);
    assert.match(agents, /actual dispatch .*?(?:model|effort|context).*?match `PAIFA_ROUTE`/is);
    assert.match(agents, /successful dispatch .*?emit `PAIFA_DISPATCHED`/is);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
