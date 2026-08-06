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

test('released repository installs the execution gate without replacing existing AGENTS rules', () => {
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
    assert.match(agents, /before material execution.*?choose the lowest capable model and effort/is);
    assert.match(agents, /for real dispatch.*?invoke `paifa` immediately before the tool call/is);
    assert.match(agents, /independent task.*?independent Worktree.*?user follow-up.*?independent review/is);
    assert.match(agents, /otherwise an internal subagent/is);
    assert.match(agents, /ordinary work uses Terra medium.*?cross-module.*?Terra high/is);
    assert.match(
      agents,
      /Sol.*?both high consequence and high uncertainty.*?Terra high failure/is,
    );
    assert.match(agents, /risk keywords alone.*?do not justify Sol/is);
    assert.match(agents, /方式：当前任务｜模型：5\.6 Terra 中｜原因：范围明确的普通实现/is);
    assert.match(agents, /准备执行：回复 1 批准/is);
    assert.match(agents, /approved dispatch kind, model, and effort in the actual tool call/is);
    assert.match(agents, /do not repeat the two lines while waiting or reporting status/is);
    assert.doesNotMatch(agents, /PAIFA_ROUTE|PAIFA_DISPATCHED|PAIFA_CONTEXT|expanded route YAML/is);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});

test('global execution gate uses the compact two-line approval contract', () => {
  const block = readFileSync(
    path.join(REPOSITORY_ROOT, 'templates', 'global-agents-block.md'),
    'utf8',
  );
  const skill = readFileSync(path.join(REPOSITORY_ROOT, 'SKILL.md'), 'utf8');

  const notice = '方式：当前任务｜模型：5.6 Terra 中｜原因：范围明确的普通实现\n准备执行：回复 1 批准';
  assert.match(block, /material execution/i);
  assert.match(block, /questions, analysis, planning, source reading, and read-only checks.*?do not require approval/is);
  assert.match(block, new RegExp(notice));
  assert.match(block, /only a standalone `1` approves/i);
  assert.match(block, /direct work.*?actual UI-selected model/i);
  assert.match(skill, /material execution/i);
  assert.match(skill, new RegExp(notice));
  assert.doesNotMatch(block, /范围：|实际模型：|思考强度：/);
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
