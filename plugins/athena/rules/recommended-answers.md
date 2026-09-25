# Recommended Answers (`--recommended`)

Applies only when the invocation, or a parent's forwarded prompt, includes
`--recommended`. Without the flag, ask as usual.

## Auto-answer

Instead of asking a clarification question (including mode selection and
proceed / request-changes / abort workflow gates), choose in this order: the
option labelled `(Recommended)`, else the first option, else your own pick with a
one-line reason. Print `auto-answered (--recommended): <question> → <choice>`.

Still ask when the choice is irreversible or outward-facing (push, publish,
merge, delete, PR/issue create, posting), needs credentials, has no defensible
default, is a regression or side-effect decision (`HARD-GATE-NO-SIDE-EFFECTS`),
or would reverse an explicit user decision (`self-decision.md`).

## Decision log

Before acting on an auto-answer, append it to the decision log:

- active plan dir → `{plan-dir}/decisions.md`
- no plan dir → `.athena/plans/reports/decisions-{YYMMDD-HHMM}-{slug}.md`

Create the file with a `# Decisions` heading. One entry per answer:

```markdown
## D<N> — <short question> (<skill>/<step>, <YYYY-MM-DD HH:MM>)

- Options: <A (Recommended)> · <B> · <C>
- Chosen: <A> — labelled | first | own pick
- Why: <one line>
- To revert: <what to rerun or change>
```

## Scope

- Forward `--recommended` to every downstream skill and subagent prompt; answer
  questions relayed back by subagents the same way.
- `--recommended` never implies `--code-review`, `--test`, or another opt-in.
