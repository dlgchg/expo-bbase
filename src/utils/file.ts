import fs from "fs-extra";
import path from "path";

/**
 * Recursively copy all files from a source directory to a destination directory.
 */
export async function copyDirectory(
  src: string,
  dest: string
): Promise<void> {
  await fs.copy(src, dest, { overwrite: true });
}

/**
 * Write a file, creating parent directories as needed.
 */
export async function writeFile(
  filePath: string,
  content: string
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);
  await fs.writeFile(filePath, content, "utf-8");
}

/**
 * Check if a path exists.
 */
export async function pathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

/**
 * Read a JSON file and parse it.
 */
export async function readJson<T = Record<string, unknown>>(
  filePath: string
): Promise<T> {
  return fs.readJson(filePath) as Promise<T>;
}

/**
 * Write a JSON object to a file with formatting.
 */
export async function writeJson(
  filePath: string,
  data: unknown,
  spaces: number = 2
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.ensureDir(dir);
  await fs.writeJson(filePath, data, { spaces });
}

/**
 * Replace template variables in content string.
 * Supports {{variableName}} syntax.
 */
export function replaceTemplateVars(
  content: string,
  vars: Record<string, string>
): string {
  let result = content;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, "g");
    result = result.replace(regex, value);
  }
  return result;
}
