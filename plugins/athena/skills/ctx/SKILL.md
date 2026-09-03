---
name: ctx
description: 'Compact the conversation while preserving the original plans, user prompts, key changes, and todo tasks. Use --save to also write the preserved context to a markdown snapshot first.'
user-invocable: true
disable-model-invocation: true
when_to_use: 'Invoke when the context needs compacting but plans, user prompts, key changes, and todos must survive.'
category: utilities
keywords: [compact, context, handoff, save]
argument-hint: '[--save]'
---

# Ctx

Arguments: <args>$ARGUMENTS</args>

Hands off to the built-in `/compact` with a fixed preservation instruction, and
optionally snapshots that context to markdown first.

Do not name this skill `compact` — a skill by that name shadows the built-in
`/compact`, so the handoff line below re-enters the skill instead of compacting.

## Steps

### 1. Save (only when `--save` is present)

Write `.athena/context/<YYMMDD-HHMM>-compacted-context.md` (create the directory if
missing; `.athena/` is gitignored) with exactly these sections, drawn from the
current conversation only — no invention, omit a section that has no content:

```markdown
# Context Snapshot — <YYYY-MM-DD HH:MM>

## Plans

<original plan paths and their outcome, constraints, non-goals, acceptance criteria>

## User Prompts

<each user request, verbatim, in order>

## Key Changes

<file path — what changed and why, one line each>

## Todo Tasks

<open items with status>
```

Keep it factual and compact. Report the written path.

### 2. Compact

The built-in `/compact` is user-typed; no tool, hook, or message can invoke it.
Queue it instead — the Stop hook types it at the prompt for this exact session
as soon as this turn ends:

```bash
"${CLAUDE_SKILL_DIR}/scripts/request-compact.sh"
```

The script reads `CLAUDE_CODE_SESSION_ID` from its own environment, so it can
only ever target the session it was run from. It exits non-zero when it cannot
find a tmux or iTerm2 pane to type into; in that case end your reply with the
exact line below as the last thing the user sees, so they can run it directly:

```text
/compact keep the original plans, user's prompts, key changes and todo tasks
```

## Rules

- `--save` only adds step 1; the compact instruction is identical either way.
- Never compact by summarizing in-chat instead — that does not free context.
- Do not read or edit project code for this skill.
