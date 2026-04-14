/**
 * Escapes special regex characters in a string for safe use in RegExp constructors.
 *
 * @param str - The string to escape
 * @returns The escaped string safe for use in `new RegExp()`
 */
export function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
