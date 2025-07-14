# The component contracts system serves two primary purposes:
 - **Breaking change detection** during refactoring and validation
- **Documentation** of successful refactoring patterns for future reference

## Table of Contents
1. [File Organization & Storage Structure](#file-organization--storage-structure) — where contracts and diffs live
2. [What a Contract Includes](#what-a-contract-includes) — data captured in a snapshot
3. [When to Build a Contract](#when-to-build-a-contract) — baseline vs validation
4. [When to Generate Diffs](#when-to-generate-diffs) — automated and manual diffing
5. [Integration with Refactoring Rules Workflow](#integration-with-refactoring-rules-workflow) — contracts in 5-step automation
6. [Post-Review & Hot-Fix Workflow](#post-review--hot-fix-workflow) — fixing bugs after validation
7. [Building a Refactoring Knowledge Base](#building-a-refactoring-knowledge-base) — storing proven patterns

## File Organization & Storage Structure

Contracts are organised in a predictable, component-scoped directory tree:

```
.cursor/tmp/contracts/
├── badge/                           # Component-specific directory
│   ├── ui-header-20250703T185531Z.contract.json
│   ├── ui-header-20250703T192519Z.contract.json
│   └── diffs/                          # Diff files subdirectory
│       └── diff-header-20250703T194046Z.json
├── button/
│   ├── feature-modal-20250704T120000Z.contract.json
│   └── diffs/
└── input/
    ├── login-form-20250705T090000Z.contract.json
    └── diffs/
```

**Key Highlights:**
- **Component-scoped directories**
- **Timestamped contract files**
- **Component-specific diff folders**
- **Predictable naming** (`diff-<component>-<timestamp>.json`)

## What a Contract Includes

Each contract captures a comprehensive snapshot of a component:

### Public API
- **Properties**: Input/output properties with types and default values
- **Events**: EventEmitter declarations and their types
- **Methods**: Public methods with parameters and return types
- **Lifecycle hooks**: Implemented Angular lifecycle interfaces
- **Imports**: All imported dependencies and their sources

### DOM Structure
- **Element hierarchy**: Complete DOM tree with parent-child relationships
- **Attributes**: Static and dynamic attributes on elements
- **Bindings**: Property bindings, event handlers, and structural directives
- **Content projection**: ng-content slots and their selectors

### Styles
- **CSS rules**: All styles applied to DOM elements
- **Element mapping**: Which styles apply to which DOM elements
- **Source tracking**: Whether styles come from component files or external stylesheets

Because contracts track every public-facing facet of a component, any refactor that breaks its API or behaviour is flagged immediately.

## How do I build a contract?

Rules taking care about the contract building during the workflow, but if you need to build it "manually" say in the chat:

```
build_component_contract(<component-file.ts>, dsComponentName)
``` 

> Replace `<component-file.ts>` with the path to your component and set `dsComponentName` to the design-system component (e.g., `DsBadge`). The tool analyses the template, TypeScript, and styles, then saves a timestamped `*.contract.json` to  
> `.cursor/tmp/contracts/<ds-component-kebab>/`.

## When to Build a Contract

### Core Principle

**Build a new contract whenever a component changes.** This ensures you have an accurate snapshot of the component's state at each critical point in its evolution.

### Pre-Refactoring Contract (Baseline)

Always build an initial contract **before** starting any refactoring work. This creates your baseline for comparison.

- **Automated workflow**: Handled automatically by the refactoring rules (see `03-fix-violations.mdc`)
- **Manual workflow**: Build the contract manually before making any changes

### Post-Refactoring Contract (Validation)

Build a new contract **after** completing your refactoring work to capture the final state.

- **Automated workflow**: Generated during the validation phase (see `04-validate-changes.mdc`)
- **Manual workflow**: Build the contract after completing all changes

### Multiple Contract States

For workflows involving QA, E2E testing, or UAT phases, build additional contracts if the component changes during or after testing. 

**Best practice**: Create a new contract for each significant milestone where the component is modified.

## When to Generate Diffs

### Automated Workflow Diffs

Contract diffs are automatically generated during the validation phase (see `04-validate-changes.mdc`). These diffs enable AI-powered validation of refactoring changes.

### Manual Workflow Diffs

When refactoring manually or outside the automated rules workflow, generate diffs to:
- Identify breaking or risky changes
- Get AI analysis of the refactoring impact
- Validate that changes meet expectations

## Integration with Refactoring Rules Workflow

The contracts system is fully integrated into the 5-step refactoring workflow:

### Step 1: Find Violations (`01-find-violations.mdc`)
- **Purpose**: Identify legacy component usage across the codebase
- **Contract role**: No contracts generated at this stage
- **Output**: Ranked list of folders and files with violations

### Step 2: Plan Refactoring (`02-plan-refactoring.mdc`)
- **Purpose**: Create detailed migration plan for each affected component
- **Contract role**: Analysis of component structure informs refactoring strategy
- **Output**: Comprehensive migration plan with complexity scoring

### Step 3: Fix Violations (`03-fix-violations.mdc`)
- **Purpose**: Execute the refactoring plan systematically
- **Contract role**: **Pre-refactoring contracts are automatically generated** for each component before changes begin
- **Key integration**: `build_component_contract(component_files, dsComponentName)` creates baseline contracts
- **Output**: Refactored components with baseline contracts stored

### Step 4: Validate Changes (`04-validate-changes.mdc`)
- **Purpose**: Verify refactoring safety and detect breaking changes
- **Contract role**: **Post-refactoring contracts are generated and compared** against baselines
- **Key integration**: 
  - `build_component_contract()` captures refactored state
  - `diff_component_contract()` compares before/after contracts
  - AI analyzes diffs for breaking changes and risks
- **Output**: Validation report highlighting risky changes

### Step 5: Prepare Report (`05-prepare-report.mdc`)
- **Purpose**: Generate testing checklists and documentation
- **Contract role**: Contract diffs inform testing requirements and risk assessment
- **Output**: Role-specific testing checklists and commit documentation

## Post-Review & Hot-Fix Workflow

What happens when QA finds a bug or a reviewer requests changes **after** the initial refactor has already been validated?

1. **Apply the Code Fix** – attach the changed component file(s).
2. **Re-build the "latest" contract**
   ```
   User: build_component_contract(<changed-file.ts>, dsComponentName)
   ```
   The new snapshot will be stored alongside the previous ones in
   `.cursor/tmp/contracts/<ds-component-kebab>/`.
3. **Locate the original baseline contract** – this is the contract that was captured for the initial state (usually the very first timestamp in the folder).
4. **Generate a diff** between the baseline and the latest contract:
   ```
   User: diff_component_contract(<baseline>.contract.json, <latest>.contract.json, dsComponentName)
   ```
   The diff file will land under
   `.cursor/tmp/contracts/<ds-component-kebab>/diffs/`.
5. **Review the diff output using AI** – attach the diff and ask it to analyze it.
   * If only intentional changes appear, proceed to merge / re-test.
   * If unexpected API, DOM, or style changes surface, iterate on the fix and repeat steps 1-4.

### Why keep the original baseline?

Diffing against the **first** snapshot ensures you do not
inadvertently mask breaking changes introduced during multiple fix cycles.

### Tip: Cleaning up old snapshots

Once a hot-fix is approved, you may delete intermediate contract and diff files to
reduce noise and keep the folder tidy – leave the original baseline, final state and the
latest approved diff. You can manually move it to `.cursor/tmp/patterns/ds-component-name`.

## Building a Refactoring Knowledge Base

Consider storing successful diffs (that passed all checks and testing) to build a knowledge base of proven refactoring patterns. This is particularly valuable when:

- Refactoring hundreds or thousands of similar components
- Establishing team standards for common refactoring scenarios
- Training new team members on safe refactoring practices
- Automating similar refactoring tasks in the future
