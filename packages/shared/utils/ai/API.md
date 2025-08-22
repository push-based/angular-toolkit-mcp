# Utils

Comprehensive **utility library** providing process execution, file operations, string manipulation, and logging utilities for Node.js applications.

## Minimal usage

```ts
import {
  executeProcess,
  findFilesWithPattern,
  resolveFileCached,
  slugify,
  objectToCliArgs,
} from '@code-pushup/utils';

// Execute a process with observer
const result = await executeProcess({
  command: 'node',
  args: ['--version'],
  observer: {
    onStdout: (data) => console.log(data),
  },
});

// Find files containing a pattern
const files = await findFilesWithPattern('./src', 'Component');

// Resolve file with caching
const content = await resolveFileCached('./config.json');

// String utilities
const slug = slugify('Hello World!'); // → 'hello-world'
const args = objectToCliArgs({ name: 'test', verbose: true }); // → ['--name="test"', '--verbose']
```

## Key Features

- **Process Execution**: Robust child process management with observers and error handling
- **File Operations**: Cached file resolution and pattern-based file searching
- **String Utilities**: Text transformation, slugification, and pluralization
- **CLI Utilities**: Object-to-arguments conversion and command formatting
- **Logging**: Environment-based verbose logging control
- **Type Safety**: Full TypeScript support with comprehensive type definitions

## Use Cases

- **Build Tools**: Execute CLI commands with real-time output monitoring
- **File Processing**: Search and resolve files efficiently with caching
- **Code Generation**: Transform data into CLI arguments and formatted strings
- **Development Tools**: Create development utilities with proper logging
- **Static Analysis**: Find and process files based on content patterns
- **Cross-Platform**: Handle path normalization and command execution

## Documentation map

| Doc                            | What you'll find                            |
| ------------------------------ | ------------------------------------------- |
| [FUNCTIONS.md](./FUNCTIONS.md) | A–Z quick reference for every public symbol |
| [EXAMPLES.md](./EXAMPLES.md)   | Runnable scenarios with expected output     |
