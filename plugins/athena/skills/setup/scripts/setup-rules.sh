#!/usr/bin/env bash
# Materialize the plugin's rules/*.md into <project>/.claude/rules/athena-<name>.md.
#
#   setup-rules.sh            write/refresh (skips files edited locally)
#   setup-rules.sh --check    report only; exit 1 if anything would change
#   setup-rules.sh --remove   delete athena-*.md and the manifest
#   setup-rules.sh --force    overwrite even locally edited files
#
# A manifest at .claude/rules/.athena-rules.manifest records "name sha256 version" per file so
# local edits can be detected on the next run.
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PLUGIN="$(cd "$HERE/../../.." && pwd)"
SRC="$PLUGIN/rules"
PROJ="${CLAUDE_PROJECT_DIR:-$PWD}"
DST="$PROJ/.claude/rules"
MANIFEST="$DST/.athena-rules.manifest"
VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$PLUGIN/.claude-plugin/plugin.json" | head -1)

MODE=write
for a in "$@"; do
  case "$a" in
    --check) MODE=check ;;
    --remove) MODE=remove ;;
    --force) MODE=force ;;
    -h|--help) sed -n '2,10p' "$0"; exit 0 ;;
    *) echo "unknown argument: $a" >&2; exit 2 ;;
  esac
done

sha() { if command -v shasum >/dev/null 2>&1; then shasum -a 256 "$1" | cut -d' ' -f1; else sha256sum "$1" | cut -d' ' -f1; fi; }
recorded_sha() { [ -f "$MANIFEST" ] && awk -v n="$1" '$1==n{print $2}' "$MANIFEST" || true; }

printf '%-32s %-20s %s\n' "file" "status" "detail"
printf '%-32s %-20s %s\n' "----" "------" "------"

if [ "$MODE" = remove ]; then
  n=0
  for f in "$DST"/athena-*.md; do
    [ -e "$f" ] || continue
    rm -f "$f"; n=$((n+1))
    printf '%-32s %-20s %s\n' "$(basename "$f")" "removed" ""
  done
  rm -f "$MANIFEST"
  echo; echo "removed $n file(s); the plugin hook will inject rules again from the next session"
  exit 0
fi

[ -d "$SRC" ] || { echo "no rules directory at $SRC" >&2; exit 1; }
pending=0
tmp_manifest="$(mktemp)"; trap 'rm -f "$tmp_manifest"' EXIT

for src in "$SRC"/*.md; do
  name="athena-$(basename "$src")"
  dst="$DST/$name"
  new_sha=$(sha "$src")
  if [ ! -f "$dst" ]; then
    status=created; detail=""
  elif cmp -s "$src" "$dst"; then
    status=unchanged; detail=""
  else
    old=$(recorded_sha "$name"); cur=$(sha "$dst")
    if [ -n "$old" ] && [ "$old" != "$cur" ] && [ "$MODE" != force ]; then
      status="modified-locally"; detail="skipped (use --force)"
    else
      status=updated; detail=""
    fi
  fi

  case "$status" in
    created|updated)
      pending=$((pending+1))
      if [ "$MODE" != check ]; then mkdir -p "$DST"; cp "$src" "$dst"; fi
      printf '%s %s %s\n' "$name" "$new_sha" "$VERSION" >> "$tmp_manifest" ;;
    unchanged)
      printf '%s %s %s\n' "$name" "$new_sha" "$VERSION" >> "$tmp_manifest" ;;
    modified-locally)
      printf '%s %s %s\n' "$name" "$(recorded_sha "$name")" "$VERSION" >> "$tmp_manifest" ;;
  esac
  [ "$MODE" = check ] && [ "$status" != unchanged ] && [ "$status" != modified-locally ] && status="would-$status"
  printf '%-32s %-20s %s\n' "$name" "$status" "$detail"
done

if [ "$MODE" = check ]; then
  echo; echo "$pending change(s) pending"; [ "$pending" -eq 0 ]
else
  mkdir -p "$DST"; cp "$tmp_manifest" "$MANIFEST"
  echo; echo "rules written to $DST (plugin $VERSION); the SessionStart hook now skips injection here"
fi
