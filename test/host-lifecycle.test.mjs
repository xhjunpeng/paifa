import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');
const POLICY_FILES = [
  'SKILL.md',
  'README.md',
  'references/routing-policy.md',
  'references/tool-mapping.md',
];

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

function policyDocuments() {
  return POLICY_FILES.map((relativePath) => ({ relativePath, text: read(relativePath) }));
}

test('paifa keeps the one-time development approval, without taking over ordinary conversation choices', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');

  assert.match(skill, /Before the first material action.*?wait for.*?exact `1`/is);
  assert.match(gate, /Before the first material action.*?exact `1`/is);
  assert.match(gate, /only to the Paifa development gate and an evidence-based Sol escalation/is);
  for (const { relativePath, text } of policyDocuments()) {
    assert.doesNotMatch(
      text,
      /all Codex-initiated confirmations and choices.*?numbered replies/is,
      `${relativePath} must not globally control ordinary conversation choices`,
    );
  }
});

test('approval creates or resumes a native Goal for the whole approved task envelope', () => {
  for (const { relativePath, text } of policyDocuments()) {
    assert.match(text, /after the user replies with the exact `1`.*?create_goal/is, relativePath);
    assert.match(text, /if an active Goal already covers the same task.*?(?:keep|keeps|resume|resumes) it/is, relativePath);
    assert.match(text, /objective.*?approved task envelope/is, relativePath);
  }
});

test('an active Goal prevents a premature final answer and keeps progress in commentary', () => {
  for (const { relativePath, text } of policyDocuments()) {
    assert.match(text, /while the Goal is active.*?(?:do not|does not).*?final_answer/is, relativePath);
    assert.match(text, /progress.*?commentary/is, relativePath);
    assert.match(text, /before sending a final answer.*?get_goal/is, relativePath);
  }
});

test('an active Goal resumes after compaction and may end only at a real lifecycle boundary', () => {
  for (const { relativePath, text } of policyDocuments()) {
    assert.match(text, /after compaction.*?get_goal.*?continue/is, relativePath);
    assert.match(text, /verified completion.*?update_goal.*?complete/is, relativePath);
    assert.match(text, /genuine blocker.*?update_goal.*?blocked/is, relativePath);
    assert.match(text, /changed high-risk boundary/is, relativePath);
  }
});

test('the global managed block carries the lifecycle guard that is installed into projects', () => {
  const gate = read('templates/global-agents-block.md');

  assert.match(gate, /create_goal/is);
  assert.match(gate, /while the Goal is active.*?do not.*?final_answer/is);
  assert.match(gate, /after compaction.*?get_goal.*?continue/is);
  assert.match(gate, /only after verified completion.*?update_goal.*?complete/is);
});

test('delegation remains host-managed and does not bypass the main task lifecycle', () => {
  for (const { relativePath, text } of policyDocuments()) {
    assert.match(text, /before actual delegation.*?host-managed collection/is, relativePath);
    assert.match(
      text,
      /(?:every worker result.*?before.*?final answer|final answer.*?every worker result)/is,
      relativePath,
    );
    assert.match(text, /final answer only when the Goal lifecycle permits it/is, relativePath);
    assert.match(text, /worker.*?must not.*?ask the user.*?confirmation/is, relativePath);
  }
});
