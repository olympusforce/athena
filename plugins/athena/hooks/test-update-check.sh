#!/usr/bin/env bash
# CI test for update-check.sh (offline: file:// URLs, temp cache):
#   - newer published version → one valid-JSON systemMessage naming both versions + update command
#   - equal / older / unreachable / opted out → no output, exit 0
#   - fresh cache is used without fetching; stale cache refetches
set -euo pipefail
HERE="$(cd "$(dirname "$0")" && pwd)"
PLUGIN="$(cd "$HERE/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

INSTALLED=$(grep -o '"version"[[:space:]]*:[[:space:]]*"[0-9.]*"' "$PLUGIN/.claude-plugin/plugin.json" | head -1 | grep -o '[0-9][0-9.]*')
IFS=. read -r MA MI PA <<<"$INSTALLED"

market() {  # market <plugin-version> → fake marketplace.json path (metadata version differs on purpose)
  local f="$TMP/market-$1.json"
  printf '{"metadata":{"version":"0.0.1"},"plugins":[{"name":"athena","version":"%s"}]}\n' "$1" >"$f"
  echo "$f"
}
run() {  # run <url> [extra env...] → stdout of the hook
  local url="$1"; shift
  echo '{"hook_event_name":"SessionStart"}' \
    | env CLAUDE_PLUGIN_ROOT="$PLUGIN" CLAUDE_PLUGIN_DATA="$TMP/data" ATHENA_UPDATE_URL="$url" "$@" \
      bash "$HERE/update-check.sh"
}
fresh() { rm -rf "$TMP/data"; }
fail() { echo "FAIL: $*"; exit 1; }

NEWER="$MA.$MI.$((PA + 1))"; MAJOR="$((MA + 1)).0.0"; OLDER="0.0.1"

fresh; out=$(run "file://$(market "$NEWER")")
printf '%s' "$out" | node -e '
  const j = JSON.parse(require("fs").readFileSync(0, "utf8"));
  const [newer, inst] = process.argv.slice(1);
  if (!j.systemMessage.includes(newer) || !j.systemMessage.includes(inst)) throw new Error("versions missing");
  if (!j.systemMessage.includes("claude plugin update athena@athena")) throw new Error("command missing");
' "$NEWER" "$INSTALLED" || fail "newer patch: bad notice: $out"
echo "ok: notice on newer patch ($NEWER > $INSTALLED)"

fresh; [ -n "$(run "file://$(market "$MAJOR")")" ] || fail "newer major: no notice"; echo "ok: notice on newer major"
fresh; [ -z "$(run "file://$(market "$INSTALLED")")" ] || fail "equal: unexpected notice"; echo "ok: silent when equal"
fresh; [ -z "$(run "file://$(market "$OLDER")")" ] || fail "older: unexpected notice"; echo "ok: silent when older"
fresh; [ -z "$(run "file://$TMP/missing.json")" ] || fail "unreachable: unexpected notice"; echo "ok: silent when unreachable"
fresh; [ -z "$(run "file://$(market "$NEWER")" ATHENA_NO_UPDATE_CHECK=1)" ] || fail "opt-out ignored"; echo "ok: opt-out"

# fresh cache: notice comes from the cache, URL is never fetched
fresh; mkdir -p "$TMP/data"; printf '%s %s\n' "$(date +%s)" "$NEWER" >"$TMP/data/update-check"
[ -n "$(run "file://$TMP/missing.json")" ] || fail "fresh cache not used"; echo "ok: fresh cache used without fetch"

# fresh failed-attempt cache ("-"): silent, no refetch
fresh; mkdir -p "$TMP/data"; printf '%s -\n' "$(date +%s)" >"$TMP/data/update-check"
[ -z "$(run "file://$(market "$NEWER")")" ] || fail "failed-attempt cache refetched"; echo "ok: failed attempt rate-limited"

# stale cache: refetch and overwrite
fresh; mkdir -p "$TMP/data"; printf '%s %s\n' 1 "$INSTALLED" >"$TMP/data/update-check"
[ -n "$(run "file://$(market "$NEWER")")" ] || fail "stale cache not refreshed"
grep -q " $NEWER$" "$TMP/data/update-check" || fail "cache not rewritten"; echo "ok: stale cache refetched"
