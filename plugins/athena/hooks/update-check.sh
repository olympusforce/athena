#!/usr/bin/env bash
# SessionStart (startup) hook: tell the user when a newer athena is published.
#
# Compares the installed plugin version with the version on the marketplace's main branch
# (what `claude plugin update` installs) and prints one user-visible systemMessage when the
# published one is newer. Checks online at most once per 24h (cached); offline, errors, or
# ATHENA_NO_UPDATE_CHECK=1 mean silence. Never fails the session.
# Pure bash + POSIX tools + curl; no jq/node/python.
set -u

cat >/dev/null 2>&1 || true   # drain the JSON payload on stdin
[ "${ATHENA_NO_UPDATE_CHECK:-}" = "1" ] && exit 0

ROOT="${CLAUDE_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
URL="${ATHENA_UPDATE_URL:-https://raw.githubusercontent.com/olympusforce/athena/main/.claude-plugin/marketplace.json}"
CACHE_DIR="${CLAUDE_PLUGIN_DATA:-${XDG_CACHE_HOME:-${HOME:-/tmp}/.cache}/athena}"
CACHE="$CACHE_DIR/update-check"
TTL="${ATHENA_UPDATE_TTL:-86400}"

ver() { grep -o '"version"[[:space:]]*:[[:space:]]*"[0-9][0-9.]*"' | head -1 | grep -o '[0-9][0-9.]*"$' | tr -d '"'; }

# newer A B → success when A > B (major.minor.patch, missing parts = 0)
newer() {
  local a1 a2 a3 b1 b2 b3
  IFS=. read -r a1 a2 a3 <<<"$1"
  IFS=. read -r b1 b2 b3 <<<"$2"
  for p in "${a1:-0} ${b1:-0}" "${a2:-0} ${b2:-0}" "${a3:-0} ${b3:-0}"; do
    set -- $p
    [ "$1" -gt "$2" ] && return 0
    [ "$1" -lt "$2" ] && return 1
  done
  return 1
}

installed=$(ver <"$ROOT/.claude-plugin/plugin.json" 2>/dev/null) || exit 0
[ -n "$installed" ] || exit 0

now=$(date +%s)
latest=""
if [ -r "$CACHE" ]; then
  read -r stamp cached <"$CACHE" 2>/dev/null || true
  if [ -n "${stamp:-}" ] && [ $((now - stamp)) -lt "$TTL" ] 2>/dev/null; then
    [ "${cached:-}" = "-" ] || latest="${cached:-}"
    fresh=1
  fi
fi

if [ -z "${fresh:-}" ]; then
  # plugin entry's version (skip the marketplace metadata version above "plugins")
  latest=$(curl -fsS --max-time 2 "$URL" 2>/dev/null | sed -n '/"plugins"/,$p' | sed '1s/.*"plugins"//' | ver) || latest=""
  mkdir -p "$CACHE_DIR" 2>/dev/null \
    && printf '%s %s\n' "$now" "${latest:--}" >"$CACHE.tmp" 2>/dev/null \
    && mv -f "$CACHE.tmp" "$CACHE" 2>/dev/null
fi

[ -n "$latest" ] && newer "$latest" "$installed" || exit 0

msg="athena $latest is available (installed $installed). Update: claude plugin marketplace update athena && claude plugin update athena@athena, then restart. Changes: https://github.com/olympusforce/athena/blob/main/CHANGELOG.md"
printf '{"systemMessage":"%s"}\n' "$msg"
exit 0
