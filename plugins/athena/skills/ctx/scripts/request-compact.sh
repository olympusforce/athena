#!/bin/sh
# Queue a /compact for the Claude Code session this script was invoked from.
#
# The queued line is typed at the prompt by the Stop hook (compact-on-stop.sh)
# as soon as the current turn ends, because the prompt only accepts input when
# the session is idle.
#
# Usage: request-compact.sh [--session-id <uuid>] [--instruction <text>]
#        --session-id   defaults to $CLAUDE_CODE_SESSION_ID; when given, it must
#                       match, so the request can never land on another session.

set -eu

. "$(dirname "$0")/lib-inject.sh"

INSTRUCTION="keep the original plans, user's prompts, key changes and todo tasks"
WANT_SESSION=""

while [ $# -gt 0 ]; do
	case "$1" in
	--session-id)
		WANT_SESSION=${2:?--session-id needs a value}
		shift 2
		;;
	--instruction)
		INSTRUCTION=${2:?--instruction needs a value}
		shift 2
		;;
	*)
		printf 'unknown argument: %s\n' "$1" >&2
		exit 2
		;;
	esac
done

SESSION=${CLAUDE_CODE_SESSION_ID:-}
if [ -z "$SESSION" ]; then
	printf 'no CLAUDE_CODE_SESSION_ID in the environment — run this from inside a Claude Code session\n' >&2
	exit 1
fi
if [ -n "$WANT_SESSION" ] && [ "$WANT_SESSION" != "$SESSION" ]; then
	printf 'session mismatch: asked for %s but this is %s\n' "$WANT_SESSION" "$SESSION" >&2
	exit 1
fi

PANE=$(detect_pane)
PANE_KIND=${PANE%% *}
PANE_ID=${PANE#* }
if [ "$PANE_KIND" = none ]; then
	printf 'no tmux or iTerm2 pane found for session %s — type the /compact line yourself\n' "$SESSION" >&2
	exit 1
fi

mkdir -p "$(queue_dir)"
chmod 700 "$(queue_dir)"

# One record per line: kind, pane id, then the instruction (may contain spaces).
umask 077
printf '%s\n%s\n%s\n' "$PANE_KIND" "$PANE_ID" "$INSTRUCTION" >"$(queue_file "$SESSION")"

printf 'queued /compact for session %s (%s pane %s); fires when this turn ends\n' \
	"$SESSION" "$PANE_KIND" "$PANE_ID"
