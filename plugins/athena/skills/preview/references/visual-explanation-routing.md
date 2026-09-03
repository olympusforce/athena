# Visual Explanation Routing

Use this file when a workflow asks for a visual explanation, diagram, slide deck,
diff review, or recap. Load `../SKILL.md` first for command syntax, then use this
file to choose the mode.

## Mode Selection

| Need                                              | Preview mode                              |
| ------------------------------------------------- | ----------------------------------------- |
| View an existing Markdown file or directory       | `/athena:preview <path>`                      |
| Explain a concept or code path                    | `/athena:preview --explain <topic>`           |
| Generate a focused architecture/data-flow diagram | `/athena:preview --diagram <topic>`           |
| Terminal-friendly diagram only                    | `/athena:preview --ascii <topic>`             |
| Self-contained HTML explanation                   | `/athena:preview --html --explain <topic>`    |
| Slide deck                                        | `/athena:preview --html --slides <topic>`     |
| Visual diff review for a branch, PR, or commit    | `/athena:preview --html --diff [ref]`         |
| Compare an implementation plan to code            | `/athena:preview --html --plan-review <plan>` |
| Recap recent project context                      | `/athena:preview --html --recap [timeframe]`  |

## Specialist Handoffs

- Documentation update after a durable visual: use `/athena:docs update` and
  `../../docs/references/documentation-management.md`.

## Output Rules

- Prefer the active plan's `visuals/` folder when a plan exists.
- If no plan exists, save under `plans/visuals/`.
- For HTML output, always include the theme toggle required by
  `html-css-patterns.md`.
- For diagrams, render and inspect the output; syntax validity alone is not
  enough.
