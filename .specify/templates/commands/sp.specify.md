# /sp.specify - Create or Update Feature Specification

## Purpose

Generate or update a feature specification document following the project constitution and spec template.

## Usage

```
/sp.specify [feature-name] [options]
```

**Arguments:**
- `feature-name`: Chapter name or feature identifier (kebab-case)

**Options from user input:**
- Style, structure, word count, translation preferences

## Execution Flow

When this command is invoked, follow these steps:

### 1. Parse User Input

Extract:
- **Feature Name**: Chapter/section identifier
- **Style**: Educational tone, clarity level, technical depth
- **Chapter Structure**: Sections, subsections, components
- **Word Count**: Target range (e.g., 500-800 words)
- **Translation**: Urdu translation flag
- **Custom Requirements**: Any additional specifications

### 2. Load Context

Read:
- **Constitution** (`.specify/memory/constitution.md`) - Ensure compliance
- **Spec Template** (`.specify/templates/spec-template.md`) - Use as base
- **Book Spec** (`book.spec.yaml`) - Understand overall structure
- **Existing Specs** (if updating) - Maintain consistency

### 3. Generate Specification

Create a comprehensive feature spec at `specs/<feature-name>/spec.md`:

**Required Sections:**
1. **Overview**: Summary, audience, learning objectives
2. **Scope**: In/out of scope clearly defined
3. **Content Structure**:
   - Title & subtitle
   - Introduction
   - Content sections with key concepts
   - Code examples (language, framework, dependencies)
   - Diagrams (mermaid, flowcharts, architecture)
   - Summary with key takeaways
   - Exercises & quiz questions
4. **Style & Tone**: Matches user-specified style
5. **Constitution Compliance**: Checklist for all relevant principles
6. **Internationalization**: Urdu translation section (if requested)
7. **Technical Requirements**: Dependencies, hardware, software
8. **Acceptance Criteria**: Testable completion criteria
9. **References**: Sources, further reading, related chapters

### 4. Apply User Specifications

**From Current Input:**
- **Style**: "Educational, clear, concise, engaging, technical examples included"
- **Chapter Structure**:
  - title
  - subtitle
  - introduction
  - contentSections
  - codeExamples (if any)
  - diagrams/illustrations (described)
  - summary
  - exercises/quiz
  - optionalUrduTranslation
- **Word Count**: 500-800 words per chapter

Ensure ALL these elements are present and properly structured.

### 5. Constitution Alignment

Validate against principles:
- **Principle 1 (Educational Clarity)**: Progressive disclosure, defined terms
- **Principle 2 (Reproducibility)**: Versioned dependencies, tested examples
- **Principle 3 (Modern Frameworks)**: ROS 2 usage where applicable
- **Principle 4 (Simulation-First)**: Sim examples before hardware
- **Principle 5 (Safety/Ethics)**: Addressed where relevant
- **Principle 10 (Accessibility/i18n)**: Clear English, Urdu translation

### 6. Content Quality Checks

- [ ] Learning objectives are specific and measurable
- [ ] Code examples are complete and runnable
- [ ] Diagrams are described in enough detail to be created
- [ ] Exercises test understanding of key concepts
- [ ] Quiz questions have clear correct answers
- [ ] Word count is within specified range
- [ ] All template placeholders are filled

### 7. Output Structure

Create directory structure:
```
specs/<feature-name>/
├── spec.md           # Main specification
├── examples/         # Code examples (optional)
└── diagrams/         # Diagram sources (optional)
```

### 8. Post-Creation Actions

- Generate spec file with all placeholders filled
- Update `book.spec.yaml` if needed
- Create PHR (Prompt History Record)
- Report completion with summary

### 9. Validation Report

Output a summary:
```
✅ Specification Created: specs/<feature-name>/spec.md

📋 Sections Completed:
- Overview (X objectives, Y word count)
- Content Structure (Z sections)
- Code Examples (N examples)
- Diagrams (M diagrams described)
- Exercises & Quiz (P exercises, Q questions)
- Urdu Translation (prepared/not applicable)

📊 Constitution Compliance:
- ✓ Educational Clarity
- ✓ Reproducibility
- ✓ Modern Frameworks
- ✓ Accessibility

📝 Next Steps:
- Review and refine content
- Implement code examples
- Create diagrams
- Write Urdu translation (if applicable)
- Run /sp.plan to create implementation plan
```

## Example Usage

```bash
/sp.specify introduction-to-physical-ai \
  style="Educational, clear, concise" \
  wordCount="500-800" \
  includeUrdu=true
```

## Important Notes

- **DO NOT** skip any required sections from the template
- **DO** fill all placeholders with concrete content (no {{TEMPLATE_VARS}} left)
- **DO** ensure code examples are language-specific and framework-appropriate
- **DO** create detailed diagram descriptions (enough for implementation)
- **ALWAYS** create a PHR after completion
- **VERIFY** constitution compliance before finalizing

## PHR Creation

After completing the spec, create a PHR:

```bash
.specify/scripts/bash/create-phr.sh \
  --title "Specify <feature-name>" \
  --stage spec \
  --feature <feature-name> \
  --json
```

Fill the PHR with:
- Full user prompt (style, structure, requirements)
- Summary of generated spec
- Files created
- Constitution principles applied
- Next recommended steps

---

**Template Version**: 1.0.0
**Constitution Alignment**: Required
**Output Format**: Markdown (Docusaurus-compatible)
