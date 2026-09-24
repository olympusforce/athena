---
name: project-management
description: 'Track progress, update plan statuses, coordinate runtime work, generate reports, and preserve cross-session continuity.'
user-invocable: true
when_to_use: 'Invoke for progress tracking, plan status, or handoffs.'
category: utilities
keywords: [project, progress, status, reports]
argument-hint: '[task: status, hydrate, sync, report]'
---

# Project Management

Project oversight and coordination with durable plan files and optional runtime task tracking.

**Principles:** Token efficiency | Concise reports | Data-driven insights

## When to Use

- Checking project status or progress across plans
- Updating plan statuses after feature completion
- Mirroring plan work into the live task-management surface
- Generating status reports or summaries
- Coordinating documentation updates after milestones
- Verifying task completeness against acceptance criteria
- Cross-session resume of multi-phase work

## Runtime Capability Contract

Discover the live task-management surface at runtime. Use it when available to
mirror work, dependencies, ownership, and status. Otherwise, update the active
plan directly. Never infer availability from a client name or cached tool list.
When invoked by `/athena:exec` or `/athena:plan` without `--tasks`, skip the live view
(no hydration or live updates) and sync plan files only; a direct
`/athena:project-management hydrate` request is unaffected.
Plan files are the durable source of truth, and sync-back must work without
runtime task tracking.

## Core Capabilities

### 1. Runtime Work Tracking

Load: `references/task-operations.md`

When a live task-management surface exists:

- Mirror plan items with enough context to map them back to their source
- Track pending, active, blocked, and completed state
- Preserve dependency relationships
- Coordinate parallel agents with scoped ownership

### 2. Session Bridging (Hydration Pattern)

Load: `references/hydration-workflow.md`

Runtime tracking may be ephemeral. Plan files are durable. The hydration pattern bridges them:

- **Hydrate:** Read unchecked plan items and mirror them when a live surface exists
- **Work:** Track live progress when possible; otherwise update the active plan
- **Sync-back:** Reconcile all completed tasks against all phase files, update `[ ]` → `[x]`, update YAML frontmatter status
- **Resume:** Next session re-hydrates from remaining `[ ]` items

### 3. Progress Tracking

Load: `references/progress-tracking.md`

- Scan `./.athena/plans/*/plan.md` for active plans
- Parse YAML frontmatter for status, priority, effort
- Count `[x]` vs `[ ]` in phase files for completion %
- Cross-reference completed work against planned tasks
- Verify acceptance criteria met before marking complete

### 4. Documentation Coordination

Load: `references/documentation-triggers.md`

Trigger `./.athena/docs` updates when:

- Phase status changes, major features complete
- API contracts change, architecture decisions made
- Security patches applied, breaking changes occur

Delegate to `docs-manager` subagent for actual updates.

### 5. Status Reporting

Load: `references/reporting-patterns.md`

Generate reports: session summaries, plan completion, multi-plan overviews.

- Use naming: `{reports-path}/pm-{date}-{time}-{slug}.md`
- Sacrifice grammar for brevity; use tables over prose
- List unresolved questions at end

## Workflow

```
[Scan Plans] → [Hydrate Tasks] → [Track Progress] → [Update Status] → [Generate Report] → [Trigger Doc Updates]
```

1. Read the durable plan and discover the live task-management surface
2. If the live view is empty and live tracking applies (see Runtime Capability Contract), hydrate it from unchecked plan items
3. During work, update the live view when available; otherwise update the active plan
4. On completion: run full-plan sync-back (all phase files, including backfill for earlier phases), then update YAML frontmatter
5. Generate status report to reports directory
6. Delegate doc updates if changes warrant

## Mandatory Sync-Back Guard

When updating plan status, NEVER mark only the currently active phase.

1. Sweep all `phase-XX-*.md` files under the target plan directory.
2. Reconcile every completed runtime item to its source phase and checklist item.
3. Backfill stale checkboxes in earlier phases before marking later phases done.
4. Update `plan.md` status/progress from real checkbox counts.
5. If any completed task cannot be mapped to a phase file, report unresolved mappings and do not claim full completion.

## Plan YAML Frontmatter

All `plan.md` files MUST have:

```yaml
---
title: Feature name
status: in-progress # pending | in-progress | completed
priority: P1
effort: medium
branch: feature-branch
tags: [auth, api]
created: <date>
---
```

Update `status` when plan state changes.

## Quality Standards

- All analysis data-driven, referencing specific plans and reports
- Focus on business value delivery and actionable insights
- Highlight critical issues requiring immediate attention
- Maintain traceability between requirements and implementation

## Related Skills

- `plan` — Creates implementation plans (planning phase)
- `exec` — Implements plans (execution phase, invokes project-manager at finalize)
- `plans-kanban` — Visual dashboard for plan viewing
