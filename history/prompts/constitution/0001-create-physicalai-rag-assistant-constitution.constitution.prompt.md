---
id: 0001
title: Create PhysicalAI RAG Assistant Constitution
stage: constitution
date: 2025-12-07
surface: agent
model: claude-sonnet-4-5
feature: none
branch: main
user: Muhammad Faizan Manzoor
command: /sp.constitution
labels: ["constitution", "rag-assistant", "cli-automation", "physical-ai"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - .specify/memory/constitution.md
tests:
  - null
---

## Prompt

```text
  You are the "PhysicalAI-RAG-Assistant".
  You generate ONLY CLI-automatable specs for building a fully integrated RAG chatbot inside a Docusaurus book.
  Rules:
  1. All steps MUST be executable via CLI. No manual edits.
  2. Deterministic and file-safe outputs.
  3. Output must follow spec-kit conventions.
  4. Chatbot runs on FastAPI, Qdrant Cloud Free, Neon Postgres Free, LLM via ChatKit or Gemini Free Tier.
  5. RAG answers only from book content unless explicitly opted out.
  6. Selected-text queries override normal retrieval.
  7. Generated code must be minimal and CLI-installable.
  8. Docusaurus integration must be plugin-based via CLI.
  9. Pipelines must support re-running from CLI.
  10. Any ambiguity = simplest CLI-automatable solution.
```

## Response snapshot

Updated `.specify/memory/constitution.md` to version 1.0.0 with 10 core principles for the PhysicalAI-RAG-Assistant:

**Core Principles**:
1. CLI-First Automation (NON-NEGOTIABLE) - All operations via CLI, no manual steps
2. Deterministic & File-Safe Operations - Reproducible outputs, atomic file operations
3. Spec-Kit Convention Compliance - Follow established directory and naming conventions
4. Free-Tier Infrastructure Only - Qdrant/Neon/ChatKit free tiers, no paid services
5. Book-Content-Only RAG - Default to answering only from book material
6. Selected-Text Query Override - Prioritize user-selected context
7. Minimal & CLI-Installable Code - No over-engineering, standard package managers
8. Docusaurus Plugin-Based Integration - Custom plugin architecture
9. Re-runnable Pipelines - Idempotent data operations
10. Simplest CLI-Automatable Solution - YAGNI principle for ambiguous requirements

**Additional Sections**:
- Development Workflow: Constitution Check → Specify → Plan → Tasks → Implement → Validate
- Architecture Standards: FastAPI backend, RAG pipeline design, Docusaurus plugin, data models
- Governance: Amendment procedure, versioning policy, compliance review, enforcement levels

## Outcome

- ✅ Impact: Established foundational principles for CLI-first RAG chatbot development aligned with Physical AI book mission
- 🧪 Tests: N/A (constitution is a governance document)
- 📁 Files: Created constitution v1.0.0 with sync impact report
- 🔁 Next prompts: Use `/sp.specify` to create RAG chatbot feature specification following these principles
- 🧠 Reflection: Constitution successfully balances educational accessibility (free tiers), technical rigor (CLI automation), and user experience (selected-text queries). All 10 principles are actionable and testable.

## Evaluation notes (flywheel)

- Failure modes observed: None (initial constitution creation)
- Graders run and results (PASS/FAIL): PASS - All placeholders filled, templates verified consistent
- Prompt variant (if applicable): N/A (standard constitution creation)
- Next experiment (smallest change to try): Test constitution principles during first feature specification with `/sp.specify`
