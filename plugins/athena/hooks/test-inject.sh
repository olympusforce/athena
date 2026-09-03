#!/usr/bin/env bash
# CI test for inject-rules.sh:
#   - every chunk is valid JSON and stays under the inline limit Claude Code keeps in context
#   - the chunks together cover every rules/*.md exactly once
#   - nothing is emitted when the rules are already materialized in the project
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PLUGIN="$(cd "$HERE/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

SLOTS=$(grep -o 'inject-rules.sh\\" [0-9]* [0-9]*' "$HERE/hooks.json" | awk '{print $3}' | sort -u)
[ "$(echo "$SLOTS" | wc -l)" -eq 1 ] || { echo "hooks.json slot counts disagree: $SLOTS"; exit 1; }
REGISTERED=$(grep -c 'inject-rules.sh\\" [0-9]* [0-9]*' "$HERE/hooks.json")
[ "$REGISTERED" -eq "$SLOTS" ] || { echo "hooks.json registers $REGISTERED slot(s) but declares $SLOTS"; exit 1; }

mkdir -p "$TMP/p1" "$TMP/home"
: > "$TMP/all.txt"
for k in $(seq 1 "$SLOTS"); do
  out=$(echo '{"session_id":"t","hook_event_name":"SessionStart"}' \
    | CLAUDE_PLUGIN_ROOT="$PLUGIN" CLAUDE_PROJECT_DIR="$TMP/p1" HOME="$TMP/home" bash "$HERE/inject-rules.sh" "$k" "$SLOTS")
  [ -n "$out" ] || { echo "slot $k/$SLOTS: empty"; continue; }
  printf '%s' "$out" | node -e '
    const j = JSON.parse(require("fs").readFileSync(0, "utf8"));
    const ctx = j.hookSpecificOutput.additionalContext;
    if (j.hookSpecificOutput.hookEventName !== "SessionStart") throw new Error("bad event");
    if (ctx.length > 7000) throw new Error("chunk too large for inline hook context: " + ctx.length);
    for (const m of ctx.matchAll(/<!-- ([^ ]+\.md) -->/g)) console.log(m[1]);
    console.error("slot ok:", ctx.length, "chars");
  ' >> "$TMP/all.txt"
done
sort "$TMP/all.txt" > "$TMP/got.txt"
ls "$PLUGIN/rules"/*.md | xargs -n1 basename | sort > "$TMP/want.txt"
diff "$TMP/want.txt" "$TMP/got.txt" || { echo "rule files not covered exactly once"; exit 1; }
echo "ok: $(wc -l < "$TMP/got.txt") rule files across $SLOTS slot(s)"

mkdir -p "$TMP/p2/.claude/rules" && touch "$TMP/p2/.claude/rules/athena-x.md"
out2=$(echo '{}' | CLAUDE_PLUGIN_ROOT="$PLUGIN" CLAUDE_PROJECT_DIR="$TMP/p2" HOME="$TMP/home" bash "$HERE/inject-rules.sh" 1 "$SLOTS")
[ -z "$out2" ] || { echo "expected no output when rules are materialized"; exit 1; }
echo "ok: skipped when materialized"
