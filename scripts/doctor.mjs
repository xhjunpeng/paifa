#!/usr/bin/env node

import {
  existsSync,
  lstatSync,
  readFileSync,
  readlinkSync,
  realpathSync,
} from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { readInstallState, sha256 } from './lib/install-state.mjs';
import { inspectManagedBlock, removeManagedBlock } from './lib/managed-block.mjs';

function parseArgs(values) {
  const options = { json: false };
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === '--repo-root' || value === '--codex-home') {
      const next = values[index + 1];
      if (!next) throw new Error(`ARGUMENT_REQUIRED: ${value} needs a path.`);
      options[value === '--repo-root' ? 'repoRoot' : 'codexHome'] = next;
      index += 1;
    } else if (value === '--json') {
      options.json = true;
    } else {
      throw new Error(`UNKNOWN_ARGUMENT: ${value}`);
    }
  }
  return options;
}

function check(id, status, message) {
  return { id, status, message };
}

function linkTarget(linkPath) {
  const target = readlinkSync(linkPath);
  return path.resolve(path.dirname(linkPath), target);
}

function renderHuman(receipt) {
  const lines = receipt.checks.map((entry) => (
    `${entry.status.toUpperCase().padEnd(4)} ${entry.id}: ${entry.message}`
  ));
  lines.push(receipt.ok ? 'Paifa doctor: healthy' : 'Paifa doctor: attention required');
  return `${lines.join('\n')}\n`;
}

function runDoctor({ repoRoot, codexHome }) {
  const checks = [];
  const required = [
    'SKILL.md',
    'VERSION',
    'templates/global-agents-block.md',
    'templates/paifa-luna-worker.toml',
    'references/routing-policy.md',
    'references/high-risk.md',
    'references/tool-mapping.md',
    'scripts/approval.mjs',
    'scripts/closeout.mjs',
    'scripts/lib/approval-state.mjs',
    'scripts/lib/dispatch-capabilities.mjs',
    'scripts/lib/delegation-lifecycle.mjs',
    'evals/routing-cases.json',
    'evals/trigger-cases.json',
  ];
  const missing = required.filter((relativePath) => {
    const target = path.join(repoRoot, relativePath);
    return !existsSync(target) || !lstatSync(target).isFile();
  });
  checks.push(missing.length === 0
    ? check('repository-files', 'pass', 'All required repository files exist.')
    : check('repository-files', 'fail', `Missing: ${missing.join(', ')}`));

  let version = null;
  try {
    version = readFileSync(path.join(repoRoot, 'VERSION'), 'utf8').trim();
    const skill = readFileSync(path.join(repoRoot, 'SKILL.md'), 'utf8');
    const validFrontmatter = /^---\nname: paifa\ndescription: Use when[^\n]*\n---\n/.test(skill);
    checks.push(validFrontmatter
      ? check('skill-frontmatter', 'pass', 'Skill frontmatter is discoverable.')
      : check('skill-frontmatter', 'fail', 'Skill frontmatter is missing or invalid.'));
  } catch (error) {
    checks.push(check('skill-frontmatter', 'fail', error.message));
  }

  const statePath = path.join(codexHome, 'paifa', 'install-state.json');
  let state = null;
  try {
    state = readInstallState(statePath);
    checks.push(state
      ? check('install-state', 'pass', 'Installation state is valid JSON.')
      : check('install-state', 'fail', 'Installation state is missing.'));
  } catch (error) {
    checks.push(check('install-state', 'fail', error.message));
  }

  const skillPath = path.join(codexHome, 'skills', 'paifa');
  if (state) {
    const hashPattern = /^[a-f0-9]{64}$/;
    const schemaValid = typeof state.version === 'string'
      && state.repoRoot === repoRoot
      && state.skillPath === skillPath
      && typeof state.backupPath === 'string'
      && existsSync(state.backupPath)
      && lstatSync(state.backupPath).isFile()
      && hashPattern.test(state.agentsBeforeHash ?? '')
      && hashPattern.test(state.agentsAfterHash ?? '')
      && typeof state.agentsExisted === 'boolean'
      && (state.agentsExisted
        ? Number.isInteger(state.agentsOriginalMode)
          && state.agentsOriginalMode >= 0
          && state.agentsOriginalMode <= 0o777
        : state.agentsOriginalMode === null)
      && sha256(readFileSync(state.backupPath)) === state.agentsBeforeHash
      && state.lunaWorkerPath === path.join(codexHome, 'agents', 'paifa-luna-worker.toml')
      && hashPattern.test(state.lunaWorkerHash ?? '');
    checks.push(schemaValid
      ? check('install-state-contract', 'pass', 'Installation state paths and backup hash are valid.')
      : check('install-state-contract', 'fail', 'Installation state contract is incomplete or inconsistent.'));
  }
  try {
    const stat = lstatSync(skillPath);
    if (!stat.isSymbolicLink()) throw new Error('Skill path is not a symbolic link.');
    const target = realpathSync(linkTarget(skillPath));
    checks.push(target === repoRoot
      ? check('skill-link', 'pass', 'Skill link points to this repository.')
      : check('skill-link', 'fail', `Skill link points to ${target}.`));
  } catch (error) {
    checks.push(check('skill-link', 'fail', error.message));
  }

  const agentsPath = path.join(codexHome, 'AGENTS.md');
  let managed = null;
  try {
    const agents = readFileSync(agentsPath, 'utf8');
    managed = inspectManagedBlock(agents);
    checks.push(managed.count === 1
      ? check('managed-block', 'pass', 'Exactly one managed block exists.')
      : check('managed-block', 'fail', 'Managed block is missing.'));
    if (state?.agentsAfterHash) {
      const restoreReady = sha256(agents) === state.agentsAfterHash
        && sha256(removeManagedBlock(agents)) === state.agentsBeforeHash;
      checks.push(restoreReady
        ? check('restore-readiness', 'pass', 'Global rules still match the installed hash.')
        : check('restore-readiness', 'warn', 'Global rules changed since initial install; full backup restore will be refused.'));
    }
  } catch (error) {
    checks.push(check('managed-block', 'fail', error.message));
  }

  const versionsMatch = Boolean(version && state && managed?.count === 1
    && version === state.version
    && version === managed.version);
  checks.push(versionsMatch
    ? check('version-match', 'pass', `Repository and installation are ${version}.`)
    : check('version-match', 'fail', 'Repository, state, and managed-block versions differ.'));

  if (state?.lunaWorkerPath && state?.lunaWorkerHash) {
    try {
      const worker = readFileSync(state.lunaWorkerPath, 'utf8');
      checks.push(sha256(worker) === state.lunaWorkerHash
        ? check('luna-worker', 'pass', 'Managed Luna worker is installed and unchanged.')
        : check('luna-worker', 'warn', 'Luna worker is missing or user-modified; Luna will not be proposed for delegated work.'));
    } catch (error) {
      checks.push(check('luna-worker', 'warn', 'Luna worker is missing or user-modified; Luna will not be proposed for delegated work.'));
    }
  }

  try {
    const routing = JSON.parse(readFileSync(path.join(repoRoot, 'evals', 'routing-cases.json'), 'utf8'));
    const triggers = JSON.parse(readFileSync(path.join(repoRoot, 'evals', 'trigger-cases.json'), 'utf8'));
    const valid = Array.isArray(routing)
      && Array.isArray(triggers.shouldTrigger)
      && Array.isArray(triggers.shouldNotTrigger);
    checks.push(valid
      ? check('eval-fixtures', 'pass', 'Evaluation fixtures have valid top-level shapes.')
      : check('eval-fixtures', 'fail', 'Evaluation fixtures have invalid top-level shapes.'));
  } catch (error) {
    checks.push(check('eval-fixtures', 'fail', error.message));
  }

  return {
    ok: checks.every((entry) => entry.status !== 'fail'),
    version,
    checks,
    limits: {
      semanticRoutingVerified: false,
      automaticDiscoveryVerified: false,
    },
  };
}

try {
  const parsed = parseArgs(process.argv.slice(2));
  const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
  const repoRoot = realpathSync(parsed.repoRoot ?? path.resolve(scriptDirectory, '..'));
  const codexHome = path.resolve(
    parsed.codexHome ?? process.env.CODEX_HOME ?? path.join(os.homedir(), '.codex'),
  );
  const receipt = runDoctor({ repoRoot, codexHome });
  process.stdout.write(parsed.json
    ? `${JSON.stringify(receipt, null, 2)}\n`
    : renderHuman(receipt));
  process.exitCode = receipt.ok ? 0 : 1;
} catch (error) {
  const receipt = {
    ok: false,
    error: {
      code: error.code ?? String(error.message).split(':', 1)[0],
      message: error.message,
    },
  };
  process.stdout.write(`${JSON.stringify(receipt, null, 2)}\n`);
  process.exitCode = 2;
}
