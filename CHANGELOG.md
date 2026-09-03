# Changelog

## 1.0.0 — unreleased

- Initial marketplace release. Vendors athena-organic (see `SYNC_SOURCE.json` for the exact commit).
- Skills are namespaced `/athena:<name>`, agents `athena:<name>`.
- Always-on rules delivered by a SessionStart hook; `/athena:setup` writes them into `.claude/rules/`.
- Wires the `ctx` skill's Stop hook (`compact-on-stop.sh`), which the file-copy install never did.
