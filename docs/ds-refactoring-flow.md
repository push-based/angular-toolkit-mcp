# Design System Refactoring Flow


## Overview

This document describes a 5-step AI-assisted refactoring process for migrating legacy components to the design system. Each step uses a specific rule file (.mdc) that guides the Cursor agent through automated analysis and code changes.

**Flow Approaches:**

The refactoring process offers two alternative approaches for the initial phases:

**Option A: Targeted Approach** (recommended for focused, incremental migrations)
1. **Find Violations** (`01-find-violations.mdc`) → Identify specific deprecated component usage
2. **Plan Refactoring** (`02-plan-refactoring.mdc`) → Create detailed migration strategy for specific cases

**Option B: Comprehensive Approach** (recommended for large-scale migrations)
1. **Find All Violations** (`01b-find-all-violations.mdc`) → Scan entire codebase, group by folders, select subfolder for detailed analysis
2. **Plan Refactoring for All Violations** (`02b-plan-refactoring-for-all-violations.mdc`) → Create comprehensive migration plan for all violations in scope

**Continuation Steps** (used with both approaches):
3. **Fix Violations** → Execute code changes
   - **If viable:** Proceed with normal checklist (`03-fix-violations.mdc`)
   - **If non-viable:** Use alternative handling (`03-non-viable-cases.mdc`)
4. **Validate Changes** → Verify refactoring safety
5. **Prepare Report** → Generate testing checklists and documentation

The process includes three quality gates where human review and approval are required. When components are identified as non-viable during planning, an alternative handling process is used instead of proceeding to the normal fix violations step.

## Prerequisites

Before starting the refactoring flow, ensure you have:
- Cursor IDE with this MCP (Model Context Protocol) server connected. This flow was tested with Cursor but should also work with Windsurf or Copilot.
- The five rule files (.mdc) available in your workspace
- A git branch for the refactoring work

## 01-find-violations.mdc

### Goal

Identify and locate legacy component usage in a codebase to prepare for systematic refactoring. This rule helps developers find deprecated design system components and their usage patterns across the project in a structured, two-step process.

### Process

To start this process, drag file `01-find-violations.mdc` to the cursor chat and provide `directory` and `component` parameters, your chat message will look like this 

```
@01-find-violations.mdc directory=path/to/directory component=DsComponent
```

This rule follows a two-step process to find violations:

**Step 1: Folder-level scan**
- Scans the specified directory for component violations grouped by folder
- Provides a ranked list of folders with violation counts
- Allows user to select a specific subfolder for detailed analysis

**Step 2: File-level scan**
- Performs detailed scanning of the selected subfolder
- Groups violations by individual files
- Outputs a sorted list of files with violation counts
- Prepares the transition to the planning phase

> After the second scan, AI will explicitly ask you to attach the second rule for planning.

### Tools used

- `report-violations` - Main MCP tool that analyzes deprecated design system CSS usage
  - Parameters: `componentName`, `directory`, `groupBy` (folder/file)
  - Returns violation data with counts and locations
  - Supports both folder-level and file-level grouping

### Flow

> You don't need to manually perform any of the listed actions except providing the `component=DsComponent directory=path/to/folder` in the initial message.

1. **Initial Setup**: User provides `{{COMPONENT_NAME}}` and `{{DIRECTORY}}` parameters
2. **Folder Scan**: Execute `report-violations` with `groupBy: "folder"`
3. **Error Handling**: Check for tool errors or zero violations
4. **Folder Results**: Display ranked folder list with violation counts
5. **User Selection**: Prompt user to choose a subfolder for detailed analysis
6. **File Scan**: Execute `report-violations` with `groupBy: "file"` on selected subfolder
7. **File Results**: Display sorted file list with violation counts
8. **Transition**: Prompt user to attach "Plan Phase" rules for next step

The rule enforces strict output formatting with `<folders>` and `<violations>` tags, and uses `<commentary>` blocks for error messages and clarifications.

### Preferred model

Claude-4-Sonnet

## 01b-find-all-violations.mdc (Alternative Comprehensive Approach)

### Goal

Perform comprehensive analysis of an entire codebase to identify all deprecated component usage patterns across multiple directories and components. This rule provides a broader scope alternative to the targeted approach, allowing teams to understand the full migration scope before focusing on specific areas for detailed planning.

### Process

To start this process, drag file `01b-find-all-violations.mdc` to the cursor chat and provide the `directory` parameter, your chat message will look like this:

```
@01b-find-all-violations.mdc directory=path/to/directory
```

This rule follows a comprehensive two-step process to find all violations:

**Step 1: Global folder-level scan**
- Scans the entire specified directory tree for all deprecated component violations
- Groups results by folder to provide overview of violation distribution
- Provides a ranked list of folders with violation counts and file counts
- Allows user to understand migration scope across the entire codebase
- Enables selection of specific subfolder for focused analysis

**Step 2: Targeted file-level scan**
- Performs detailed scanning of the selected subfolder from step 1
- Groups violations by individual files within the selected scope
- Outputs a sorted list of files with violation counts for precise targeting
- Prepares comprehensive data for the planning phase

> After the second scan, AI will explicitly ask you to attach the comprehensive planning rule.

### Tools used

- `report-all-violations` - Comprehensive MCP tool that analyzes all deprecated design system CSS usage across the codebase
  - Parameters: `directory`, `groupBy` (folder/file)
  - Returns: Complete violation data with counts and locations across all components
  - Supports both folder-level overview and file-level detailed analysis

### Flow

> You don't need to manually perform any of the listed actions except providing the `directory=path/to/folder` in the initial message.

1. **Initial Setup**: User provides `{{DIRECTORY}}` parameter for comprehensive analysis
2. **Global Scan**: Execute `report-all-violations` with `groupBy: "folder"` for complete overview
3. **Error Handling**: Check for tool errors or zero violations across entire codebase
4. **Folder Results**: Display ranked folder list with comprehensive violation and file counts
5. **User Selection**: Prompt user to choose a subfolder from the comprehensive results for detailed focus
6. **Targeted Scan**: Execute `report-all-violations` with `groupBy: "file"` on selected subfolder
7. **File Results**: Display sorted file list with precise violation counts for planning
8. **Transition**: Prompt user to attach comprehensive planning rules for next step

The rule enforces structured output with `<folders>` and `<violations>` tags, and uses `<commentary>` blocks for error messages and progress updates.

### Preferred model

Claude-4-Sonnet

## 02b-plan-refactoring-for-all-violations.mdc (Alternative Comprehensive Approach)

### Goal

Create a comprehensive migration strategy for large-scale refactoring of legacy components across multiple files and violation types. This rule provides a thorough analysis approach for complex migration scenarios involving extensive deprecated component usage, focusing on creating detailed implementation plans for comprehensive scope migrations.

### Process

To start this process, drag file `02b-plan-refactoring-for-all-violations.mdc` to the cursor chat after completing the comprehensive violations analysis.

The rule implements an enhanced three-phase comprehensive planning process:

**Phase 1: Comprehensive Analysis**
- Reviews extensive component documentation, implementation code, and usage patterns across all violation files
- Analyzes complete scope of affected files (templates, TypeScript, styles, specs, NgModules) 
- Assesses migration complexity across the entire selected scope and identifies potential non-viable migrations
- Evaluates library dependencies and their comprehensive impact on large-scale migration
- Considers cross-component dependencies and interaction patterns

**Phase 2: Detailed Plan Creation for Complete Scope**
- Compares deprecated usage patterns against design system exemplars across all files
- Classifies each migration comprehensively as: Simple swap, Requires restructure, or Non-viable
- Assigns complexity scores (1-10) with comprehensive penalties for animations/breakpoints/variants across scope
- Creates comprehensive actionable plans ordered by effort with concrete edits needed for all files
- Provides extensive verification notes for static file-based checks across the migration scope
- Considers migration dependencies and optimal sequencing for large-scale changes

---
**🚦 Quality Gate 1 (Comprehensive Review)**

Before proceeding to Phase 3, you must review the comprehensive migration plan.

**Required Actions:**
- Review the complete migration strategy for all identified violations
- **If all components are viable for migration:** Approve or request modifications, then proceed with comprehensive checklist creation
- **If some components are non-viable:** Developer must thoroughly review and confirm non-viability decisions, then use `@03-non-viable-cases.mdc` for non-viable cases
- **If mixed viability:** Proceed with checklist for viable cases and handle non-viable cases separately
- Clarify any uncertainties regarding the comprehensive approach

**Next Step:** 
- **All viable migrations:** When satisfied with the plan, the agent will create a comprehensive checklist
- **Mixed or non-viable migrations:** Use appropriate handling rules for different component categories
---

**Phase 3: Comprehensive Checklist Creation**
- Generates extensive checklist covering all viable migrations with detailed checkbox items
- Creates comprehensive verification phase with static checks across all affected files
- Includes dependency management and sequencing considerations for large-scale migrations
- Saves comprehensive checklist to `.cursor/tmp/refactoring-checklist-{{FOLDER_PATH}}.md`

> After the comprehensive checklist is generated and you see it in the chat, it is time to attach the fix violations rule.

### Tools used

- `list-ds-components` - Lists all available Design System components in the project
  - Parameters: `sections` (optional) - Array of sections to include: "implementation", "documentation", "stories", "all"
  - Returns: Complete inventory of DS components with their file paths and metadata
  - Provides: Overview of available components for comprehensive migration planning

- `get-ds-component-data` - Retrieves comprehensive component information for all involved components
  - Parameters: `componentName`, `sections` (optional) - Array of sections to include: "implementation", "documentation", "stories", "all"
  - Returns: Complete implementation files, documentation files, import paths for multiple components
  - Provides: Component source code, API documentation, usage examples across scope

- `build-component-usage-graph` - Maps comprehensive component dependencies and usage patterns
  - Parameters: `directory`, `violationFiles` (from comprehensive scan, automatically picked up)
  - Returns: Complete graph showing where all components are imported and used across scope
  - Analyzes: modules, specs, templates, styles, reverse dependencies for large-scale impact

- `get-project-dependencies` - Analyzes project structure and dependencies for comprehensive scope
  - Parameters: `directory`, optional `componentName`
  - Returns: library type (buildable/publishable), peer dependencies for scope assessment
  - Validates: import paths, workspace configuration for large-scale migration compatibility

### Flow

> You don't need to manually perform any of the listed actions.

1. **Comprehensive Input Gathering**: Collect all component data, folder path, documentation, code, usage graphs, and library data for complete scope
2. **Extensive Analysis**: Review all inputs and analyze comprehensive codebase impact across all violation files
3. **Large-Scale Complexity Assessment**: Evaluate migration difficulty and identify non-viable cases across complete scope
4. **Comprehensive File Classification**: Categorize each file's migration requirements within the broader context
5. **Detailed Plan Creation**: Generate comprehensive migration steps with complexity scores for all files
6. **Extensive Verification Design**: Create static checks for comprehensive plan validation across scope
7. **Large-Scale Ambiguity Resolution**: Identify and request clarification for unclear aspects across scope
8. **Comprehensive Approval Process**: Present complete plan with "🛠️ Approve this comprehensive plan or specify adjustments?"
9. **Extensive Checklist Generation**: Create detailed actionable checklist after approval covering all scope
10. **Comprehensive File Persistence**: Save complete checklist to temporary file for large-scale reference

The rule enforces structured output with `<comprehensive_analysis>`, `<migration_plan>`, and `<checklist>` tags, and includes enhanced ambiguity safeguards for complex large-scale scenarios.

### Preferred model

- Non-complex cases: Claude-4-Sonnet
- Complex large-scale cases: Claude-4-Sonnet (thinking)

## 02-plan-refactoring.mdc

### Goal

Create a comprehensive migration plan for refactoring legacy components to new design system components. This rule analyzes the current codebase, evaluates migration complexity, and provides a detailed, actionable plan with specific steps, classifications, and verification notes for each affected file.

### Process

To start this process, drag file `02-plan-refactoring.mdc` to the cursor chat.

The rule implements a three-phase migration planning process:

**Phase 1: Comprehensive Analysis**
- Reviews component documentation, implementation code, and usage patterns
- Analyzes all affected files (templates, TypeScript, styles, specs, NgModules)
- Assesses migration complexity and identifies potential non-viable migrations
- Evaluates library dependencies and their impact on migration

**Phase 2: Detailed Plan Creation**
- Compares old markup against design system exemplars
- Classifies each migration as: Simple swap, Requires restructure, or Non-viable
- Assigns complexity scores (1-10) with penalties for animations/breakpoints/variants
- Creates actionable plans ordered by effort with concrete edits needed
- Provides verification notes for static file-based checks

---
**🚦 Quality Gate 1**

Before proceeding to Phase 3, you must review the migration plan.

**Required Actions:**
- Review the suggested plan thoroughly
- **If components are viable for migration:** Approve or request modifications, then proceed with checklist creation
- **If components are non-viable:** Developer must thoroughly review and confirm non-viability, then use `@03-non-viable-cases.mdc` instead of normal checklist
- Clarify any uncertainties

**Next Step:** 
- **Viable migrations:** When satisfied with the plan, the agent will create a checklist
- **Non-viable migrations:** Use the non-viable cases rule instead of proceeding to fix violations
---

**Phase 3: Checklist Creation**
- Generates comprehensive checklist of actual changes as checkboxes
- Creates verification phase with static checks that can be performed by reading files
- Saves checklist to `.cursor/tmp/refactoring-checklist-{{FOLDER_PATH}}.md`

> After the checklist is generated and you see it in the chat, it is time to attach the next rule.

### Tools used

- `list-ds-components` - Lists all available Design System components in the project
  - Parameters: `sections` (optional) - Array of sections to include: "implementation", "documentation", "stories", "all"
  - Returns: Complete inventory of DS components with their file paths and metadata
  - Provides: Overview of available components for migration planning

- `get-ds-component-data` - Retrieves comprehensive component information
  - Parameters: `componentName`, `sections` (optional) - Array of sections to include: "implementation", "documentation", "stories", "all"
  - Returns: implementation files, documentation files, import paths
  - Provides: component source code, API documentation, usage examples

- `build-component-usage-graph` - Maps component dependencies and usage
  - Parameters: `directory`, `violationFiles` (from previous step, automatically picked up)
  - Returns: graph showing where components are imported and used
  - Analyzes: modules, specs, templates, styles, reverse dependencies

- `get-project-dependencies` - Analyzes project structure and dependencies
  - Parameters: `directory`, optional `componentName`
  - Returns: library type (buildable/publishable), peer dependencies
  - Validates: import paths, workspace configuration

### Flow

> You don't need to manually perform any of the listed actions.

1. **Input Gathering**: Collect component name, folder path, documentation, code, usage graph, and library data
2. **Comprehensive Analysis**: Review all inputs and analyze codebase impact
3. **Complexity Assessment**: Evaluate migration difficulty and identify non-viable cases
4. **File Classification**: Categorize each file's migration requirements
5. **Plan Creation**: Generate detailed migration steps with complexity scores
6. **Verification Design**: Create static checks for plan validation
7. **Ambiguity Resolution**: Identify and request clarification for unclear aspects
8. **Approval Process**: Present plan with "🛠️ Approve this plan or specify adjustments?"
9. **Checklist Generation**: Create actionable checklist after approval
10. **File Persistence**: Save checklist to temporary file for reference

The rule enforces structured output with `<comprehensive_analysis>`, `<migration_plan>`, and `<checklist>` tags, and includes built-in ambiguity safeguards.

### Preferred model

- Non-complex cases: Claude-4-Sonnet
- Complex cases: Claude-4-Sonnet (thinking)

## Non-Viable Cases Handling

### When to Use

During the **02-plan-refactoring.mdc** step, if the AI identifies components as non-viable for migration, this must be **thoroughly reviewed by an actual developer**. Only after developer confirmation should you proceed with non-viable handling instead of the normal checklist confirmation.

### Process

When non-viable cases are confirmed during planning, instead of proceeding with the normal checklist, use the non-viable cases rule:
- Reference: `@03-non-viable-cases.mdc` (or `@03-non-viable-cases.mdc` depending on your rule setup)
- **Critical:** This replaces the normal "Fix Violations" step entirely

The rule implements a systematic three-phase process for handling non-migratable components:

**Phase 1: Identification & Discovery**
- Identifies the target component class name from conversation context
- Runs CSS discovery using `report-deprecated-css` tool on both global styles and style overrides directories
- Creates a comprehensive implementation checklist with validation checks
- Saves checklist to `.cursor/tmp/css-cleanup/[class-name]-[scope]-non-viable-migration-checklist.md`

**Phase 2: Implementation**
- Works systematically from the saved checklist file
- **Step 1: HTML Template Updates (FIRST PRIORITY)**
  - Replaces original component classes with `after-migration-[ORIGINAL_CLASS]` in HTML files/templates
  - Must be done BEFORE any CSS changes to ensure consistency
- **Step 2: CSS Selector Duplication (NOT REPLACEMENT)**
  - Duplicates CSS selectors rather than replacing them
  - Transforms: `.custom-radio {}` → `.custom-radio, .after-migration-custom-radio {}`
  - Maintains visual parity between original and prefixed versions

**Phase 3: Validation (Mandatory)**
- **Validation 1 - CSS Count Consistency**: Re-runs `report-deprecated-css` tool to verify deprecated class count remains identical
- **Validation 2 - Violation Reduction**: Runs `report-violations` tool to verify the expected reduction in violations
- Updates checklist with validation results and marks all items complete

### Key Features

**Exclusion Strategy**: The `after-migration-` prefix serves as a marker that excludes these components from future violation reports, effectively removing them from the migration pipeline while preserving functionality.

**Visual Consistency**: By duplicating CSS selectors rather than replacing them, the workflow ensures that both the original classes and the new prefixed classes render identically.

**Comprehensive Tracking**: The workflow maintains detailed checklists and validation steps to ensure all instances are properly handled and tracked.

**Error Prevention**: Systematic validation ensures that the transformation doesn't break existing functionality or miss any instances.

### Tools used

- `report-deprecated-css` - Identifies deprecated CSS classes in style directories
  - Parameters: `directory`, `componentName`
  - Returns: List of deprecated CSS usage with file locations and line numbers
  - Used for: Discovery phase and validation of CSS count consistency

- `report-violations` - Analyzes deprecated component usage in templates and code
  - Parameters: `directory`, `componentName`  
  - Returns: List of component violations with file locations
  - Used for: Validation of violation reduction after implementation

### Flow

> You don't need to manually perform any of the listed actions except providing directory paths when requested.

1. **Component Identification**: Extract target component class name from conversation context
2. **Directory Input**: Request global styles and style overrides directories from user (with fallback handling)
3. **CSS Discovery**: Run parallel `report-deprecated-css` scans on both directories
4. **Checklist Creation**: Generate comprehensive implementation checklist with validation checks
5. **HTML Updates**: Replace component classes with `after-migration-` prefixed versions in templates
6. **CSS Duplication**: Add prefixed selectors alongside original selectors in CSS files
7. **Validation Execution**: Run mandatory validation checks using actual tools
8. **Progress Tracking**: Update checklist file throughout the process with completion status
9. **Final Verification**: Confirm all validation criteria are met before completion

The rule enforces structured output with `<target_component>`, `<checklist_summary>`, `<validation_1>`, and `<validation_2>` tags, and maintains strict validation criteria to ensure process integrity.

### When to Use This Workflow

This workflow should be used when:
- A component is identified as non-viable for migration during the planning phase
- Legacy components cannot be updated due to technical constraints
- Components need to be excluded from future violation reports
- Maintaining existing visual appearance is critical during transition periods

### Integration with Main Flow

This handling is integrated within the design system refactoring process:
- **Decision Point**: During `02-plan-refactoring.mdc` when components are classified as "Non-viable"
- **Developer Review Required**: Must be thoroughly reviewed and approved by actual developer before proceeding
- **Replaces Steps 3-5**: When used, this replaces the normal Fix Violations → Validate Changes → Prepare Report sequence
- **Outcome**: Successfully processed components will be excluded from subsequent violation reports

### Preferred model

Claude-4-Sonnet

## 03-fix-violations.mdc

### Goal

Execute the refactoring checklist by analyzing components, implementing changes, and tracking progress.

### Process

To start this process, drag file `03-fix-violations.mdc` to the cursor chat AFTER you get a `<checklist>`.

The rule implements a systematic refactoring execution process:

**Step 1: Checklist Loading**
- Reads the refactoring checklist from `.cursor/tmp/refactoring-checklist-{{FOLDER_PATH}}.md`
- Parses checklist items and identifies components to be refactored

**Step 2: Contract Generation**
- Creates component contracts for each component before refactoring
- Generates JSON snapshots of component's public API, DOM structure, and styles
- Saves contracts to `.cursor/tmp/contracts/<ds-component-kebab>/` directory

**Step 3: Refactoring Execution**
- Analyzes each component using the generated contracts
- Determines necessary changes based on checklist items
- Implements code modifications (templates, TypeScript, styles, specs)
- Updates checklist with progress notes

**Step 4: Progress Tracking**
- Updates checklist file with completion status and change descriptions
- Documents what was changed or why no changes were needed
- Maintains audit trail of refactoring progress

**Step 5: Reflection and Confirmation**
- Identifies uncertainties or areas needing user confirmation
- Provides clear explanations of any ambiguous situations
- Requests user approval for complex or uncertain changes

---
**🚦 Quality Gate 2**

At this point, initial refactoring is complete.

**Required Actions:**
- Review refactoring results
- Resolve any ambiguities
- Approve the results

**Next Step:** After changes are approved and questions resolved, it is time to add the next rule to the chat.
---

### Tools used

- `build_component_contract` - Creates component contracts for safe refactoring
  - Parameters: `directory`, `templateFile`, `styleFile`, `typescriptFile`, `dsComponentName`
  - Returns: contract with public API, DOM structure, styles, and metadata
  - Generates: JSON contract files with SHA-256 hashes for validation

### Flow

> You don't need to manually perform any of the listed actions.

1. **Checklist Parsing**: Load and parse the refactoring checklist from temporary file
2. **Contract Generation**: Create baseline contracts for all components in scope
3. **Component Analysis**: Analyze each component using contract data
4. **Change Determination**: Evaluate what modifications are needed per checklist item
5. **Code Implementation**: Execute the actual refactoring changes
6. **Progress Documentation**: Update checklist with completion status and notes
7. **Reflection Phase**: Identify uncertainties and areas needing confirmation
8. **User Interaction**: Request approval for complex changes or clarifications
9. **Final Report**: Generate structured report with updates, reflections, and confirmations needed

The rule enforces structured output with `<refactoring_report>`, `<checklist_updates>`, `<reflections>`, and `<user_confirmations_needed>` tags, and maintains detailed progress tracking throughout the process.

### Preferred model

Claude-4-Sonnet

## 04-validate-changes.mdc

### Goal

Analyze refactored code and component contracts to identify potential issues, breaking changes, and risky points that require attention from the development team. This rule provides comprehensive validation through static analysis, contract comparison, and structured reporting to ensure refactoring safety and quality.

### Process

To start this process, drag file `04-validate-changes.mdc` to the cursor chat after refactoring is completed.

The rule implements a comprehensive validation analysis process:

**Step 1: Static Code Analysis**
- Runs ESLint validation on all refactored files
- Checks for Angular-specific rule violations and TypeScript issues
- Reports any linting errors that need immediate attention

**Step 2: Contract Generation**
- Creates new component contracts for the refactored state
- Captures current public API, DOM structure, and styles
- Generates SHA-256 hashes for contract validation

**Step 3: Contract Comparison**
- Lists all available component contracts (before/after states)
- Performs detailed diffs between old and new contracts
- Identifies changes in function signatures, data structures, and interfaces

**Step 4: Change Analysis**
- Analyzes contract diffs for potential breaking changes
- Evaluates severity and impact of each modification
- Considers backwards compatibility and performance implications

**Step 5: Risk Assessment**
- Identifies high-risk changes requiring elevated attention
- Evaluates potential impacts on other system parts
- Assesses overall refactoring safety and quality

**Step 6: Validation Reporting**
- Generates structured analysis with detailed findings
- Provides specific recommendations for development, QA, and UAT teams
- Highlights critical issues requiring immediate action

---
**🚦 Quality Gate 3**

This is your last chance to make changes before opening the pull request.

**Required Actions:**
- Review validation report and risk assessment
- Resolve any critical issues
- Approve the final results

**Next Step:** After all issues are resolved and no changes are needed, you can attach the next rule file.
---

### Tools used

- `lint-changes` - Performs static code analysis using ESLint
  - Parameters: `directory`, optional `files` and `configPath`
  - Returns: Angular-specific rule violations, TypeScript issues, template errors
  - Features: Automatic ESLint config resolution, comprehensive rule coverage

- `build_component_contract` - Creates contracts for refactored components
  - Parameters: `directory`, `templateFile`, `styleFile`, `typescriptFile`, `dsComponentName`
  - Returns: JSON contract with public API, DOM structure, and styles
  - Purpose: Capture post-refactoring component state

- `list_component_contracts` - Lists available component contracts
  - Parameters: `directory`
  - Returns: Available contract files with timestamps and metadata
  - Purpose: Identify before/after contract pairs for comparison

- `diff_component_contract` - Compares component contracts
  - Parameters: `directory`, `contractBeforePath`, `contractAfterPath`, `dsComponentName`
  - Returns: Detailed diff highlighting changes in API, DOM, and styles
  - Saves: Diff files to `.cursor/tmp/contracts/<component>/diffs/`

### Flow

> You don't need to manually perform any of the listed actions.

1. **Input Processing**: Parse refactored files list and available component contracts
2. **Static Analysis**: Run ESLint validation on all refactored files
3. **Error Handling**: Address any linting errors before proceeding
4. **Contract Generation**: Create new contracts for refactored components
5. **Contract Discovery**: List all available contracts for comparison
6. **Contract Comparison**: Generate diffs between before/after contract states
7. **Change Analysis**: Analyze diffs for breaking changes and risks
8. **Impact Assessment**: Evaluate severity and system-wide implications
9. **Report Generation**: Create structured validation report with recommendations
10. **Quality Assurance**: Provide actionable insights for development teams

The rule enforces structured output with `<analysis>`, `<questions_for_user>`, and `<validation_report>` tags, ensuring comprehensive coverage of all potential issues and clear communication of findings.

### Preferred model

Claude-4-Sonnet (thinking)

## 05-prepare-report.mdc

### Goal

Analyze the complete refactoring session, create comprehensive testing checklists for different roles, and generate documentation for code changes. This rule provides the final deliverables including role-specific testing checklists, semantic commit messages, and PR descriptions to ensure proper handoff to development teams and quality assurance processes.

### Process

To start this process, drag file `05-prepare-report.mdc` to the cursor chat after validation is completed.

The rule implements a comprehensive reporting and documentation process:

**Step 1: Chat History Analysis**
- Reviews the entire refactoring session conversation
- Identifies all refactoring changes discussed and implemented
- Extracts analysis, insights, and code modifications
- Documents potential risks and concerns mentioned

**Step 2: Impact Assessment**
- Evaluates the overall impact of changes on the system
- Identifies potential edge cases and affected scenarios
- Determines areas requiring special attention during testing
- Assesses both functional and non-functional implications

**Step 3: Testing Checklist Creation**
- Generates role-specific testing checklists for three key roles:
  - **Developer**: Unit tests, integration tests, code review points
  - **Manual QA Engineer**: Functional testing, regression testing, edge cases
  - **UAT Professional**: User acceptance criteria, business logic validation
- Highlights uncertainties requiring clarification
- Specifies critical verification points

**Step 4: Documentation Generation**
- Creates semantic commit message following conventional commit format
- Generates PR description summarizing changes and review points
- Saves comprehensive verification checklist to `.cursor/tmp/verification-checklist-{{FOLDER}}.md`

**Step 5: Deliverable Packaging**
- Structures all outputs in standardized format
- Ensures proper handoff documentation
- Provides actionable items for each stakeholder role

> This is the end of the flow.

### Tools used

None

### Flow

> You don't need to manually perform any of the listed actions.

1. **History Review**: Analyze complete chat history for refactoring changes and insights
2. **Change Analysis**: Identify specific code areas modified and potential risks
3. **Impact Evaluation**: Assess overall system impact and edge cases
4. **Checklist Generation**: Create detailed testing checklists for each role
5. **Documentation Creation**: Generate semantic commit messages and PR descriptions
6. **File Persistence**: Save verification checklist to temporary directory
7. **Output Structuring**: Format all deliverables in standardized sections
8. **Quality Assurance**: Ensure comprehensive coverage and actionable items
9. **Stakeholder Handoff**: Provide clear documentation for development teams

The rule enforces structured output with `<analysis>`, `<testing_checklists>`, `<verification_document_path>`, `<commit_message>`, and `<pr_description>` tags, ensuring complete documentation of the refactoring process and clear next steps for all stakeholders.

### Preferred model

Claude-4-Sonnet


## clean-global-styles.mdc (Independent Step)

### Goal

Analyze a project for deprecated CSS classes and component violations to provide a comprehensive assessment of design system migration readiness. This rule serves as a preliminary analysis step that can be used independently of the main refactoring flow to understand the scope of deprecated usage across both global styles and component-specific code.

### Process

To start this process, drag file `clean-global-styles.mdc` to the cursor chat and provide the required parameters:

```
directory=path/to/source/directory
stylesDirectory=path/to/global/styles/directory  
componentName=DsComponentName

@clean-global-styles.mdc
```

This rule follows a three-step analysis process:

**Step 1: Global Styles Analysis**
- Scans the global styles directory for deprecated CSS classes
- Identifies occurrences of deprecated classes across all style files
- Reports file locations and line numbers for each violation

**Step 2: Source Directory Analysis**
- Scans the source directory for deprecated CSS classes in component styles
- Identifies deprecated CSS usage in component-specific style files
- Reports violations with precise file and line information

**Step 3: Component Violations Analysis**
- Scans the source directory for deprecated component usage in templates and TypeScript files
- Identifies HTML elements and TypeScript code using deprecated classes
- Reports violations with context about where deprecated components are used

### Tools used

- `report-deprecated-css` - Analyzes deprecated CSS classes in style files
  - Parameters: `directory`, `componentName`
  - Returns: List of deprecated CSS class usage with file locations and line numbers
  - Scans: .scss, .sass, .less, .css files for deprecated class selectors

- `report-violations` - Analyzes deprecated component usage in templates and code
  - Parameters: `directory`, `componentName`
  - Returns: List of component violations with file locations and line numbers
  - Scans: .html, .ts files for deprecated component usage in templates and inline templates

### Flow

> You don't need to manually perform any of the listed actions except providing the initial parameters.

1. **Parameter Setup**: User provides `{{SOURCE_PATH}}`, `{{GLOBAL_STYLES_PATH}}`, and `{{COMPONENT_NAME}}`
2. **Global Styles Scan**: Execute `report-deprecated-css` on global styles directory
3. **Source Directory Scan**: Execute `report-deprecated-css` on source directory
4. **Component Violations Scan**: Execute `report-violations` on source directory
5. **Results Analysis**: Analyze all findings and determine next steps
6. **Recommendation Generation**: Provide structured recommendations based on findings
7. **User Action Decision**: Present options for handling deprecated CSS if no violations found

### Output Structure

The rule provides structured output with three key sections:

**Analysis Section**
- Summary of violations found in source folder
- Count and distribution of deprecated CSS occurrences
- Assessment of migration readiness

**Recommendation Section**
- Priority actions based on findings
- Guidance on whether to fix violations first or clean up deprecated CSS
- Strategic recommendations for migration approach

**User Action Required Section**
- Interactive options when no violations are found but deprecated CSS exists
- Choices for handling deprecated CSS (remove, save, or ignore)
- Clear next steps for the user

### Decision Tree

The rule follows a decision tree approach:

1. **If component violations are found**: Recommend fixing violations first before cleaning up deprecated CSS
2. **If no violations but deprecated CSS exists**: Offer options to remove, save, or ignore deprecated CSS
3. **If no violations and no deprecated CSS**: Confirm the directory is clean and ready

### Integration with Main Flow

While this rule operates independently, it can inform the main refactoring flow:

- **Before Main Flow**: Use to assess overall migration scope and readiness
- **During Planning**: Reference findings to understand global impact
- **After Refactoring**: Use to verify cleanup completeness

### Preferred model

Claude-4-Sonnet


## discover-affected-urls.mdc (Independent Step)

### Goal

Analyze Angular routing hierarchy to discover URL(s) where specific component files can be accessed in a web application. This rule performs comprehensive routing analysis using a bottom-up approach to identify both directly routable components and non-routable components (modals, dialogs, child components) that are accessible through their parent routes, providing complete URL discovery with redirect resolution.

### Process

To start this process, drag file `discover-affected-urls.mdc` to the cursor chat and provide the required parameters:

```
app_directory=src/app
files=["src/app/components/user.component.ts", "src/app/dialogs/confirmation.component.ts"]

@discover-affected-urls.mdc
```

This rule implements a comprehensive five-phase analysis process:

**Phase 1: Routing Hierarchy Discovery & Bottom-Top Point Identification**
- Scans the complete app directory to identify ALL routing files and build routing hierarchy tree
- Discovers top point (complete app routing structure) and bottom point (file parent routes)
- Classifies each file as either directly routable or non-routable
- Validates that both routing points are properly identified before proceeding

**Phase 2: Non-Routable Component Analysis**
- Identifies components without direct route definitions (modals, dialogs, library components)
- Traverses component hierarchy upward through multiple levels to find routable parent components
- Analyzes modal/dialog trigger mechanisms (MatDialog.open, component selectors, service calls)
- Maps complete relationship chains from non-routable components to their accessible routes

**Phase 3: Bottom-Up Route Connection & Path Construction**
- Creates comprehensive redirect mapping from all routing files in the hierarchy
- Traces routable components upward through routing hierarchy with full redirect resolution
- Resolves non-routable component paths using parent relationships from Phase 2
- Constructs complete paths with redirect audit trails and concrete URL examples

**Phase 4: Parameter & Visibility Analysis**
- Extracts parameter constraints from TypeScript files using established connections
- Scans for visibility conditions (@if, *ngIf directives, route guards, permissions)
- Provides realistic examples with culture codes and parameter values
- Validates parameter inheritance and visibility constraints along routing paths

**Phase 5: Quick Access Summary Generation**
- Collects and organizes all route examples from previous phases
- Generates structured summary with mandatory bullet list format
- Provides 1-3 concrete URL examples per file with realistic parameters
- Ensures complete coverage of all analyzed files with proper formatting

### Tools used

None - This rule uses pure Angular routing analysis without external MCP tools

### Flow

> You don't need to manually perform any of the listed actions except providing the initial parameters.

1. **Parameter Setup**: User provides `{{APP_DIRECTORY}}` and `{{FILES}}` array for analysis
2. **Routing Discovery**: Scan app directory for complete routing hierarchy and classify files
3. **Non-Routable Analysis**: Identify parent relationships for components without direct routes
4. **Route Construction**: Build complete paths with redirect resolution and concrete examples
5. **Parameter Analysis**: Extract constraints and visibility conditions along routing paths
6. **Summary Generation**: Create quick access summary with formatted URL examples for all files
7. **Validation**: Ensure complete coverage and proper formatting of all analyzed components

### Output Structure

The rule provides structured output across five tagged sections:

**Routing Discovery Section** (`<routing_discovery>`)
- Complete app routing hierarchy tree
- File classification (routable vs non-routable)
- Top and bottom point identification

**Non-Routable Analysis Section** (`<non_routable_analysis>`)
- Parent component relationships
- Multi-level hierarchy traversal results
- Modal/dialog trigger analysis

**Bottom-Up Connection Section** (`<bottom_up_connection>`)
- Comprehensive redirect mapping
- Complete path construction with examples
- Redirect audit trails

**Parameter Analysis Section** (`<parameter_analysis>`)
- Parameter constraints and visibility conditions
- Realistic examples with culture codes
- Guard and permission analysis

**Quick Access Summary Section** (`<quick_access_summary>`)
- Structured summary with bullet format
- 1-3 URL examples per file
- Complete coverage verification

### Use Cases

This rule is particularly useful for:

- **Component Migration Planning**: Understanding where components are accessible before refactoring
- **Testing Strategy**: Identifying all URLs that need testing after component changes
- **Documentation**: Creating comprehensive route documentation for components
- **Debugging**: Troubleshooting routing issues and finding component access points
- **Impact Analysis**: Understanding the scope of changes when modifying routable components

### Integration with Main Flow

While this rule operates independently, it complements the design system refactoring flow:

- **Before Refactoring**: Identify all URLs where legacy components are accessible
- **During Planning**: Understand routing impact of component changes
- **After Migration**: Verify that refactored components remain accessible at expected URLs
- **Testing Phase**: Use discovered URLs for comprehensive component testing

### Preferred model

Claude-4-Sonnet
