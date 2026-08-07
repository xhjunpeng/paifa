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

test('released repository installs a delegation gate without replacing existing AGENTS rules', () => {
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
    assert.match(agents, /Invoke `paifa` only when considering real delegated work, a model upgrade, or a high-risk boundary/is);
    assert.match(agents, /Ordinary direct editing, testing, debugging, retries, and integration remain with the main task/is);
    assert.match(agents, /Delegate only when independence, parallel benefit, lower handoff cost, and a verified return\/continuation path are all present/is);
    assert.doesNotMatch(agents, /next action will change state/is);
    assert.match(agents, /SKILL\.md is the source of truth for model routing, approval, delegation, and completion rules/is);
    assert.doesNotMatch(agents, /PAIFA_ROUTE|PAIFA_DISPATCHED|PAIFA_CONTEXT|expanded route YAML/is);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('global delegation gate is a compact trigger while the Skill owns the policy', () => {
  const block = readFileSync(
    path.join(REPOSITORY_ROOT, 'templates', 'global-agents-block.md'),
    'utf8',
  );
  const skill = readFileSync(path.join(REPOSITORY_ROOT, 'SKILL.md'), 'utf8');

  const notice = '方式：当前任务｜模型：5.6 Sol｜思考强度：极高｜原因：高后果且高度不确定，需先确认\n准备执行：回复 1 批准';
  assert.match(block, /considering real delegated work, a model upgrade, or a high-risk boundary/i);
  assert.match(block, /Ordinary direct editing, testing, debugging, retries, and integration remain with the main task/i);
  assert.match(block, /Delegate only when independence, parallel benefit, lower handoff cost, and a verified return\/continuation path are all present/i);
  assert.doesNotMatch(block, /next action will change state/i);
  assert.doesNotMatch(block, /方式：|准备执行：|开始执行：|Sol|Terra|Luna/);
  assert.match(skill, /description: Use when considering real delegated work, a model upgrade, or a high-risk boundary/is);
  assert.match(skill, new RegExp(notice));
  assert.match(skill, /local approval executor/is);
  assert.match(skill, /Sol.*?immediately following reply.*?equals `1` or `确认` after trimming/is);
  assert.doesNotMatch(skill, /A clear execution intent/is);
  assert.match(skill, /task envelope.*?planning.*?implementation.*?tests.*?retries.*?branch.*?push.*?PR.*?checks.*?merge.*?closeout/is);
  assert.match(skill, /Luna\/Terra upgrades remain automatic/is);
  assert.match(skill, /Direct execution is the default/is);
  assert.match(skill, /Direct execution does not require visible model metadata/is);
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
