import assert from 'node:assert/strict';
import { describe, test } from 'node:test';

import {
  applyManagedBlock,
  inspectManagedBlock,
  removeManagedBlock,
} from '../scripts/lib/managed-block.mjs';

const BODY_V1 = '## Paifa Dispatch Gate\n\nUse `paifa` before delegated work.';
const BODY_V2 = '## Paifa Dispatch Gate\n\nUse `paifa` before every delegated retry.';

describe('managed AGENTS block', () => {
  test('appends one versioned block and preserves the original prefix', () => {
    const original = '# Existing Rules\n\nKeep this byte-for-byte.\n';
    const updated = applyManagedBlock(original, BODY_V1, '1');

    assert.ok(updated.startsWith(original));
    assert.match(updated, /PAIFA_MANAGED_BLOCK_START version=1/);
    assert.match(updated, /Use `paifa` before delegated work\./);
    assert.equal(inspectManagedBlock(updated).count, 1);
  });

  test('reinstalling the same block is byte-idempotent', () => {
    const installed = applyManagedBlock('# Existing\n', BODY_V1, '1');

    assert.equal(applyManagedBlock(installed, BODY_V1, '1'), installed);
  });

  test('updates only the marked block and its version', () => {
    const original = '# Existing\n\nUnrelated rule.\n';
    const installed = applyManagedBlock(original, BODY_V1, '1');
    const updated = applyManagedBlock(installed, BODY_V2, '2');

    assert.ok(updated.startsWith(original));
    assert.doesNotMatch(updated, /before delegated work/);
    assert.match(updated, /before every delegated retry/);
    assert.match(updated, /PAIFA_MANAGED_BLOCK_START version=2/);
  });

  test('remove restores the exact pre-install content', () => {
    for (const original of ['', '# Existing', '# Existing\n', '# Existing\n\n']) {
      const installed = applyManagedBlock(original, BODY_V1, '1');
      assert.equal(removeManagedBlock(installed), original);
    }
  });

  test('rejects duplicate managed blocks', () => {
    const once = applyManagedBlock('# Existing\n', BODY_V1, '1');
    const duplicate = `${once}\n${once.slice(once.indexOf('<!-- PAIFA_MANAGED_BLOCK_START'))}`;

    assert.throws(
      () => inspectManagedBlock(duplicate),
      /DUPLICATE_MANAGED_BLOCK/,
    );
  });

  test('rejects unmatched start or end markers', () => {
    assert.throws(
      () => inspectManagedBlock('before\n<!-- PAIFA_MANAGED_BLOCK_START version=1 -->\n'),
      /MALFORMED_MANAGED_BLOCK/,
    );
    assert.throws(
      () => inspectManagedBlock('before\n<!-- PAIFA_MANAGED_BLOCK_END -->\n'),
      /MALFORMED_MANAGED_BLOCK/,
    );
  });
});
