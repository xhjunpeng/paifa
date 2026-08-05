import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('paifa leaves ordinary main-thread work alone', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');

  assert.match(
    skill,
    /does not decide whether to delegate/is,
  );
  assert.match(
    gate,
    /if no real dispatch is happening, the main task proceeds normally without Paifa or waiting/is,
  );
});

test('the main task owns completion after a dispatch', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');
  const routing = read('references/routing-policy.md');

  assert.match(skill, /main task.*?owns completion/is);
  assert.match(skill, /continues independent work.*?integrates required results/is);
  assert.match(gate, /main task.*?responsible for integrating required results.*?completing/is);
  assert.match(routing, /main task owns completion.*?continue safe independent work.*?integrate/is);
});
