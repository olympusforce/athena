# Skill Domain Routing

Route domain work from the runtime's live installed-skill catalog. Kit
composition can replace an entire skill set, so a copied command inventory in
this shared rule is never authoritative.

## Routing Procedure

1. Read the live skill catalog supplied by the runtime.
2. Match the user's primary intent to a capability below.
3. Select an installed skill whose metadata explicitly covers that capability.
4. Read that skill's complete instructions before acting.
5. If no installed skill matches, continue with the primary workflow and
   available native capabilities. Do not recommend or invoke an absent skill.

## Capability Map

| User intent                                               | Capability to match                                                              |
| --------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Replicate, build, style, or audit a UI                    | Frontend design, frontend development, UI styling, accessibility, or performance |
| Locate code or understand a repository                    | File scouting, semantic navigation, repository packing, or knowledge mapping     |
| Build an API, authentication flow, or payment integration | Backend development, authentication, or payments                                 |
| Design schemas or optimize database behavior              | Database design and operations                                                   |
| Deploy an application or change infrastructure            | Deployment or DevOps                                                             |
| Audit security or investigate threats                     | Security review, vulnerability scanning, or threat intelligence                  |
| Build or improve an AI workflow                           | Context engineering, agent development, or multimodal processing                 |
| Build, expose, or use MCP tooling                         | MCP construction, agentization, or MCP execution                                 |
| Create or maintain documentation                          | Documentation maintenance, current-doc lookup, diagrams, or publishing           |
| Write marketing content or design a brand                 | Copywriting, brand design, or visual design                                      |
| Work in a specific application framework                  | Match the exact framework named by the user                                      |

## Usage Rules

- Pick one primary skill per distinct intent; add a secondary skill only when
  the task genuinely crosses domains.
- Treat installed skill metadata as the availability and routing authority.
- Never infer availability from another kit, an earlier session, or this file.
- Run selected domain skills inside `primary-workflow.md`; do not restate its
  delivery sequence here.
