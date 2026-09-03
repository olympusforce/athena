#!/usr/bin/env node
// Assert VERSION == plugin.json.version == marketplace metadata.version == plugins[0].version
// and, when --tag=<ref> is given, that the ref is `athena--v<VERSION>`.
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const version = read("VERSION").trim();
const plugin = JSON.parse(read("plugins/athena/.claude-plugin/plugin.json"));
const market = JSON.parse(read(".claude-plugin/marketplace.json"));
const entry = market.plugins.find((p) => p.name === "athena");

const seen = {
  VERSION: version,
  "plugin.json": plugin.version,
  "marketplace.metadata.version": market.metadata?.version,
  "marketplace.plugins[athena].version": entry?.version,
};
const bad = Object.entries(seen).filter(([, v]) => v !== version);
if (bad.length) {
  console.error("version mismatch:", seen);
  process.exit(1);
}
const tagArg = process.argv.find((a) => a.startsWith("--tag="));
if (tagArg) {
  const tag = tagArg.slice("--tag=".length);
  const want = `athena--v${version}`;
  if (tag !== want) {
    console.error(`tag ${tag} does not match ${want}`);
    process.exit(1);
  }
}
console.log(`version ok: ${version}`);
