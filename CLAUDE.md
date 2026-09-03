# athena (plugin marketplace repo)

- `plugins/athena/{skills,agents,output-styles,rules}` are **generated** from
  `../athena-organic/.claude` by `node scripts/sync.mjs`. Never hand-edit them;
  fix the source in athena-organic and re-run the sync.
- Authored (hand-maintained) files: `plugins/athena/skills/setup/`, `plugins/athena/hooks/`,
  `.claude-plugin/`, `plugins/athena/.claude-plugin/`, `scripts/`, docs.
- Version is single-sourced in `VERSION`; `node scripts/sync.mjs --version X.Y.Z` propagates it.
- Before committing: `node scripts/sync.mjs --check && claude plugin validate --strict . && claude plugin validate --strict plugins/athena`.
- Release: `claude plugin tag plugins/athena --push` (tag format `athena--vX.Y.Z`).
