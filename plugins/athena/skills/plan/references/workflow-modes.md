# Workflow Modes

## Auto-Detection (Default Planning Mode)

When no flag specified, analyze task and pick mode:

| Signal                                       | Mode     | Rationale                |
| -------------------------------------------- | -------- | ------------------------ |
| Simple task, clear scope, no unknowns        | fast     | Skip research overhead   |
| Complex task, unfamiliar domain, new tech    | hard     | Research needed          |
| Major refactor, 5+ areas, architectural debt | deep     | Need per-phase scouting  |
| 3+ independent features/layers/modules       | parallel | Enable concurrent agents |
| Ambiguous approach, multiple valid paths     | two      | Compare alternatives     |

Use `ask_user capability` if detection is uncertain.

## Scope Challenge Integration

Step 0 (Scope Challenge, see `scope-challenge.md`) runs before mode detection and can influence it. Without `--yagni`, it records HOLD SCOPE without presenting a scope-reduction fork:

- If user selects **EXPANSION** → auto-suggest `--hard` or `--two`
- If user selects **REDUCTION** → auto-suggest `--fast`
- If user selects **HOLD** → proceed with auto-detected mode

Mode can still be overridden by explicit flags (`--fast`, `--hard`, etc.).
The scope step is skipped only when the task is trivial. `--fast` changes
planning depth only; it does not authorize scope reduction. Preserve the full
requested scope unless the user passes `--yagni` or directly instructs a named
cut.

## Fast Mode (`--fast`)

No research. Analyze → Plan → Hydrate Tasks. Fast mode reduces workflow
depth, not the requested product scope.

1. Read repository instructions and follow the existing documentation navigation to locate current requirements, architecture, and development standards; confirm them against relevant source and tests
2. Use `planner` subagent to create plan
3. Hydrate tasks (unless `--no-tasks`)
4. **Implementation option:** `/athena:exec {absolute-plan-path}/plan.md`

**Why no default execute automation?** Fast planning reduces planning overhead, but implementation still requires a user choice. Add `--auto` only when the user explicitly asks to skip execute review gates.

## Hard Mode (`--hard`)

Research → Scout → Plan → Red Team → Validate → Hydrate Tasks.

1. Spawn max 2 `researcher` agents in parallel (different aspects, max 5 calls each)
2. Read repository instructions and follow documentation navigation to the relevant requirements, architecture, and standards; use `/athena:scout` when owning evidence is missing, ambiguous, or conflicts with source and tests
3. Gather research + scout report filepaths → pass to `planner` subagent
4. Post-plan red team review (see Red Team Review section below)
5. Post-plan validation (see Validation section below)
6. Hydrate tasks (unless `--no-tasks`)
7. **Context reminder:** `/athena:exec {absolute-plan-path}/plan.md`

**Why no execute flag?** Thorough planning needs interactive review gates.

## Deep Mode (`--deep`)

For major refactors touching 5+ areas with meaningful architectural debt.

Research → Per-phase scouting → Plan → Red Team → Validate → Hydrate Tasks.

1. Spawn 2-3 `researcher` agents for high-level architecture analysis
2. Follow repository instructions and documentation navigation to relevant authorities, verify them against current source and tests, and use `/athena:scout` across affected areas
3. For EACH planned phase, run focused scout work to:
   - inventory files to create, modify, or delete
   - count existing tests and identify missing coverage
   - list functions or interfaces that need test protection
   - identify duplicated code or risky dependency edges
4. Planner embeds the scout data into each phase file
5. Run red-team review
6. Run validation
7. Hydrate tasks unless `--no-tasks`
8. Output the standard `/athena:exec {absolute-plan-path}/plan.md` reminder

### Deep Phase Requirements

Each phase file in deep mode should include:

- a file inventory table
- a test scenario matrix
- a function or interface checklist
- a dependency map for that phase

## `--tdd` Flag (Composable)

Combine with any mode: `--hard --tdd`, `--deep --tdd`, `--parallel --tdd`.

`--tdd` adds tests-first structure to every implementation phase:

```
Phase N: [Topic]
├── Step A: Write tests for current behavior
├── Step B: Add shared infrastructure or seams
├── Step C: Refactor existing code
└── Step D: Verify compile + tests
```

Each TDD phase should include:

- **Tests Before**: regression coverage written before refactoring
- **Refactor**: code changes those tests protect
- **Tests After**: new tests for new behavior created during the phase
- **Regression Gate**: compile/type-check + test command that must pass after
  the refactor

## Parallel Mode (`--parallel`)

Research → Scout → Plan with file ownership → Red Team → Validate → Hydrate Tasks with dependency graph.

1. Same as Hard mode steps 1-3
2. Planner creates phases with:
   - **Exclusive file ownership** per phase (no overlap)
   - **Dependency matrix** (which phases run concurrently vs sequentially)
   - **Conflict prevention** strategy
3. plan.md includes: dependency graph, execution strategy, file ownership matrix
4. Hydrate progress when supported: preserve sequential dependencies and leave parallel groups independent
5. Post-plan red team review
6. Post-plan validation
7. **Context reminder:** `/athena:exec --parallel {absolute-plan-path}/plan.md`

### Parallel Phase Requirements

- Each phase self-contained, no runtime deps on other phases
- Clear file boundaries — each file modified in ONE phase only
- Group by: architectural layer, feature domain, or technology stack
- Example: Phases 1-3 parallel (DB/API/UI), Phase 4 sequential (integration tests)

## Two-Approach Mode (`--two`)

Research → Scout → Plan 2 approaches → Compare → Hydrate Tasks.

1. Same as Hard mode steps 1-3
2. Planner creates 2 implementation approaches with:
   - Clear trade-offs (pros/cons each)
   - Recommended approach with rationale
3. User selects approach
4. Post-plan red team review on selected approach
5. Post-plan validation
6. Hydrate tasks for selected approach (unless `--no-tasks`)
7. **Context reminder:** `/athena:exec {absolute-plan-path}/plan.md`

## Task Hydration Per Mode

| Mode     | Task Granularity              | Dependency Pattern                |
| -------- | ----------------------------- | --------------------------------- |
| fast     | Phase-level only              | Sequential chain                  |
| hard     | Phase + critical steps        | Sequential + step deps            |
| deep     | Phase + per-phase inventories | Sequential + validation gates     |
| parallel | Phase + steps + ownership     | Parallel groups + sequential deps |
| two      | After user selects approach   | Sequential chain                  |

All modes: See `task-management.md` for runtime capability discovery and durable plan sync.

## Post-Plan Red Team Review

Adversarial review that spawns hostile reviewers to find flaws before validation.

**Available in:** hard, deep, parallel, two modes. **Skipped in:** fast mode.

**Invocation:** Run `/athena:plan red-team {plan-directory-path}`.

```
/athena:plan red-team {plan-directory-path}
```

**Sequence:** Red team runs BEFORE validation because:

1. Red team may change the plan (added risks, removed sections, new constraints)
2. Validation should confirm the FINAL plan, not a pre-review draft
3. Validating first then red-teaming would invalidate validation answers

## Post-Plan Validation

Check `## Plan Context` → `Validation: mode=X, questions=MIN-MAX`:

| Mode     | Behavior                                                           |
| -------- | ------------------------------------------------------------------ |
| `prompt` | Ask: "Validate this plan with interview?" → Yes (Recommended) / No |
| `auto`   | Run `/athena:plan validate {plan-directory-path}`                      |
| `off`    | Skip validation                                                    |

**Invocation (when prompt mode, user says yes):** Run:

```
/athena:plan validate {plan-directory-path}
```

**Available in:** hard, deep, parallel, two modes. **Skipped in:** fast mode.

## Context Reminder

After plan creation, output user-choice next steps with the **actual absolute path**:

| Mode     | Exec Command                         |
| -------- | ------------------------------------ |
| fast     | `/athena:exec {path}/plan.md`            |
| hard     | `/athena:exec {path}/plan.md`            |
| deep     | `/athena:exec {path}/plan.md`            |
| parallel | `/athena:exec --parallel {path}/plan.md` |
| two      | `/athena:exec {path}/plan.md`            |

If planning ran with `--tdd`, append `--tdd` to the reminder above so exec keeps
the tests-first execution path. Example:
`/athena:exec {path}/plan.md --tdd`

> **Best Practice:** Run `/clear` before implementing to reduce planning-context carryover.
> Then, if the user chooses implementation, run the exec command above.
> Add `--auto` only when the user explicitly asks for autonomous implementation.

**Why absolute path?** After `/clear`, the new session loses previous context.
Always include the absolute path after presenting the plan so the user can choose a next step safely.

## Pre-Creation Check

Check `## Plan Context` in injected context:

- **"Plan: {path}"** → Ask "Continue with existing plan? [Y/n]"
- **"Suggested: {path}"** → Branch hint only, ask if activate or create new
- **"Plan: none"** → Create new using `Plan dir:` from `## Naming`

After creating the plan. Pass plan directory path to every subagent during the process.
