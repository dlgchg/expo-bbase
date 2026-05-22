import { Command } from "commander";
import { createProject } from "../index";
import { upgradeProject } from "../index";
import { addModule } from "../index";

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

/**
 * Register the "upgrade" command with the CLI program.
 */
export function registerUpgradeCommand(program: Command): void {
  program
    .command("upgrade")
    .description("Upgrade an existing expo-bbase project to the latest module versions")
    .option("--dir <path>", "Project directory (default: current directory)", process.cwd())
    .action(async (options: { dir: string }) => {
      await upgradeProject(options.dir);
    });
}

/**
 * Register the "add" command with the CLI program.
 */
export function registerAddCommand(program: Command): void {
  program
    .command("add [modules...]")
    .description("Add one or more modules to an existing expo-bbase project")
    .option("--dir <path>", "Project directory (default: current directory)", process.cwd())
    .action(async (moduleIds: string[], options: { dir: string }) => {
      await addModule(moduleIds, options.dir);
    });
}
