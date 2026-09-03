#!/bin/sh
# Stop hook: if the session that just finished a turn has a queued /compact,
# type it at its now-idle prompt.
#
# Wired from settings.json as a Stop hook. Every other turn it exits ~instantly
# after one stat() of a missing file.

set -eu

. "$(dirname "$0")/lib-inject.sh"

PAYLOAD=$(cat)
SESSION=$(printf '%s' "$PAYLOAD" | jq -r '.session_id // empty' 2>/dev/null || true)
[ -n "$SESSION" ] || exit 0

REQUEST=$(queue_file "$SESSION")
[ -f "$REQUEST" ] || exit 0

PANE_KIND=$(sed -n 1p "$REQUEST")
PANE_ID=$(sed -n 2p "$REQUEST")
INSTRUCTION=$(sed -n 3p "$REQUEST")

# Consume first: a request that fails to inject must not retry on every turn.
rm -f "$REQUEST"

[ -n "$PANE_KIND" ] && [ -n "$INSTRUCTION" ] || exit 0

# Detach so the hook returns immediately, and give the TUI a moment to settle
# back to an idle prompt before typing into it.
(
	sleep 1
	inject_line "$PANE_KIND" "$PANE_ID" "/compact $INSTRUCTION"
) >/dev/null 2>&1 &

exit 0
