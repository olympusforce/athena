# Ship Workflow — Detailed Steps

## Step 1: Pre-flight

1. Check current branch: `git branch --show-current`
   - If on target branch (main/master/dev): **ABORT** — "Ship from a feature branch, not the target branch."
2. Determine ship mode from arguments:
   - `official` → target = auto-detect default branch (main/master)
   - `beta` → target = auto-detect dev branch (dev/beta/develop)
   - No argument → infer from branch name:
     - `feat/* hotfix/* fix/*` → official
     - `dev/* beta/* experiment/*` → beta
     - Unclear → `ask_user capability` with options: "Official (main)", "Beta (dev)"
3. Auto-detect target branch:
   ```bash
   # For official: detect default branch
   git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's@^refs/remotes/origin/@@'
   # Fallback
   git rev-parse --verify origin/main 2>/dev/null && echo "main" || echo "master"

   # For beta: detect dev branch
   for b in dev beta develop; do
     git rev-parse --verify origin/$b 2>/dev/null && echo "$b" && break
   done
   ```
4. Run `git status` (never use `-uall`). Uncommitted changes are always included.
5. Run `git diff <target>...HEAD --stat` and `git log <target>..HEAD --oneline` to understand what's being shipped.
6. If `--dry-run`: output what would happen at each step and stop here.

## Step 2: Link Issues

Find or create related GitHub issues for traceability.

1. Search for related open issues by keywords from branch name and commit messages:

   ```bash
   # Extract keywords from branch name
   BRANCH=$(git branch --show-current)
   KEYWORDS=$(echo "$BRANCH" | sed 's/[^a-zA-Z0-9]/ /g' | tr '[:upper:]' '[:lower:]')

   # Search existing issues
   gh issue list --state open --limit 10 --search "$KEYWORDS"
   ```

2. Also check if any issues are referenced in commit messages:

   ```bash
   git log <target>..HEAD --oneline | grep -oE '#[0-9]+' | sort -u
   ```

3. **If related issues found:** Note issue numbers for PR linking.

4. **If NO related issues found:** Create a new issue with structured format:

   ```bash
   gh issue create --title "<type>: <summary from commits>" --body "$(cat <<'EOF'
   ## Problem Statement
   <infer from diff and commit messages>

   ## Proposal
   <summarize the implementation approach>

   ## How It Works
   <describe key changes with bullet points>

   ### Architecture
   ```

   <ASCII diagram of component interactions>
   ```

   ## Challenges
   - <potential edge cases or risks>

   ## Plan & Phases
   - [x] Implementation complete
   - [x] Tests passing
   - [ ] Code review approved
   - [ ] Merged to <target>

   ## Human Review Tasks
   - [ ] Verify business logic correctness
   - [ ] Check for edge cases not covered by tests
   - [ ] Validate UX/API contract changes (if any)
         EOF
         )"

   ```

   ```

5. Store issue numbers for Step 12 (PR creation).

## Step 3: Merge target branch

Fetch and merge so tests run against the merged state:

```bash
git fetch origin <target> && git merge origin/<target> --no-edit
```

- **If merge conflicts:** Try auto-resolve simple ones (lockfiles, version files). For complex conflicts, **STOP** and show them.
- **If already up to date:** Continue silently.

## Step 4: Run Tests

**Skip if:** `--skip-tests` flag.

1. Auto-detect test command (see `auto-detect.md`)
2. Delegate to `tester` subagent — don't inline test execution
3. Check pass/fail from agent result

- **If any test fails:** Show failures and **STOP**. Do not proceed.
- **If all pass:** Note counts briefly and continue.
- **If no test runner detected:** Use `ask_user capability` — "No test runner detected. Skip tests or provide command?"

## Step 5: Pre-Landing Review

**Skip if:** `--skip-review` or `--skip-code-review` flag.

1. Run `git diff origin/<target>` to get the full diff
2. Delegate to `code-reviewer` subagent with the diff
3. Two-pass model:
   - **Pass 1 (CRITICAL):** Security, injection, race conditions, auth bypass
   - **Pass 2 (INFORMATIONAL):** Dead code, magic numbers, test gaps, style

4. **Output findings:**

   ```
   Pre-Landing Review: N issues (X critical, Y informational)
   ```

5. **If critical issues found:** For EACH critical issue, use `ask_user capability`:
   - Problem description with `file:line`
   - Recommended fix
   - Options: A) Fix now (recommended), B) Acknowledge and ship, C) False positive — skip

6. **If user chose Fix (A):** Apply fixes, commit fixed files, then **re-run tests** (Step 4) before continuing.
7. **If only informational:** Include in PR body, continue.
8. **If no issues:** Output "No issues found." and continue.

## Step 6: Version Bump (conditional)

1. Auto-detect version source (see `auto-detect.md`)
2. If no version file found: **skip silently**
3. Auto-decide bump level from diff size:
   - **< 50 lines:** patch bump
   - **50+ lines:** patch bump (default safe choice)
   - **Major feature or breaking change:** Use `ask_user capability` — "This looks like a significant change. Bump minor or patch?"
4. For beta mode: use prerelease suffix (e.g., `1.2.4-beta.1`)
5. Write new version to detected file

## Step 7: Changelog (conditional)

1. Check for CHANGELOG.md or CHANGES.md
2. If not found: **skip silently**
3. Auto-generate entry from ALL commits on branch:
   - `git log <target>..HEAD --oneline` for commit list
   - `git diff <target>...HEAD` for full diff context
4. Categorize into: Added, Changed, Fixed, Removed
5. Insert after file header, dated today
6. Format: `## [X.Y.Z] - YYYY-MM-DD`

**Do NOT ask user to describe changes.** Infer from diff and commits.

## Step 8: Journal (background)

**Run only if:** the shared "Journal step — opt-in" applies — the `--journal`
flag was passed. Precedence: flag > project config > user config > default
(`false`). Otherwise print one line and continue to Step 9:

- `journal skipped by default` (no `--journal` flag), or
- `journal skipped by preference` (config).

Explicit `/athena:journal` is unaffected.

Write a technical journal entry capturing this ship session. Run as **background task** to not block pipeline.

1. Invoke `/athena:journal` skill via `journal-writer` subagent in background:
   - Topic: summary of shipped changes (from commit messages + diff stats)
   - Include: what was shipped, key decisions, technical challenges encountered
   - Output: saved to `./.athena/plans/journals/` directory
   - Authority: chronological work record only; durable decisions belong in
     current docs or ADRs
2. Don't wait for completion — continue to next step immediately.

## Step 9: Docs Update (conditional, background)

**Skip if:** `--skip-docs` flag OR ship mode is `beta`.

Update project documentation for official releases. Run as **background task**.

1. Invoke `/athena:docs update` skill via `docs-manager` subagent in background:
   - Analyzes code changes since last release
   - Updates relevant docs in `./.athena/docs/` directory
2. Don't wait for completion — continue to next step immediately.

## Step 9b: Finalize plan (foreground, plan-backed ships only)

Run **synchronously before Step 10** so the finalized plan files are staged by
the ship commit. Full protocol: the "Delivery finalization (close on ship)"
section of the shared files-first plan-state reference
(the `exec` skill's `references/plan-state-files-first.md`).

1. `/athena:plan resolve` for the current repo + branch. **No active plan → skip this
   step silently** (most ships carry no plan).
2. Verify checkboxes with `/athena:plan status`; if the diff proves a phase done,
   `/athena:plan check <phase-file>` it. If the work is genuinely partial, `/athena:plan
update <id> --status in-progress` and skip the completion below.
3. `/athena:plan update <id> --status completed` — rewrites `plan.md` front-matter
   `status:` (canonical) and the index in one op. Step 10's `git add -A` then
   commits the finalized plan files with the ship, so `status: completed` reaches
   the target branch in the same merge as the code.

Do **not** run `/athena:plan close` here — that is the merge flow's job (the index
stays `active` through the review window).

## Step 10: Commit

1. Stage all changes: `git add -A`
2. Security check: scan staged diff for secrets (API keys, tokens, passwords)
   - If secrets found: **STOP**, warn user, suggest `.gitignore`
3. Compose commit message:
   - Format: `type(scope): description`
   - Infer type from changes (feat/fix/refactor/chore)
   - If version + changelog present, include in same commit
4. Commit:

```bash
git commit -m "$(cat <<'EOF'
type(scope): description

Brief body describing the changes.
EOF
)"
```

## Step 11: Push

```bash
git push -u origin $(git branch --show-current)
```

- **Never force push.**
- If push rejected: suggest `git pull --rebase` and retry once.

## Step 12: Create PR

Check if `gh` CLI is available:

```bash
which gh 2>/dev/null || echo "MISSING"
```

If missing: output "Install GitHub CLI (gh) to auto-create PRs" and stop after push.

Render the **seven required sections** plus Linked Issues / Ship Mode in the
effective language. Keep the PR **title** English conventional-commit form.
Record language `source` / `fallbackReason` under Ship Mode.

**Link issues** collected from Step 2 using exact `Closes #N` / `Relates to #N`
keywords inside the Linked Issues section.

Create PR targeting the correct branch:

```bash
gh pr create --base <target-branch> --title "<type(scope): summary>" --body "$(cat <<'EOF'
<localized evidence-rich body from pr-template.md>
EOF
)"
```

Validate before finishing:

```bash
PR_BIN=.claude/hooks/lib/pr-body-contract.cjs
test -f "$PR_BIN" || PR_BIN=kits/core/hooks/lib/pr-body-contract.cjs
gh pr view --json body -q .body | node "$PR_BIN"
```

**Output the PR URL** — this is the final output the user sees.

If PR already exists for this branch, update it instead (same contract):

```bash
gh pr edit --title "<type(scope): summary>" --body "$(cat <<'EOF'
<localized evidence-rich body>
EOF
)"
```

## Step 12b: Record plan↔PR linkage (plan-backed ships only)

If Step 9b finalized a plan, record the PR number on it so the merge flow can
match plan to PR and close the index unambiguously:

```md
/athena:plan update <plan-id> --linked-pr <pr-number>
```

`--linked-pr` is index-only (it does not touch files). Skip silently when no
plan was finalized. Do not close the plan here — the index `close` happens only
after the PR merges (see the shared reference's "Delivery finalization" section).

## Step 13: Social publish (if `--social`)

**Skip this whole step if:** `--social` was not passed (byte-identical
behavior to today). This step persists its own journal record through
`journal create` (item 5 below), so it does not depend on the Step 8 opt-in.

1. **CI must be green before anything else.** Never post about a broken PR:

   ```bash
   gh pr checks <pr-number> --json state --jq '[.[] | select(.state != "SUCCESS" and .state != "SKIPPED" and .state != "NEUTRAL")] | length'
   ```

   A non-zero count means checks are pending/failing — print which ones and
   **stop this step** (the ship itself already completed at Step 12/12b;
   only the social publish is skipped).

2. **Private-repo confirmation.** A private repo needs an explicit second
   opt-in beyond `--social --yes-post`:

   ```bash
   IS_PRIVATE=$(gh repo view --json isPrivate --jq .isPrivate)
   ```

   If `"true"` and `--yes-post-private` was not passed: **refuse** with
   "repo is private — pass --yes-post-private to publish about it" and stop
   this step.

3. **Collaborator-only comment ingestion** (never quote outside commenters
   into a public post). Pull only `COLLABORATOR`/`MEMBER`/`OWNER` review
   bodies for the draft's "The tricky bit" section:

   ```bash
   gh api "repos/$OWNER/$REPO/pulls/<pr-number>/reviews" \
     --jq '.[] | select(.author_association == "COLLABORATOR" or .author_association == "MEMBER" or .author_association == "OWNER") | .body' \
     > /tmp/pr-collaborator-notes.md
   ```

4. **Compose the draft** (pure, no I/O besides the file writes below):
   Resolve the script installed-first, source-repo fallback:

   ```bash
   COMPOSE_BIN="${CLAUDE_PLUGIN_ROOT:-}/skills/ship/scripts/compose-build-in-public.cjs"
   test -f "$COMPOSE_BIN" || COMPOSE_BIN=$(ls -t "$HOME"/.claude/plugins/cache/*/athena/*/skills/ship/scripts/compose-build-in-public.cjs 2>/dev/null | head -1)
   test -n "$COMPOSE_BIN" && test -f "$COMPOSE_BIN" || COMPOSE_BIN="$HOME/.claude/skills/ship/scripts/compose-build-in-public.cjs"
   test -f "$COMPOSE_BIN" || COMPOSE_BIN=.claude/skills/ship/scripts/compose-build-in-public.cjs
   gh pr view <pr-number> --json body -q .body > /tmp/pr-body.md
   node "$COMPOSE_BIN" \
     --pr-title "<PR title>" \
     --pr-body-file /tmp/pr-body.md \
     --journal-blockers-file /tmp/pr-collaborator-notes.md \
     --writing-style "<resolved journal.writing_style, if any>" \
     --output /tmp/build-in-public-draft.md
   ```

5. **Persist through `/athena:journal create`** — every social post traces back
   to a durable journal entry:

   ```md
   journal create "$(head -1 /tmp/build-in-public-draft.md | sed 's/^# //')" \
     --summary "<one-line summary from the composer's --json output>" \
     --stdin < /tmp/build-in-public-draft.md
   ```
