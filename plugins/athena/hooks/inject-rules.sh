#!/usr/bin/env bash
# SessionStart hook: hand the Athena always-on rules to the session as additional context.
#
#   inject-rules.sh [SLOT] [SLOTS]      default: 1 1 (everything in one payload)
#
# Claude Code keeps hook output inline only up to roughly 10 KB; larger payloads are spilled
# to a file with a 2 KB preview. The rules total ~16 KB, so hooks.json registers this script
# several times (SLOT 1..SLOTS) and each call emits one greedy-packed chunk of whole rule files,
# capped at LIMIT bytes. Slots with nothing assigned emit nothing.
#
# Skips silently when the rules have been materialized with /athena:setup (project or user
# scope), so they are never loaded twice. Pure bash + POSIX tools; no jq/node/python.
set -euo pipefail

SLOT="${1:-1}"
SLOTS="${2:-1}"
LIMIT="${ATHENA_RULES_CHUNK_LIMIT:-6000}"
ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"

cat >/dev/null 2>&1 || true   # drain the JSON payload on stdin

compgen -G "$PROJ/.claude/rules/athena-*.md" >/dev/null 2>&1 && exit 0
compgen -G "${HOME:-/nonexistent}/.claude/rules/athena-*.md" >/dev/null 2>&1 && exit 0
compgen -G "$ROOT/rules/*.md" >/dev/null 2>&1 || exit 0

# Greedy packing: files in sorted order, new slot when the next file would exceed LIMIT.
slot=1; used=0; mine=()
for f in "$ROOT"/rules/*.md; do
  size=$(wc -c <"$f")
  if [ "$used" -gt 0 ] && [ $((used + size)) -gt "$LIMIT" ]; then slot=$((slot + 1)); used=0; fi
  used=$((used + size))
  [ "$slot" -eq "$SLOT" ] && mine+=("$f")
done
TOTAL=$slot   # number of non-empty chunks; SLOTS in hooks.json only needs to be >= this
[ "${#mine[@]}" -gt 0 ] || exit 0

TAB=$(printf '\t')
json_escape() {
  # strip control chars except \t and \n, escape backslash/quote/tab, drop CR, join lines with \n
  tr -d '\000-\010\013\014\016-\037' \
    | sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e "s/$TAB/\\\\t/g" -e 's/\r$//' \
    | awk '{ printf "%s\\n", $0 }'
}

body=$(
  {
    printf '<athena-rules part="%s/%s" source="plugin">\n' "$SLOT" "$TOTAL"
    if [ "$SLOT" -eq 1 ]; then
      printf 'Always-on Athena rules, injected by the athena plugin in %s parts. Run /athena:setup once to write them to .claude/rules/ and stop this injection.\n' "$TOTAL"
    fi
    for f in "${mine[@]}"; do
      printf '\n<!-- %s -->\n' "$(basename "$f")"
      cat "$f"
      printf '\n'
    done
    printf '</athena-rules>\n'
  } | json_escape
)

printf '{"hookSpecificOutput":{"hookEventName":"SessionStart","additionalContext":"%s"}}\n' "$body"
