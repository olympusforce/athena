#!/usr/bin/env node
// Post-sync guard for plugins/athena. Zero dependencies, Node >= 18.
//
//   node scripts/lint-plugin.mjs [pluginDir]
//
// Errors (exit 1): things the rewrite layer must have handled.
// Warnings (exit 0): known upstream bugs kept visible until athena-organic fixes them.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_PLUGIN = join(HERE, "..", "plugins", "athena");

export function walk(dir, out = []) {
  for (const name of readdirSync(dir).sort()) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p, out);
    else out.push(p);
  }
  return out;
}

export function skillNames(pluginDir) {
  return readdirSync(join(pluginDir, "skills"))
    .filter((n) => statSync(join(pluginDir, "skills", n)).isDirectory())
    .sort((a, b) => b.length - a.length);
}

export function lint(pluginDir = DEFAULT_PLUGIN) {
  const errors = [];
  const warnings = [];
  const skills = skillNames(pluginDir);
  const alt = skills.map((s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|");
  // Same anchoring as sync.mjs R1: line start or backtick, then /<skill>, then space/backtick/EOL.
  const bareSkill = new RegExp(`(^[ \\t]*|\`)/(${alt})(?=[\\s\`]|$)`, "gm");

  const checks = [
    { re: bareSkill, level: "error", msg: "skill reference not namespaced (/athena:...)" },
    { re: /^description:.*\(Athena\)/m, level: "error", msg: '"(Athena)" prefix left in description' },
    { re: /\$CLAUDE_PROJECT_DIR\/\.claude\/skills\//g, level: "error", msg: "kit file resolved via $CLAUDE_PROJECT_DIR/.claude/skills" },
    { re: /(^|[^~$}\w./])\.claude\/skills\/[a-z-]+\//gm, level: "warn", msg: "project-relative .claude/skills/ path (fine only as a fallback)" },
    { re: /\.claude\/hooks\/lib\//g, level: "warn", msg: "dangling .claude/hooks/lib reference (upstream: ship skill)" },
    { re: /the engineer [a-z-]+ skill/g, level: "warn", msg: "corrupted skill name (upstream)" },
    { re: /(^|[^.])\.?\/athena\/plans\//gm, level: "warn", msg: "'/athena/plans/' typo (upstream)" },
  ];

  for (const file of walk(pluginDir)) {
    if (!file.endsWith(".md")) continue;
    const rel = relative(pluginDir, file);
    if (rel.startsWith("skills/setup/")) continue; // authored; may legitimately mention /athena:setup only
    const text = readFileSync(file, "utf8");
    for (const c of checks) {
      c.re.lastIndex = 0;
      let m;
      while ((m = c.re.exec(text))) {
        const line = text.slice(0, m.index).split("\n").length;
        (c.level === "error" ? errors : warnings).push(`${rel}:${line}: ${c.msg}: ${m[0].trim().slice(0, 80)}`);
        if (!c.re.global) break;
      }
    }
  }
  return { errors, warnings };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const dir = process.argv[2] ?? DEFAULT_PLUGIN;
  const { errors, warnings } = lint(dir);
  for (const w of warnings) console.warn(`warn  ${w}`);
  for (const e of errors) console.error(`error ${e}`);
  console.log(`lint: ${errors.length} error(s), ${warnings.length} warning(s)`);
  process.exit(errors.length ? 1 : 0);
}
