# Unified Workflow Steps

All modes share core steps with mode-specific variations.

**Runtime progress contract:** Runtime task tracking is opt-in via `--tasks`.
With `--tasks`, discover the live task-management surface and use it when
available. Otherwise, update the active plan directly. Plan files are
the durable source of truth, and every workflow step must work without runtime
task tracking.

## Step 0: Brainstorm Contract, Intent Detection & Setup

1. Capture outcome, constraints, non-goals, and acceptance criteria. Reuse them
   from an accepted plan or design when present.
2. Resolve only material gaps; routine approval is unnecessary in explicit auto
   mode when the contract is already concrete.
3. Parse input with `intent-detection.md` rules.
4. If mode=code: detect plan path, set active plan, and retain its accepted
   brainstorm contract.
5. With `--tasks` and three or more meaningful steps, mirror progress into the live task-management surface when available. Without `--tasks`, print `task tracking skipped by default (pass --tasks to enable)`.

**Output:** concise brainstorm contract plus detected workflow mode and reason.

## Step 1: Research (skip if fast/code mode)

**Interactive/Auto:**

- Spawn multiple `researcher` agents in parallel
- Use `/athena:scout ext` or `scout` agent for codebase search
- Keep reports ≤150 lines
- Evaluate findings against the opening outcome and constraints.

**Parallel:**

- Optional: max 2 researchers if complex

**Output:** `✓ Step 1: Research complete - [N] reports gathered`

### [Review Gate 1] Post-Research (skip if auto mode)

- Present research summary to user
- Use `ask_user capability` to ask: "Proceed to planning?" / "Request more research" / "Abort"
- **Auto mode:** Skip this gate

## Step 2: Planning

**Interactive/Auto:**

- Use `planner` agent with research context
- Create `plan.md` + `phase-XX-*.md` files

**Fast:**

- Use `/athena:plan --fast` with scout results only
- Minimal planning, focus on action

**Parallel:**

- Use `/athena:plan --parallel` for dependency graph + file ownership matrix

**Code:**

- Skip - plan already exists
- Parse existing plan for phases

**Output:** `✓ Step 2: Plan created - [N] phases`

### [Review Gate 2] Post-Plan (skip if auto mode)

- Present plan overview with phases
- Use `ask_user capability` to ask: "Validate the plan or approve plan to start implementation?" - "Validate" / "Approve" / "Abort" / "Other" ("Request revisions")
  - "Validate": run `/athena:plan validate` skill invocation
  - "Approve": continue to implementation
  - "Abort": stop the workflow
  - "Other": revise the plan based on user's feedback
- **Auto mode:** Skip this gate

## Step 3: Implementation

**IMPORTANT:**

1. Read the active plan before trusting session state.
2. With `--tasks`, discover the live task-management surface and compare any existing view with the plan.
3. With `--tasks`, if the view is absent or stale, rebuild it from unchecked plan items when supported.
4. Preserve phase order, dependencies, ownership, and source-plan mapping; otherwise track them in the active plan.

### Conformance Checklist (before writing code)

Before implementing each phase, the developer agent MUST:

1. **Read repository instructions and the routed project docs relevant to this
   change**; do not assume a standard docs filename exists.
2. **Scout adjacent code patterns** in the files being modified and follow the
   same import, logging, and error-wrapping style.
3. **Check for existing helpers** before creating new utilities so the change
   stays DRY.
4. **Verify interface contracts** so new code extends the current surface
   instead of creating a parallel one.
5. **Cross-check the plan checklist** so every file in the phase inventory is
   actually addressed.

After each file is modified:

- **Compile check:** run the relevant project compile/type-check command
- **Pattern verify:** confirm the new code matches adjacent conventions
- **Import check:** confirm no circular dependency or dead import was added

### `--tdd` Flag Behavior

When `--tdd` is active, Step 3 splits into sub-steps per phase:

```
Step 3.T: Write tests for CURRENT behavior (regression safety net)
Step 3.I: Implement changes (refactor, new code)
Step 3.V: Verify all tests from 3.T still pass + compile gates
```

Tests from Step 3.T document the current behavior. If any fail after Step 3.I,
the refactor broke something and must be fixed before the workflow proceeds.

**All modes:**

- Record the current item as active through the live task-management surface when `--tasks` is present; otherwise update the active plan.
- Execute phase tasks sequentially (Step 3.1, 3.2, etc.)
- Use `designer` for frontend
- Run type checking after each file

**Parallel mode:**

- With `--tasks`, discover the live task-management surface before using it; do not rely on copied tool names or client restrictions.
- Launch multiple `executor` agents
- When agents pick up work, record ownership and active state through the live capability or active plan.
- Respect file ownership boundaries
- Wait for parallel group before next

**Output:** `✓ Step 3: Implemented [N] files - [X/Y] tasks complete`

### Step 3.S: Conditional Simplify (live-diff gated)

Recompute signals from the live worktree (no hook state):

```bash
totals=$(git diff --numstat HEAD --ignore-all-space)
loc=$(echo "$totals" | awk '{s+=$1+$2} END {print s+0}')
files=$(echo "$totals" | awk 'NF{c++} END {print c+0}')
maxFile=$(echo "$totals" | awk 'BEGIN{m=0} {if ($1>m) m=$1} END {print m+0}')
modified=$(git diff --name-only HEAD)
```

Read thresholds from `.ck.json` (`simplify.threshold.{locDelta,fileCount,singleFileLoc}`),
defaulting to 400 / 8 / 200. If any threshold is breached, spawn the simplifier
scoped to the modified files:

```
delegate_agent capability(subagent_type="athena:code-simplifier", prompt="Simplify these files while preserving behavior exactly: [file-list]", description="Simplify recent edits")
```

After the subagent returns, log only — never re-run or block:

- `git diff --shortstat HEAD -- [file-list]` changed → "simplifier made scoped edits"
- unchanged → "simplifier ran clean"

**Output:** `✓ Step 3.S: Simplify [ran|skipped] - [scoped changes|clean|under threshold]`

### [Review Gate 3] Post-Implementation (skip if auto mode)

- Present implementation summary (files changed, key changes)
- Use `ask_user capability` to ask: "Proceed to testing (with `--test`) / code review?" / "Request implementation changes" / "Abort"
- **Auto mode:** Skip this gate

## Step 4: Testing (only with `--test` or `--tdd`)

**Without `--test` or `--tdd`:** print `tests skipped by default (pass --test to run)` and continue to Step 5.

**All modes (with `--test`):**

- Write tests: happy path, edge cases, errors
- **MUST** spawn `tester` subagent: `delegate_agent capability(subagent_type="athena:tester", prompt="Run test suite", description="Run tests")`
- If failures: **MUST** spawn `debugger` subagent → fix → repeat
- **Forbidden:** fake mocks, commented tests, changed assertions, skipping subagent delegation

**Output:** `✓ Step 4: Tests [X/X passed] - tester subagent invoked`

### [Review Gate 4] Post-Testing (only with `--test`; skip if auto mode)

- Present test results summary
- Use `ask_user capability` to ask: "Proceed to code review?" / "Request test fixes" / "Abort"
- **Auto mode:** Skip this gate

## Step 5: Code Review

**All modes - MANDATORY subagent (skipped only by `--skip-code-review`):**

- **MUST** spawn `code-reviewer` subagent with explicit (a-e) checks and scout/acceptance context:
  ```
  delegate_agent capability(subagent_type="athena:code-reviewer",
       prompt="Review changes against these MANDATORY checks: (a) every acceptance criterion met; (b) no regression to business logic in touchpoints/blast-radius from scout; (c) no breaking changes to public contracts (signatures, schemas, APIs, env vars) unless explicitly called out; (d) follows existing patterns from scout; (e) no new lint/type/build errors anywhere. CONTEXT — scout summary: <scout-summary>; acceptance criteria: <acceptance-criteria>. Return score (X/10), critical, warnings, suggestions, and explicitly flag any side effects to trigger HARD-GATE-NO-SIDE-EFFECTS.",
       description="Code review")
  ```
- **DO NOT** review code yourself - delegate to subagent

**`--skip-code-review`:** Skip this entire step. Print `code review skipped by --skip-code-review` and surface the unreviewed-changes risk in the Step 6 finalize report, the same way skipped testing surfaces its risk.

**Interactive/Parallel/Code:**

- Interactive cycle (max 3): see `review-cycle.md`
- Requires user approval

**Auto:**

- Apply the auto-mode decision from `review-cycle.md`
- Auto-fix critical (max 3 cycles)
- Escalate to user after 3 failed cycles

**Fast:**

- Simplified review, no fix loop
- User approves or aborts

**Output:** `✓ Step 5: Review [score]/10 - [Approved|Auto-approved] - code-reviewer subagent invoked`

## Step 6: Finalize

**All modes - finalize contract:**

1. **MUST** activate `/athena:project-management` skill (MANDATORY) — run full sync-back for [plan-path]: reconcile completed runtime work with all phase files, backfill stale completed checkboxes across every phase, then update plan.md frontmatter/table progress. Do NOT only mark current phase.
2. Evaluate docs impact using the installed documentation-management routing.
   If an authority surface changed, delegate `docs-manager` with the changed
   contract, evidence, and exact routed docs in scope. Do not issue a generic
   whole-corpus refresh.
3. Project-management sync-back MUST include:

### Status Sync (Finalize)

Live help owns the
syntax and effects; do not copy an argument schema into this workflow.

**Fallback:** Edit plan.md directly — only change the Status column cell, preserve table structure.

- Sweep all `phase-XX-*.md` files in the plan directory.
- Mark every completed item `[ ] → [x]` based on completed tasks (including earlier phases finished before current phase).
- Update `plan.md` status/progress (`pending`/`in-progress`/`completed`) from actual checkbox state.
- Return unresolved mappings if any completed task cannot be matched to a phase file.

4. After sync-back confirmation, reflect completion in the live task-management surface when `--tasks` is present.
5. If Step 4 did not run, print `tests: NOT RUN` in the finalize report (all modes, including auto).
6. Onboarding check (API keys, env vars)
7. **MUST** spawn git subagent: `delegate_agent capability(subagent_type="athena:git-manager", prompt="Stage and commit changes", description="Commit")`

**CRITICAL:** Step 6 is incomplete without project-management sync-back, an
explicit docs-impact decision, and the configured git approval flow.

**Auto mode:** Continue to next phase automatically, start from **Step 3**.
**Others:** Ask user before next phase

**Output:** `✓ Step 6: Finalized - 3 subagents invoked - Full-plan sync-back completed - Committed`

## Mode-Specific Flow Summary

Legend: `[R]` = Review Gate (human approval required); `4` and its `[R]` run only with `--test`/`--tdd`

```
interactive: 0 → 1 → [R] → 2 → [R] → 3 → [R] → 4 → [R] → 5(user) → 6
auto:        0 → 1 → 2 → 3 → 4 → 5(auto) → 6 → next phase (NO stops)
fast:        0 → skip → 2(fast) → [R] → 3 → [R] → 4 → [R] → 5(simple) → 6
parallel:    0 → 1? → [R] → 2(parallel) → [R] → 3(multi-agent) → [R] → 4 → [R] → 5(user) → 6
code:        0 → skip → skip → 3 → [R] → 4 → [R] → 5(user) → 6
```

**Key difference:** `auto` mode is the ONLY mode that skips all review gates.

## Critical Rules

- Never skip steps without mode justification
- **MANDATORY DELEGATION:** Steps 4, 5, 6 MUST delegate via delegate_agent capability / skill activation. DO NOT implement directly.
  - Step 4 (with `--test`/`--tdd`): `tester` (and `debugger` if failures)
  - Step 5: `code-reviewer` (unless `--skip-code-review`)
  - Step 6: `/athena:project-management`, conditional `docs-manager`, `git-manager`
- Runtime tracking only with `--tasks`: discover the live task-management surface first.
- With `--tasks` and a live surface, mirror unchecked plan items and keep their status current.
- Otherwise, update the active plan directly; plan files remain authoritative.
- All step outputs follow format: `✓ Step [N]: [status] - [metrics]`
- **VALIDATION:** If delegate_agent calls = 0 at end of workflow, the workflow is INCOMPLETE.
