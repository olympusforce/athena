# Changelog

## 1.1.0 — unreleased

- `/athena:exec` testing is opt-in: pass `--test` (implied by `--tdd`). The `no-test` mode is removed; `--test` composes with any mode. The finalize report always states `tests: NOT RUN` when testing was skipped.
- Runtime task tracking is opt-in: pass `--tasks` to `/athena:plan` or `/athena:exec`. `/athena:plan` forwards `--tasks` / `--test` on handoff to exec.
- Legacy `--no-test` / `--no-tasks` are accepted and ignored. `/athena:ship` still runs tests unless `--skip-tests`.

## 1.0.0 — unreleased

- Initial marketplace release. Vendors athena-organic (see `SYNC_SOURCE.json` for the exact commit).
- Skills are namespaced `/athena:<name>`, agents `athena:<name>`.
- Always-on rules delivered by a SessionStart hook; `/athena:setup` writes them into `.claude/rules/`.
- Wires the `ctx` skill's Stop hook (`compact-on-stop.sh`), which the file-copy install never did.
