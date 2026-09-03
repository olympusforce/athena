# Log Analysis Fix Workflow

For fixing issues found in application logs.

## Prerequisites

- Log file at `./logs.txt` or a project-specific equivalent

## Setup When Logs Are Missing

Add persistent log piping to project configuration:

- **Bash/Unix:** `command 2>&1 | tee logs.txt`
- **PowerShell:** `command *>&1 | Tee-Object logs.txt`

## Progress Tracking

The stages are `analyze logs → scout code → plan fix → implement → test →
review`. Discover the live task-management surface and mirror this dependency
chain when available. Otherwise, update the active plan as stages start and
finish. Plan files are the durable source of truth.

## Workflow

### Step 1: Read and Analyze Logs

- Read logs with `search_files capability`; start with a small result limit
- Use the debugger agent for root-cause analysis
- Inspect recent lines first
- Capture stack traces, error codes, timestamps, and repeated patterns

### Step 2: Scout the Codebase

Use `scout` or parallel `ghost-rider` subagents to find affected code. See
`references/parallel-exploration.md` for patterns.

### Step 3: Plan the Fix

Use the planner agent. Do not plan until log evidence and code paths agree on
the root cause.

### Step 4: Implement

Implement the smallest cause-aligned fix.

### Step 5: Test

Use the tester agent. If the original symptom remains, return to Step 2 and
re-diagnose before changing more code.

### Step 6: Review

**Skip if:** `--skip-code-review`. Print `code review skipped by --skip-code-review` and surface the unreviewed-changes risk at finalize.

Use the code-reviewer agent and retain fresh verification evidence.

## Tips

- Focus on the most recent errors first
- Correlate stack traces, error codes, and timestamps
- Group repeated errors before forming hypotheses
