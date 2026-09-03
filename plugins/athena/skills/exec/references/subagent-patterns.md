# Subagent Patterns

Standard patterns for spawning and using subagents in execute workflows.

## Delegation Capability Pattern

```
delegate_agent capability(subagent_type="[type]", prompt="[task description]", description="[brief]")
```

## Research Phase

```
delegate_agent capability(subagent_type="athena:researcher", prompt="Research [topic]. Report ≤150 lines.", description="Research [topic]")
```

- Use multiple researchers in parallel for different topics
- Keep reports ≤150 lines with citations

## Scout Phase

```
delegate_agent capability(subagent_type="scout", prompt="Find files related to [feature] in codebase", description="Scout [feature]")
```

- Use `/athena:scout ext` (preferred) or `/athena:scout` (fallback)

## Planning Phase

```
delegate_agent capability(subagent_type="athena:planner", prompt="Create implementation plan based on reports: [reports]. Save to [path]", description="Plan [feature]")
```

- Input: researcher and scout reports
- Output: `plan.md` + `phase-XX-*.md` files

## UI Implementation

```
delegate_agent capability(subagent_type="athena:designer", prompt="Implement [feature] UI per the project's discovered design guidance", description="UI [feature]")
```

- For frontend work
- Follow design guidelines

## Testing

```
delegate_agent capability(subagent_type="athena:tester", prompt="Run test suite for plan phase [phase-name]", description="Test [phase]")
```

- Must achieve 100% pass rate

## Debugging

```
delegate_agent capability(subagent_type="athena:debugger", prompt="Analyze failures: [details]", description="Debug [issue]")
```

- Use when tests fail
- Provides root cause analysis

## Code Review

```
delegate_agent capability(subagent_type="athena:code-reviewer",
     prompt="Review changes for [phase] against these MANDATORY checks: (a) every acceptance criterion met; (b) no regression to business logic in touchpoints/blast-radius from scout; (c) no breaking changes to public contracts (signatures, schemas, APIs, env vars) unless explicitly called out; (d) follows existing patterns from scout; (e) no new lint/type/build errors anywhere. CONTEXT — scout summary: <scout-summary>; acceptance criteria: <acceptance-criteria>. Return score (X/10), critical, warnings, suggestions, and explicitly flag any side effects to trigger HARD-GATE-NO-SIDE-EFFECTS.",
     description="Review [phase]")
```

## Conditional Simplify

```
delegate_agent capability(subagent_type="athena:code-simplifier", prompt="Simplify these files while preserving behavior exactly: [file-list]", description="Simplify recent edits")
```

- Trigger when live `git diff --numstat HEAD --ignore-all-space` breaches any
  `simplify.threshold` from `.ck.json` (defaults: 400 LOC / 8 files / 200 single-file LOC)
- Scope the prompt to `git diff --name-only HEAD`
- Verify with `git diff --shortstat HEAD -- [file-list]` before/after the subagent;
  do not rely on the agent's prose summary
- Skip when `CK_SIMPLIFY_DISABLED=1` or `.ck.json` `simplify.gate.enabled=false`

## Project Management

Activate the `/athena:project-management` skill (MANDATORY at Finalize — not a subagent):

> Run full sync-back in [plan-path]: reconcile completed tasks with all phase files, backfill stale completed checkboxes across all phases, update plan.md status/progress, and report unresolved mappings.

## Documentation

```
delegate_agent capability(subagent_type="athena:docs-manager", prompt="Update docs for [phase]. Changed files: [list]", description="Update docs")
```

## Git Operations

```
delegate_agent capability(subagent_type="athena:git-manager", prompt="Stage and commit changes with conventional commit message", description="Commit changes")
```

## Parallel Execution

```
delegate_agent capability(subagent_type="athena:executor", prompt="Implement [phase-file] with file ownership: [files]", description="Implement phase [N]")
```

- Launch multiple for parallel phases
- Include file ownership boundaries
