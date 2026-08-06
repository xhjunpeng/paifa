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
    assert.match(agents, /chooses the dispatch kind, model, and reasoning effort/is);
    assert.match(agents, /does not authorize delegation.*?expand the requested scope/is);
    assert.match(agents, /independent task.*?independent Worktree.*?direct user follow-up.*?independent review/is);
    assert.match(agents, /internal subagent only for bounded work.*?share the current directory/is);
    assert.match(agents, /ordinary planning.*?Terra.*?cross-module planning.*?Terra high/is);
    assert.match(
      agents,
      /Sol.*?both high consequence and high uncertainty.*?Terra high failure/is,
    );
    assert.match(agents, /risk keywords alone.*?do not justify Sol/is);
    assert.match(
      agents,
      /派发方式：独立任务｜派发模型：5\.6 Terra｜思考强度：高｜原因：跨模块任务/is,
    );
    assert.match(agents, /same dispatch kind, model, and effort in the actual tool call/is);
    assert.match(agents, /waiting, monitoring, and status updates do not repeat the line/is);
    assert.doesNotMatch(agents, /PAIFA_ROUTE|PAIFA_DISPATCHED|PAIFA_CONTEXT|expanded route YAML/is);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('repository allows noncommercial use and reserves commercial licensing', () => {
  const license = readFileSync(path.join(REPOSITORY_ROOT, 'LICENSE'), 'utf8');
  const readme = readFileSync(path.join(REPOSITORY_ROOT, 'README.md'), 'utf8');

  assert.match(license, /PolyForm Noncommercial License 1\.0\.0/);
  assert.doesNotMatch(license, /MIT License/);
  assert.match(readme, /Commercial use requires a separate written license/);
  assert.match(readme, /Commercial terms and fees are agreed separately/);
  assert.match(readme, /github\.com\/xhjunpeng\/paifa\/issues\/new/);
});
