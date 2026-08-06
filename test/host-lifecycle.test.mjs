import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('paifa does not gate ordinary conversation', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');

  assert.match(
    skill,
    /questions, analysis, planning, source reading, and read-only checks.*?do not require approval/is,
  );
  assert.match(
    gate,
    /questions, analysis, planning, source reading, and read-only checks.*?do not require approval/is,
  );
});

test('the main task owns completion after a dispatch', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');
  const routing = read('references/routing-policy.md');

  assert.match(skill, /main task.*?owns completion/is);
  assert.match(skill, /continues safe work.*?integrates delegated results/is);
  assert.match(gate, /main task.*?continues safe independent work.*?integrates required delegated results.*?owns completion/is);
  assert.match(routing, /main task owns completion.*?continue safe independent work.*?integrate/is);
});
