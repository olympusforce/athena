# Doc Content Rules

Load this file before generating or updating documentation. Include the
relevant ownership, drift-resistance, and authority rules in every docs-manager
delegate prompt because delegated contexts are isolated.

Root agent context files (`CLAUDE.md`/`AGENTS.md`) are process memory, not
WHY/WHERE docs; follow `agent-context-rules.md` for those. This file's deletion
test and drift-resistance rules are the shared spine both operations rely on.

## Ownership Rule

Code owns WHAT and HOW. Docs own only WHY and WHERE.

- WHY: decisions, rejected alternatives, trade-offs, business rules, domain
  terminology, and constraints code cannot express.
- WHERE: navigation to entry points, module boundaries, and executable owners.

Never write prose that re-describes implementation behavior. It creates a
second source of truth that is not executable or testable. Point to source,
tests, schemas, manifests, generators, or workflows instead.

## The Deletion Test

For every sentence, ask:

1. If an agent read the executable owner, would it learn this anyway? If yes,
   delete the sentence or replace it with a pointer.
2. If the team vanished, could this rationale, constraint, or terminology be
   recovered from the repository? If no, keep and clarify it.

## Drift-Resistance Rules

1. Point, do not paraphrase. Prefer a stable path plus symbol or named heading.
2. Never copy code, signatures, config bodies, mutable inventories, or command
   output into prose. An example may remain only when it teaches a decision.
3. Do not hand-maintain counts, percentages, LOC tables, file trees, or support
   matrices. Link to their machine owner or provide the command that discovers
   them.
4. Distill current rationale into the repository's canonical decision surface.
   Remove obsolete or superseded prose; Git history preserves the long form.
5. Every current claim must be either mechanically checkable or a durable
   decision/domain fact. A claim falsifiable by an implementation rename needs
   an executable owner, not a rewritten paragraph.
6. If review exposes an unwritten rejection rule, record it once in the
   canonical review or engineering-rules surface.
7. Do not create ADRs, changelog entries, roadmaps, generators, bots, or
   docs-only gates unless the user or repository contract explicitly requires
   that operating surface.

## Repository-Specific Authority

Do not impose stable filenames across projects. Discover authority from
repository instructions, the root README, and existing docs navigation. Choose
the smallest set of real information boundaries.

When the repository designates them:

- the root collaborator guide owns safety-critical invariants and navigation;
- a reviewer playbook owns judgment calls, hard rejections, and historical
  scars;
- code standards own engineering choices, testing policy, naming, quality, and
  contribution constraints;
- system architecture owns current boundaries and a compact decision ledger;
- a project overview owns product intent, non-goals, terminology, and business
  constraints;
- a codebase summary is navigation only, never per-file description;
- operational guides own provider quirks and runbooks not expressible in code.

Keep glossary and navigation separate and thin only when they are genuinely
needed. Do not create placeholders to complete a template.

## Sizing

WHY docs are naturally short. A short honest navigation or rationale document
is better than implementation paraphrase. Split only at real semantic
boundaries and never pad.
