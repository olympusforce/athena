# Plan State: Files-First Model

Shared by every skill that creates, resolves, or mutates a plan (`plan`,
`issue-to-plan`, `exec`, and any other skill referencing this file).
This is the single description of where plan state lives — do not restate a
divergent copy in another skill; link here instead.

## Canonical state = repo files

- `.athena/plans/<timestamp>-<slug>/plan.md` plus `phase-NN-*.md` in the repo ARE the
  plan. Hand-editable Markdown, legacy-claudekit style. They are the
  deliverable of planning skills and the only thing implementation skills read
  to know what to build.
- A project with no GitHub remote, no `gh` auth, and no network still has a
  fully working plan — because the files are the plan.

## GitHub issue = optional visibility projection, never canonical

- Publishing is never required and never the source of truth. Skip it entirely
  in a repo with no GitHub remote, no `gh` auth, or when the user does not ask
  for it — the plan is still fully usable as files. When the user asks to publish
  but `gh`/GitHub auth is unavailable, skip without failing and report one line
  suggesting how to enable it (e.g. `gh auth login`).
- Publishing never overwrites the body of a pre-existing issue a plan was
  created from (e.g. via `issue-to-plan`); it only adds links, comments, or
  labels.
- If the index and a linked issue ever disagree on status, the local files
  (and the index rebuilt from them) win. The issue is a mirror, not a lock.
