import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  realpathSync,
  rmSync,
  symlinkSync,
  unlinkSync,
} from 'node:fs';
import path from 'node:path';

import {
  applyManagedBlock,
  inspectManagedBlock,
  removeManagedBlock,
} from './managed-block.mjs';
import {
  atomicWriteFile,
  readInstallState,
  sha256,
  writeInstallState,
} from './install-state.mjs';

function fail(code, message) {
  const error = new Error(`${code}: ${message}`);
  error.code = code;
  throw error;
}

function requiredFile(filePath, code) {
  if (!existsSync(filePath) || !lstatSync(filePath).isFile()) {
    fail(code, `Required file is missing: ${filePath}`);
  }
  return readFileSync(filePath, 'utf8');
}

function resolvedLinkTarget(linkPath) {
  const target = readlinkSync(linkPath);
  return path.resolve(path.dirname(linkPath), target);
}

function inspectSkillPath(skillPath) {
  if (!existsSync(skillPath)) return { kind: 'missing' };
  const stat = lstatSync(skillPath);
  if (!stat.isSymbolicLink()) {
    return { kind: 'conflict' };
  }
  return { kind: 'symlink', target: resolvedLinkTarget(skillPath) };
}

function timestamp(value) {
  return value.toISOString().replace(/[:.]/g, '-');
}

function fileMode(filePath, fallback = 0o600) {
  return existsSync(filePath) ? lstatSync(filePath).mode & 0o777 : fallback;
}

function restoreLink(skillPath, before) {
  if (existsSync(skillPath) && lstatSync(skillPath).isSymbolicLink()) {
    unlinkSync(skillPath);
  }
  if (before.kind === 'symlink') {
    symlinkSync(before.target, skillPath);
  }
}

export function performInstall(options) {
  const repoRoot = realpathSync(options.repoRoot);
  const codexHome = path.resolve(options.codexHome);
  const agentsPath = path.join(codexHome, 'AGENTS.md');
  const skillDirectory = path.join(codexHome, 'skills');
  const skillPath = path.join(skillDirectory, 'paifa');
  const statePath = path.join(codexHome, 'paifa', 'install-state.json');
  const now = options.now ? options.now() : new Date();

  requiredFile(path.join(repoRoot, 'SKILL.md'), 'SKILL_FILE_MISSING');
  const version = requiredFile(path.join(repoRoot, 'VERSION'), 'VERSION_FILE_MISSING').trim();
  const block = requiredFile(
    path.join(repoRoot, 'templates', 'global-agents-block.md'),
    'GLOBAL_BLOCK_MISSING',
  );
  if (!version) fail('VERSION_INVALID', 'VERSION must not be empty.');

  mkdirSync(skillDirectory, { recursive: true, mode: 0o700 });
  const agentsExisted = existsSync(agentsPath);
  const beforeAgents = agentsExisted ? readFileSync(agentsPath, 'utf8') : '';
  const beforeAgentsMode = fileMode(agentsPath);
  const blockState = inspectManagedBlock(beforeAgents);
  const beforeSkill = inspectSkillPath(skillPath);
  const beforeStateText = existsSync(statePath) ? readFileSync(statePath, 'utf8') : null;
  const previousState = readInstallState(statePath);

  if (beforeSkill.kind === 'conflict') {
    fail('SKILL_PATH_CONFLICT', `${skillPath} exists and is not a symlink.`);
  }
  if (beforeSkill.kind === 'symlink'
    && beforeSkill.target !== repoRoot
    && !options.replaceManagedLink) {
    fail('SKILL_LINK_CONFLICT', `${skillPath} points to another repository.`);
  }
  if (blockState.count === 1 && !previousState) {
    fail('INSTALL_STATE_MISSING', 'A managed block exists without installation state.');
  }

  const desiredAgents = applyManagedBlock(beforeAgents, block, version);
  const linkAlreadyCorrect = beforeSkill.kind === 'symlink' && beforeSkill.target === repoRoot;
  const stateAlreadyCorrect = previousState?.version === version
    && previousState?.repoRoot === repoRoot;
  if (desiredAgents === beforeAgents && linkAlreadyCorrect && stateAlreadyCorrect) {
    return {
      status: 'unchanged',
      version,
      repoRoot,
      skillPath,
      statePath,
      backupPath: previousState.backupPath,
    };
  }

  if (previousState && !options.update) {
    fail('UPDATE_REQUIRED', 'Existing installation changes require --update.');
  }

  const beforeHash = sha256(beforeAgents);
  const backupDirectory = path.join(codexHome, 'backups', 'paifa');
  const backupPath = previousState?.backupPath ?? path.join(
      backupDirectory,
      `AGENTS.md.${timestamp(now)}.${beforeHash.slice(0, 12)}.bak`,
    );
  const originalBeforeHash = previousState?.agentsBeforeHash ?? beforeHash;
  const originalAgentsExisted = previousState
    ? (typeof previousState.agentsExisted === 'boolean' ? previousState.agentsExisted : true)
    : agentsExisted;
  const originalAgentsMode = previousState
    ? (previousState.agentsExisted === false
        ? null
        : (Number.isInteger(previousState.agentsOriginalMode)
            ? previousState.agentsOriginalMode
            : beforeAgentsMode))
    : (agentsExisted ? beforeAgentsMode : null);
  if (!previousState) atomicWriteFile(backupPath, beforeAgents, 0o600);

  try {
    atomicWriteFile(agentsPath, desiredAgents, beforeAgentsMode);
    options.hooks?.afterAgentsWrite?.();

    if (!linkAlreadyCorrect) {
      if (beforeSkill.kind === 'symlink') unlinkSync(skillPath);
      symlinkSync(repoRoot, skillPath);
    }

    const state = {
      version,
      repoRoot,
      skillPath,
      backupPath,
      agentsBeforeHash: originalBeforeHash,
      agentsAfterHash: sha256(desiredAgents),
      agentsExisted: originalAgentsExisted,
      agentsOriginalMode: originalAgentsMode,
      installedAt: now.toISOString(),
    };
    writeInstallState(statePath, state);

    return {
      status: blockState.count === 0 && beforeSkill.kind === 'missing' ? 'installed' : 'updated',
      version,
      repoRoot,
      skillPath,
      statePath,
      backupPath,
    };
  } catch (error) {
    if (agentsExisted) {
      atomicWriteFile(agentsPath, beforeAgents, beforeAgentsMode);
    } else {
      rmSync(agentsPath, { force: true });
    }
    restoreLink(skillPath, beforeSkill);
    if (beforeStateText === null) {
      rmSync(statePath, { force: true });
    } else {
      atomicWriteFile(statePath, beforeStateText, 0o600);
    }
    throw error;
  }
}

export function performUninstall(options) {
  const codexHome = path.resolve(options.codexHome);
  const agentsPath = path.join(codexHome, 'AGENTS.md');
  const skillPath = path.join(codexHome, 'skills', 'paifa');
  const statePath = path.join(codexHome, 'paifa', 'install-state.json');
  const stateText = existsSync(statePath) ? readFileSync(statePath, 'utf8') : null;
  const state = readInstallState(statePath);
  if (!state) fail('INSTALL_STATE_MISSING', 'Paifa is not recorded as installed.');

  const expectedRepo = options.repoRoot ? realpathSync(options.repoRoot) : state.repoRoot;
  if (state.repoRoot !== expectedRepo) {
    fail('REPOSITORY_MISMATCH', 'Requested repository does not match installation state.');
  }

  const beforeSkill = inspectSkillPath(skillPath);
  if (beforeSkill.kind !== 'symlink' || beforeSkill.target !== state.repoRoot) {
    fail('SKILL_LINK_MISMATCH', 'Installed Skill link no longer matches installation state.');
  }

  const beforeAgents = existsSync(agentsPath) ? readFileSync(agentsPath, 'utf8') : '';
  const agentsExistedBeforeUninstall = existsSync(agentsPath);
  const beforeAgentsMode = fileMode(agentsPath);
  let desiredAgents;
  if (options.restoreBackup) {
    if (sha256(beforeAgents) !== state.agentsAfterHash) {
      fail('RESTORE_HASH_MISMATCH', 'AGENTS.md changed after installation; refusing full restore.');
    }
    const backupAgents = requiredFile(state.backupPath, 'BACKUP_MISSING');
    if (sha256(removeManagedBlock(beforeAgents)) !== state.agentsBeforeHash) {
      fail('RESTORE_BASE_MISMATCH', 'Unrelated global rules changed since initial installation; refusing full restore.');
    }
    desiredAgents = backupAgents;
  } else {
    desiredAgents = removeManagedBlock(beforeAgents);
  }

  const shouldRemoveAgents = state.agentsExisted === false && desiredAgents === '';
  const desiredMode = options.restoreBackup && Number.isInteger(state.agentsOriginalMode)
    ? state.agentsOriginalMode
    : beforeAgentsMode;

  try {
    if (shouldRemoveAgents) {
      rmSync(agentsPath, { force: true });
    } else {
      atomicWriteFile(agentsPath, desiredAgents, desiredMode);
    }
    unlinkSync(skillPath);
    rmSync(statePath, { force: true });
    return { status: 'uninstalled', restoredBackup: Boolean(options.restoreBackup) };
  } catch (error) {
    if (agentsExistedBeforeUninstall) {
      atomicWriteFile(agentsPath, beforeAgents, beforeAgentsMode);
    } else {
      rmSync(agentsPath, { force: true });
    }
    restoreLink(skillPath, beforeSkill);
    if (stateText !== null) atomicWriteFile(statePath, stateText, 0o600);
    throw error;
  }
}
