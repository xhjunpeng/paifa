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

test('released repository installs a narrow Paifa trigger without replacing existing AGENTS rules', () => {
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
    assert.match(agents, /Invoke `paifa` only when the next action will change state/is);
    assert.match(agents, /questions, explanations, planning, source reading, or read-only inspection/is);
    assert.match(agents, /SKILL\.md is the source of truth for model routing, approval, delegation, and completion rules/is);
    assert.doesNotMatch(agents, /PAIFA_ROUTE|PAIFA_DISPATCHED|PAIFA_CONTEXT|expanded route YAML/is);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('global execution gate is a compact trigger while the Skill owns the policy', () => {
  const block = readFileSync(
    path.join(REPOSITORY_ROOT, 'templates', 'global-agents-block.md'),
    'utf8',
  );
  const skill = readFileSync(path.join(REPOSITORY_ROOT, 'SKILL.md'), 'utf8');

  const notice = '方式：当前任务｜模型：5.6 Terra 中｜原因：范围明确的普通实现\n准备执行：回复 1 批准';
  assert.match(block, /next action will change state/i);
  assert.match(block, /questions, explanations, planning, source reading, or read-only inspection/i);
  assert.doesNotMatch(block, /方式：|准备执行：|开始执行：|Sol|Terra|Luna/);
  assert.match(skill, /description: Use when the next action will change state/is);
  assert.match(skill, new RegExp(notice));
  assert.match(skill, /clear execution intent/is);
  assert.match(skill, /一次任务级授权.*?依赖安装.*?测试.*?修复.*?重试.*?验证/is);
  assert.match(skill, /当前任务.*?only when.*?exact model and effort.*?visible/is);
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
