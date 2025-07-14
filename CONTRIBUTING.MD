# Contributing to Angular Toolkit MCP

Thank you for your interest in contributing to the Angular Toolkit MCP! This document provides guidelines and information for contributors.

## 📋 Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Code Quality](#code-quality)
- [Submitting Changes](#submitting-changes)
- [Documentation](#documentation)
- [Debugging](#debugging)

## 🚀 Getting Started

### Prerequisites

- **Node.js** (version 18 or higher)
- **npm** (comes with Node.js)
- **Git** for version control

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally

## 🛠️ Development Setup

### Initial Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Build the project:**
   ```bash
   npx nx build angular-mcp
   ```

### Nx Workspace Commands

This project uses Nx for monorepo management. Key commands:

```bash
# Build all projects
npx nx run-many --target=build --all

# Build specific project
npx nx build angular-mcp-server

# Run tests for all projects
npx nx run-many --target=test --all

# Lint all projects
npx nx run-many --target=lint --all

# Check project graph
npx nx graph
```

## 🏗️ Project Structure

This is an Nx monorepo with the following structure:

```
├── packages/
│   ├── angular-mcp/           # Main MCP client application
│   ├── angular-mcp-server/    # Core MCP server library
│   ├── minimal-repo/          # Test fixtures and examples
│   └── shared/                # Shared libraries
│       ├── angular-ast-utils/     # Angular AST parsing
│       ├── angular-cli-utils/     # Angular CLI utilities
│       ├── ds-component-coverage/ # Design system analysis
│       ├── models/               # Core types and schemas
│       ├── styles-ast-utils/     # CSS/SCSS AST parsing
│       ├── typescript-ast-utils/ # TypeScript AST utilities
│       └── utils/               # General utilities
├── testing/                   # Testing utilities and setup
├── docs/                      # Documentation
└── tools/                     # Build and development tools
```

### Key Projects

- **`angular-mcp`**: Main executable MCP client
- **`angular-mcp-server`**: Core server logic and MCP tools
- **Shared libraries**: Reusable utilities for AST parsing, file operations, and Angular analysis

## 🔄 Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 2. Make Changes

- Follow the existing code style and patterns
- Add tests for new functionality
- Update documentation as needed

### 3. Build and Test

```bash
# Build affected projects
npx nx affected --target=build

# Run tests
npx nx affected --target=test

# Lint code
npx nx affected --target=lint
```

### 4. Commit Changes

Follow conventional commit format:

```bash
git commit -m "feat: add new MCP tool for component analysis"
git commit -m "fix: resolve dependency resolution issue"
git commit -m "docs: update API documentation"
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npx nx run-many --target=test --all

# Run tests for specific project
npx nx test angular-mcp-server

# Run tests with coverage
npx nx test angular-mcp-server --coverage
```

### Writing Tests

- Use Vitest for unit testing
- Follow the existing test patterns
- Mock external dependencies appropriately
- Test both success and error scenarios

## 📏 Code Quality

### ESLint Configuration

The project uses ESLint with TypeScript and Nx-specific rules:

```bash
# Lint all files
npx nx run-many --target=lint --all

# Lint specific project
npx nx lint angular-mcp-server

# Auto-fix linting issues
npx nx lint angular-mcp-server --fix
```

### Code Style Guidelines

- Use TypeScript strict mode
- Follow functional programming patterns where possible
- Use descriptive variable and function names
- Add JSDoc comments for public APIs
- Prefer composition over inheritance

### Pre-commit Checks

Before committing, ensure:
- [ ] All tests pass
- [ ] No linting errors
- [ ] Code builds successfully
- [ ] Documentation is updated

## 📝 Submitting Changes

### Pull Request Process

1. **Push your branch:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request:**
   - Use a descriptive title
   - Include a detailed description of changes
   - Reference any related issues
   - Add screenshots for UI changes

3. **PR Requirements:**
   - All CI checks must pass
   - Code review approval required
   - Documentation updates included
   - Tests added for new functionality

## 🐛 Debugging

### Debug Server

Start the MCP server in debug mode:

```bash
npx nx run angular-mcp:debug
```

This starts the server with the MCP Inspector for debugging.


### Debugging Tips

- Use the MCP Inspector for real-time debugging
- Check server logs for detailed error information
- Use `console.log` or debugger statements in development
- Test with the minimal-repo examples

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
