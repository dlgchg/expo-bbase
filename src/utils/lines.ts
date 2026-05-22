/**
 * Join an array of strings with newlines.
 * This helper avoids template literal escaping issues in module content strings.
 */
export function lines(...args: string[]): string {
  return args.join("\n");
}
