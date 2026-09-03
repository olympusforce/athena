#!/bin/sh
# Shared helpers: locate the request queue and type a line into a terminal pane.
#
# The built-in /compact cannot be invoked by any tool, hook, or IPC message —
# cross-session messaging delivers "/compact ..." as plain text and never runs
# it. The only thing that does run it is the user typing it at the prompt, so
# this types it for them, into the exact pane hosting the session.

queue_dir() {
	printf '%s/claude-ctx-compact' "${TMPDIR:-/tmp}"
}

queue_file() {
	printf '%s/%s.request' "$(queue_dir)" "$1"
}

# inject_line <pane_kind> <pane_id> <text>
# Types <text> plus Enter into the pane. Returns non-zero if unsupported.
inject_line() {
	kind=$1
	pane=$2
	text=$3

	case "$kind" in
	tmux)
		[ -n "$pane" ] || return 1
		command -v tmux >/dev/null 2>&1 || return 1
		tmux send-keys -t "$pane" -l -- "$text" || return 1
		tmux send-keys -t "$pane" Enter || return 1
		;;
	iterm2)
		[ -n "$pane" ] || return 1
		command -v osascript >/dev/null 2>&1 || return 1
		# Args go through argv, so no quoting/escaping of <text> is needed.
		osascript - "$pane" "$text" <<-'APPLESCRIPT' || return 1
			on run argv
				set target_id to item 1 of argv
				set line_text to item 2 of argv
				tell application "iTerm2"
					repeat with w in windows
						repeat with t in tabs of w
							repeat with s in sessions of t
								if (id of s) is target_id then
									write s text line_text
									return
								end if
							end repeat
						end repeat
					end repeat
				end tell
				error "no iTerm2 session with id " & target_id
			end run
		APPLESCRIPT
		;;
	*)
		return 1
		;;
	esac
}

# detect_pane: echoes "<kind> <id>" for the terminal hosting this process.
detect_pane() {
	if [ -n "${TMUX_PANE:-}" ] && [ -n "${TMUX:-}" ]; then
		printf 'tmux %s' "$TMUX_PANE"
	elif [ -n "${ITERM_SESSION_ID:-}" ]; then
		# ITERM_SESSION_ID is "w0t1p0:<uuid>"; AppleScript matches the uuid.
		printf 'iterm2 %s' "${ITERM_SESSION_ID#*:}"
	else
		printf 'none '
	fi
}
