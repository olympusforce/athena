# Documentation Impact Routing

Use this file when another workflow must decide whether docs are affected. For
full operations, invoke `/athena:docs init`, `/athena:docs update`, `/athena:docs summarize`,
or `/athena:docs agent-context` (root `CLAUDE.md`/`AGENTS.md`).

## Update docs when a change affects

- user-visible behavior, setup, commands, or configuration;
- architecture, data flow, public contracts, security, or recovery;
- machine-readable contracts or generated reference output;
- an accepted maintainer decision that future work must not rediscover.

Do not add documentation churn for internal edits whose observable contract did
not change. Docs own WHY and WHERE; current WHAT and HOW must point to an
executable owner. If a review exposes an unwritten rejection criterion, record
it once in the repository's canonical review or standards surface.

## Discover the target

Read repository instructions, the root README, and the project's existing docs
navigation. Search current docs for the changed concept. Do not route by a
universal filename list.

Update the smallest authority surface. If a command, inventory, matrix, or
generated output already has a machine owner, update that owner and have prose
link to it rather than copying the details.

## Evidence and state

- Evergreen docs describe durable intent and operating contracts.
- Source, tests, manifests, generated output, artifacts, and live services prove
  current behavior.
- Plans, reports, audits, and release records are stateful evidence, not product
  authority.

Before updating a document, read it. After updating, verify links and claims
against the owning evidence. Remove stale or duplicate text rather than adding
another reconciliation layer.

## Cross-skill handoffs

- `/athena:exec` and `/athena:fix`: update docs during finalize only when the impact
  criteria above apply.
- The installed planning skill reads routed project context before creating an
  execution plan.
- `/athena:preview`: keep temporary visuals with the active plan; link them from
  evergreen docs only when they remain useful.
- `/tech-graph`: use for publish-grade diagrams when a visual materially
  improves the document.
- Any skill editing `.athena/docs/` applies `references/doc-content-rules.md`.
