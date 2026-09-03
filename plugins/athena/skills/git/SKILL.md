---
name: git
description: 'Git operations with conventional commits. Use for staging, committing, pushing, PRs, merges, stacked PRs. Auto-splits commits by type/scope. Security scans for secrets.'
user-invocable: true
when_to_use: 'Invoke for commits, PRs, stacked PRs, branch hygiene, or release git steps.'
category: dev-tools
keywords: [git, commits, staging, PR, merge, merge-pr, stack, stacked-prs, ci]
argument-hint: 'cm|cp|pr|merge|merge-pr|stack [args]'
---

# Git Operations

## Default (No Arguments)

If invoked without arguments, use `ask_user capability` to present available git operations:

| Operation  | Description                                  |
| ---------- | -------------------------------------------- |
| `cm`       | Stage files & create commits                 |
| `cp`       | Stage files, create commits and push         |
| `pr`       | Create Pull Request                          |
| `merge`    | Merge branches                               |
| `merge-pr` | Merge a GitHub PR + watch CI to green        |
| `stack`    | Drive GitHub native Stacked PRs (`gh stack`) |

Present as options via `ask_user capability` with header "Git Operation", question "What would you like to do?".

Execute git workflows via `git-manager` subagent to isolate verbose output.
Activate `context-engineering` skill.

**IMPORTANT:**

- Sacrifice grammar for the sake of concision.
- Ensure token efficiency while maintaining high quality.
- Pass these rules to subagents.

## Arguments

- `cm`: Stage files & create commits
- `cp`: Stage files, create commits and push
- `pr`: Create Pull Request [to-branch] [from-branch]
  - `to-branch`: Target branch (default: main)
  - `from-branch`: Source branch (default: current branch)
- `merge`: Merge [to-branch] [from-branch]
  - `to-branch`: Target branch (default: main)
  - `from-branch`: Source branch (default: current branch)
- `merge-pr`: Merge PR [pr-ref] via `gh`, then watch post-merge CI until green and verify
  - `pr-ref`: PR number or URL (required)
  - Readiness-gated: refuses on conflicts, red CI, or `CHANGES_REQUESTED`; uses `--auto` when checks are pending
- `stack`: Drive GitHub native Stacked PRs through the `gh stack` extension
  - Lifecycle: `init` → `add` → `submit --auto` → `sync`/`rebase` → `merge`
  - Guardrail: history-rewriting and multi-PR merge steps are user-gated; force-push stays scoped to stack branches
  - See `references/workflow-stacked-prs.md` for the full command surface and exit-code stop conditions

## Quick Reference

| Task         | Reference                            |
| ------------ | ------------------------------------ |
| Commit       | `references/workflow-commit.md`      |
| Push         | `references/workflow-push.md`        |
| Pull Request | `references/workflow-pr.md`          |
| Merge        | `references/workflow-merge.md`       |
| Merge PR     | `references/workflow-merge-pr.md`    |
| Stacked PRs  | `references/workflow-stacked-prs.md` |
| Standards    | `references/commit-standards.md`     |
| Safety       | `references/safety-protocols.md`     |
| Branches     | `references/branch-management.md`    |
| GitHub CLI   | `references/gh-cli-guide.md`         |

## Core Workflow

### Step 1: Stage + Analyze

```bash
git add -A && git diff --cached --stat && git diff --cached --name-only
```

### Step 2: Security Check

Scan for secrets before commit:

```bash
git diff --cached | grep -iE "(api[_-]?key|token|password|secret|credential)"
```

**If secrets found:** STOP, warn user, suggest `.gitignore`.

### Step 3: Split Decision

**NOTE:**

- Search for related issues on GitHub and add to body.
- Only use `feat`, `fix`, or `perf` prefixes for files in `.claude` directory (do not use `docs`).

**Split commits if:**

- Different types mixed (feat + fix, code + docs)
- Multiple scopes (auth + payments)
- Config/deps + code mixed
- FILES > 10 unrelated

**Single commit if:**

- Same type/scope, FILES ≤ 3, LINES ≤ 50

### Step 4: Commit

```bash
git commit -m "type(scope): description"
```

## Output Format

```
✓ staged: N files (+X/-Y lines)
✓ security: passed
✓ commit: HASH type(scope): description
✓ pushed: yes/no
```

## Error Handling

| Error            | Action                      |
| ---------------- | --------------------------- |
| Secrets detected | Block commit, show files    |
| No changes       | Exit cleanly                |
| Push rejected    | Suggest `git pull --rebase` |
| Merge conflicts  | Suggest manual resolution   |

## References

- `references/workflow-commit.md` - Commit workflow with split logic
- `references/workflow-push.md` - Push workflow with error handling
- `references/workflow-pr.md` - PR creation with remote diff analysis
- `references/workflow-merge.md` - Branch merge workflow
- `references/workflow-merge-pr.md` - PR merge with post-merge CI watch and verification
- `references/workflow-stacked-prs.md` - GitHub native Stacked PRs via `gh stack` (lifecycle + safety)
- `references/commit-standards.md` - Conventional commit format rules
- `references/safety-protocols.md` - Secret detection, branch protection
- `references/branch-management.md` - Naming, lifecycle, strategies
- `references/gh-cli-guide.md` - GitHub CLI commands reference
