# Hydration Workflow

Plan files are the durable layer. Runtime task tracking, when available, is a
session-scoped working view. Hydration projects plan work into that view;
sync-back preserves completed work in the plan.

## Session Start

1. Read `plan.md` and every `phase-XX-*.md` file.
2. Identify checked, unchecked, and blocked items.
3. Discover the live task-management surface.
4. If available, compare its current view with the plan before adding anything.
5. Mirror only remaining work, preserving dependencies, ownership, and source-plan mapping.
6. If unavailable, continue by updating the active plan directly.

Never infer runtime support from the client, editor, terminal, or a cached tool
inventory.

## During Work

- Record an item as active before starting it.
- Record completion immediately after verification.
- Advance blocked work only when its prerequisites are complete.
- Keep parallel ownership non-overlapping.
- Persist important findings in the plan or a linked report.

## Session End: Sync-Back

1. Sweep all phase files in the target plan directory.
2. Reconcile completed runtime items with their source checklist entries.
3. Backfill stale completed checkboxes in earlier phases.
4. Derive `plan.md` status and progress from checkbox state.
5. Report unresolved mappings and do not claim full completion while any remain.
6. Treat the runtime view as disposable after the plan is current.

## Cross-Session Resume

On resume, rebuild optional runtime tracking from unchecked plan items. Checked
items remain complete; no prior session state is required.

## YAML Frontmatter Sync

Keep the plan's existing frontmatter schema. Update its status only when the
underlying phase checkboxes justify the transition. Do not invent new fields to
serve a particular runtime task system.
