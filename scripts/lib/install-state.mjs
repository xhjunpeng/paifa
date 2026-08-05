import { createHash, randomUUID } from 'node:crypto';
import {
  chmodSync,
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from 'node:fs';
import path from 'node:path';

export function sha256(content) {
  return createHash('sha256').update(content).digest('hex');
}

export function atomicWriteFile(filePath, content, mode = 0o600) {
  const directory = path.dirname(filePath);
  mkdirSync(directory, { recursive: true, mode: 0o700 });
  const temporaryPath = path.join(
    directory,
    `.${path.basename(filePath)}.${process.pid}.${randomUUID()}.tmp`,
  );

  try {
    writeFileSync(temporaryPath, content, { encoding: 'utf8', flag: 'wx', mode });
    renameSync(temporaryPath, filePath);
    chmodSync(filePath, mode);
  } catch (error) {
    rmSync(temporaryPath, { force: true });
    throw error;
  }
}

export function readInstallState(statePath) {
  if (!existsSync(statePath)) return null;
  try {
    return JSON.parse(readFileSync(statePath, 'utf8'));
  } catch (error) {
    const wrapped = new Error(`INSTALL_STATE_INVALID: ${error.message}`);
    wrapped.code = 'INSTALL_STATE_INVALID';
    throw wrapped;
  }
}

export function writeInstallState(statePath, state) {
  atomicWriteFile(statePath, `${JSON.stringify(state, null, 2)}\n`, 0o600);
}
