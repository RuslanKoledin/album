# Photobook Agent Asset Rules

This folder contains the source instructions used by the Photobook frontend.
Keep the active skills concise, project-specific, and free from conflicting
stack defaults.

## Startup

Before changing these assets:

1. Run `python3 agent-assets/project-documentation-wiki/scripts/init_project_wiki.py --project .`.
2. Read `docs/wiki/index.md`, `docs/wiki/schema.md`, recent `docs/wiki/log.md`,
   and the relevant local `FEATURE.md`.
3. Read the skill being changed and only its directly relevant references.

After a durable skill, architecture, workflow, or rule change, update the
affected Wiki/feature documents and append the Wiki log.

## Consuming project truth

- The consuming Photobook project owns engineering rules in
  `docs/engineering/frontend.md`; this bundle must link to that source instead
  of copying its stack, architecture, testing, or UI rules.
- Keep active skills procedural: route the agent to project truth, task-specific
  references, and verification.
- Generic imported sources may remain for provenance, but they must not become
  active defaults or override the consuming project.

## Skill authoring

- Keep `SKILL.md` procedural and concise.
- Put detailed architecture and domain rules in directly linked references.
- Do not repeat the same rule in multiple active skills without a clear reason.
- Keep YAML frontmatter limited to `name` and `description`.
- Keep `agents/openai.yaml` consistent with its skill.
- Use imperative instructions and explicit trigger descriptions.

## Verification

- Validate every changed skill with the system `quick_validate.py` script.
- Check Markdown links and search active files for stale conflicting stack rules.
- Validate the consuming frontend according to its own engineering Definition
  of Done.
