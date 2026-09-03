# Quick Workflow

Fast scout-diagnose-fix-verify cycle for simple issues.

The parent skill's opening intent frame is already satisfied before this route
loads. Quick mode does not skip or repeat it.

## Steps

### Step 1: Scout (Minimal)

Locate affected file(s) and their direct dependencies only.

- Read error message → identify file path
- Check direct imports/dependencies of affected file
- Skip full codebase mapping

**Output:** `✓ Step 1: Scouted - [file], [N] direct deps`

### Step 2: Diagnose (Abbreviated)

Activate `debug` skill. Activate `sequential-thinking` for structured analysis.

- Read error message/logs
- **Capture pre-fix state:** Record exact error output (this is your verification baseline)
- Identify root cause (usually obvious for simple issues)
- Skip parallel hypothesis testing for trivial cases
- Confirm there is one direct, cause-aligned repair. If meaningful alternatives
  remain, escalate to Standard or Deep before implementation.

**Output:** `✓ Step 2: Diagnosed - Root cause: [brief description]`

### Step 3: Fix & Verify

Implement the fix directly.

- Make minimal changes
- Follow existing patterns
- Preserve the opening constraints and non-goals

**Parallel Verification:**
Launch run_shell-capable agents in parallel:

```
delegate_agent capability("run_shell", "Run typecheck", "Verify types")
delegate_agent capability("run_shell", "Run lint", "Verify lint")
```

**Before/After comparison:** Re-run the EXACT command from pre-fix state capture. Compare output.

See `references/parallel-exploration.md` for patterns.

**Output:** `✓ Step 3: Fixed - [N] files, verified (types/lint passed)`

### Step 4: Review + Prevent

**Skip the review sub-step if:** `--skip-code-review`. Print `code review skipped by --skip-code-review` and surface the unreviewed-changes risk at finalize; the Prevention sub-steps below still run.

Use `code-reviewer` subagent for quick review with explicit side-effect sweep.

Prompt: "Quick review of fix for [issue]. Check: (a) acceptance criteria met, (b) no regression to business logic in blast-radius from Step 1 scout, (c) no breaking changes to public contracts (signatures, schemas, APIs, env vars), (d) follows existing patterns, (e) no new lint/type/build errors. Score X/10. Explicitly flag any side effects."

See HARD-GATE-NO-SIDE-EFFECTS in SKILL.md — on reviewer-flagged regression → `ask_user capability` with 2-4 options (revert / narrow / update dependents / accept).

**Prevention (abbreviated for Quick):**

- Type errors/lint: type system IS the test → regression test optional
- Bug fixes: add at least 1 test covering the fixed scenario
- Still require before/after comparison of verification output

**Review handling:** See `references/review-cycle.md`

**Output:** `✓ Step 4: Review [score]/10 - [prevention measures]`

### Step 5: Report

Report summary to user (root cause, files changed, prevention).

**Output:** `✓ Step 5: Reported`

### Step 6: Finalize (MANDATORY — every fix)

1. **Activate `/athena:project-management` skill (MANDATORY)** → sync plan status if the fix is part of a plan, update progress, and refresh runtime tracking when available.
2. Evaluate docs impact; use `docs-manager` only when a routed authority surface changed.
3. Reflect completion in the live task-management surface when available.
4. Spawn `git-manager` subagent to commit.
5. Run `/athena:journal` to log decisions — only when the shared "Journal step — opt-in" applies (see SKILL.md; runs when `--journal` or `journal.auto=true`).

**Output:** `✓ Step 6: Finalized - sync-back complete, committed, journaled|journal skipped`

## Skills/Subagents Activated

| Step | Skills/Subagents                                                                                                                                                                  |
| ---- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | `scout` (minimal) or direct file read                                                                                                                                          |
| 2    | `debug`, `sequential-thinking`                                                                                                                                              |
| 3    | Parallel `run_shell` for verification                                                                                                                                             |
| 4    | `code-reviewer` subagent (skipped by `--skip-code-review`)                                                                                                                        |
| 5    | Report                                                                                                                                                                            |
| 6    | `/athena:project-management` (MANDATORY), conditional `docs-manager`, `git-manager`, `/athena:journal` (only when the shared "Journal step — opt-in" applies — see SKILL.md) |

**Extra:** `context-engineering` if dealing with AI/LLM code

## Notes

- Skip if review fails → escalate to Standard workflow
- Total steps: 6
- No planning phase needed
- Opening brainstorm contract is inherited from the parent skill
- Pre-fix state capture is STILL mandatory (even for quick fixes)
- Step 6 finalize is MANDATORY for every fix — `/athena:project-management` is NOT optional
