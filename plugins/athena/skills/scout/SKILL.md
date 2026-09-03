---
name: scout
description: 'Fast codebase scouting using native search, optional ghost-rider agents, and user-permitted OpenCode probes. Use for file discovery, task context gathering, and scoped searches across directories.'
user-invocable: true
when_to_use: 'Invoke for fast file discovery and codebase orientation.'
category: dev-tools
keywords: [codebase, scouting, file-discovery, search]
argument-hint: '[search-target] [ext]'
---

# Scout

Fast, token-efficient codebase scouting using parallel agents to find files needed for tasks.

## Arguments

- Default: Scout using built-in `ghost-rider` subagents in parallel when delegation is permitted (`./references/internal-scouting.md`)
- `ext`: Scout using user-permitted OpenCode probes when native/local search is insufficient (`./references/external-scouting.md`)

## When to Use

- Beginning work on feature spanning multiple directories
- User mentions needing to "find", "locate", or "search for" files
- Starting debugging session requiring file relationships understanding
- User asks about project structure or where functionality lives
- Before changes that might affect multiple codebase parts

## Quick Start

1. Analyze user prompt to identify search targets
2. Use a wide range of `search_files` patterns to find relevant files and estimate scale of the codebase
3. Spawn parallel agents with divided directories only when the active runtime permits delegate_agent usage
4. Collect results into concise report

## Runtime Tooling

Use portable capabilities first:

- `search_files` for local discovery.
- `read_file` for scoped file reads.
- `run_shell` for local commands such as `rg`, `wc`, or `sed`.
- The live task-management surface for progress tracking when useful.
- `delegate_agent` for `ghost-rider` subagents only when user request and runtime policy allow delegation.

Do not spawn subagents only because this skill mentions `ghost-rider`. Some runtimes,
including Codex Desktop, require the actual user request to explicitly ask for
subagents, delegation, or parallel agent work. If that explicit request is
absent, scout in the main agent with `search_files` and `read_file`.

Runtime mapping for `delegate_agent`:

- Claude Code: use the native delegate call with `subagent_type: "athena:ghost-rider"`.

## Workflow

### 1. Analyze Task

- Parse user prompt for search targets
- Identify key directories, patterns, file types, lines of code
- Determine optimal SCALE value of subagents to spawn

### 2. Divide and Conquer

- Split codebase into logical segments per agent
- Assign each agent specific directories or patterns
- Ensure no overlap, maximize coverage

### 3. Register Scout Work

- **Skip if:** Agent count ≤ 2 (overhead exceeds benefit)
- Discover the live task-management surface and check for existing scout work
- If available, register one scoped item per agent; otherwise update the active plan
- Keep tracking concise: scope, assigned directories, current status, and timeout
- Treat the active plan as the durable source of truth

### 4. Spawn Parallel Agents

Load appropriate reference based on decision tree:

- **Internal (Default):** `references/internal-scouting.md` (ghost-rider subagents)
- **External:** `references/external-scouting.md` (OpenCode)

**Notes:**

- Record each scope as in progress before spawning its agent
- Prompt detailed instructions for each subagent with exact directories or files it should read
- Remember that each subagent has less than 200K tokens of context window
- Amount of subagents to-be-spawned depends on the current system resources available and amount of files to be scanned
- Each subagent must return a detailed summary report to a main agent
- In Codex Desktop, first expose deferred multi-agent tools through `tool_search` if they are not already visible.
- If runtime policy blocks subagents because the user did not explicitly request delegation, continue with main-agent scouting instead of forcing a spawn.

### 5. Collect Results

**IMPORTANT:** Invoke `/athena:project-organization` skill to organize the outputs.

- Timeout: 3 minutes per agent (skip non-responders)
- Record completed scopes and log timed-out agents in the report
- Aggregate findings into single report
- List unresolved questions at end

## Report Format

```markdown
# Scout Report

## Relevant Files

- `path/to/file.ts` - Brief description
- ...

## Unresolved Questions

- Any gaps in findings
```

## References

- `references/internal-scouting.md` - Using `ghost-rider` subagents
- `references/external-scouting.md` - Using user-permitted OpenCode probes

## Workflow Position

**Typically precedes:** `/athena:debug` (debug after scouting), `/athena:fix` (fix after locating code), `/athena:code-review` (scout edge cases before review)
**Related:** `/athena:debug` (investigate after scouting), `/athena:brainstorm` (explore after scouting)
