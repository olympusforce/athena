#!/usr/bin/env node
// Vendor athena-organic/.claude into plugins/athena and apply the plugin-layout rewrites.
// Zero dependencies, Node >= 18.
//
//   node scripts/sync.mjs [--source ../athena-organic/.claude] [--version X.Y.Z]
//                         [--check] [--dry-run] [--allow-dirty] [--no-agent-namespace]
//
// Steps: resolve source → stage copy → rewrite → patch → manifests → lockfile → lint → install.
// --check builds into a temp dir and diffs against the committed tree (exit 1 on drift).

import {
  cpSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync,
  statSync, writeFileSync, chmodSync, renameSync,
} from "node:fs";
import { join, relative, dirname, resolve, basename } from "node:path";
import { tmpdir } from "node:os";
import { execSync } from "node:child_process";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { lint, walk } from "./lint-plugin.mjs";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const PLUGIN = join(ROOT, "plugins", "athena");
const GENERATED = ["skills", "agents", "output-styles", "rules"];
const AUTHORED_SKILLS = ["setup"];
const EXCLUDE_NAMES = new Set([".DS_Store", "agent-memory", "node_modules", ".env", ".thought-history.json"]);

// ---------- args ----------
const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const SOURCE = resolve(ROOT, opt("--source", "../athena-organic/.claude"));
const NEW_VERSION = opt("--version", null);
const CHECK = flag("--check");
const DRY = flag("--dry-run");
const ALLOW_DIRTY = flag("--allow-dirty");
const NS_AGENTS = !flag("--no-agent-namespace");

if (!existsSync(join(SOURCE, "skills"))) {
  console.error(`source has no skills/: ${SOURCE}`);
  process.exit(2);
}

// ---------- 1. source metadata ----------
const git = (cmd) => execSync(`git -C "${SOURCE}" ${cmd}`, { encoding: "utf8" }).trim();
const commit = git("rev-parse HEAD");
const commitDate = git("log -1 --format=%cI");
const dirty = git("status --porcelain -- .").length > 0;
if (dirty && !ALLOW_DIRTY && !CHECK && !DRY) {
  console.error("source working tree is dirty; commit first or pass --allow-dirty");
  process.exit(2);
}

// ---------- 2-3. stage copy ----------
const STAGE = mkdtempSync(join(tmpdir(), "athena-sync-"));
function copyTree(src, dst) {
  mkdirSync(dst, { recursive: true });
  for (const name of readdirSync(src).sort()) {
    if (EXCLUDE_NAMES.has(name) || name.endsWith(".log")) continue;
    const s = join(src, name), d = join(dst, name);
    const st = statSync(s);
    if (st.isDirectory()) copyTree(s, d);
    else { cpSync(s, d); chmodSync(d, st.mode & 0o777); }
  }
}
for (const dir of GENERATED) copyTree(join(SOURCE, dir), join(STAGE, dir));
for (const s of AUTHORED_SKILLS) {
  const from = join(PLUGIN, "skills", s);
  if (existsSync(from)) copyTree(from, join(STAGE, "skills", s));
}

// ---------- 4. rewrites ----------
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const SKILLS = readdirSync(join(STAGE, "skills")).filter((n) => statSync(join(STAGE, "skills", n)).isDirectory());
const AGENTS = readdirSync(join(STAGE, "agents")).filter((n) => n.endsWith(".md")).map((n) => n.slice(0, -3));
const skillAlt = SKILLS.sort((a, b) => b.length - a.length).map(esc).join("|");
const agentAlt = AGENTS.sort((a, b) => b.length - a.length).map(esc).join("|");

const RULES = [
  { id: "R1", desc: "skill namespace", re: new RegExp(`(^[ \\t]*|\`)/(${skillAlt})(?=[\\s\`]|$)`, "gm"), to: "$1/athena:$2" },
  { id: "R2", desc: "strip (Athena) prefix", only: /^skills\/[^/]+\/SKILL\.md$/, re: /^(description:\s*(?:>-?\n\s+)?['"]?)\(Athena\)\s+/m, to: "$1" },
];
if (NS_AGENTS) {
  RULES.push(
    { id: "R3a", desc: "Task(agent) grants", re: new RegExp(`Task\\((${agentAlt})\\)`, "g"), to: "Task(athena:$1)" },
    { id: "R3b", desc: "subagent_type", re: new RegExp(`(subagent_type\\s*[=:]\\s*["'])(${agentAlt})(["'])`, "g"), to: "$1athena:$2$3" },
    { id: "R3c", desc: "@athena mention", re: /@athena\b(?!:)/g, to: "@athena:athena" },
  );
}

// Layout-only deltas that cannot be expressed as a global regex. Each must hit exactly `expect`
// times; a mismatch means upstream changed (or fixed) the text — update or delete the patch.
const PATCHES = [
  // { file: "agents/example.md", find: /.../g, to: "...", expect: 1 },
];

const counts = Object.fromEntries(RULES.map((r) => [r.id, 0]));
for (const file of walk(STAGE)) {
  if (!file.endsWith(".md")) continue;
  const rel = relative(STAGE, file);
  if (AUTHORED_SKILLS.some((s) => rel.startsWith(`skills/${s}/`))) continue;
  let text = readFileSync(file, "utf8");
  const before = text;
  for (const r of RULES) {
    if (r.only && !r.only.test(rel)) continue;
    text = text.replace(r.re, (...m) => { counts[r.id]++; return r.to.replace(/\$(\d)/g, (_, i) => m[+i] ?? ""); });
  }
  if (text !== before) writeFileSync(file, text);
}
let patched = 0;
for (const p of PATCHES) {
  const f = join(STAGE, p.file);
  const text = readFileSync(f, "utf8");
  const hits = (text.match(p.find) ?? []).length;
  if (hits !== p.expect) { console.error(`patch ${p.file}: expected ${p.expect} hit(s), got ${hits}`); process.exit(3); }
  writeFileSync(f, text.replace(p.find, p.to));
  patched++;
}

// ---------- 5. manifests ----------
const versionFile = join(ROOT, "VERSION");
const version = (NEW_VERSION ?? readFileSync(versionFile, "utf8")).trim();
if (!/^\d+\.\d+\.\d+(-[0-9A-Za-z.-]+)?$/.test(version)) { console.error(`bad version: ${version}`); process.exit(2); }
const pluginJsonPath = join(PLUGIN, ".claude-plugin", "plugin.json");
const marketJsonPath = join(ROOT, ".claude-plugin", "marketplace.json");
const pluginJson = JSON.parse(readFileSync(pluginJsonPath, "utf8"));
const marketJson = JSON.parse(readFileSync(marketJsonPath, "utf8"));
pluginJson.version = version;
marketJson.metadata = { ...(marketJson.metadata ?? {}), version };
for (const p of marketJson.plugins) if (p.name === "athena") p.version = version;

// ---------- 6. lockfile ----------
const hash = createHash("sha256");
for (const f of walk(STAGE)) {
  const rel = relative(STAGE, f);
  if (AUTHORED_SKILLS.some((s) => rel.startsWith(`skills/${s}/`))) continue;
  hash.update(rel).update("\0").update(readFileSync(f)).update("\0");
}
const countDir = (d, pred = () => true) => readdirSync(join(STAGE, d)).filter(pred).length;
const lock = {
  source: { repo: "olympusforge/athena-organic", path: ".claude", commit, commitDate, dirty },
  syncedAt: new Date().toISOString(),
  toolVersion: "sync.mjs@1",
  agentNamespace: NS_AGENTS,
  counts: {
    files: walk(STAGE).length,
    skills: SKILLS.length - AUTHORED_SKILLS.length,
    agents: AGENTS.length,
    rules: countDir("rules", (n) => n.endsWith(".md")),
    outputStyles: countDir("output-styles", (n) => n.endsWith(".md")),
  },
  rewrites: counts,
  patches: patched,
  outputSha256: hash.digest("hex"),
};

// ---------- 7. lint ----------
const { errors, warnings } = lint(STAGE);
for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
if (errors.length) { console.error(`lint failed with ${errors.length} error(s)`); process.exit(4); }

console.log(`source  ${SOURCE} @ ${commit.slice(0, 12)}${dirty ? " (dirty)" : ""}`);
console.log(`counts  ${JSON.stringify(lock.counts)}`);
console.log(`rewrite ${JSON.stringify(counts)}  patches=${patched}  warnings=${warnings.length}`);

// ---------- 8. check / install ----------
function treeMap(root) {
  const m = new Map();
  if (!existsSync(root)) return m;
  for (const f of walk(root)) m.set(relative(root, f), readFileSync(f));
  return m;
}
if (CHECK) {
  let drift = 0;
  for (const dir of GENERATED) {
    const a = treeMap(join(STAGE, dir)), b = treeMap(join(PLUGIN, dir));
    for (const k of new Set([...a.keys(), ...b.keys()])) {
      if (!a.has(k)) { console.log(`extra    ${dir}/${k}`); drift++; }
      else if (!b.has(k)) { console.log(`missing  ${dir}/${k}`); drift++; }
      else if (!a.get(k).equals(b.get(k))) { console.log(`changed  ${dir}/${k}`); drift++; }
    }
  }
  const curLock = existsSync(join(ROOT, "SYNC_SOURCE.json")) ? JSON.parse(readFileSync(join(ROOT, "SYNC_SOURCE.json"), "utf8")) : {};
  if (curLock.outputSha256 !== lock.outputSha256) { console.log(`lockfile outputSha256 differs`); drift++; }
  if (curLock.source?.commit !== commit) console.log(`note: lockfile commit ${curLock.source?.commit?.slice(0, 12)} vs source ${commit.slice(0, 12)}`);
  rmSync(STAGE, { recursive: true, force: true });
  console.log(drift ? `DRIFT: ${drift} difference(s); run node scripts/sync.mjs` : "in sync");
  process.exit(drift ? 1 : 0);
}
if (DRY) { rmSync(STAGE, { recursive: true, force: true }); console.log("dry run; nothing written"); process.exit(0); }

for (const dir of GENERATED) {
  rmSync(join(PLUGIN, dir), { recursive: true, force: true });
  renameSync(join(STAGE, dir), join(PLUGIN, dir));
}
rmSync(STAGE, { recursive: true, force: true });
writeFileSync(versionFile, version + "\n");
writeFileSync(pluginJsonPath, JSON.stringify(pluginJson, null, 2) + "\n");
writeFileSync(marketJsonPath, JSON.stringify(marketJson, null, 2) + "\n");
writeFileSync(join(ROOT, "SYNC_SOURCE.json"), JSON.stringify(lock, null, 2) + "\n");
console.log(`installed into ${relative(process.cwd(), PLUGIN) || "."}; version ${version}`);
