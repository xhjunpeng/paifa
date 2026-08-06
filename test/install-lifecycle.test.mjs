import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { describe, test } from 'node:test';

import {
  performInstall,
  performUninstall,
} from '../scripts/lib/installer.mjs';
import { inspectManagedBlock } from '../scripts/lib/managed-block.mjs';

const ORIGINAL_AGENTS = '# Global Rules\n\nKeep this rule.\n';
const BLOCK_V1 = '## Paifa Dispatch Gate\n\nInvoke `paifa` before delegated work.';

function fixture({ agentsExisted = true } = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'paifa-install-'));
  const repoRoot = path.join(root, 'repo');
  const codexHome = path.join(root, 'codex');
  mkdirSync(path.join(repoRoot, 'templates'), { recursive: true });
  mkdirSync(path.join(codexHome, 'skills'), { recursive: true });
  writeFileSync(path.join(repoRoot, 'SKILL.md'), '---\nname: paifa\ndescription: Use when delegating Codex work.\n---\n', 'utf8');
  writeFileSync(path.join(repoRoot, 'VERSION'), '1.0.0\n', 'utf8');
  writeFileSync(path.join(repoRoot, 'templates', 'global-agents-block.md'), BLOCK_V1, 'utf8');
  writeFileSync(path.join(repoRoot, 'templates', 'paifa-luna-worker.toml'), [
    'name = "Paifa Luna Worker"',
    'model = "gpt-5.6-luna"',
    'model_reasoning_effort = "medium"',
    '',
  ].join('\n'), 'utf8');
  if (agentsExisted) {
    writeFileSync(path.join(codexHome, 'AGENTS.md'), ORIGINAL_AGENTS, 'utf8');
  }

  return {
    root,
    repoRoot,
    codexHome,
    cleanup() {
      rmSync(root, { recursive: true, force: true });
    },
  };
}

function installOptions(value, overrides = {}) {
  return {
    repoRoot: value.repoRoot,
    codexHome: value.codexHome,
    now: () => new Date('2026-08-05T12:00:00.000Z'),
    ...overrides,
  };
}

describe('install lifecycle', () => {
  test('initial install creates one block, backup, repository symlink, and managed Luna worker', () => {
    const value = fixture();
    try {
      const receipt = performInstall(installOptions(value));
      const agents = readFileSync(path.join(value.codexHome, 'AGENTS.md'), 'utf8');
      const skillLink = path.join(value.codexHome, 'skills', 'paifa');
      const statePath = path.join(value.codexHome, 'paifa', 'install-state.json');
      const lunaWorkerPath = path.join(value.codexHome, 'agents', 'paifa-luna-worker.toml');

      assert.equal(receipt.status, 'installed');
      assert.equal(inspectManagedBlock(agents).count, 1);
      assert.equal(lstatSync(skillLink).isSymbolicLink(), true);
      assert.equal(readlinkSync(skillLink), realpathSync(value.repoRoot));
      assert.equal(existsSync(statePath), true);
      assert.match(readFileSync(lunaWorkerPath, 'utf8'), /model = "gpt-5\.6-luna"/);
      assert.equal(readFileSync(receipt.backupPath, 'utf8'), ORIGINAL_AGENTS);
    } finally {
      value.cleanup();
    }
  });

  test('uninstall preserves a Luna worker changed by the user', () => {
    const value = fixture();
    try {
      performInstall(installOptions(value));
      const workerPath = path.join(value.codexHome, 'agents', 'paifa-luna-worker.toml');
      writeFileSync(workerPath, 'model = "user-owned"\n', 'utf8');

      performUninstall({ repoRoot: value.repoRoot, codexHome: value.codexHome });

      assert.equal(readFileSync(workerPath, 'utf8'), 'model = "user-owned"\n');
    } finally {
      value.cleanup();
    }
  });

  test('repeated install is byte-idempotent for AGENTS and keeps one block', () => {
    const value = fixture();
    try {
      performInstall(installOptions(value));
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      const afterFirst = readFileSync(agentsPath, 'utf8');

      const receipt = performInstall(installOptions(value));
      const afterSecond = readFileSync(agentsPath, 'utf8');

      assert.equal(receipt.status, 'unchanged');
      assert.equal(afterSecond, afterFirst);
      assert.equal(inspectManagedBlock(afterSecond).count, 1);
    } finally {
      value.cleanup();
    }
  });

  test('update replaces only the managed block', () => {
    const value = fixture();
    try {
      performInstall(installOptions(value));
      writeFileSync(path.join(value.repoRoot, 'VERSION'), '1.1.0\n', 'utf8');
      writeFileSync(
        path.join(value.repoRoot, 'templates', 'global-agents-block.md'),
        '## Paifa Dispatch Gate\n\nInvoke `paifa` before delegated work and retries.',
        'utf8',
      );

      const receipt = performInstall(installOptions(value, { update: true }));
      const agents = readFileSync(path.join(value.codexHome, 'AGENTS.md'), 'utf8');

      assert.equal(receipt.status, 'updated');
      assert.ok(agents.startsWith(ORIGINAL_AGENTS));
      assert.match(agents, /delegated work and retries/);
      assert.equal(inspectManagedBlock(agents).version, '1.1.0');
    } finally {
      value.cleanup();
    }
  });

  test('changed installation requires the explicit update flag', () => {
    const value = fixture();
    try {
      performInstall(installOptions(value));
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      const before = readFileSync(agentsPath, 'utf8');
      writeFileSync(path.join(value.repoRoot, 'VERSION'), '1.1.0\n', 'utf8');
      assert.throws(() => performInstall(installOptions(value)), /UPDATE_REQUIRED/);
      assert.equal(readFileSync(agentsPath, 'utf8'), before);
    } finally {
      value.cleanup();
    }
  });

  test('restore-backup after an update restores the original global rules', () => {
    const value = fixture();
    try {
      performInstall(installOptions(value));
      writeFileSync(path.join(value.repoRoot, 'VERSION'), '1.1.0\n', 'utf8');
      writeFileSync(path.join(value.repoRoot, 'templates', 'global-agents-block.md'),
        '## Paifa Dispatch Gate\n\nInvoke `paifa` before delegated work and retries.', 'utf8');
      performInstall(installOptions(value, { update: true }));
      performUninstall({ repoRoot: value.repoRoot, codexHome: value.codexHome, restoreBackup: true });
      const agents = readFileSync(path.join(value.codexHome, 'AGENTS.md'), 'utf8');
      assert.equal(agents, ORIGINAL_AGENTS);
      assert.equal(inspectManagedBlock(agents).count, 0);
    } finally {
      value.cleanup();
    }
  });

  test('restore-backup refuses when an update carried unrelated global edits', () => {
    const value = fixture();
    try {
      performInstall(installOptions(value));
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      writeFileSync(agentsPath, `# Added Before Update\n${readFileSync(agentsPath, 'utf8')}`, 'utf8');
      writeFileSync(path.join(value.repoRoot, 'VERSION'), '1.1.0\n', 'utf8');
      writeFileSync(path.join(value.repoRoot, 'templates', 'global-agents-block.md'),
        '## Paifa Dispatch Gate\n\nInvoke `paifa` before delegated work and retries.', 'utf8');
      performInstall(installOptions(value, { update: true }));

      assert.throws(
        () => performUninstall({
          repoRoot: value.repoRoot,
          codexHome: value.codexHome,
          restoreBackup: true,
        }),
        /RESTORE_BASE_MISMATCH/,
      );

      performUninstall({ repoRoot: value.repoRoot, codexHome: value.codexHome });
      assert.equal(readFileSync(agentsPath, 'utf8'), `# Added Before Update\n${ORIGINAL_AGENTS}`);
    } finally {
      value.cleanup();
    }
  });

  test('existing non-symlink skill path stops without changing AGENTS', () => {
    const value = fixture();
    try {
      mkdirSync(path.join(value.codexHome, 'skills', 'paifa'));

      assert.throws(
        () => performInstall(installOptions(value)),
        /SKILL_PATH_CONFLICT/,
      );
      assert.equal(readFileSync(path.join(value.codexHome, 'AGENTS.md'), 'utf8'), ORIGINAL_AGENTS);
    } finally {
      value.cleanup();
    }
  });

  test('symlink to another repository requires explicit replacement', () => {
    const value = fixture();
    try {
      const other = path.join(value.root, 'other');
      mkdirSync(other);
      symlinkSync(other, path.join(value.codexHome, 'skills', 'paifa'));

      assert.throws(
        () => performInstall(installOptions(value)),
        /SKILL_LINK_CONFLICT/,
      );
      assert.equal(readFileSync(path.join(value.codexHome, 'AGENTS.md'), 'utf8'), ORIGINAL_AGENTS);
    } finally {
      value.cleanup();
    }
  });

  test('failure after AGENTS write restores original content and link state', () => {
    const value = fixture();
    try {
      assert.throws(
        () => performInstall(installOptions(value, {
          hooks: {
            afterAgentsWrite() {
              throw new Error('injected failure');
            },
          },
        })),
        /injected failure/,
      );

      assert.equal(readFileSync(path.join(value.codexHome, 'AGENTS.md'), 'utf8'), ORIGINAL_AGENTS);
      assert.equal(existsSync(path.join(value.codexHome, 'skills', 'paifa')), false);
      assert.equal(existsSync(path.join(value.codexHome, 'paifa', 'install-state.json')), false);
    } finally {
      value.cleanup();
    }
  });

  test('install failure preserves the original AGENTS mode', () => {
    const value = fixture();
    try {
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      chmodSync(agentsPath, 0o640);

      assert.throws(
        () => performInstall(installOptions(value, {
          hooks: {
            afterAgentsWrite() {
              throw new Error('injected failure');
            },
          },
        })),
        /injected failure/,
      );

      assert.equal(lstatSync(agentsPath).mode & 0o777, 0o640);
    } finally {
      value.cleanup();
    }
  });

  test('uninstall removes only managed artifacts and preserves outside edits', () => {
    const value = fixture();
    try {
      performInstall(installOptions(value));
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      const installed = readFileSync(agentsPath, 'utf8');
      writeFileSync(agentsPath, `# Added Later\n${installed}`, 'utf8');

      const receipt = performUninstall({
        repoRoot: value.repoRoot,
        codexHome: value.codexHome,
      });

      assert.equal(receipt.status, 'uninstalled');
      assert.equal(readFileSync(agentsPath, 'utf8'), `# Added Later\n${ORIGINAL_AGENTS}`);
      assert.equal(existsSync(path.join(value.codexHome, 'skills', 'paifa')), false);
      assert.equal(existsSync(path.join(value.codexHome, 'paifa', 'install-state.json')), false);
    } finally {
      value.cleanup();
    }
  });

  test('install and uninstall preserve an existing AGENTS mode', () => {
    const value = fixture();
    try {
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      chmodSync(agentsPath, 0o640);

      performInstall(installOptions(value));
      assert.equal(lstatSync(agentsPath).mode & 0o777, 0o640);

      performUninstall({ repoRoot: value.repoRoot, codexHome: value.codexHome });
      assert.equal(lstatSync(agentsPath).mode & 0o777, 0o640);
    } finally {
      value.cleanup();
    }
  });

  test('uninstall restores the absence of an AGENTS file created by install', () => {
    const value = fixture({ agentsExisted: false });
    try {
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');

      performInstall(installOptions(value));
      assert.equal(existsSync(agentsPath), true);

      performUninstall({ repoRoot: value.repoRoot, codexHome: value.codexHome });
      assert.equal(existsSync(agentsPath), false);
    } finally {
      value.cleanup();
    }
  });

  test('update preserves metadata for an originally absent AGENTS file', () => {
    const value = fixture({ agentsExisted: false });
    try {
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      performInstall(installOptions(value));
      writeFileSync(path.join(value.repoRoot, 'VERSION'), '1.1.0\n', 'utf8');
      performInstall(installOptions(value, { update: true }));

      const state = JSON.parse(readFileSync(
        path.join(value.codexHome, 'paifa', 'install-state.json'),
        'utf8',
      ));
      assert.equal(state.agentsExisted, false);
      assert.equal(state.agentsOriginalMode, null);

      performUninstall({ repoRoot: value.repoRoot, codexHome: value.codexHome });
      assert.equal(existsSync(agentsPath), false);
    } finally {
      value.cleanup();
    }
  });

  test('restore-backup refuses after unrelated AGENTS changes', () => {
    const value = fixture();
    try {
      performInstall(installOptions(value));
      const agentsPath = path.join(value.codexHome, 'AGENTS.md');
      writeFileSync(agentsPath, `# Changed\n${readFileSync(agentsPath, 'utf8')}`, 'utf8');

      assert.throws(
        () => performUninstall({
          repoRoot: value.repoRoot,
          codexHome: value.codexHome,
          restoreBackup: true,
        }),
        /RESTORE_HASH_MISMATCH/,
      );
      assert.equal(existsSync(path.join(value.codexHome, 'skills', 'paifa')), true);
    } finally {
      value.cleanup();
    }
  });

  test('shell CLIs install and uninstall with structured receipts', () => {
    const value = fixture();
    try {
      const repository = path.resolve(import.meta.dirname, '..');
      const install = spawnSync('sh', [
        'scripts/install.sh',
        '--repo-root', value.repoRoot,
        '--codex-home', value.codexHome,
      ], { cwd: repository, encoding: 'utf8' });

      assert.equal(install.status, 0, install.stderr);
      assert.equal(JSON.parse(install.stdout).status, 'installed');

      const uninstall = spawnSync('sh', [
        'scripts/uninstall.sh',
        '--repo-root', value.repoRoot,
        '--codex-home', value.codexHome,
      ], { cwd: repository, encoding: 'utf8' });

      assert.equal(uninstall.status, 0, uninstall.stderr);
      assert.equal(JSON.parse(uninstall.stdout).status, 'uninstalled');
    } finally {
      value.cleanup();
    }
  });
});
