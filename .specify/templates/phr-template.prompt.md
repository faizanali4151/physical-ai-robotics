---
id: {{ID}}
title: "{{TITLE}}"
stage: {{STAGE}}
date: {{DATE_ISO}}
surface: {{SURFACE}}
model: {{MODEL}}
feature: {{FEATURE}}
branch: {{BRANCH}}
user: {{USER}}
command: {{COMMAND}}
labels: {{LABELS_YAML}}
links:
  spec: {{SPEC_LINK}}
  ticket: {{TICKET_LINK}}
  adr: {{ADR_LINK}}
  pr: {{PR_LINK}}
files: {{FILES_YAML}}
tests: {{TESTS_YAML}}
---

# Prompt History Record: {{TITLE}}

## Context

**Stage**: {{STAGE}}
**Feature**: {{FEATURE}}
**Date**: {{DATE_ISO}}
**User**: {{USER}}
**Command**: {{COMMAND}}

## User Prompt

```
{{PROMPT_TEXT}}
```

## Assistant Response

{{RESPONSE_TEXT}}

## Files Modified

{{FILES_YAML}}

## Tests Run/Added

{{TESTS_YAML}}

## Outcome

{{OUTCOME}}

## Evaluation

{{EVALUATION}}

---

*Generated with Claude Code - Spec-Driven Development*
