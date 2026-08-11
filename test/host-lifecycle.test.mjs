import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('paifa requires one proposal before a new development package begins', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');

  assert.match(
    skill,
    /description: Use when beginning a new development package before its first material action/is,
  );
  assert.match(
    gate,
    /Before the first material action in a new development package, invoke `paifa`/is,
  );
  for (const text of [skill, gate]) {
    assert.match(text, /show one proposal and wait for.*`1`/is);
    assert.match(text, /covers normal implementation, tests, debugging, retries, integration, and necessary delegation until completion/is);
    assert.match(text, /Ask again only for an evidence-based Sol escalation/is);
  }
});

test('direct execution shows a concrete manual model recommendation without claiming a switch', () => {
  const skill = read('SKILL.md');

  assert.match(skill, /Use direct execution only when safe parallel work would not finish sooner/is);
  assert.match(skill, /推荐模型：<具体模型>.*?推荐思考强度：<具体强度>/is);
  assert.match(skill, /Codex UI 手动切换/is);
  assert.match(skill, /Direct execution does not require visible model metadata/is);
  assert.doesNotMatch(skill, /If either is unavailable.*?must use.*?内部子智能体/is);
});

test('prioritizes child agents when safe parallel work finishes the development task sooner', () => {
  const documents = [
    read('SKILL.md'),
    read('README.md'),
    read('references/routing-policy.md'),
    read('references/tool-mapping.md'),
  ];

  for (const text of documents) {
    assert.match(text, /first assess whether safe parallel work shortens total completion time/is);
    assert.match(text, /if it does, delegate implementation, testing, or acceptance to worker(s)/is);
    assert.match(text, /workers.*?same task branch.*?must not create.*?(?:branch|worktree)/is);
  }
});

test('normalizes every Codex-initiated confirmation and choice to numbered replies', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');

  for (const text of [skill, gate]) {
    assert.match(text, /all Codex-initiated confirmations and choices.*?recommended option.*?`1`/is);
    assert.match(text, /回复 1 执行/is);
    assert.match(text, /never ask.*?(?:confirmation|authorization|yes)/is);
  }
});

test('the policy does not claim an unimplemented dispatch runtime', () => {
  const documents = [read('SKILL.md'), read('README.md'), read('references/routing-policy.md')];
  for (const text of documents) {
    assert.doesNotMatch(text, /DispatchRecord|parentWake|checkpointStore/);
  }
});

test('only the main task gates a delegate before it is created', () => {
  const documents = [
    read('SKILL.md'),
    read('README.md'),
    read('references/routing-policy.md'),
    read('references/tool-mapping.md'),
  ];

  for (const text of documents) {
    assert.match(text, /main task.*?only.*?proposal.*?approve.*?user interaction/is);
    assert.match(text, /before approval.*?must not create.*?(?:real )?delegate/is);
    assert.match(text, /worker.*?inherit.*?approved route.*?scope/is);
    assert.match(text, /worker.*?must not.*?approval CLI.*?ask the user.*?confirmation/is);
    assert.match(text, /worker.*?only.*?return.*?(?:short )?result.*?main task/is);
    assert.match(text, /host UI.*?may show.*?worker panel.*?main task.*?final answer/is);
  }
});

test('one started task envelope covers delivery and closeout without repeated confirmation', () => {
  const documents = [
    read('SKILL.md'),
    read('README.md'),
    read('references/routing-policy.md'),
    read('references/tool-mapping.md'),
  ];

  for (const text of documents) {
    assert.match(text, /task envelope.*?planning.*?implementation.*?tests.*?retries/is);
    assert.match(text, /branch.*?push.*?PR.*?checks.*?merge.*?closeout/is);
    assert.match(text, /before declaring complete.*?node scripts\/closeout\.mjs --base <base> --branch <task-branch>/is);
    assert.match(text, /must not delete.*?(?:unmerged|dirty|unrelated|active worktree)/is);
    assert.match(text, /Use direct execution only when safe parallel work would not finish sooner/is);
    assert.match(text, /later Sol escalation requires one additional `1`/is);
    assert.doesNotMatch(text, /write route\.json/i);
  }
});
