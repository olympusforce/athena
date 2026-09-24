# Commit Workflow

Execute via `git-manager` subagent.

## Tool 1: Stage + Analyze

```bash
git add -A && \
echo "=== STAGED ===" && git diff --cached --stat && \
echo "=== SECURITY ===" && \
git diff --cached | grep -c -iE "(api[_-]?key|token|password|secret|credential)" | awk '{print "SECRETS:"$1}' && \
echo "=== GROUPS ===" && \
git diff --cached --name-only | awk -F'/' '{
  if ($0 ~ /\.(md|txt)$/) print "docs:"$0
  else if ($0 ~ /test|spec/) print "test:"$0
  else if ($0 ~ /\.claude/) print "config:"$0
  else if ($0 ~ /package\.json|lock/) print "deps:"$0
  else print "code:"$0
}'
```

**If SECRETS > 0:** STOP, show matches, block commit.

## Tool 2: Split Decision

NOTE:

- Search for related issues on GitHub and add to body.
- Only use `feat`, `fix`, or `perf` prefixes for files in `.claude` directory (do not use `docs`).

**From groups, decide:**

**A) Single commit:** Same type/scope, FILES ≤ 3, LINES ≤ 50

**B) Multi commit:** Mixed types/scopes, group by:

- Group 1: `config:` → `chore(config): ...`
- Group 2: `deps:` → `chore(deps): ...`
- Group 3: `test:` → `test: ...`
- Group 4: `code:` → `feat|fix: ...`
- Group 5: `docs:` → `docs: ...`

## Tool 3: Commit

**AI signatures:** with `--no-ai` (default), strip AI artifacts from each
message and run the verification grep in `commit-standards.md`; a hit blocks
the commit. With `--ai-signature`, keep the runtime's normal attribution.

**Single:**

```bash
git commit -m "type(scope): description"
```

**Multi (sequential):**

```bash
git reset && git add file1 file2 && git commit -m "type(scope): desc"
```

Repeat for each group.

## Tool 4: Push (if requested)

```bash
git push && echo "✓ pushed: yes" || echo "✓ pushed: no"
```

**Only push if user explicitly requested** ("push", "commit and push").

With `--watch` (`cp`): return the pushed branch; the invoking session (not `git-manager`) continues with `workflow-watch.md`.
