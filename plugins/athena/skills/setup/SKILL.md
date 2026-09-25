---
name: setup
description: Write the Athena always-on rules into this project's .claude/rules/ as athena-*.md so they load natively and the plugin's SessionStart injection stops. Idempotent. --check to preview, --remove to uninstall, --force to overwrite local edits.
user-invocable: true
disable-model-invocation: true
when_to_use: 'Invoke once per repository after installing the athena plugin, or after a plugin update to refresh the rules.'
category: utilities
keywords: [setup, install, rules, onboarding]
argument-hint: '[--check | --remove | --force]'
---

# Setup

Arguments: <args>$ARGUMENTS</args>

The athena plugin injects its 9 rules into every session through a SessionStart
hook. This skill writes those same rules into the project instead, as
`.claude/rules/athena-<name>.md`, so Claude Code loads them natively and the
hook stops injecting (it checks for `athena-*.md` and exits).

## Steps

1. Run the installer and show its table to the user verbatim:

   ```bash
   bash "${CLAUDE_SKILL_DIR}/scripts/setup-rules.sh" $ARGUMENTS
   ```

2. Then tell the user, briefly:
   - Materialized rules take effect natively from the **next** session; this
     session already has them via the hook, so nothing is missing now.
   - Committing `.claude/rules/athena-*.md` gives teammates the rules even
     without the plugin installed.
   - Re-run `/athena:setup` after a plugin update to refresh them; files the
     user edited locally are skipped unless `--force` is passed.

## Rules

- Do not edit the rule files by hand here; the script owns them.
- Do not read or modify project code for this skill.
