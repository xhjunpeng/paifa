import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { test } from 'node:test';

const ROOT = path.resolve(import.meta.dirname, '..');

function read(relativePath) {
  return readFileSync(path.join(ROOT, relativePath), 'utf8');
}

test('paifa discovery is limited to a next state-changing action', () => {
  const skill = read('SKILL.md');
  const gate = read('templates/global-agents-block.md');

  assert.match(
    skill,
    /description: Use when the next action will change state/is,
  );
  assert.match(
    gate,
    /Invoke `paifa` only when the next action will change state/is,
  );
  for (const text of [skill, gate]) {
    assert.match(text, /questions, explanations, planning discussion, source reading, or read-only inspection/is);
    assert.match(text, /create or modify an executable plan document/is);
    assert.match(text, /chatting about a plan alone does not invoke Paifa/is);
  }
});

test('paifa never substitutes an unknown current session for a model choice', () => {
  const skill = read('SKILL.md');

  assert.match(skill, /当前任务.*?only when.*?exact model and effort.*?visible/is);
  assert.match(skill, /must use.*?内部子智能体.*?独立任务.*?exact route/is);
  assert.doesNotMatch(skill, /界面未暴露具体强度档位/);
});

test('the main task owns completion after a dispatch', () => {
  const skill = read('SKILL.md');
  const routing = read('references/routing-policy.md');

  assert.match(skill, /main task.*?owns completion/is);
  assert.match(skill, /continues safe work.*?integrates delegated results/is);
  assert.match(routing, /main task owns completion.*?continue safe independent work.*?integrate/is);
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
    assert.match(text, /(?:must not.*?propose.*?confirmation|(?:remain|stay) automatic)/is);
    assert.match(text, /(?:before Sol|Sol.*?task goal).*?repository.*?production.*?credentials.*?paid service.*?irreversible deletion.*?data migration/is);
    assert.doesNotMatch(text, /write route\.json/i);
  }
});
