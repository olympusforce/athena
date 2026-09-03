# Reporting Patterns

## Report Types

### 1. Session Status Report

Quick summary of work done in current session.

```markdown
## Session Report: [Date]

### Work Completed

- [x] [Task/feature description]
- [x] [Task/feature description]

### In Progress

- [ ] [Task description] — [% complete, blocker if any]

### Tasks Created

- [N] tasks hydrated from [plan]
- [M] completed, [K] remaining

### Next Session

1. [Priority item]
2. [Follow-up item]
```

### 2. Plan Completion Report

Comprehensive summary when a plan reaches completion.

```markdown
## Plan Complete: [Plan Name]

### Summary

- **Duration:** [start] → [end]
- **Phases:** [N] completed
- **Files changed:** [count]
- **Tests:** [pass/total]

### Achievements

- [Feature/capability delivered]

### Known Limitations

- [Any caveats or future work needed]

### Documentation Updates

- [Which docs were updated]
```

### 3. Progress Report (Multi-Plan)

Overview across all active plans.

```markdown
## Project Progress: [Date]

| Plan   | Status   | Progress | Priority | Next Action |
| ------ | -------- | -------- | -------- | ----------- |
| [name] | [status] | [%]      | P[N]     | [action]    |

### Highlights

- [Key achievement or milestone]

### Risks

- [Risk] — [Mitigation]

### Blockers

- [Blocker] — [Resolution path]
```

## Report Naming

Use pattern from `## Naming` section injected by hooks:
`{reports-path}/pm-{date}-{time}-{slug}.md`

Example: `.athena/plans/reports/pm-260205-2221-auth-progress.md`

## Report Generation Workflow

1. Read durable plan files and discover the live task-management surface
2. Gather live status when available, but resolve conflicts in favor of the plan
3. Scan phase files and count checkboxes
4. Compile metrics into the report template
5. Write to the reports directory
6. Highlight achievements, blockers, risks, and next steps

## Concision Rules

- Sacrifice grammar for brevity
- Use tables over paragraphs where possible
- List unresolved questions at end
- Metrics > prose (use numbers, percentages)
- Skip obvious context; focus on actionable insights
