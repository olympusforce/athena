# Init Workflow

Use this workflow to establish project documentation without imposing a
template inherited from Athena. Read `references/doc-content-rules.md` before
authoring or delegating document changes.

## 1. Brainstorm the docs contract

Run the opening gate from the parent skill. Capture audience, intended
decisions, authority, evidence, scope, and acceptance criteria.

## 2. Inspect the project

- Read repository instructions and the root README first.
- Discover existing docs, plans, generated references, and navigation with
  repository search tools.
- Scout the relevant source and tests. Skip credentials, caches, dependencies,
  generated bundles, and unrelated external trees.
- Extract entry points, boundaries, decisions, alternatives, domain rules, and
  cross-file constraints without copying mutable implementation details.
- Identify which information is evergreen and which is a stateful record.

## 3. Design the smallest useful route

Choose files by information role, not by a preset filename list. A small
project may need one routed document. A larger project may separate product
intent, current decisions, workflow, architecture, machine contracts, and
operations when those boundaries are real.

- Reuse an existing route when it is coherent.
- Add an index only when multiple documents need navigation.
- Do not create empty placeholders, speculative roadmaps, or an ADR collection
  merely to complete a template.
- Keep machine-owned inventories in a manifest or generator output and link to
  that owner from prose.

Present the proposed route before writing when it would replace existing docs
or materially change authority.

## 4. Author with evidence

Use `docs-manager` through the runtime's delegation capability when available;
otherwise perform the same evidence-first work locally. Pass the brainstormed
contract, discovered routes, evidence map, exact files to retain, replace, or
remove, and relevant rules from `references/doc-content-rules.md`.

If the project has little discoverable WHY, write short docs. Never pad with
implementation paraphrases.

## 5. Validate

- Verify internal links and referenced paths.
- Run examples or owning scripts where practical.
- Confirm current claims against source, tests, artifacts, or live state.
- Check that no fixed inventory or copied command sequence gained a second
  maintenance owner.
- Report created, changed, retained, and removed authority surfaces.
