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

**Note:** This flow appears to be empty in the current directory but rule files exist in `.cursor/rules/` for:
- Finding violations
- Planning refactoring
- Fixing violations
- Validating changes
- Preparing reports

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