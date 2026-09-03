# Output Standards & Quality

## Plan File Format

### YAML Frontmatter (Required for plan.md)

All `plan.md` files MUST include YAML frontmatter at the top:

```yaml
---
title: '{Brief plan title}'
description: '{One-sentence summary for card preview}'
status: pending # pending | in-progress | completed | cancelled
priority: P2 # P1 (High) | P2 (Medium) | P3 (Low)
effort: 4h # Estimated total effort
issue: <issue-number> # GitHub issue number (if applicable)
branch: <owner>/feat/<feature-name>
tags: [frontend, api] # Category tags
blockedBy: [] # Same-scope refs by default; use global:/project: for cross-scope
blocks: [] # Example: [project:<timestamp>-user-dashboard]
created: <date>
---
```

When `--html` is active, `plan.html` is the primary artifact after validation
and red-team gates. A companion `plan.md` may exist as a short index for
metadata, issue links, and exec handoff compatibility only. Do not duplicate
the full plan body in both files unless a downstream exec handoff needs
Markdown.

### HTML Plan Format (`--html`)

`plan.html` must be:

- Self-contained with inline CSS and JavaScript.
- Responsive and keyboard-accessible.
- Structured around overview, visible phase outlines, user flows, risks, an
  implementation workflow diagram, annotated UI/UX mockups when UI is in scope,
  diagrams, charts, citations, and open questions.
- Interactive where useful: tabs, expandable sections, filters, toggles, or
  chart controls.
- Source-cited with visible URL citations for external docs, GitHub issues,
  specs, and research links.
- Safe to open directly from disk without a dev server.
- Designed in editorial magazine style: warm paper `#faf7f2`, paper panels
  `#f0ebe1`, ink `#0a0a0a`, muted `#6b6258`, accent red `#b8232c`, serif
  display, mono labels, hairline dividers, asymmetric grids, rule lines, and
  subtle paper grain.
- Free of gradients, shadows, rounded cards, pure white backgrounds, emoji
  icons, generic SaaS styling, and decorative bokeh/orbs.
- Explicit on the main page: every phase shows title, status, priority,
  dependencies, objective, 3-6 key bullets, related files, success highlights,
  and test/validation gate when known.
- Modal-driven for detail: every phase outline opens a keyboard-accessible
  modal that renders full phase markdown with headings, lists, checkboxes,
  tables, code fences, inline code, blockquotes, links, horizontal rules, and
  frontmatter metadata.
- Visual on implementation: include at least one implementation workflow diagram
  (flowchart, sequence, or architecture) rendered inline; `--html` treats this
  as required, not optional.
- Mockup-driven when the plan touches UI/UX: embed annotated mockups of the
  proposed screens or components inline, derived from the project design
  guidelines (`docs/design-guidelines.md` when present, else the built-in
  editorial contract), with callouts mapping elements to design tokens,
  interaction states, and acceptance criteria so the user previews intended UI
  before implementation.
- Illustrated when image generation is available: use `imagegen`,
  built-in `image_gen`, or `create_image` to generate 1-3 watercolor technical
  sketch assets, keep sources under `{plan-dir}/assets/`, and embed selected
  images as data URIs so `plan.html` remains portable.

### AgentWiki Publish Format (`--wiki`)

When `--wiki` is active:

- Publish only final reviewed artifacts after validation/red-team gates.
- Use AgentWiki CLI when `agentwiki whoami` succeeds; otherwise use AgentWiki
  MCP document/upload/share/static-site tools when exposed.
- Default to private/workspace sharing with `agentwiki doc share`. Use
  `agentwiki doc publish` only when the user explicitly requests public
  document publishing.
- Markdown plans publish as AgentWiki documents. If details live across
  phase files, prepare `{plan-dir}/wiki-publish.md` as a concise combined
  document or index before upload.
- HTML plans remain local by default. Publish through AgentWiki hosted static
  sites using the self-contained `plan.html` only when the user explicitly
  requests a public hosted site.
- Record returned document, share, publish, or site URLs in the final response.
  If `--github` is also active, add the wiki URL to the GitHub issue.
- If AgentWiki is unavailable or unauthenticated, skip publishing without
  failing plan creation and report the exact missing capability.
- Redact secrets, tokens, private logs, customer data, and local-only absolute
  paths before publishing.

### Auto-Population Rules

When creating plans, auto-populate these fields:

- **title**: Extract from task description
- **description**: First sentence of Overview section
- **status**: Always `pending` for new plans
- **priority**: From user request or default `P2`
- **effort**: Sum of phase estimates
- **issue**: Parse from branch name or context
- **branch**: Current git branch (`git branch --show-current`)
- **tags**: Infer from task keywords (e.g., frontend, backend, api, auth)
- **blockedBy**: Detected during pre-creation scan (empty `[]` if none)
- **blocks**: Detected during pre-creation scan (empty `[]` if none)
- **created**: Today's date in YYYY-MM-DD format

### Cross-Scope Reference Syntax

- Bare reference: `<timestamp>-auth-system`
  - Meaning: same scope as the current plan.
- Global reference: `global:<timestamp>-auth-system`
  - Meaning: resolve against the configured global plans root.
- Project reference: `project:<timestamp>-auth-system`
  - Meaning: resolve against the current project plans root.

Missing references should warn and render as `not found`. They should not block plan creation.

### Tag Vocabulary (Recommended)

Use these predefined tags for consistency:

- **Type**: `feature`, `bugfix`, `refactor`, `docs`, `infra`
- **Domain**: `frontend`, `backend`, `database`, `api`, `auth`
- **Scope**: `critical`, `tech-debt`, `experimental`

### Runtime Work Item Guidance

When a live task-management surface is available, derive concise work items
from the plan. Use an imperative action and deliverable, include the relevant
acceptance criteria, and retain a durable source-plan reference. Discover the
runtime's exact fields instead of copying a parameter schema into the plan.

See `task-management.md` for runtime capability discovery, durable mapping, and handoff rules.

## Task Breakdown

- Transform complex requirements into manageable, actionable tasks
- Each task independently executable with clear dependencies
- Prioritize by dependencies, risk, business value
- Eliminate ambiguity in instructions
- Include specific file paths for all modifications
- Provide clear acceptance criteria per task

### File Management

List affected files with:

- Full paths (not relative)
- Action type (modify/create/delete)
- Brief change description
- Dependencies on other changes
- Discover and follow the consuming repository's instruction and development-standard documents; do not assume a fixed docs path.

## Workflow Process

1. **Initial Analysis** → Read docs, understand context
2. **Research Phase** → Spawn researchers in parallel, investigate approaches
3. **Synthesis** → Analyze reports, identify optimal solution
4. **Design Phase** → Create architecture, implementation design
5. **Plan Documentation** → Write comprehensive plan in Markdown, or `plan.html`
   when `--html` is present
6. **Review & Refine** → Ensure completeness, clarity, actionability

## Output Requirements

### What Planners Do

- Create plans ONLY (no implementation)
- Provide plan file path and summary
- With `--html`, provide the `plan.html` path first and say it is authoritative
- With `--wiki`, provide the AgentWiki document/share/site URL when published,
  or the exact skip reason when unavailable
- Self-contained plans with necessary context
- Code snippets/pseudocode when clarifying
- Multiple options with trade-offs when appropriate
- Discover and follow the consuming repository's instruction and development-standard documents; do not assume a fixed docs path.

### Writing Style

**IMPORTANT:** Sacrifice grammar for concision

- Focus clarity over eloquence
- Use bullets and lists
- Short sentences
- Remove unnecessary words
- Prioritize actionable info

### Unresolved Questions

**IMPORTANT:** Use `ask_user capability` to ask users for unresolved questions at the end

- Questions needing clarification
- Technical decisions requiring input
- Unknowns impacting implementation
- Trade-offs requiring business decisions
  Revise the plan and phases based on the answers.

## Quality Standards

### Thoroughness

- Thorough and specific in research/planning
- Consider edge cases, failure modes
- Think through entire user journey
- Document all assumptions

### Maintainability

- Consider long-term maintainability
- Design for future modifications
- Document decision rationale
- Avoid over-engineering
- Discover and follow the consuming repository's instruction and development-standard documents; do not assume a fixed docs path.

### Research Depth

- When uncertain, research more
- Multiple options with clear trade-offs
- Validate against best practices
- Consider industry standards

### Security & Performance

- Address all security concerns
- Identify performance implications
- Plan for scalability
- Consider resource constraints

### Implementability

- Detailed enough for junior developers
- Validate against existing patterns
- Ensure codebase standards consistency
- Provide clear examples

**Remember:** Plan quality determines implementation success. Be comprehensive, consider all solution aspects.
