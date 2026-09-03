---
name: journal
description: 'Write chronological technical journals for session reflection and change analysis. Journals preserve work history; they do not replace current docs or ADRs.'
user-invocable: true
when_to_use: 'Invoke for technical session reflection or chronological work records.'
category: utilities
keywords: [journal, reflection, changes, session]
argument-hint: '[topic or reflection]'
---

# Journal

Capture a concise technical journal for the current session, then persist it with the first-class CLI.

Journals are work history under `<project>/.athena/plans/journals/`. They are not durable product or decision authority — record lasting decisions in the project's ADR or current docs owner.

## Workflow

1. Gather the important events: root cause, key changes, impacts, decisions, and next steps.
2. Draft a short title and body (markdown). Prefer concrete errors, paths, and outcomes over vague summaries.
3. Persist with the content by following:

```md
/athena:journal create "<title>" --summary "<one-line summary>" --stdin <<'EOF'
## What happened
...

## Decision
...

## Next steps
...
EOF
```

Optional flags: `--date YYYY-MM-DD`, `--project <registry-name>`.

4. Validate when needed:

```md
/athena:journal validate <slug-or-filename-stem>
```

5. AgentWiki publish from this skill is **deferred**. Report `AgentWiki publish skipped` and keep the local file as the source of truth.

6. Browse existing entries with `journal list` / `journal show <slug>`, or the Journals page in desktop/dashboard.

**Optional:** Invoke the `journal-writer` subagent when emotional honesty and failure archaeology are the point of the entry; still persist through `journal create`.

## Naming

Created files use `YYYY-MM-DD-<slug>.md` with `-2`, `-3`, … collision suffixes.

## Workflow Position

**Typically follows:** `ship` (journal after shipping), `/athena:exec` (journal after implementation), `/athena:fix` (journal after bug fix)
**Terminal skill** — no typical successor.

## Journal step — opt-in

## Automatic vs explicit invocation

Explicit `/athena:journal` is always available and are
unaffected by any preference or flag.

The **automatic** journal step at the end of the `plan`, `/athena:exec`,
`/athena:fix`, `ship`, and `bootstrap` skills honors:

- The `--journal` flag on the invoking skill (default: `false`).

Precedence when a workflow decides whether to run the automatic step: flag >
project config > user config > default (`false`). When the automatic step is
skipped, workflows print one line so the intent stays visible in output:

- `journal skipped by default` (no `--journal` flag), or
- `journal skipped by preference` (config).
