# Fact-only task envelope

Direct execution is the default and does not need a task envelope. Use this compact envelope only after a real delegation has passed Paifa's four evidence checks and host capability checks.

```text
Goal:
Worktree or repository:
Allowed changes:
Forbidden changes:
Verified facts:
Unresolved facts:
Risk boundary:
Acceptance commands and expected evidence:
Stopping conditions:
Dispatch ID:
Return contract:
Resume checkpoint:
Return format:
```

State observations, commands, and decisions already supported by evidence. Label uncertainty as unresolved, exclude credentials and unrelated context, and keep the envelope no larger than needed. The Dispatch ID, return contract, and resume checkpoint are required for delegated work and omitted for `direct` execution.
