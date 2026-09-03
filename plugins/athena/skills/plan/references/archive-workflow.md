# Archive Workflow

## Your mission

Read and analyze the plans, then write journal entries and archive specific plans or all plans in the `plans` directory.

## Plan Resolution

1. If `$ARGUMENTS` provided → Use that path
2. Else read all plans in the `plans` directory

## Workflow

### Step 1: Read Plan Files

Read the plan directory:

- `plan.md` - Overview and phases list
- `phase-*.md` - 20 first lines of each phase file to understand the progress and status

### Step 2: Summarize the plans and document them with `/athena:journal` skill invocation

Respect the shared "Journal step — opt-in" contract before prompting. Skip the
entire journal sub-step silently — do NOT ask — unless this applies:

- The invocation includes the `--journal` flag.

Precedence: flag > project config > user config > default (`false`). When
skipped, print one line and jump to Step 3:

- `journal skipped by default` (no `--journal` flag), or
- `journal skipped by preference` (config).

Otherwise, use `ask_user capability` tool to ask if user wants to document journal entries or not.
Skip this step if user selects "No".
If user selects "Yes":

- Analyze the information in previous steps.
- Use delegate_agent capability with `subagent_type="athena:journal-writer"` in parallel to document all plans.
- Journal entries should be concise and focused on the most important events, key changes, impacts, and decisions.
- Keep journal entries in the `./.athena/plans/journals/` directory.
- Treat journals as chronological work records; move durable rules to current
  docs or ADRs.

### Step 3: Ask user to confirm the action before archiving these plans

Use `ask_user capability` tool to ask if user wants to proceed with archiving these plans, select specific plans to archive or all completed plans only.

Archiving is an **index-visibility change, not file deletion**. The plan `.md`
files are canonical repo history and stay on disk. Do NOT offer, and never run, a
`rm -rf`/permanent-delete of a plan folder — that discards versioned history and
is exactly the "stale plan read as false context" harm this workflow avoids.

### Step 4: Archive the plans

Archive by changing index visibility, never by touching files:

- These mark the plan closed/archived in the rebuildable index. They do NOT move
  or delete the `plan.md`/`phase-*.md` files.
- Physically removing a plan folder is a separate, explicit user action only,
  and only after the plan is closed/archived in the index, journaled, and its
  files are committed. The user runs `git rm -r ./.athena/plans/<plan-dir>` themselves —
  `git rm` refuses untracked paths and preserves history for tracked ones, so it
  cannot silently destroy uncommitted work. Never fall back to `rm -rf`: if
  `.athena/plans/` is gitignored in the consuming repo, deletion is unrecoverable. Never
  a skill default, never a broad-glob delete.

### Step 5: Ask if user wants to commit the changes

Use `ask_user capability` tool to ask if user wants to commit the changes with these options:

- Stage and commit the changes (Use `/athena:git` for commit flow)
- Commit and push the changes (Use `/athena:git` for push flow)
- Nah, I'll do it later

## Output

After archiving the plans, provide summary:

- Number of plans archived (index visibility only; files kept on disk)
- Table of plans that are archived (title, status, created date, LOC)
- Table of journal entries that are created (title, status, created date, LOC)

## Important Notes

- Only ask questions about genuine decision points
- Sacrifice grammar for concision
- List any unresolved questions at the end
- Ensure token efficiency while maintaining high quality
