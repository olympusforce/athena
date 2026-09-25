---
name: ship
description: 'Ship pipeline: merge main, test, review, commit, push, PR. Single command from feature branch to PR URL. Use for shipping official releases to main/master or beta releases to dev/beta branches.'
user-invocable: true
when_to_use: 'Invoke when a completed branch needs PR shipping workflow.'
category: dev-tools
keywords: [ship, PR, merge, push, release]
argument-hint: '[official|beta] [--skip-tests] [--skip-review|--skip-code-review] [--journal] [--skip-docs] [--social] [--yes-post] [--yes-post-private] [--dry-run] [--recommended]'
---

# Ship: Unified Ship Pipeline

Single command to ship a feature branch. Fully automated — only stops for test failures, critical review issues, or major version bumps.

**Inspired by:** gstack `/athena:ship` by Garry Tan. Adapted for framework-agnostic, multi-language support.

## Arguments

| Flag                 | Effect                                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `official`           | Ship to default branch (main/master). Full pipeline with docs + journal                                                                                                                                  |
| `beta`               | Ship to dev/beta branch. Lighter pipeline, skip docs update                                                                                                                                              |
| (none)               | Auto-detect: if base branch is main/master → official, else → beta                                                                                                                                       |
| `--skip-tests`       | Skip test step (use when tests already passed)                                                                                                                                                           |
| `--skip-review`      | Skip pre-landing review step. `--skip-code-review` is accepted as an alias                                                                                                                               |
| `--journal`          | Run the journal writing step (default: skipped; also honors `journal.auto=true` config preference)                                                                                                       |
| `--skip-docs`        | Skip docs update step                                                                                                                                                                                    |
| `--social`           | Opt-in: after the PR is created, compose a build-in-public journal draft and publish it to social channels (see "Build-in-public publishing" below). Off by default — never fires on a plain `/athena:ship`. |
| `--yes-post`         | Required alongside `--social` to actually publish. Without it, the social step runs in dry-run mode: renders and prints the per-channel posts, makes no API call, exits 0.                               |
| `--yes-post-private` | Required alongside `--social --yes-post` when the repo is private — an explicit second opt-in for posting about non-public work.                                                                         |
| `--dry-run`          | Show what would happen without executing                                                                                                                                                                 |

## Ship Mode Detection

```
If argument = "official" → target = main/master (auto-detect default branch)
If argument = "beta"     → target = dev/beta (auto-detect dev branch)
If no argument           → infer from current branch naming:
  - feature/* hotfix/* bugfix/* → official (target main)
  - dev/* beta/* experiment/*  → beta (target dev/beta)
  - unclear                    → ask_user capability
```

## When to Stop (blocking)

- On target branch already → abort
- Merge conflicts that can't be auto-resolved → stop, show conflicts
- Test failures → stop, show failures
- Critical review issues → ask_user capability per issue
- Major/minor version bump needed → ask_user capability

## When NOT to Stop

- Uncommitted changes → always include them
- Patch version bump → auto-decide
- Changelog content → auto-generate
- Commit message → auto-compose
- No version file → skip version step silently
- No changelog → skip changelog step silently

## Pipeline

```
Step 1:  Pre-flight      → Branch check, mode detection, status, diff analysis
Step 2:  Link Issues      → Find/create related GitHub issues
Step 3:  Merge target     → Fetch + merge origin/<target-branch>
Step 4:  Run tests        → Auto-detect test runner, run, check results
Step 5:  Review           → Two-pass checklist review (critical + informational)
Step 6:  Version bump     → Auto-detect version file, bump patch/minor
Step 7:  Changelog        → Auto-generate from commits + diff
Step 8:  Journal          → Write technical journal via /journal (see the shared "Journal step — opt-in" contract: runs only with the --journal flag or journal.auto config)
Step 9:  Docs update      → Update project docs via /docs update (official only)
Step 9b: Finalize plan    → plan update --status completed (plan-backed; foreground, staged by Step 10)
Step 10: Commit           → Conventional commit with version/changelog
Step 11: Push             → git push -u origin <branch>
Step 12: Create PR        → gh pr create with structured body + linked issues
Step 12b: Link plan↔PR    → plan update --linked-pr <n> (plan-backed; no close until merge)
Step 13: Social publish   → if --social: build-in-public draft → journal create → post-social.cjs (see below)
```

**Detailed steps:** Load `references/ship-workflow.md`
**Auto-detection:** Load `references/auto-detect.md`
**PR template:** Load `references/pr-template.md`

## Writing language + PR body (#1195)

Before Step 12, resolve language with
`WL_BIN=.claude/hooks/lib/writing-language.cjs
test -f "$WL_BIN" || WL_BIN=kits/core/hooks/lib/writing-language.cjs
node "$WL_BIN" --json` and author the PR body in
that language. Titles stay English conventional commits. The body must include
the seven evidence sections (plus Linked Issues / Ship Mode). Prefer honest
`None` / `Not run` / `Unavailable` over invented narrative.

## Build-in-public publishing (`--social`)

Guardrails (never bypassed by any flag):

- **CI must be green.** If the PR's checks are failing, the step refuses to
  post and explains why — the ship itself still completed.
- **Step 13 writes its own journal record** via `journal create` — a social
  post always traces back to a durable entry, independently of the Step 8
  opt-in. `--social` is an explicit user choice, distinct from the automatic
  per-ship journal (Step 8).
- **Collaborator-only signal.** Only PR review comments from
  `COLLABORATOR`/`MEMBER`/`OWNER` associations feed the draft's "The tricky
  bit" section — outside commenters are never quoted into a public post.
- **Dry-run by default.** Without `--yes-post`, the step renders every
  channel's post and stops — no API call. Re-run with `--social --yes-post`
  to actually publish.
- **Private-repo confirmation.** If the repository is private, `--social
--yes-post` alone still refuses; add `--yes-post-private` too.

Full step-by-step commands: `references/ship-workflow.md` (Step 13).

## Token Efficiency Rules

- Steps 4 (tests) and 5 (review): delegate to `tester` and `code-reviewer` subagents — don't inline
- Steps 8 (journal) and 9 (docs): run in **background** — don't block pipeline
- Step 2 (issues): use single `gh` command batch — avoid multiple API calls
- Skip steps early via flags to save tokens on unnecessary work
- Beta mode auto-skips: docs update (Step 9)
- Capture step outputs inline — don't re-read files already in context

## Quick Start

User says `/athena:ship` → run full pipeline → output PR URL.
User says `/athena:ship beta` → ship to dev branch with lighter pipeline.
User says `/athena:ship official` → ship to main with full docs + journal.

## Output Format

```
✓ Pre-flight: branch feature/foo, 5 commits, +200/-50 lines (mode: official)
✓ Issues: linked #42, created #43
✓ Merged: origin/main (up to date)
✓ Tests: 42 passed, 0 failed
✓ Review: 0 critical, 2 informational
✓ Version: 1.2.3 → 1.2.4
✓ Changelog: updated
✓ Journal: written (background) / skipped (opt-in via --journal or journal.auto)
✓ Docs: updated (background)
✓ Committed: feat(auth): add OAuth2 login flow
✓ Pushed: origin/feature/foo
✓ PR: https://github.com/org/repo/pull/123 (linked: #42, #43)
```

## Important Rules

- **Never skip tests** (unless `--skip-tests`). If tests fail, stop.
- **Never force push.** Regular `git push` only.
- **Never ask for confirmation** except for critical review issues and major/minor version bumps.
- **Auto-detect everything.** Test runner, version file, changelog format, target branch — detect from project files.
- **Framework-agnostic.** Works for Node, Python, Rust, Go, Ruby, Java, or any project with a test command.
- **Subagent delegation.** Use `tester` for tests, `code-reviewer` for review, `journal-writer` for journal, `docs-manager` for docs. Don't inline.
- **Background tasks.** Journal and docs run in background to not block the pipeline.

## Workflow Position

**Typically follows:** `/athena:code-review` (ship after review passes)
**Typically precedes:** `/athena:journal` (document after shipping)
**Related:** `/athena:code-review` (review before shipping), `/test` (test before shipping)
