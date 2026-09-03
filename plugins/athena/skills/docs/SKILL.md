---
name: docs
description: 'Analyze a codebase and create, refresh, summarize, or audit project documentation without imposing a fixed docs layout, including authoring and optimizing the root CLAUDE.md/AGENTS.md agent context file.'
user-invocable: true
when_to_use: 'Invoke to create, refresh, summarize, or audit project documentation, or to author or optimize the root CLAUDE.md/AGENTS.md agent context file.'
category: utilities
keywords: [documentation, init, update, summarize, audit, agent-context, claude-md, agents-md]
argument-hint: 'init|update|summarize|agent-context'
---

# Documentation Management

Maintain the smallest documentation set that lets people and AI collaborators
understand the project's intent, current contract, evidence, and operating
workflow.

## Philosophy

Code owns WHAT and HOW; docs own WHY and WHERE. Docs are a thin navigation
layer plus knowledge code cannot express: decisions, rejected alternatives,
business rules, domain terminology, and constraints. Point to executable owners
instead of paraphrasing behavior. Load `references/doc-content-rules.md` for any
doc-writing operation and include its relevant rules in delegated context.

A root agent context file (`CLAUDE.md`/`AGENTS.md`) is a distinct artifact
class: process memory that owns imperative HOW-TO-BEHAVE, not WHY/WHERE. It
follows `references/agent-context-rules.md`, which shares this skill's
deletion-test spine but keeps its own keep-or-cut filter and enforcement rules.

## Opening Gate

Start with a bounded brainstorm. Establish:

- who consumes the docs: people, AI, or both;
- the outcome and decisions the docs must make possible;
- which sources prove current behavior;
- what is evergreen guidance versus stateful evidence;
- the acceptance criteria for this docs operation.

Reuse an accepted plan or prior brainstorm when it already answers these
questions. Do not reopen settled intent without new evidence.

## Routing

Parse the first word of `$ARGUMENTS`:

| Input            | Load                                | Purpose                                                                        |
| ---------------- | ----------------------------------- | ------------------------------------------------------------------------------ |
| `init`           | `references/init-workflow.md`       | Establish a minimal project-specific docs route                                |
| `update`         | `references/update-workflow.md`     | Reconcile impacted docs with current evidence                                  |
| `summarize`      | `references/summarize-workflow.md`  | Summarize current evidence without forcing a new file                          |
| `agent-context`  | `references/agent-context-rules.md` | Author, audit, or optimize the root `CLAUDE.md`/`AGENTS.md` agent context file |
| empty or unclear | ask the user                        | Choose the operation; never assume `init`                                      |

Other workflows deciding whether docs are affected should load
`references/documentation-management.md`.

## Flags

Composable with any operation:

- `--advice` — before writing or updating any doc or agent context file, spawn
  `athena` for counsel on what to keep, cut, or restructure, and factor it into
  the change. `athena` advises only; this skill stays responsible for every
  edit and still confirms writes with the user. Spawn it again when stuck or
  before an irreversible docs change.
- `--audit` — for `agent-context`: first get a `athena` audit pass over the
  current `CLAUDE.md`/`AGENTS.md`, then interview the user one question at a time
  (one keep / cut / fix decision per question) using the keep-or-cut filter in
  `references/agent-context-rules.md`. Apply only the confirmed changes.

## Discovery Contract

Do not assume filenames, a file count, or a universal documentation tree.
Discover the project's contract in this order:

1. repository instructions such as `AGENTS.md` or `CLAUDE.md`;
2. the root `README.md`;
3. the project's docs index or navigation file, when present;
4. existing files under `.athena/docs/` and links from the earlier routes;
5. source, tests, scripts, generated artifacts, and live state that prove claims.

Use `.athena/docs/` for project documentation when that is the repository convention.
Treat source and tests as evidence, not prose that must be copied into every
document.

## Maintenance Rules

- Update only documents whose contract or evidence changed.
- Delete stale or duplicate guidance instead of preserving it for history.
- Link to the owning script, manifest, or generated source instead of copying
  command lists, inventories, or exact test names into multiple files.
- Keep evergreen guidance free of dates, issue IDs, phase labels, and section
  coordinates unless those values are the subject of the contract.
- Keep stateful research, plans, audit results, and release evidence clearly
  labeled and outside the evergreen authority path.
- Do not create an ADR, governance layer, generator, or docs-only CI gate unless
  the user explicitly requests that additional operating surface.
- Verify every path, command, configuration key, and behavioral claim against
  current evidence.

For diagrams, use the installed diagram skill only when a visual materially
improves understanding, then visually review the output.

**Do not implement product code during a documentation operation.**
