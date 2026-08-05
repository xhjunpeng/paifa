# Contributing

Paifa changes must preserve cost efficiency without weakening quality or risk floors.

## Behavioral changes

Use documentation TDD:

1. Create a safe fictional pressure case.
2. Run fresh low-cost samples without the proposed wording and record the failing behavior verbatim.
3. Add the smallest guidance that addresses the observed failure.
4. Re-run three fresh samples first; expand to five only when results disagree or fail.
5. Store model, reasoning effort, case version, verbatim output, manual verdict, and violation reason.

Do not replace verbatim evidence with summaries. Do not add more samples merely to make a process look complete.

## Script changes

Write a failing deterministic test first, confirm the expected RED failure, implement the smallest repair, then run the focused test and full suite:

```bash
npm test
git diff --check
```

Installation tests must use temporary Codex Homes. Never test destructive behavior against a contributor's real global files.

## Release hygiene

- Add a changelog entry for released behavior.
- Keep `SKILL.md` below 500 English words.
- Add no runtime dependency without a documented need.
- Include no credentials, private paths, private project data, or invented remote URLs.
- Keep Windows unsupported until a native installation lifecycle is implemented and tested.
- Do not weaken the Sol `high` floor for high-risk work or the user-confirmation boundary above it.
