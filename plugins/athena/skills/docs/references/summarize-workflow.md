# Summarize Workflow

1. Run the parent skill's bounded brainstorm to establish audience, focus, and
   acceptance criteria.
2. Read repository instructions and the existing docs route.
3. Use `scout` or focused repository search for the requested topics. Do not
   scan the entire codebase unless the request requires it.
4. Answer with an evidence-backed summary.
5. Update a summary document only when the project already designates one or
   the user explicitly asks for a durable file. Never invent a standard
   `codebase-summary` file solely because this operation was invoked.

Keep current behavior distinct from intended direction and stateful research.
When a designated codebase summary exists, keep it as a navigation map of entry
points and boundaries, never a per-file or per-function description. Follow
`references/doc-content-rules.md`. Do not implement product code.
