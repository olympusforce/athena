# Project Domain Routing

Use this file only when choosing between installed Athena skills. If the user
asks to discover or install external skills, return to `../SKILL.md` and use the
Skills CLI flow.

## Routing Rules

- If the user names a skill, use that skill.
- Pick one primary skill per distinct intent. Mention secondary skills only as
  follow-up helpers.
- If the task needs a multi-step sequence, read
  `../../exec/references/workflow-routing.md` after choosing the primary skill.
- If two skills overlap, prefer the more specific domain skill over a generic
  workflow skill.

## Frontend and UI

| User intent                                        | Primary skill               |
| -------------------------------------------------- | --------------------------- |
| Replicate a mockup, screenshot, or video           | `/athena:frontend-design`       |
| Build React or TypeScript components               | `/athena:frontend-development`  |
| Style with Tailwind or shadcn/ui                   | `/athena:ui-styling`            |
| Audit UI accessibility or UX                       | `/athena:web-design-guidelines` |
| Apply React or Next.js performance patterns        | `/athena:react-best-practices`  |
<!-- | Generate UI designs with Stitch                    | `/stitch`                |
| Write shaders or procedural graphics               | `/shader`                | -->

## Codebase Understanding

| User intent                              | Primary skill  |
| ---------------------------------------- | -------------- |
| Locate files or understand code quickly  | `/athena:scout`    |
| Pack a repository for LLM use            | `/athena:repomix`  |
| Semantic go-to-definition or find-usages | `/gkg`      |
| Build a queryable knowledge graph        | `/graphify` |

## Backend, Data, and Auth

| User intent                               | Primary skill             |
| ----------------------------------------- | ------------------------- |
<!-- | Build REST, GraphQL, or backend services  | `/athena:backend-development` |
| Add auth, OAuth, sessions, or passkeys    | `/better-auth`         |
| Design schemas or write SQL/NoSQL queries | `/databases`           |
| Integrate Stripe, Polar, Paddle, or SePay | `/payment-integration` | -->

## Infrastructure and Security

| User intent                               | Primary skill       |
| ----------------------------------------- | ------------------- |
<!-- | Deploy to hosted platforms                | `/deploy`        |
| Docker, Kubernetes, CI/CD, or cloud ops   | `/devops`        |
| STRIDE/OWASP audit with remediation       | `/security`      |
| Secret, dependency, or vulnerability scan | `/security-scan` |
| OSINT or cyber threat intelligence        | `/cti-expert`    | -->

## AI, MCP, and Browser Automation

| User intent                            | Primary skill             |
| -------------------------------------- | ------------------------- |
| Context, memory, or agent architecture | `/athena:context-engineering` |
<!-- | Generate `llms.txt`                    | `/llms`                |
| Build Google ADK agents                | `/google-adk-python`   |
| Build MCP servers                      | `/mcp-builder`         |
| Convert code into CLI/MCP surface      | `/agentize`            |
| Discover or execute MCP tools          | `/use-mcp`             | -->

## Testing, Docs, and Media

| User intent                                      | Primary skill          |
| ------------------------------------------------ | ---------------------- |
<!-- | Run tests, coverage, or TDD gates                | `/test`             |
| Playwright, Vitest, k6, visual or a11y tests     | `/web-testing`      | -->
| Project docs init/update/summarize               | `/athena:docs`             |
| Library/framework docs lookup                    | `/athena:docs-seeker`      |
| Visual explanation, preview, slides, or diagrams | `/athena:preview`          |
<!-- | Mermaid syntax                                   | `/mermaidjs-v11`    |
| Publish-grade technical diagrams                 | `/tech-graph`       | -->

## Planning, Research, and Agent Workflow

| User intent                                                       | Primary skill         |
| ----------------------------------------------------------------- | --------------------- |
| Pressure-test a plan, design, or idea through an interview        | `/athena:advise`          |
<!-- | Draft a self-contained brief for a researcher                     | `/research-prompt` |
| Preserve conversation state for a fresh agent                     | `/handoff`         |
| Extract user decisions into a README, ADR, or structured document | `/interview-docs`  |
| Create local context files for a subfolder                        | `/folder-context`  |
| Prepare / preflight a long-running goal with an outcome lock      | `/goal-warmup`     |
| Benchmark a coding model on DeepSWE through OpenRouter            | `/deep-swe`        | -->

## Frameworks and Platforms

| User intent                            | Primary skill            |
| -------------------------------------- | ------------------------ |
| Next.js, App Router, RSC, Turborepo    | `/athena:web-frameworks`     |
<!-- | TanStack Start/Form/AI                 | `/tanstack`           | -->
| React Native, Flutter, SwiftUI, Kotlin | `/athena:mobile-development` |
