/**
 * Extracts deprecated class from violation message
 */
export function parseViolationMessage(message: string): string {
  // Clean up HTML tags
  const cleanMessage = message
    .replace(/<code>/g, '`')
    .replace(/<\/code>/g, '`');

  // Extract deprecated class - look for patterns like "class `offer-badge`" or "class `btn, btn-primary`"
  const classMatch = cleanMessage.match(/class `([^`]+)`/);
  return classMatch ? classMatch[1] : 'unknown';
}

/**
 * Extracts deprecated class and replacement from violation message
 * Performance optimized with caching to avoid repeated regex operations
 */
const messageParsingCache = new Map<
  string,
  { violation: string; replacement: string }
>();

export function parseViolationMessageWithReplacement(message: string): {
  violation: string;
  replacement: string;
} {
  // Check cache first
  const cached = messageParsingCache.get(message);
  if (cached) {
    return cached;
  }

  // Clean up HTML tags
  const cleanMessage = message
    .replace(/<code>/g, '`')
    .replace(/<\/code>/g, '`');

  // Extract deprecated class - look for patterns like "class `offer-badge`" or "class `btn, btn-primary`"
  const classMatch = cleanMessage.match(/class `([^`]+)`/);
  const violation = classMatch ? classMatch[1] : 'unknown';

  // Extract replacement component - look for "Use `ComponentName`"
  const replacementMatch = cleanMessage.match(/Use `([^`]+)`/);
  const replacement = replacementMatch ? replacementMatch[1] : 'unknown';

  const result = { violation, replacement };
  messageParsingCache.set(message, result);
  return result;
}
