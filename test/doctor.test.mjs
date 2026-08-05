import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  rmSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import { performInstall } from '../scripts/lib/installer.mjs';
import { sha256 } from '../scripts/lib/install-state.mjs';

const DOCTOR = path.resolve(import.meta.dirname, '..', 'scripts', 'doctor.mjs');

function writeRepo(repoRoot) {
  mkdirSync(path.join(repoRoot, 'templates'), { recursive: true });
  mkdirSync(path.join(repoRoot, 'references'), { recursive: true });
  mkdirSync(path.join(repoRoot, 'evals'), { recursive: true });
  writeFileSync(
    path.join(repoRoot, 'SKILL.md'),
    '---\nname: paifa\ndescription: Use when preparing to delegate Codex work.\n---\n\n# Paifa\n',
    'utf8',
  );
  writeFileSync(path.join(repoRoot, 'VERSION'), '1.0.0\n', 'utf8');
  writeFileSync(
    path.join(repoRoot, 'templates', 'global-agents-block.md'),
    '## Paifa Dispatch Gate\n\nInvoke `paifa` before delegated work.',
    'utf8',
  );
  writeFileSync(path.join(repoRoot, 'references', 'routing-policy.md'), '# Routing\n', 'utf8');
  writeFileSync(path.join(repoRoot, 'references', 'high-risk.md'), '# High risk\n', 'utf8');
  writeFileSync(path.join(repoRoot, 'references', 'tool-mapping.md'), '# Tools\n', 'utf8');
  writeFileSync(path.join(repoRoot, 'evals', 'routing-cases.json'), '[]\n', 'utf8');
  writeFileSync(
    path.join(repoRoot, 'evals', 'trigger-cases.json'),
    '{"shouldTrigger":[],"shouldNotTrigger":[]}\n',
    'utf8',
  );
}

function fixture({ install = true } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'paifa-doctor-'));
  const repoRoot = path.join(root, 'repo');
  const codexHome = path.join(root, 'codex');
  mkdirSync(repoRoot);
  mkdirSync(path.join(codexHome, 'skills'), { recursive: true });
  writeRepo(repoRoot);
  writeFileSync(path.join(codexHome, 'AGENTS.md'), '# Global\n', 'utf8');
  if (install) performInstall({ repoRoot, codexHome });

  return {
    root,
    repoRoot,
    codexHome,
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

function runDoctor(value) {
  return spawnSync(process.execPath, [
    DOCTOR,
    '--repo-root', value.repoRoot,
    '--codex-home', value.codexHome,
    '--json',
  ], { encoding: 'utf8' });
}

function checkById(receipt, id) {
  return receipt.checks.find((check) => check.id === id);
}

describe('paifa doctor', () => {
  test('reports a healthy installation without modifying files', () => {
    const value = fixture();
    try {
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      const statePath = path.join(value.codexHome, 'paifa', 'install-state.json');
      const before = {
        agents: sha256(readFileSync(agentsPath, 'utf8')),
        state: sha256(readFileSync(statePath, 'utf8')),
      };

      const result = runDoctor(value);
      const receipt = JSON.parse(result.stdout);

      assert.equal(result.status, 0, result.stderr);
      assert.equal(receipt.ok, true);
      assert.ok(receipt.checks.every((check) => check.status !== 'fail'));
      assert.equal(sha256(readFileSync(agentsPath, 'utf8')), before.agents);
      assert.equal(sha256(readFileSync(statePath, 'utf8')), before.state);
    } finally {
      value.cleanup();
    }
  });

  test('reports a missing skill link', () => {
    const value = fixture();
    try {
      unlinkSync(path.join(value.codexHome, 'skills', 'paifa'));
      const result = runDoctor(value);
      const receipt = JSON.parse(result.stdout);

      assert.equal(result.status, 1);
      assert.equal(checkById(receipt, 'skill-link').status, 'fail');
    } finally {
      value.cleanup();
    }
  });

  test('reports a skill link pointing to another repository', () => {
    const value = fixture();
    try {
      const link = path.join(value.codexHome, 'skills', 'paifa');
      const other = path.join(value.root, 'other');
      mkdirSync(other);
      unlinkSync(link);
      symlinkSync(other, link);

      const receipt = JSON.parse(runDoctor(value).stdout);
      assert.equal(checkById(receipt, 'skill-link').status, 'fail');
    } finally {
      value.cleanup();
    }
  });

  test('reports repository and installed version mismatch', () => {
    const value = fixture();
    try {
      writeFileSync(path.join(value.repoRoot, 'VERSION'), '1.1.0\n', 'utf8');
      const receipt = JSON.parse(runDoctor(value).stdout);

      assert.equal(checkById(receipt, 'version-match').status, 'fail');
    } finally {
      value.cleanup();
    }
  });

  test('reports malformed installation state', () => {
    const value = fixture();
    try {
      writeFileSync(
        path.join(value.codexHome, 'paifa', 'install-state.json'),
        '{bad-json',
        'utf8',
      );
      const receipt = JSON.parse(runDoctor(value).stdout);

      assert.equal(checkById(receipt, 'install-state').status, 'fail');
    } finally {
      value.cleanup();
    }
  });

  test('reports missing required repository files', () => {
    const value = fixture();
    try {
      rmSync(path.join(value.repoRoot, 'references', 'high-risk.md'));
      const receipt = JSON.parse(runDoctor(value).stdout);

      assert.equal(checkById(receipt, 'repository-files').status, 'fail');
    } finally {
      value.cleanup();
    }
  });

  test('reports not-installed state cleanly and remains read-only', () => {
    const value = fixture({ install: false });
    try {
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      const before = readFileSync(agentsPath, 'utf8');
      const result = runDoctor(value);
      const receipt = JSON.parse(result.stdout);

      assert.equal(result.status, 1);
      assert.equal(checkById(receipt, 'install-state').status, 'fail');
      assert.equal(readFileSync(agentsPath, 'utf8'), before);
      assert.equal(lstatSync(value.codexHome).isDirectory(), true);
    } finally {
      value.cleanup();
    }
  });
});
