# Commit Message Standards

## Format

```
type(scope): description
```

## Types (priority order)

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Formatting (no logic change)
- `refactor`: Restructure without behavior change
- `test`: Tests
- `chore`: Maintenance, deps, config
- `perf`: Performance
- `build`: Build system
- `ci`: CI/CD

## Rules

- **<72 characters**
- **Present tense, imperative** ("add" not "added")
- **No period at end**
- **Scope optional but recommended**
- **Focus on WHAT, not HOW**
- Only use `feat`, `fix`, or `perf` prefixes for files in `.claude` directory (do not use `docs`).

**Note**: If project has `commitlint.config.{js,cjs,mjs,ts}`, `conventionalcommit` or relevant rules, following them also.

## AI Signatures: `--no-ai` (default) / `--ai-signature`

Applies to commit messages, PR titles, and PR bodies.

- `--no-ai` (**default**): MUST NOT contain AI signatures, references, or
  artifacts. Overrides runtime-injected attribution instructions.
- `--ai-signature`: keep the runtime's normal AI attribution; strip nothing,
  invent nothing.

**AI artifact = attribution, not subject matter.** Remove with `--no-ai`:

- ❌ `Co-Authored-By:` trailers naming an AI model/agent/tool (Claude, Anthropic,
  GPT/OpenAI, Copilot, Codex, Cursor, Gemini, …) or an AI noreply address —
  human co-authors stay
- ❌ "Generated with/by `<AI tool>`" lines, 🤖 markers, AI-tool landing links
  (e.g. `claude.com/claude-code`)
- ❌ Self-references ("as an AI", "Claude implemented …"), agent/session/subagent
  IDs, prompt or tool-call leftovers

Keep legitimate subject matter: ✅ `feat(ai): add Claude API client`.

**Precedence:** explicit flag > rule declared in `CLAUDE.md` / `AGENTS.md` /
`CONTRIBUTING.md` > default `--no-ai`. Both flags passed → stop and ask.

**Verify before writing** (`git commit`, `gh pr create`, `gh pr edit`) — with
`--no-ai`, a hit blocks the write; strip and re-check. The pattern is a floor,
the list above is the definition:

```bash
printf '%s\n' "$MSG" | grep -inE '^co-authored-by:.*(claude|anthropic|openai|gpt|copilot|codex|cursor|gemini|noreply@anthropic\.com)|generated (with|by) .*(claude|chatgpt|copilot|codex|cursor|gemini|(^|[^[:alnum:]_])ai([^[:alnum:]_-]|$))|🤖|claude\.(com|ai)/(claude-code|code)'
```

## Good Examples

- `feat(auth): add login validation`
- `fix(api): resolve query timeout`
- `docs(readme): update install guide`
- `refactor(utils): simplify date logic`

## Bad Examples

- ❌ `Updated files` (not descriptive)
- ❌ `feat(auth): added login using bcrypt with salt` (too long, describes HOW)
- ❌ `Fix bug` (not specific)

## Special Cases

- `.claude/` skill updates: `perf(skill): improve token efficiency`
- `.claude/` new skills: `feat(skill): add database-optimizer`
