# Watch PR Workflow (`--watch`)

Watch a PR until CI is green and every **required** gate the project uses is
satisfied. Read-only: never push, merge, dismiss reviews, or resolve threads.

Runs in the invoking session, not `git-manager` (long-running poll). Prefer the
runtime's background-wait facility; stop anything you started when done.

## Step 1: Resolve PR

| Invocation                              | PR ref                                                |
| --------------------------------------- | ----------------------------------------------------- |
| `#N`, `PR N`, PR URL                    | that ref                                              |
| `cp --watch`, `pr --watch`, compound    | the current branch (after `git-manager` returns)      |

```bash
PR=$(gh pr view "<ref-or-empty-for-current-branch>" --json number -q .number)
```

Use the numeric `$PR` everywhere below (GraphQL rejects `#N` / URLs).

- No PR for the branch → report `no PR for <branch>; run pr first` and stop.
- Require `gh auth status` and a GitHub remote; otherwise report
  `watch requires gh + GitHub` and stop.

## Step 2: Build the watch contract

Discover gates from project evidence, highest priority first. Never assume a
specific bot (CodeRabbit, SonarQube, … are only examples).

| Priority | Source                                                                      | Yields                                                        |
| -------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| 1        | Declared rules in `CLAUDE.md` / `AGENTS.md` / `CONTRIBUTING.md`             | Authoritative gates; override lower sources                   |
| 2        | Branch rules for the base branch                                            | Required status checks, required approvals, code-owner review |
| 3        | The PR itself                                                               | Actual check names; bot reviewers present (`*[bot]`)          |
| 4        | Repo config signals (`.coderabbit.yaml`, `sonar-project.properties`, `.sonarcloud.properties`, `.github/workflows/*`, …) | Bots **expected** to report |

```bash
BASE=$(gh pr view "$PR" --json baseRefName -q .baseRefName)
gh api "repos/{owner}/{repo}/rules/branches/$BASE"            # 2 (read access)
gh api "repos/{owner}/{repo}/branches/$BASE/protection"       # 2 fallback; 403/404 is fine
gh pr view "$PR" --json statusCheckRollup,latestReviews,reviewDecision,reviewRequests,headRefOid,state  # 3
```

`required` = yes for priority 1–2 gates and for bots from priority 3–4; a human
who merely commented is not a gate. Print the contract before watching:

```
gate                  | kind   | source           | required
CI / build            | check  | branch rules     | yes
coderabbitai[bot]     | review | .coderabbit.yaml | yes
human approvals (1)   | review | branch rules     | yes
```

## Step 3: Gate evaluation

- **Check gate** (check run or commit status, incl. quality gates): `SUCCESS`;
  `NEUTRAL`/`SKIPPED` only when not required.
- **Human approvals:** judge by `reviewDecision` (GitHub already applies
  stale-review dismissal): `APPROVED` when branch rules require approvals, and
  never `CHANGES_REQUESTED`.
- **Bot review gate:** latest review on the current `headRefOid` is `APPROVED`.
  - **Comment-only bot** (on the last 5 merged PRs it only ever `COMMENTED`):
    satisfied when it reviewed the current head **and** has no unresolved
    review threads.

```bash
gh pr list --state merged --limit 5 --json number
gh pr view <n> --json latestReviews
gh api graphql -f query='query($o:String!,$r:String!,$n:Int!){repository(owner:$o,name:$r){pullRequest(number:$n){reviewThreads(first:100){nodes{isResolved comments(first:1){nodes{author{login}}}}}}}}' -F o={owner} -F r={repo} -F n="$PR"
```

Success = every `required` gate satisfied.

## Step 4: Poll loop

1. No check gates in the contract → skip to review gates.
2. Until checks are registered (`statusCheckRollup` non-empty), poll every 60s
   — `gh pr checks` exits 1 on "no checks reported", which is NOT a failure.
3. Then: `gh pr checks "$PR" --watch --interval 60` (fallback:
   `statusCheckRollup` + `sleep 60`).
4. Re-evaluate review gates every 60s. If `headRefOid` changed (new push),
   restart evaluation against the new head.

Stateless: after an interruption, re-resolve the PR and re-evaluate.

## Step 5: Stop conditions

- All required gates satisfied → success
- A gate fails (red check, `CHANGES_REQUESTED`, unresolved bot finding)
- No checks registered within 15 min, or a check pending > 30 min (stall)
- An expected bot has not posted within 15 min of the head push (stall)
- Required human approval still missing after 30 min → report `waiting on
  human review` and stop (do not poll indefinitely)
- PR closed or merged

## Step 6: Report

```
✓ watch: <PR url> — N/N gates satisfied (<elapsed>)
✗ watch: <PR url> — blocked by <gate>
```

Include the final gate table. On failure add evidence: `gh run view <id>
--log-failed` tail (secrets redacted) or links to the bot's unresolved comments,
then `ask_user capability`: "Hand off to `/athena:fix`" / "Keep watching" / "Stop".
Never auto-fix or auto-merge (use `merge-pr` to merge).
