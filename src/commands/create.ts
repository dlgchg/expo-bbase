import { Command } from "commander";
import { createProject } from "../index";

/**
 * Register the "create" command with the CLI program.
 */
export function registerCreateCommand(program: Command): void {
  program
    .command("create <project-name>")
    .description("Create a new Expo project with selected modules")
    .action(async (projectName: string) => {
      await createProject(projectName);
    });
}
