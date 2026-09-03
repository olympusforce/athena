# Runtime Work Tracking

Runtime task management is an optional coordination layer over durable plan
files. Do not copy a host's tool names or parameter schema into this guidance.

## Capability Discovery

1. Discover the live task-management surface at runtime.
2. Use only capabilities the live surface actually exposes.
3. If no surface exists, update the active plan directly.
4. Never infer availability from a client name or cached tool list.

## Portable Semantics

When supported, the runtime view should represent:

- a concise work item and its acceptance criteria;
- pending, active, blocked, and completed state;
- prerequisite relationships;
- non-overlapping ownership for parallel work; and
- a durable mapping back to the source plan item.

The exact commands, field names, and state transitions belong to the live
runtime contract. Discover them instead of reproducing them here.

## When to Use Runtime Tracking

Use it for multi-phase work, meaningful dependencies, parallel ownership, or a
workflow with at least three related items. Skip it for a short linear change.

## Completion Rule

Runtime state is not completion evidence. Before reporting progress or handing
off work, reconcile it with plan checkboxes, verification evidence, and any
unresolved blockers. Plan files remain authoritative across sessions.
