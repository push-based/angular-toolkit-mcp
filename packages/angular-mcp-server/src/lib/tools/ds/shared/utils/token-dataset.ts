/**
 * Token Dataset — queryable data structure for design tokens.
 *
 * Provides interfaces and an indexed implementation for efficient
 * lookup by name, prefix, value, category, and scope.
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

/**
 * Scope derived from directory path segments.
 * Keys are determined by the directoryStrategy config.
 * Empty object for flat strategy.
 */
export interface TokenScope {
  [key: string]: string;
}

/**
 * A single design token entry with metadata.
 */
export interface TokenEntry {
  /** Full custom property name, e.g. '--semantic-color-primary' */
  name: string;
  /** Resolved value string, e.g. '#86b521' or 'var(--other-token)' */
  value: string;
  /** Category assigned by inference strategy. Undefined if uncategorised. */
  category?: string;
  /** Scope from directory strategy */
  scope: TokenScope;
  /** Source file path */
  sourceFile: string;
}

/**
 * Queryable, immutable token dataset.
 */
export interface TokenDataset {
  /** True when no tokens were loaded */
  readonly isEmpty: boolean;
  /** Diagnostic messages from loading */
  readonly diagnostics: string[];
  /** All loaded tokens */
  readonly tokens: ReadonlyArray<TokenEntry>;

  /** Lookup by exact token name */
  getByName(name: string): TokenEntry | undefined;
  /** Lookup by token name prefix */
  getByPrefix(prefix: string): TokenEntry[];
  /** Reverse lookup: find all tokens resolving to the given value */
  getByValue(value: string): TokenEntry[];
  /** Lookup by category */
  getByCategory(category: string): TokenEntry[];
  /** Lookup by scope: returns tokens matching all provided key-value pairs */
  getByScope(scope: Record<string, string>): TokenEntry[];
  /** Scope-filtered reverse value lookup */
  getByValueInScope(value: string, scope: Record<string, string>): TokenEntry[];
  /** Scope-filtered category lookup */
  getByCategoryInScope(
    category: string,
    scope: Record<string, string>,
  ): TokenEntry[];
}

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

/**
 * Indexed implementation of {@link TokenDataset}.
 *
 * Builds four internal indexes at construction time:
 *  - `byName`     — Map<name, TokenEntry>          (O(1) lookup)
 *  - `byValue`    — Map<value, TokenEntry[]>        (O(1) lookup)
 *  - `byCategory` — Map<category, TokenEntry[]>     (O(1) lookup)
 *  - `byScopeKey` — Map<scopeKey, Map<scopeValue, TokenEntry[]>>  (O(k) lookup)
 *
 * `getByPrefix()` performs a linear scan (O(n)).
 *
 * Note: individual TokenEntry objects are not deep-frozen for performance.
 * ReadonlyArray typing prevents structural mutation at compile time.
 * Deep-freeze can be added if consumers require runtime immutability guarantees.
 */
export class TokenDatasetImpl implements TokenDataset {
  readonly isEmpty: boolean;
  readonly diagnostics: string[];
  readonly tokens: ReadonlyArray<TokenEntry>;

  private readonly byName: Map<string, TokenEntry>;
  private readonly byValue: Map<string, TokenEntry[]>;
  private readonly byCategory: Map<string, TokenEntry[]>;
  private readonly byScopeKey: Map<string, Map<string, TokenEntry[]>>;

  constructor(tokens: TokenEntry[], diagnostics: string[] = []) {
    this.tokens = Object.freeze([...tokens]);
    this.diagnostics = Object.freeze([...diagnostics]) as string[];
    this.isEmpty = tokens.length === 0;

    // Build indexes
    this.byName = new Map();
    this.byValue = new Map();
    this.byCategory = new Map();
    this.byScopeKey = new Map();

    for (const token of tokens) {
      // by name (last-write wins for duplicates)
      this.byName.set(token.name, token);

      // by value
      const valueList = this.byValue.get(token.value);
      if (valueList) {
        valueList.push(token);
      } else {
        this.byValue.set(token.value, [token]);
      }

      // by category
      if (token.category != null) {
        const catList = this.byCategory.get(token.category);
        if (catList) {
          catList.push(token);
        } else {
          this.byCategory.set(token.category, [token]);
        }
      }

      // by scope key → value
      for (const [key, val] of Object.entries(token.scope)) {
        let keyMap = this.byScopeKey.get(key);
        if (!keyMap) {
          keyMap = new Map();
          this.byScopeKey.set(key, keyMap);
        }
        const scopeList = keyMap.get(val);
        if (scopeList) {
          scopeList.push(token);
        } else {
          keyMap.set(val, [token]);
        }
      }
    }
  }

  // -- Query methods --------------------------------------------------------

  getByName(name: string): TokenEntry | undefined {
    return this.byName.get(name);
  }

  getByPrefix(prefix: string): TokenEntry[] {
    return this.tokens.filter((t) => t.name.startsWith(prefix));
  }

  getByValue(value: string): TokenEntry[] {
    return [...(this.byValue.get(value) ?? [])];
  }

  getByCategory(category: string): TokenEntry[] {
    return [...(this.byCategory.get(category) ?? [])];
  }

  getByScope(scope: Record<string, string>): TokenEntry[] {
    const entries = Object.entries(scope);
    if (entries.length === 0) {
      return [...this.tokens];
    }

    // Start with the first key-value pair, then intersect
    let result: Set<TokenEntry> | undefined;

    for (const [key, val] of entries) {
      const keyMap = this.byScopeKey.get(key);
      const matching = keyMap?.get(val) ?? [];
      const matchSet = new Set(matching);

      if (result === undefined) {
        result = matchSet;
      } else {
        // Intersect
        for (const token of result) {
          if (!matchSet.has(token)) {
            result.delete(token);
          }
        }
      }
    }

    return result ? [...result] : [];
  }

  getByValueInScope(
    value: string,
    scope: Record<string, string>,
  ): TokenEntry[] {
    const byVal = this.getByValue(value);
    const byScope = new Set(this.getByScope(scope));
    return byVal.filter((t) => byScope.has(t));
  }

  getByCategoryInScope(
    category: string,
    scope: Record<string, string>,
  ): TokenEntry[] {
    const byCat = this.getByCategory(category);
    const byScope = new Set(this.getByScope(scope));
    return byCat.filter((t) => byScope.has(t));
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates an empty {@link TokenDataset}, optionally with a diagnostic message.
 */
export function createEmptyTokenDataset(diagnostic?: string): TokenDataset {
  const diagnostics = diagnostic ? [diagnostic] : [];
  return new TokenDatasetImpl([], diagnostics);
}
