# Cursor Flows

This directory contains AI-assisted workflow templates (flows) for Angular component refactoring and design system migration tasks. These flows are designed to work with Cursor IDE's rule system to provide structured, step-by-step guidance for complex refactoring operations.

## What are Flows?

Flows are collections of rule files (.mdc) that guide the AI through multi-step processes. Each flow contains:
- **Rule files (.mdc)**: Step-by-step instructions for the AI
- **Documentation**: Supporting materials and best practices
- **Templates**: Reusable patterns and examples

## Available Flows

### 1. Component Refactoring Flow
**Location:** `component-refactoring/`
**Purpose:** Improve individual Angular components according to modern best practices

**Files:**
- `01-review-component.mdc` - Analyze component and create improvement plan
- `02-refactor-component.mdc` - Execute refactoring checklist
- `03-validate-component.mdc` - Verify improvements through contract comparison
- `angular-20.md` - Angular best practices reference

**Use Case:** When you need to modernize a single component's code quality, performance, or maintainability.

### 2. Design System Refactoring Flow
**Location:** `ds-refactoring-flow/`
**Purpose:** Migrate components from deprecated design system patterns to modern alternatives

**Flow Options:**

**Option A: Targeted Approach** (recommended for focused, incremental migrations)
- `01-find-violations.mdc` - Identify specific deprecated component usage
- `02-plan-refactoring.mdc` - Create detailed migration strategy for specific cases

**Option B: Comprehensive Approach** (recommended for large-scale migrations)
- `01b-find-all-violations.mdc` - Scan entire codebase, group by folders, select subfolder for detailed analysis
- `02b-plan-refactoring-for-all-violations.mdc` - Create comprehensive migration plan for all violations in scope

**Continuation Steps** (used with both approaches):
- `03-non-viable-cases.mdc` - Handle non-migratable components by marking them for exclusion
- `03-fix-violations.mdc` - Execute code changes
- `04-validate-changes.mdc` - Verify improvements through contract comparison
- `05-prepare-report.mdc` - Generate testing checklists and documentation
- `clean-global-styles.mdc` - Independent analysis of deprecated CSS usage

**Choosing Your Approach:**
- **Targeted (01 → 02)**: Use when working on specific components or small sets of violations. Provides focused analysis and incremental progress.
- **Comprehensive (01b → 02b)**: Use when planning large-scale migrations across multiple folders. Provides broad overview first, then detailed planning for selected scope.

**Special Handling:**
- **Non-Viable Cases**: When components are identified as non-viable during the planning step, use `03-non-viable-cases.mdc` instead of proceeding with the normal fix violations step. This marks components with special prefixes (`after-migration-[ORIGINAL_CLASS]`) to exclude them from future violation reports.

**Use Cases:** 
- **Targeted Flow**: Incremental migration of specific components or small violation sets
- **Comprehensive Flow**: Large-scale migration planning across multiple directories
- **Non-Viable Handling**: Alternative handling within either flow for legacy components that cannot be migrated

## How to Use Flows

1. Copy the desired flow's `.mdc` files to your `.cursor/rules/` directory
2. The rules will be automatically available in Cursor
3. Follow the flow documentation for step-by-step guidance

## Prerequisites

Before using any flow, ensure you have:
- **Cursor IDE** with MCP (Model Context Protocol) server connected
- **Git branch** for your refactoring work
- **Component files** accessible in your workspace
- **Angular project** with proper TypeScript configuration

## Flow Process Overview

Most flows follow a similar pattern:
1. **Analysis** - Review current state and identify issues
2. **Planning** - Create actionable improvement checklist
3. **Execution** - Implement changes systematically
4. **Validation** - Verify improvements and quality gates
5. **Reporting** - Document changes and results

## Quality Gates

Flows include human review checkpoints to ensure:
- ✅ Analysis accuracy
- ✅ Refactoring plan approval
- ✅ Code quality validation
- ✅ Final acceptance

## Documentation

For detailed information about each flow, see:
- [Component Refactoring Flow](../../docs/component-refactoring-flow.md)
- [Architecture & Design](../../docs/architecture-internal-design.md)
- [Contracts Documentation](../../docs/contracts.md)