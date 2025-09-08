# Component Refactoring Flow

## Overview

This document describes a 3-step AI-assisted component refactoring process for improving individual Angular components according to modern best practices. Each step uses a specific rule file (.mdc) that guides the Cursor agent through systematic analysis, code improvements, and validation.

**Process Summary:**
1. **Review Component** → Analyze component against best practices and create improvement plan
2. **Refactor Component** → Execute approved checklist items and implement changes
3. **Validate Component** → Verify improvements through contract comparison and scoring

The process includes two quality gates where human review and approval are required. When refactoring involves Design System components, the process can leverage selective data retrieval to access only the specific component information needed (implementation, documentation, or stories).

## Prerequisites

Before starting the component refactoring flow, ensure you have:
- Cursor IDE with this MCP (Model Context Protocol) server connected. This flow was tested with Cursor but should also work with Windsurf or Copilot.
- The three rule files (.mdc) available in your workspace
- A git branch for the refactoring work
- The component files (TypeScript, template, and styles) accessible in your workspace

## 01-review-component.mdc

### Goal

Analyze an Angular component against modern best practices and design system guidelines to create a comprehensive improvement plan. This rule evaluates component quality across five key dimensions and generates an actionable refactoring checklist.

### Process

To start this process, drag file `01-review-component.mdc` to the cursor chat and provide the required parameters:

```
component_path=path/to/component.ts
styleguide="Angular 20 best practices with signals, standalone components, and modern control flow"
component_files=[provide the TypeScript, template, and style file contents]

@01-review-component.mdc
```

This rule follows a structured analysis process:

**Step 1: File Validation**
- Verifies all essential component files are provided (TypeScript, template, styles)
- Ensures component structure is complete for analysis
- Stops process if critical files are missing

**Step 2: Multi-Dimensional Analysis**
- Evaluates component against five key categories:
  - **Accessibility**: ARIA attributes, semantic HTML, keyboard navigation
  - **Performance**: Change detection strategy, lazy loading, bundle size impact
  - **Scalability**: Code organization, reusability, maintainability patterns
  - **Maintainability**: Code clarity, documentation, testing considerations
  - **Best Practices**: Angular conventions, TypeScript usage, modern patterns

**Step 3: Scoring and Assessment**
- Assigns numerical scores (1-10) for each category
- Identifies 3-5 concrete observations per category
- Provides narrative analysis of overall component state

**Step 4: Checklist Generation**
- Creates actionable improvement items based on analysis
- Prioritizes changes by impact and complexity
- Formats as markdown checklist for systematic execution

---
**🚦 Quality Gate 1**

Before proceeding to implementation, you must review and approve the refactoring plan.

**Required Actions:**
- Review the component analysis and scores
- Examine the proposed refactoring checklist
- Approve the plan or request modifications

**Next Step:** When satisfied with the checklist, attach the next rule file.
---

### Tools used

None - This rule performs static analysis based on provided component files and styleguide requirements.

### Flow

> You don't need to manually perform any of the listed actions except providing the initial parameters.

1. **Input Validation**: Verify component files and styleguide are provided
2. **File Structure Check**: Ensure TypeScript, template, and style files are available
3. **Multi-Category Analysis**: Evaluate component against five key dimensions
4. **Scoring Assignment**: Assign numerical scores (1-10) for each category
5. **Observation Collection**: Identify 3-5 concrete issues per category
6. **Narrative Generation**: Create overall component state summary
7. **Checklist Creation**: Generate actionable improvement items
8. **Approval Request**: Present checklist for user review and approval

The rule enforces structured output with `<component_analysis>`, `<scoring>`, and `<refactoring_checklist>` tags, ensuring comprehensive coverage and clear next steps.

### Preferred model

Claude-4-Sonnet

## 02-refactor-component.mdc

### Goal

Execute the approved refactoring checklist by implementing code changes, tracking progress, and maintaining component contracts for validation. This rule systematically processes each checklist item and documents all modifications made to the component.

### Process

To start this process, drag file `02-refactor-component.mdc` to the cursor chat and provide:

```
component_path=path/to/component.ts
checklist_content=[the approved checklist from step 1]

@02-refactor-component.mdc
```

The rule implements a systematic refactoring execution process:

**Step 1: Pre-Refactor Contract Generation**
- Creates baseline component contract capturing current state
- Documents component's public API, DOM structure, and styles
- Establishes reference point for later validation
- Stops process if contract generation fails

**Step 2: Checklist Processing**
- Iterates through each unchecked item in the approved checklist
- Implements necessary code changes using standard editing tools
- Marks completed items with explanatory notes
- Handles ambiguous items by requesting user clarification

**Step 3: Progress Documentation**
- Updates checklist with completion status and change descriptions
- Saves updated checklist to `.cursor/tmp/component-refactor-checklist-{{COMPONENT_PATH}}.md`
- Maintains audit trail of all modifications

**Step 4: Summary Generation**
- Creates comprehensive summary of completed changes
- Documents what was modified and why
- Provides updated checklist in markdown format

---
**🚦 Quality Gate 2**

At this point, all checklist items have been processed. You must review the refactoring results.

**Required Actions:**
- Review the refactor summary and completed changes
- Verify all checklist items were addressed appropriately
- Resolve any ambiguities or questions

**Next Step:** After approving the refactoring results, attach the validation rule file.
---

### Tools used

- `build_component_contract` - Creates component contracts for safe refactoring
  - Parameters: `componentFile`, `dsComponentName` (set to "AUTO")
  - Returns: contract path with component's public API, DOM structure, and styles
  - Purpose: Establish baseline for validation comparison

- `get-ds-component-data` - Retrieves Design System component information when needed
  - Parameters: `componentName`, `sections` (optional) - Array of sections to include: "implementation", "documentation", "stories", "all"
  - Returns: Selective component data based on refactoring needs
  - Purpose: Access DS component documentation and examples for proper implementation patterns

### Flow

> You don't need to manually perform any of the listed actions except providing the initial parameters.

1. **Contract Generation**: Create pre-refactor component contract
2. **Error Handling**: Verify contract creation succeeded
3. **Checklist Iteration**: Process each unchecked item systematically
4. **Code Implementation**: Execute necessary changes for each item
5. **Progress Tracking**: Mark items complete with explanatory notes
6. **Ambiguity Resolution**: Request clarification for unclear items
7. **Checklist Persistence**: Save updated checklist to temporary file
8. **Summary Creation**: Generate comprehensive refactoring summary
9. **Completion Confirmation**: Request user approval to proceed to validation

The rule enforces structured output with `<refactor_summary>` and `<checklist_updated>` tags, ensuring complete documentation of all changes and clear transition to validation.

### Preferred model

Claude-4-Sonnet

## 03-validate-component.mdc

### Goal

Analyze the refactored component by comparing before and after contracts, re-evaluating quality scores, and providing comprehensive validation assessment. This rule ensures refactoring improvements are measurable and identifies any remaining issues.

### Process

To start this process, drag file `03-validate-component.mdc` to the cursor chat and provide:

```
component_path=path/to/component.ts
baseline_contract_path=path/to/baseline/contract.json

@03-validate-component.mdc
```

The rule implements a comprehensive validation process:

**Step 1: Post-Refactor Contract Generation**
- Creates new component contract capturing refactored state
- Documents updated component API, DOM structure, and styles
- Establishes comparison point against baseline contract

**Step 2: Contract Comparison**
- Performs detailed diff analysis between baseline and updated contracts
- Identifies specific changes in component structure and behavior
- Analyzes impact of modifications on component functionality

**Step 3: Quality Re-Assessment**
- Re-evaluates component against the same five categories from initial review:
  - **Accessibility**: Impact of changes on accessibility features
  - **Performance**: Improvements or regressions in performance metrics
  - **Scalability**: Changes affecting component scalability
  - **Maintainability**: Impact on code maintainability and clarity
  - **Best Practices**: Adherence to modern Angular best practices

**Step 4: Score Calculation**
- Assigns new scores (1-10) for each category
- Calculates deltas showing improvement or regression
- Provides objective measurement of refactoring success

**Step 5: Validation Assessment**
- Determines overall refactoring success or identifies remaining issues
- Highlights any risks or necessary follow-ups
- Provides final judgment on component quality

### Tools used

- `build_component_contract` - Creates post-refactor component contract
  - Parameters: `componentFile`, `dsComponentName` (set to "AUTO")
  - Returns: updated contract path with refactored component state
  - Purpose: Capture final component state for comparison

- `diff_component_contract` - Compares baseline and updated contracts
  - Parameters: `contractBeforePath`, `contractAfterPath`, `dsComponentName` (set to "AUTO")
  - Returns: detailed diff analysis showing specific changes
  - Purpose: Identify and analyze all modifications made during refactoring

### Flow

> You don't need to manually perform any of the listed actions except providing the initial parameters.

1. **Post-Contract Generation**: Create contract for refactored component
2. **Error Handling**: Verify contract creation succeeded
3. **Contract Comparison**: Generate diff analysis between baseline and updated contracts
4. **Change Analysis**: Analyze diff results for impact assessment
5. **Quality Re-Evaluation**: Re-score component across five categories
6. **Delta Calculation**: Compute improvement or regression metrics
7. **Impact Assessment**: Evaluate overall refactoring effectiveness
8. **Validation Judgment**: Determine success status and identify remaining issues
9. **Final Report**: Generate comprehensive validation assessment

The rule enforces structured output with `<diff_summary>`, `<new_scoring>`, and `<validation_assessment>` tags, ensuring objective measurement of refactoring success and clear identification of any remaining concerns.

### Preferred model

Claude-4-Sonnet

## Integration with Angular 20 Best Practices

The component refactoring flow specifically targets modern Angular development patterns as outlined in the `angular-20.md` reference document. Key focus areas include:

### TypeScript Modernization
- **Strict Type Checking**: Ensures proper type safety throughout component
- **Type Inference**: Reduces verbosity while maintaining type safety
- **Avoiding `any`**: Promotes use of `unknown` and proper type definitions

### Angular Modern Patterns
- **Standalone Components**: Migrates from NgModule-based to standalone architecture
- **Signals for State Management**: Adopts reactive state management with Angular Signals
- **New Input/Output Syntax**: Replaces decorators with `input()` and `output()` functions
- **Computed Properties**: Implements `computed()` for derived state

### Template Modernization
- **Control Flow Syntax**: Migrates from structural directives to `@if`, `@for`, `@switch`
- **Native Class/Style Bindings**: Replaces `ngClass`/`ngStyle` with native bindings
- **OnPush Change Detection**: Implements performance optimization strategies

### Service and Dependency Injection
- **Inject Function**: Adopts modern `inject()` function over constructor injection
- **Providable Services**: Ensures proper service registration and tree-shaking

This comprehensive approach ensures components are not only improved but also aligned with the latest Angular best practices and performance recommendations. 