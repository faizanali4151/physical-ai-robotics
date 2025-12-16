# .specify Directory

This directory contains the project's governance, templates, and automation scripts for Spec-Driven Development (SDD).

## Structure

```
.specify/
├── memory/
│   └── constitution.md          # Project constitution (principles & governance)
├── templates/
│   ├── phr-template.prompt.md   # Prompt History Record template
│   ├── spec-template.md         # Feature specification template (TODO)
│   ├── plan-template.md         # Implementation plan template (TODO)
│   └── tasks-template.md        # Task breakdown template (TODO)
├── scripts/
│   └── bash/
│       └── create-phr.sh        # Script to create Prompt History Records
└── README.md                    # This file
```

## Constitution

The constitution (`.specify/memory/constitution.md`) defines the non-negotiable principles that govern this project:

- **10 Core Principles**: Educational clarity, reproducibility, modern frameworks, simulation-first, safety/ethics, multimodal integration, open source, performance, version control, accessibility
- **Governance**: Amendment procedures, versioning policy, compliance reviews
- **Current Version**: 1.0.0 (ratified 2025-12-04)

All contributions must align with these principles.

## Templates

Templates provide structure for development artifacts:

- **PHR (Prompt History Record)**: Documents AI-assisted development interactions
- **Spec**: Feature requirements and acceptance criteria (to be created)
- **Plan**: Architecture and implementation strategy (to be created)
- **Tasks**: Testable, dependency-ordered task breakdowns (to be created)

## Scripts

Automation tools for SDD workflows:

- `create-phr.sh`: Creates Prompt History Records with proper routing
  - Usage: `./create-phr.sh --title "Title" --stage <stage> [--feature <name>] [--json]`
  - Stages: constitution, spec, plan, tasks, red, green, refactor, explainer, misc, general

## Prompt History Records

PHRs are stored in `history/prompts/` with automatic routing:

- `history/prompts/constitution/` - Constitution changes
- `history/prompts/<feature-name>/` - Feature-specific work
- `history/prompts/general/` - General project work

Each PHR captures:
- User prompt (verbatim)
- Assistant response
- Files modified
- Tests run
- Outcome and evaluation

This provides traceability and learning from past decisions.

## Contributing

1. Read the constitution before making contributions
2. Use templates for new features/plans
3. Create PHRs for significant AI-assisted work
4. Reference principles in pull requests
5. Follow semantic versioning for releases

## Resources

- [Constitution](memory/constitution.md)
- [PHR Template](templates/phr-template.prompt.md)
- [Project Root README](../README.md)
