# Changelog

## 1.4.0 — unreleased

- **Default change:** `/athena:exec` and `/athena:fix` no longer run code review by default. Pass `--code-review` to run it; `--skip-code-review` is accepted as a no-op. Finalize prints `code review: NOT RUN`. `/athena:ship` still reviews unless `--skip-review`.
- `--recommended` (any athena skill): the model takes its recommended answer to each clarification question instead of asking, and logs every choice to `decisions.md` in the plan dir (or `.athena/plans/reports/decisions-*.md`). It still asks before irreversible or outward-facing actions, credentials, or questions with no defensible default. Defined by the new always-on `recommended-answers` rule.

## 1.3.0 — unreleased

- Update notice: at startup, when a newer athena is published, a one-line message shows the update commands and the CHANGELOG link. Checked at most once per 24h (cached), 2s timeout, silent offline or on error. Opt out with `ATHENA_NO_UPDATE_CHECK=1`.

## 1.2.0 — 2026-09-25

- `/athena:git --watch`: after `cp` / `pr`, or on an existing PR (`#N`, `PR N`, URL), watch the PR until CI is green and the project's review gates approve. Gates are discovered from project rules, branch rules, the PR, and repo config — no bot is hardcoded. Read-only; stops and reports on failure.
- `/athena:git --no-ai` (default) / `--ai-signature`: commit messages, PR titles, and PR bodies carry no AI signatures unless `--ai-signature` is passed; a verification grep blocks the write on a hit.

## 1.1.0 — 2026-09-25 (untagged; first tagged in 1.2.0)

- `/athena:exec` testing is opt-in: pass `--test` (implied by `--tdd`). The `no-test` mode is removed; `--test` composes with any mode. The finalize report always states `tests: NOT RUN` when testing was skipped.
- Runtime task tracking is opt-in: pass `--tasks` to `/athena:plan` or `/athena:exec`. `/athena:plan` forwards `--tasks` / `--test` on handoff to exec.
- Legacy `--no-test` / `--no-tasks` are accepted and ignored. `/athena:ship` still runs tests unless `--skip-tests`.

## 1.0.0 — unreleased

- Initial marketplace release. Vendors athena-organic (see `SYNC_SOURCE.json` for the exact commit).
- Skills are namespaced `/athena:<name>`, agents `athena:<name>`.
- Always-on rules delivered by a SessionStart hook; `/athena:setup` writes them into `.claude/rules/`.
- Wires the `ctx` skill's Stop hook (`compact-on-stop.sh`), which the file-copy install never did.
