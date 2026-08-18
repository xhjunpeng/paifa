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

test('released repository installs a one-time development approval without replacing existing AGENTS rules', () => {
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
    assert.match(agents, /Before the first material action in a new development package, invoke `paifa`/is);
    assert.match(agents, /show one proposal and wait for the user's exact `1`/is);
    assert.match(agents, /numbered reply applies only to the Paifa development gate and an evidence-based Sol escalation/is);
    assert.doesNotMatch(agents, /all Codex-initiated confirmations and choices/is);
    assert.match(agents, /create_goal.*?approved task envelope/is);
    assert.match(agents, /while the Goal is active.*?do not send `final_answer`/is);
    assert.match(agents, /Ask again only for an evidence-based Sol escalation/is);
    assert.match(agents, /SKILL\.md is the source of truth for model routing, approval, delegation, and completion rules/is);
    assert.doesNotMatch(agents, /PAIFA_ROUTE|PAIFA_DISPATCHED|PAIFA_CONTEXT|expanded route YAML/is);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('global approval gate is a compact trigger while the Skill owns the policy', () => {
  const block = readFileSync(
    path.join(REPOSITORY_ROOT, 'templates', 'global-agents-block.md'),
    'utf8',
  );
  const skill = readFileSync(path.join(REPOSITORY_ROOT, 'SKILL.md'), 'utf8');

  assert.match(block, /Before the first material action in a new development package, invoke `paifa`/i);
  assert.match(block, /show one proposal and wait for the user's exact `1`/i);
    assert.match(block, /numbered reply applies only to the Paifa development gate and an evidence-based Sol escalation/is);
    assert.doesNotMatch(block, /all Codex-initiated confirmations and choices/is);
    assert.match(block, /create_goal.*?approved task envelope/is);
    assert.match(block, /while the Goal is active.*?do not send `final_answer`/is);
  assert.match(block, /Ask again only for an evidence-based Sol escalation/i);
  assert.doesNotMatch(block, /方式：|准备执行：|开始执行：/);
  assert.match(skill, /description: Use when beginning a new development package before its first material action/is);
  assert.match(skill, /show one proposal and wait for the user's exact `1`/is);
  assert.match(skill, /A later Sol escalation requires one additional `1`/is);
  assert.doesNotMatch(skill, /A clear execution intent/is);
  assert.match(skill, /task envelope.*?planning.*?implementation.*?tests.*?retries.*?branch.*?push.*?PR.*?checks.*?merge.*?closeout/is);
  assert.match(skill, /A later Sol escalation requires one additional `1`/is);
  assert.match(skill, /Choose direct execution when the task is small/is);
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
