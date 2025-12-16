---
id: 001
title: Fix MDX Syntax in Learning Chapter
stage: refactor
date: 2025-12-05
surface: agent
model: claude-sonnet-4-5-20250929
feature: physical-ai-book
branch: master
user: muhammad-faizan
command: /sp.implement
labels: ["mdx", "syntax-fix", "docusaurus", "refactor"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - docs/learning.mdx
tests: []
---

## Prompt

```text
ix-learning-mdx --style "MDX syntax repair" --details "
The file docs/learning.mdx is failing to compile with an ACORN parsing error at line ~578.
Fix ALL MDX syntax issues without altering the educational content.

Apply the following corrections:

1. Fix all code blocks:
   - Ensure every ``` block is properly opened and closed.
   - Add language identifiers (python, mermaid, bash, etc.)
   - Escape all curly braces { } inside code blocks so MDX does not interpret them as JS expressions.
   Example:
       return { 'a': 1 }
       → return \{ 'a': 1 \}

2. Fix Mermaid diagrams:
   - Replace decision nodes like {Decision} with {{Decision}} to avoid MDX JSX parsing.

3. Fix accidental JSX:
   - Escape <tag> or </tag> if they are not real JSX.
   Example:
       <RobotModel>
       → \<RobotModel>

4. Fix unclosed blocks:
   - Ensure no blockquote, list, heading, or fenced code block is left unclosed.
   - Ensure no stray backticks appear in the file.

5. Fix MDX expressions:
   - Remove or escape any accidental JS expressions inside {} that are not supposed to be evaluated.
   - Example:
       {value}
       → \{value\}

6. Do NOT modify:
   - Diagrams text
   - Exercises
   - Quizzes
   - Python/PyTorch code semantics
   - Navigation metadata

Output:
Return a fully corrected version of docs/learning.mdx that compiles successfully in Docusaurus MDX without any acorn errors.
"
```

## Response

Successfully fixed MDX syntax issues in `docs/learning.mdx`. The file now compiles without errors.

### Issues Identified and Fixed

1. **Line 578**: Curly braces in mathematical notation
   - Before: `D = {(s₁, a₁), (s₂, a₂), ..., (sₙ, aₙ)}`
   - After: `D = \{(s₁, a₁), (s₂, a₂), ..., (sₙ, aₙ)\}`
   - Reason: MDX was interpreting `{}` as JSX expression syntax

2. **Line 681**: Curly braces in set notation
   - Before: `D ← D ∪ {(s_π, a_expert)}`
   - After: `D ← D ∪ \{(s_π, a_expert)\}`
   - Reason: Same JSX expression parsing issue

### Verification

- Build completed successfully with no errors
- Docusaurus compiled both English and Urdu locales
- No ACORN parsing errors detected
- All educational content preserved
- Python/PyTorch code semantics unchanged
- Quiz and exercise components intact

### Files Modified

- `website/docs/learning.mdx` (2 lines changed)

### Build Output

```
[SUCCESS] Generated static files in "build".
[SUCCESS] Generated static files in "build/ur".
```

## Outcome

✅ **SUCCESS**: MDX syntax issues resolved. The learning.mdx file now compiles successfully in Docusaurus without any ACORN parsing errors.

## Evaluation

- **Correctness**: All syntax errors fixed
- **Completeness**: Entire file validated
- **Quality**: Educational content preserved
- **Build Status**: Passing
