<div align="center">

# Athena

**An agentic coding kit for [Claude Code](https://claude.com/claude-code), packaged as a plugin.**

32 skills · 16 subagents · 9 always-on rules · 6 output styles

*Turns an open Claude Code session into a repeatable pipeline:*
`brainstorm → plan → implement → review → ship`

</div>

---

## Install

```bash
claude plugin marketplace add olympusforce/athena
claude plugin install athena
```

Restart Claude Code (or run `/reload-plugins`). Type `/athena:` and the skill
list appears. A safe read-only first command:

```
/athena:scout README.md
```

Optional, once per repository:

```
/athena:setup
```

This writes the 9 always-on rules into `.claude/rules/athena-*.md` so they load
natively and can be committed for teammates. Until you do, the plugin's
SessionStart hook injects the same rules into every session, so behavior is
identical either way. The hook detects the materialized files and stops
injecting, so rules are never loaded twice.

When a newer version is published, a one-line notice with the update commands
appears at startup (checked at most once a day; offline is silent; opt out with
`ATHENA_NO_UPDATE_CHECK=1`).

Update later with `claude plugin marketplace update athena && claude plugin update athena@athena`
(then restart; re-run `/athena:setup` in projects that ran it); remove with
`claude plugin uninstall athena@athena`.

### Requirements

- Claude Code **2.1.x or newer** (plugin hooks and `${CLAUDE_PLUGIN_ROOT}`).
- [`gh`](https://cli.github.com/) only for `/athena:git pr`, `/athena:git merge-pr`,
  `/athena:ship`, `/athena:plan --github`.
- `jq` only for `/athena:ctx` (the Stop hook that types the queued `/compact`).
- Node or Python only for the handful of skills that ship helper scripts
  (`docs-seeker`, `repomix`, `ui-styling`, `web-frameworks`, `sequential-thinking`).

## Namespacing

Plugin components are namespaced by Claude Code:

| Kind | File-copy install (athena-organic) | Plugin install (this repo) |
| --- | --- | --- |
| Skill | `/plan` | `/athena:plan` |
| Agent | `@planner`, `Task(ghost-rider)` | `@athena:planner`, `Task(athena:ghost-rider)` |
| Counsel agent | `@athena` | `@athena:athena` |

Every cross-reference inside the vendored skills and agents is rewritten
accordingly by `scripts/sync.mjs`, so a skill that says "run `/athena:exec`"
refers to a command that exists.

## Quick start

```
/athena:plan add user authentication with email/password, using JWT
/athena:exec .athena/plans/<timestamp>-jwt-auth/
/athena:code-review --pending
/athena:git cp
```

`/athena:plan` writes a plan directory under `.athena/plans/` in your project.
`/athena:exec` implements it phase by phase with code review on by default.
`/athena:git` writes conventional commits and scans for secrets before staging.
Commit messages and PR titles/bodies carry no AI signatures by default
(`--no-ai`; opt in with `--ai-signature`). `--watch` watches the PR until CI is
green and the project's review gates approve (`/athena:git #159 --watch`).

## Skills

<sup>†</sup> = user-invocable only; Claude never auto-selects these.

| Skill | Purpose |
| --- | --- |
| [`/athena:brainstorm`](plugins/athena/skills/brainstorm/SKILL.md) | Turn unclear intent into an accepted outcome; compare approaches |
| [`/athena:plan`](plugins/athena/skills/plan/SKILL.md) | Phased implementation plans, architectures, roadmaps |
| [`/athena:exec`](plugins/athena/skills/exec/SKILL.md) | Implement features, plans, and fixes with a structured workflow |
| [`/athena:fix`](plugins/athena/skills/fix/SKILL.md) | Bugs, errors, test failures, CI issues, with intelligent routing |
| [`/athena:debug`](plugins/athena/skills/debug/SKILL.md) | Root-cause analysis before any fix |
| [`/athena:code-review`](plugins/athena/skills/code-review/SKILL.md) | Evidence-based review of diffs, PRs, commits, or whole codebases |
| [`/athena:ship`](plugins/athena/skills/ship/SKILL.md) | Merge, test, review, commit, push, PR |
| [`/athena:git`](plugins/athena/skills/git/SKILL.md) | Conventional commits, PRs, merges, stacked PRs, secret scanning |
| [`/athena:journal`](plugins/athena/skills/journal/SKILL.md) | Chronological technical journals |
| [`/athena:project-management`](plugins/athena/skills/project-management/SKILL.md) | Progress tracking, plan status, cross-session continuity |
| [`/athena:scout`](plugins/athena/skills/scout/SKILL.md) | Fast codebase scouting and file discovery |
| [`/athena:research`](plugins/athena/skills/research/SKILL.md) | Deep technical research before implementation |
| [`/athena:docs-seeker`](plugins/athena/skills/docs-seeker/SKILL.md) | Library and framework docs via llms.txt / context7 |
| [`/athena:repomix`](plugins/athena/skills/repomix/SKILL.md) | Pack a repository into an AI-friendly single file |
| [`/athena:find-skills`](plugins/athena/skills/find-skills/SKILL.md) | Discover and install additional agent skills |
| [`/athena:ask`](plugins/athena/skills/ask/SKILL.md) <sup>†</sup> | Analysis-only answers to technical questions |
| [`/athena:advise`](plugins/athena/skills/advise/SKILL.md) <sup>†</sup> | Interview-driven advisory |
| [`/athena:frontend-design`](plugins/athena/skills/frontend-design/SKILL.md) | Distinctive production-grade UI |
| [`/athena:frontend-development`](plugins/athena/skills/frontend-development/SKILL.md) | React/TypeScript implementation patterns |
| [`/athena:ui-styling`](plugins/athena/skills/ui-styling/SKILL.md) | shadcn/ui, Radix, Tailwind, themes |
| [`/athena:web-frameworks`](plugins/athena/skills/web-frameworks/SKILL.md) | Next.js App Router, RSC, SSR, Turborepo |
| [`/athena:react-best-practices`](plugins/athena/skills/react-best-practices/SKILL.md) | React/Next.js performance |
| [`/athena:web-design-guidelines`](plugins/athena/skills/web-design-guidelines/SKILL.md) | Accessibility and UX review |
| [`/athena:backend-development`](plugins/athena/skills/backend-development/SKILL.md) | Node.js, Python, Go: APIs, auth, databases, OWASP |
| [`/athena:mobile-development`](plugins/athena/skills/mobile-development/SKILL.md) | React Native, Flutter, SwiftUI, Compose |
| [`/athena:docs`](plugins/athena/skills/docs/SKILL.md) | Create, refresh, or audit project docs; author CLAUDE.md |
| [`/athena:preview`](plugins/athena/skills/preview/SKILL.md) | Visual explanations, slides, diagrams |
| [`/athena:project-organization`](plugins/athena/skills/project-organization/SKILL.md) | Decide file paths and standardize layout |
| [`/athena:sequential-thinking`](plugins/athena/skills/sequential-thinking/SKILL.md) | Step-by-step analysis with revision |
| [`/athena:problem-solving`](plugins/athena/skills/problem-solving/SKILL.md) | Structured reframing when stuck |
| [`/athena:context-engineering`](plugins/athena/skills/context-engineering/SKILL.md) | Context budget, memory systems, agent architecture |
| [`/athena:ctx`](plugins/athena/skills/ctx/SKILL.md) <sup>†</sup> | Compact the conversation while preserving plans and todos |
| [`/athena:setup`](plugins/athena/skills/setup/SKILL.md) <sup>†</sup> | Write the always-on rules into `.claude/rules/` (plugin-only) |

Flags (`--yagni`, `--advice`, `--journal`, `--test`, `--tasks`,
`--code-review`, `--recommended`, `--tdd`) and per-skill modes come from the
kit; each `SKILL.md` frontmatter is the authority. Code review
(`--code-review`, exec/fix), testing (`--test`, exec), and task tracking
(`--tasks`) are opt-in; `/athena:ship` still reviews and tests unless `--skip-review` /
`--skip-tests`. `--recommended` takes the model's recommended answer to each
clarification question and logs it to `decisions.md` in the plan dir.

## Agents

Skills delegate to these; mention them as `@athena:<name>`.

| Agent | Model | Purpose |
| --- | --- | --- |
| `athena:athena` | fable | Autonomous counsel on hard design and trade-off calls. Advisory-only |
| `athena:advisor` | fable | Interview-driven advisory |
| `athena:planner` | opus | Researches and writes implementation plans |
| `athena:brainstormer` | opus | Explores and debates architectural approaches |
| `athena:code-reviewer` | opus | Comprehensive review with edge-case detection |
| `athena:code-simplifier` | opus | Refines code for clarity without changing behavior |
| `athena:executor` | sonnet | Executes plan phases with strict file ownership |
| `athena:debugger` | sonnet | Investigates issues, logs, CI failures, performance |
| `athena:researcher` | sonnet | Multi-source technical research |
| `athena:docs-manager` | sonnet | Evidence-backed project documentation |
| `athena:journal-writer` | sonnet | Records significant technical difficulties |
| `athena:project-manager` | sonnet | Progress oversight and consolidated status |
| `athena:designer` | inherit | UI/UX design, wireframes, design systems |
| `athena:ghost-rider` | haiku | Fast codebase scanning and file location |
| `athena:tester` | haiku | Runs tests, analyzes coverage, validates builds |
| `athena:git-manager` | haiku | Staging, conventional commits, pushes |

## Rules and output styles

**Rules** are not a plugin component in Claude Code, so Athena delivers them two ways:

1. **SessionStart hook** (default). `plugins/athena/hooks/inject-rules.sh` emits the
   8 rule files as additional context, split into chunks small enough to stay
   inline (Claude Code spills hook output above roughly 10 KB to a file). Costs
   about 4k tokens per session start and after each compaction.
2. **`/athena:setup`** writes them to `.claude/rules/athena-*.md`. Native loading,
   reviewable in git, and the hook goes quiet. `--check`, `--remove`, `--force`.

**Output styles** (`ELI5 Mode (Level 0)` … `God Mode (Level 5)`) are installed by
the plugin; pick one with `/output-style`.

## Where output goes

Plans, phases, journals, and reports are written to `.athena/` in the project
you are working in, exactly as with the file-copy install.

## Relationship to athena-organic

[`olympusforce/athena-organic`](https://github.com/olympusforce/athena-organic) is
the **source of truth** and still supports copying `.claude/` into a project.
This repository vendors it:

- `plugins/athena/{skills,agents,output-styles,rules}` are **generated** by
  `node scripts/sync.mjs` from `../athena-organic/.claude`. Do not hand-edit them.
- The sync applies only plugin-layout rewrites: `/name` → `/athena:name`,
  `Task(agent)` → `Task(athena:agent)`, `subagent_type="agent"` →
  `"athena:agent"`, `@athena` → `@athena:athena`, and strips the `(Athena)`
  description prefix. Everything else is byte-identical to the source.
- `SYNC_SOURCE.json` records the athena-organic commit, counts, per-rule rewrite
  hits, and a content hash. `node scripts/sync.mjs --check` fails on drift.
- Authored here: `plugins/athena/skills/setup/`, `plugins/athena/hooks/`, the two
  manifests, `scripts/`, and docs.

### Local development

```bash
node scripts/sync.mjs                       # re-vendor from ../athena-organic/.claude
claude plugin validate --strict . && claude plugin validate --strict plugins/athena
node scripts/lint-plugin.mjs && bash plugins/athena/hooks/test-inject.sh && bash plugins/athena/hooks/test-update-check.sh
claude --plugin-dir ./plugins/athena        # try it without installing
```

### Release

```bash
node scripts/sync.mjs --version 1.0.1       # updates VERSION + both manifests + SYNC_SOURCE.json
# validate as above, add a CHANGELOG entry, commit, push main
claude plugin tag plugins/athena --push     # creates tag athena--v1.0.1
```

Users pick the new version up with `claude plugin update athena@athena`.

## License

MIT (see `LICENSE`). Two vendored skills are Apache-2.0 and the bundled fonts are
OFL 1.1; see `THIRD_PARTY_LICENSES.md`.
