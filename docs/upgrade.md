# Upgrading Paifa

Paifa follows semantic versioning:

- Patch releases repair compatible behavior or documentation.
- Minor releases add backward-compatible routes, checks, or tooling.
- Major releases may change receipts, managed-block contracts, or installation state.

## Upgrade procedure

From the repository root:

```bash
git pull --ff-only
./scripts/install.sh --update
node scripts/doctor.mjs
```

Paifa never updates itself over the network. Review the changelog before updating. The installer backs up global `AGENTS.md`, replaces only the marked Paifa block, preserves unrelated bytes, and updates the install-state hashes. It stops on malformed or duplicate markers and never silently replaces an unmanaged Skill directory.

If Doctor reports a mismatch, inspect the reported path and state before changing anything. Re-run the installer only after resolving an unmanaged conflict. To remove the managed block and symlink while preserving other global edits:

```bash
./scripts/uninstall.sh
```

Full backup restoration is intentionally stricter:

```bash
./scripts/uninstall.sh --restore-backup
```

It succeeds only when the current global file matches the installed hash and its non-Paifa content still matches the original backup. This prevents overwriting edits made before or after an update.

After an upgrade, a new Codex task may be required before runtime Skill discovery reflects the new files.
