# Agent Context File Rules

Load for `/athena:docs agent-context`: author, audit, or optimize a project's
**root** agent context file (`CLAUDE.md` / `AGENTS.md`). For a subfolder context
file use `/folder-context`; for human `.athena/docs/` use `init` or `update`.

## Artifact class

A root agent context file is **process memory**: imperative rules that steer
agent _behavior_. It is not `.athena/docs/`, which own WHY and WHERE. It exists to
prevent specific costly actions. Its single-source-of-truth
spine is the deletion test and drift-resistance rules in `doc-content-rules.md`;
apply those, do not restate them here.

## Keep-or-cut filter

Run every candidate line through four questions:

1. **Can the agent find this itself** with `ls`, `grep`, or reading a config
   file? If yes, cut it (directory trees, module lists, "what this project is").
2. **If this line were missing, what specific wrong or costly action results?**
   No concrete behavior → cut. "Helps it understand context" is not a behavior.
3. **Is it verifiable** — an exact command, path, or rule, not a vibe?
   "Run `pnpm test`" beats "test your changes".
4. **Does it conflict with another line?** Contradictions let the agent pick
   either; fatal across nested files.

## Write / don't-write

| Write — prevents a costly action                                           | Don't write — cost with no payoff               |
| -------------------------------------------------------------------------- | ----------------------------------------------- |
| Exact build / test / lint / single-test commands                           | Project overview, "what this project is"        |
| Mandatory tooling (`pnpm` not `npm`, `uv` not `pip`)                       | Directory tree, module inventory                |
| Expensive steps + how to avoid ("full suite is slow, use `-k`")            | Style rules a linter/formatter already enforces |
| Deny-list: files not to touch, commands not to run, migrations not to edit | Anything duplicating the README                 |
| Non-derivable gotchas (required env var, service that must run first)      | Project history, changelog                      |
| Out-of-code conventions (commit / PR / branch naming)                      | "Always write clean, readable code"             |
| Definition of done (what to run before reporting complete)                 | Architecture prose the agent can read from code |

## Audit procedure

1. Read the current file. Report its line count; if it is long, recommend an
   activation-scope split (below).
2. Classify each block: **keep** (imperative, passes the filter), **cut**
   (discoverable, vague, or duplicates the README), or **migrate** (an absolute
   rule that belongs in enforcement).
3. Propose the deletions and migrations as a diff. **Confirm with the user before
   writing.**
4. On approval, write the trimmed file. Never write secrets into it.

With `--audit`: get a `athena` audit pass over the current file first, then
interview the user one question at a time — one keep / cut / fix / migrate
decision per question — and apply only confirmed changes. With `--advice`: spawn
`athena` for counsel before writing; it advises only, you still confirm and
write.

## Enforcement is recommend-only

Markdown is guidance the model _may_ follow; client settings and hooks are
enforced regardless of what the model decides. For an absolute rule ("never push
to `main`", "never touch `infra/prod/**`"), **recommend** the deterministic
control and show a snippet — do **not** edit `settings.json` or hook files
yourself.

```jsonc
// .claude/settings.json — hand this to the user; matcher syntax is
// runtime-specific, so verify it against the current runtime's docs.
// capability-lint-allow: settings.json matcher uses the literal runtime tool name
{ "permissions": { "deny": ["Bash(git push:*)"] } }
```

A pre-tool-call hook (e.g. Claude Code's PreToolUse) is the other deterministic
option. Uppercase markdown ("NEVER PUSH") is not enforcement.

## Activation scope

Keep any single file lean; split by _when it must load_, not by compressing text:

- root file → always-loaded process rules (commands, tooling, deny-list, DoD);
- path-scoped rules → conventions that apply only to matching files;
- skills → multi-step procedures needed occasionally;
- settings / hooks → what must never be violated.

**Verify against the current runtime before recommending a mechanism.** Import
syntax, parent-vs-child load timing, path-scoped rule frontmatter, comment
stripping, and the context-inspection command differ by runtime and version.
Confirm with the runtime's own docs or a `/context`-style probe, and name the
runtime (Claude Code reads `CLAUDE.md`; Codex reads `AGENTS.md`). Do not assert a
loader behavior as an evergreen fact.

## Add on failure, not up front

Add a line only when the agent repeats a mistake, review catches something it
should have known, or the user re-types a prior correction. A large file written
before any run is mostly cost.
