# Public API — Quick Reference

| Symbol                 | Kind     | Summary                                                        |
| ---------------------- | -------- | -------------------------------------------------------------- |
| `ProcessResult`        | type     | Process execution result with stdout, stderr, code, and timing |
| `ProcessError`         | class    | Error class for process execution failures                     |
| `ProcessConfig`        | type     | Configuration object for process execution                     |
| `ProcessObserver`      | type     | Observer interface for process events                          |
| `LinePosition`         | type     | Position information for text matches within a line            |
| `SourcePosition`       | type     | Position information with line and column details              |
| `SourceLocation`       | type     | File location with position information                        |
| `accessContent`        | function | Generator function to iterate over file content lines          |
| `calcDuration`         | function | Calculate duration between performance timestamps              |
| `executeProcess`       | function | Execute a child process with observer pattern                  |
| `fileResolverCache`    | constant | Map cache for file resolution operations                       |
| `findAllFiles`         | function | Async generator to find files matching a predicate             |
| `findFilesWithPattern` | function | Find TypeScript files containing a search pattern              |
| `findInFile`           | function | Find pattern matches within a specific file                    |
| `formatCommandLog`     | function | Format command strings with ANSI colors and directory context  |
| `getLineHits`          | function | Get all pattern matches within a text line                     |
| `isExcludedDirectory`  | function | Check if a directory should be excluded from searches          |
| `isVerbose`            | function | Check if verbose logging is enabled via environment variable   |
| `objectToCliArgs`      | function | Convert object properties to command-line arguments            |
| `resolveFile`          | function | Read file content directly without caching                     |
| `resolveFileCached`    | function | Read file content with caching for performance                 |

## Types

### `ProcessResult`

```ts
type ProcessResult = {
  stdout: string;
  stderr: string;
  code: number | null;
  date: string;
  duration: number;
};
```

Represents the result of a process execution with output streams, exit code, and timing information.

### `ProcessConfig`

```ts
type ProcessConfig = Omit<
  SpawnOptionsWithStdioTuple<StdioPipe, StdioPipe, StdioPipe>,
  'stdio'
> & {
  command: string;
  args?: string[];
  observer?: ProcessObserver;
  ignoreExitCode?: boolean;
};
```

Configuration object for process execution, extending Node.js spawn options.

### `ProcessObserver`

```ts
type ProcessObserver = {
  onStdout?: (stdout: string, sourceProcess?: ChildProcess) => void;
  onStderr?: (stderr: string, sourceProcess?: ChildProcess) => void;
  onError?: (error: ProcessError) => void;
  onComplete?: () => void;
};
```

Observer interface for handling process events during execution.

### `LinePosition`

```ts
type LinePosition = {
  startColumn: number;
  endColumn?: number;
};
```

Position information for text matches within a single line.

### `SourcePosition`

```ts
type SourcePosition = {
  startLine: number;
  endLine?: number;
} & LinePosition;
```

Extended position information including line numbers.

### `SourceLocation`

```ts
type SourceLocation = {
  file: string;
  position: SourcePosition;
};
```

Complete location information with file path and position details.

## Classes

### `ProcessError extends Error`

Error class for process execution failures, containing additional process result information.

**Properties:**

- `code: number | null` - Process exit code
- `stderr: string` - Process error output
- `stdout: string` - Process standard output

## Functions

### `executeProcess(cfg: ProcessConfig): Promise<ProcessResult>`

Executes a child process with comprehensive error handling and observer pattern support.

**Parameters:**

- `cfg` - Process configuration object

**Returns:** Promise resolving to process result

### `findFilesWithPattern(baseDir: string, searchPattern: string): Promise<string[]>`

Searches for TypeScript files containing the specified pattern.

**Parameters:**

- `baseDir` - Directory to search (absolute or resolved by caller)
- `searchPattern` - Pattern to match in file contents

**Returns:** Promise resolving to array of file paths

### `findAllFiles(baseDir: string, predicate?: (file: string) => boolean): AsyncGenerator<string>`

Async generator that finds all files matching a predicate function.

**Parameters:**

- `baseDir` - Base directory to search
- `predicate` - Optional file filter function (defaults to `.ts` files)

**Returns:** Async generator yielding file paths

### `findInFile(file: string, searchPattern: string, bail?: boolean): Promise<SourceLocation[]>`

Finds all occurrences of a pattern within a specific file.

**Parameters:**

- `file` - File path to search
- `searchPattern` - Pattern to find
- `bail` - Optional flag to stop after first match

**Returns:** Promise resolving to array of source locations

### `resolveFileCached(filePath: string): Promise<string>`

Resolves file content with caching to avoid reading the same file multiple times.

**Parameters:**

- `filePath` - Path to the file to read

**Returns:** Promise resolving to file content

### `resolveFile(filePath: string): Promise<string>`

Resolves file content directly without caching.

**Parameters:**

- `filePath` - Path to the file to read

**Returns:** Promise resolving to file content

### `formatCommandLog(command: string, args?: string[], cwd?: string): string`

Formats a command string with ANSI colors and optional directory context.

**Parameters:**

- `command` - Command to execute
- `args` - Command arguments (optional)
- `cwd` - Current working directory (optional)

**Returns:** ANSI-colored formatted command string

### `objectToCliArgs<T extends object>(params?: CliArgsObject<T>): string[]`

Converts an object with different value types into command-line arguments array.

**Parameters:**

- `params` - Object with CLI parameters

**Returns:** Array of formatted CLI arguments

### `calcDuration(start: number, stop?: number): number`

Calculates duration between performance timestamps.

**Parameters:**

- `start` - Start timestamp from `performance.now()`
- `stop` - Optional end timestamp (defaults to current time)

**Returns:** Duration in milliseconds

### `getLineHits(content: string, pattern: string, bail?: boolean): LinePosition[]`

Gets all pattern matches within a text line.

**Parameters:**

- `content` - Text content to search
- `pattern` - Pattern to find
- `bail` - Optional flag to stop after first match

**Returns:** Array of line positions

### `accessContent(content: string): Generator<string>`

Generator function to iterate over file content lines.

**Parameters:**

- `content` - File content string

**Returns:** Generator yielding individual lines

### `isExcludedDirectory(fileName: string): boolean`

Checks if a directory should be excluded from file searches.

**Parameters:**

- `fileName` - Directory name to check

**Returns:** `true` if directory should be excluded

### `isVerbose(): boolean`

Checks if verbose logging is enabled via the `NG_MCP_VERBOSE` environment variable.

**Returns:** `true` if verbose logging is enabled

## Constants

### `fileResolverCache: Map<string, Promise<string>>`

Map cache used by `resolveFileCached` to store file reading promises and avoid duplicate file operations.
