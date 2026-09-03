# Skill Workflow Routing

Use this file to choose capabilities, not command names. Resolve each bracketed
capability against the runtime's live installed-skill catalog before invoking
anything. Skip optional capabilities that are unavailable; never synthesize an
absent skill command.

## Core Development Workflow

```text
[brainstorm] -> [plan] -> [implement] -> [test] -> [review] -> [ship] -> [journal]
```

- New feature: start with the brainstorm contract, then plan and implement.
- Accepted plan: reuse its outcome, constraints, non-goals, and acceptance
  criteria before implementation.
- Quick change: keep the brainstorm gate bounded, then use the fastest installed
  implementation workflow that still verifies the result.

## Bugfix Workflow

```text
[frame outcome] -> [scout] -> [diagnose] -> [choose fix] -> [implement] -> [test] -> [review]
```

- Prove the cause before changing behavior.
- Read-only investigation may stop after scouting or diagnosis.
- If no specialized debugging skill is installed, use native read and test
  capabilities without inventing a skill invocation.

## Investigation Workflow

```text
[scout] -> [diagnose] -> [brainstorm options when needed] -> [plan when delivery follows]
```

An investigation does not require a design approval loop unless it turns into
delivery work.

## Post-Implementation Capabilities

After implementation, use installed capabilities for:

- code review before merge;
- release or shipping validation when publication is in scope;
- decision or journal capture when the repository requires it.

## Shared-Workspace Setup

After the opening brainstorm contract and before implementation, use an
installed worktree/isolation capability when the repository workflow requires
one. Use an installed scouting capability or native file search to discover
relevant patterns.
