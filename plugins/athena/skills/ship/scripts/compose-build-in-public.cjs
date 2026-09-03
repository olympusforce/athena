#!/usr/bin/env node
/**
 * compose-build-in-public.cjs — pure draft composer for `ship --social`.
 *
 * `composeBuildInPublic(context)` takes PR/issue/plan/journal context and
 * returns `{title, summary, body}` — a build-in-public journal draft in the
 * shape documented in `references/ship-workflow.md`'s "Social publish" step.
 * It performs no I/O of its own (besides an optional stderr redaction
 * warning) and is deterministic: same input context → same output draft.
 *
 * Layering (AMENDMENTS.md G5, applied here too): this script does NOT call
 * out to a translation/tone engine. `writingStyle` only flips a documented
 * test hook (`MOCK_STYLE_TRANSFORM`) so callers can verify the parameter is
 * wired through; the actual style transform is the invoking agent's job
 * (e.g. via the installed copywriting skill) BEFORE or AFTER calling this
 * composer, same as journal's per-channel body layering.
 *
 * Secret redaction (athena R3): every draft is swept for common
 * secret-value shapes before being returned. NOTE on pattern provenance —
 * `kits/core/hooks/__tests__/secret-output-guardrail.test.cjs` (and its lib,
 * `kits/core/hooks/lib/secret-keywords.cjs`) only match PROMPT *keywords*
 * ("mentions .env", "mentions API key") for a UserPromptSubmit reminder;
 * there is no existing regex set for actual secret VALUES to lift from that
 * file. Adding a new file under `kits/core/hooks/` would also flip this
 * PR's `os_risk` path classification (kits/*\/hooks/* is an os_risk path).
 * So these value-matching patterns are defined here, self-contained, rather
 * than shared via a new cross-kit hooks lib.
 *
 * CLI usage (see `references/ship-workflow.md` for the full ship step):
 *   node compose-build-in-public.cjs --pr-title <title>
 *     [--pr-body-file <path>] [--issue-body-file <path>]
 *     [--plan-overview-file <path>] [--plan-next-phase <text>]
 *     [--journal-blockers-file <path>] [--collaborators <name1,name2>]
 *     [--writing-style <name>] --output <path> [--json]
 */

const fs = require('fs');
const path = require('path');
const { parseArgs } = require('util');

// See the module-level comment above for why these are self-contained
// rather than shared with kits/core/hooks/lib/secret-keywords.cjs.
const SECRET_VALUE_PATTERNS = [
  { pattern: /sk-proj-[A-Za-z0-9_-]{10,}/g }, // OpenAI project key
  { pattern: /sk-[A-Za-z0-9_-]{10,}/g }, // generic sk- key (OpenAI classic, Stripe, etc.)
  { pattern: /sk_[A-Za-z0-9_-]{10,}/g }, // generic sk_ key
  { pattern: /ghp_[A-Za-z0-9]{20,}/g }, // GitHub classic PAT
  { pattern: /github_pat_[A-Za-z0-9_]{20,}/g }, // GitHub fine-grained PAT
  { pattern: /xoxb-[A-Za-z0-9-]{10,}/g }, // Slack bot token
  { pattern: /AKIA[0-9A-Z]{12,}/g }, // AWS access key id
  { pattern: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g }, // JWT
  { pattern: /-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g }, // PEM block
  {
    // URL-embedded token/api_key/secret query params — keep the prefix, redact only the value.
    pattern: /(https?:\/\/[^\s]*?[?&](?:token|api[_-]?key|access[_-]?token|secret)=)[^\s&]+/gi,
    replace: (_match, prefix) => `${prefix}[redacted]`,
  },
  { pattern: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g }, // email address
];

/** Redact secret-value shapes from `text`. Warns to stderr (not the return value) when anything matched. */
function redactSecretsFromDraft(text) {
  if (typeof text !== 'string' || !text) return text;
  let out = text;
  let redactedAny = false;
  for (const { pattern, replace } of SECRET_VALUE_PATTERNS) {
    const before = out;
    out = out.replace(pattern, replace || '[redacted]');
    if (out !== before) redactedAny = true;
  }
  if (redactedAny) {
    process.stderr.write(
      '[compose-build-in-public] warning: redacted secret-looking value(s) from the draft body\n',
    );
  }
  return out;
}

function firstParagraph(text) {
  if (!text || typeof text !== 'string') return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  return trimmed.split(/\n\s*\n/)[0].trim();
}

/**
 * Test-only style-transform hook. Real tone/translation adaptation is the
 * calling agent's responsibility (G5 layering) — this only proves the
 * `writingStyle` parameter reaches the draft when MOCK_STYLE_TRANSFORM is set.
 */
function applyWritingStyleHook(body, writingStyle) {
  if (!writingStyle) return body;
  if (process.env.MOCK_STYLE_TRANSFORM === '1') {
    return `<!-- style: ${writingStyle} -->\n${body}`;
  }
  return body;
}

/**
 * @param {object} context
 * @param {{title?: string, body?: string}} [context.pr]
 * @param {{body?: string}|null} [context.issue] linked GitHub issue
 * @param {{overview?: string, phases?: string[], nextPhase?: string}|null} [context.plan]
 * @param {Array<string|{blockers?: string}>} [context.journalEntries]
 * @param {string[]} [context.collaborators]
 * @param {string|null} [context.writingStyle]
 * @returns {{title: string, summary: string, body: string}}
 */
function composeBuildInPublic({
  pr = {},
  issue = null,
  plan = null,
  journalEntries = [],
  collaborators = [],
  writingStyle = null,
} = {}) {
  const title = pr.title || 'Untitled change';

  const why =
    firstParagraph(issue && issue.body) ||
    firstParagraph(plan && plan.overview) ||
    firstParagraph(pr.body) ||
    'Sharing progress on this change.';

  const whatChanged =
    firstParagraph(pr.body) ||
    (plan && Array.isArray(plan.phases) && plan.phases.length > 0
      ? plan.phases.join(', ')
      : 'See the PR diff for the full set of changes.');

  const blockers = (journalEntries || [])
    .map((entry) => (typeof entry === 'string' ? entry : entry && entry.blockers))
    .filter(Boolean);

  const whatsNext = (plan && plan.nextPhase) || 'Shipping to beta and watching CI.';

  const sections = [`# ${title}`, '', '## Why this?', why, '', '## What changed', whatChanged];

  // Skip the section entirely when there are no blockers — no empty stub.
  if (blockers.length > 0) {
    sections.push('', '## The tricky bit', blockers.join('\n\n'));
  }

  sections.push('', "## What's next", whatsNext);

  if (collaborators && collaborators.length > 0) {
    sections.push(
      '',
      '## A quick thanks',
      `Thanks to ${collaborators.join(', ')} for the help along the way.`,
    );
  }

  sections.push('', '_Shipping in the open._');

  let body = sections.join('\n');
  body = applyWritingStyleHook(body, writingStyle);
  body = redactSecretsFromDraft(body); // Always the last step before returning (athena R3).

  // Redact BEFORE truncating: slicing first can cut a secret-value pattern
  // mid-match, leaving a partial value (e.g. half a token) that no longer
  // matches SECRET_VALUE_PATTERNS's length-gated regexes and so survives
  // redaction unredacted.
  const redactedWhy = redactSecretsFromDraft(why);
  const summary = redactedWhy.length > 140 ? `${redactedWhy.slice(0, 137)}...` : redactedWhy;

  return { title: redactSecretsFromDraft(title), summary, body };
}

function readFileIfExists(filePath) {
  if (!filePath) return null;
  if (!fs.existsSync(filePath)) return null;
  return fs.readFileSync(filePath, 'utf8');
}

function parseCliArgs(argv) {
  return parseArgs({
    args: argv,
    options: {
      'pr-title': { type: 'string' },
      'pr-body-file': { type: 'string' },
      'issue-body-file': { type: 'string' },
      'plan-overview-file': { type: 'string' },
      'plan-next-phase': { type: 'string' },
      'journal-blockers-file': { type: 'string' },
      collaborators: { type: 'string' },
      'writing-style': { type: 'string' },
      output: { type: 'string' },
      json: { type: 'boolean', default: false },
      help: { type: 'boolean', default: false },
    },
    allowPositionals: false,
  });
}

function main() {
  let values;
  try {
    ({ values } = parseCliArgs(process.argv.slice(2)));
  } catch (error) {
    console.error(`[compose-build-in-public] invalid arguments: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  if (values.help) {
    console.error(
      'Usage: node compose-build-in-public.cjs --pr-title <title> [--pr-body-file <path>] [--issue-body-file <path>] [--plan-overview-file <path>] [--plan-next-phase <text>] [--journal-blockers-file <path>] [--collaborators <n1,n2>] [--writing-style <name>] --output <path> [--json]',
    );
    return;
  }

  if (!values['pr-title']) {
    console.error('[compose-build-in-public] --pr-title is required');
    process.exitCode = 1;
    return;
  }

  const journalBlockersRaw = readFileIfExists(values['journal-blockers-file']);
  const journalEntries = journalBlockersRaw
    ? journalBlockersRaw
        .split(/\n\s*\n/)
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const draft = composeBuildInPublic({
    pr: { title: values['pr-title'], body: readFileIfExists(values['pr-body-file']) },
    issue: values['issue-body-file'] ? { body: readFileIfExists(values['issue-body-file']) } : null,
    plan:
      values['plan-overview-file'] || values['plan-next-phase']
        ? {
            overview: readFileIfExists(values['plan-overview-file']),
            nextPhase: values['plan-next-phase'],
          }
        : null,
    journalEntries,
    collaborators: values.collaborators
      ? values.collaborators
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : [],
    writingStyle: values['writing-style'] || null,
  });

  if (values.output) {
    fs.mkdirSync(path.dirname(path.resolve(values.output)), { recursive: true });
    fs.writeFileSync(path.resolve(values.output), `${draft.body}\n`);
  }

  if (values.json) {
    console.log(JSON.stringify(draft));
  } else if (!values.output) {
    console.log(draft.body);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  composeBuildInPublic,
  redactSecretsFromDraft,
  SECRET_VALUE_PATTERNS,
};
