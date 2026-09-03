# View Mode

## Execution

**IMPORTANT:** Run server as Claude Code background task using `run_in_background: true` with the Bash tool.

**Critical:** When calling the Bash tool:

- Set `run_in_background: true`
- Set `timeout: 300000` (5 minutes)
- Parse JSON output and report URL to user

After starting, report:

- Local URL for browser access
- Network URL for remote device access
- Inform user that server is now running as CC background task (visible in `/tasks`)

**CRITICAL:** MUST display the FULL URL including path and query string. NEVER truncate to just `host:port`.
