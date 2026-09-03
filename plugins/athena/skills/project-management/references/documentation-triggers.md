# Documentation Impact

Project status tracking and project documentation are separate authority
surfaces. Updating plan progress does not require rewriting evergreen docs.

## Update docs when

- user-visible behavior, setup, commands, or configuration changed;
- architecture, data flow, public contracts, security, or recovery changed;
- a machine-readable contract or generated reference changed;
- an accepted maintainer decision must guide future work.

Internal refactors, task completion, and phase status changes do not by
themselves require a docs update.

## Route by authority

Read repository instructions, the root README, and existing docs navigation.
Search for the changed concept and update the smallest owning surface. Do not
assume standard filenames or a universal docs tree.

When a script, manifest, schema, or generator owns a command or inventory,
update that machine owner and link to it from prose. Do not duplicate the list
across roadmap, architecture, and summary documents.

## Protocol

1. Record an explicit docs-impact decision.
2. If impact exists, pass `docs-manager` the changed contract, evidence, and
   exact routed docs in scope.
3. Verify links, commands, and claims against current evidence.
4. Keep plan/report state in the active plan; do not promote it to evergreen
   docs merely to record completion.
