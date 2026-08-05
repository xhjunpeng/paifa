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
    assert.match(agents, /invoke `paifa` immediately before .*?(?:creat|continu|retry|fork|spawn)/is);
    assert.match(agents, /only chooses .*?model and reasoning effort/is);
    assert.match(agents, /does not authorize delegation.*?expand the requested scope/is);
    assert.match(
      agents,
      /派发模型：5\.6 Terra｜思考强度：中｜原因：任务边界清晰/is,
    );
    assert.match(agents, /same model and effort in the actual tool call/is);
    assert.match(agents, /waiting, monitoring, and status updates do not repeat the line/is);
    assert.doesNotMatch(agents, /PAIFA_ROUTE|PAIFA_DISPATCHED|PAIFA_CONTEXT|expanded route YAML/is);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
