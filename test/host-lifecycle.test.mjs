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
    /does not authorize, require, or recommend delegation by itself/is,
  );
  assert.match(
    gate,
    /if no real dispatch is needed, the main task proceeds normally without Paifa or waiting/is,
  );
});

test('the main task owns completion after a dispatch', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');
  const routing = read('references/routing-policy.md');

  for (const content of [skill, gate, routing]) {
    assert.match(content, /main task owns completion/is);
    assert.match(content, /continue all safe independent work/is);
    assert.match(content, /wait.*integrate.*before (?:the )?final/is);
    assert.match(content, /must not end.*merely because delegated work (?:has )?started/is);
  }
});
