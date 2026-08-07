import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('paifa discovery is limited to delegation, model upgrades, and high-risk boundaries', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');

  assert.match(
    skill,
    /description: Use when considering real delegated work, a model upgrade, or a high-risk boundary/is,
  );
  assert.match(
    gate,
    /Invoke `paifa` only when considering real delegated work, a model upgrade, or a high-risk boundary/is,
  );
  for (const text of [skill, gate]) {
    assert.match(text, /Ordinary direct editing, testing, debugging, retries, and integration remain with the main task/is);
    assert.match(text, /Delegate only when independence, parallel benefit, lower handoff cost, and a verified return\/continuation path are all present/is);
    assert.doesNotMatch(text, /next action will change state/is);
  }
});

test('direct execution does not require visible model metadata', () => {
  const skill = read('SKILL.md');

  assert.match(skill, /Direct execution is the default/is);
  assert.match(skill, /Direct execution does not require visible model metadata/is);
  assert.doesNotMatch(skill, /If either is unavailable.*?must use.*?内部子智能体/is);
});

test('the main task owns completion after a dispatch', () => {
  const skill = read('SKILL.md');
  const routing = read('references/routing-policy.md');

  assert.match(skill, /main task.*?owns completion/is);
  assert.match(skill, /waits for or restores a DispatchRecord before integrating delegated results/is);
  assert.match(routing, /main task owns completion.*?continue direct work.*?integrate delegated results/is);
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
    assert.match(text, /worker.*?must not.*?approval CLI.*?model notice.*?user.*?confirmation/is);
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
    assert.match(text, /Direct execution.*?default/is);
    assert.match(text, /(?:before Sol|Sol.*?task goal).*?repository.*?production.*?credentials.*?paid service.*?irreversible deletion.*?data migration/is);
    assert.doesNotMatch(text, /write route\.json/i);
  }
});
