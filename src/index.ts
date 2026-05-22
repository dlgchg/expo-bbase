import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";
import path from "path";
import fse from "fs-extra";
import { Command } from "commander";
import {
  registerCreateCommand,
  registerUpgradeCommand,
  registerAddCommand,
} from "./commands/create";
import { modules, getModulesByIds, getModuleById } from "./modules";
import { generateBaseTemplates } from "./templates/base";
import { generateLoginTabsTemplates } from "./templates/login-tabs";
import { writeFile, writeJson, replaceTemplateVars } from "./utils/file";
import { generateBasePackageJson, mergeDependencies } from "./utils/package";
import type { ModuleDef, ProjectConfig } from "./types";
import { execa } from "execa";

/** CLI version — bump this when publishing */
const CLI_VERSION = "1.4.1";

/** Config file name stored in project root */
const CONFIG_FILE = ".expo-bbase.json";

// ─── CLI Entry Point ──────────────────────────────────────────────────────

export async function run(): Promise<void> {
  const program = new Command();

  program
    .name("expo-bbase")
    .description("Expo SDK 54+ scaffolding CLI tool")
    .version(CLI_VERSION);

  // Default action: npx expo-bbase <project-name>
  program
    .argument("[project-name]", "Name of the project to create")
    .action(async (projectName?: string) => {
      if (!projectName) {
        console.error(chalk.red("Error: Please provide a project name."));
        console.log(chalk.gray("Usage: npx expo-bbase <project-name>"));
        process.exit(1);
      }
      await createProject(projectName);
    });

  registerCreateCommand(program);
  registerUpgradeCommand(program);
  registerAddCommand(program);

  await program.parseAsync(process.argv);
}

// ─── Project Config Helpers ───────────────────────────────────────────────

async function readProjectConfig(
  targetDir: string
): Promise<ProjectConfig | null> {
  const configPath = path.join(targetDir, CONFIG_FILE);
  if (!(await fse.pathExists(configPath))) {
    return null;
  }
  return fse.readJson(configPath) as Promise<ProjectConfig>;
}

async function writeProjectConfig(
  targetDir: string,
  config: ProjectConfig
): Promise<void> {
  const configPath = path.join(targetDir, CONFIG_FILE);
  await writeJson(configPath, config);
}

// ─── Create Project ───────────────────────────────────────────────────────

export async function createProject(projectName: string): Promise<void> {
  console.log();
  console.log(
    chalk.bold.cyan("  ╔══════════════════════════════════════╗")
  );
  console.log(
    chalk.bold.cyan("  ║     expo-bbase — Expo Scaffolding     ║")
  );
  console.log(
    chalk.bold.cyan("  ╚══════════════════════════════════════╝")
  );
  console.log();

  // ─── Step 1: UI template selection ──────────────────────────────────
  const { uiTemplate } = await prompts({
    type: "select",
    name: "uiTemplate",
    message: "Choose a UI template",
    choices: [
      {
        title: `${chalk.bold("Login + Tabs")} — Login page, Home/List/Mine tabs with rnr components`,
        value: "login-tabs",
        description: "Pre-built login form, 3-tab layout with Button & AlertDialog demos",
      },
      {
        title: `${chalk.bold("Default")} — Blank tabs (Home + Explore)`,
        value: "default",
        description: "Minimal starter with basic tab navigation",
      },
    ],
    initial: 0,
  });

  if (uiTemplate === undefined) {
    console.log(chalk.yellow("\nCancelled."));
    process.exit(0);
  }

  const isLoginTabs = uiTemplate === "login-tabs";

  // ─── Step 2: Interactive module selection ──────────────────────────
  const choices = modules.map((m) => ({
    title: `${chalk.bold(m.name)} — ${chalk.gray(m.description)}`,
    value: m.id,
    // Auto-select ui-reusables when login-tabs template is chosen
    selected: isLoginTabs && m.id === "ui-reusables" ? true : m.defaultChecked,
  }));

  const { selectedModules } = await prompts({
    type: "multiselect",
    name: "selectedModules",
    message: "Select modules (Space to toggle, Enter to confirm)",
    choices,
    hint: "- Space toggle · a select all/none · Enter confirm",
    instructions: false,
  });

  if (selectedModules === undefined) {
    console.log(chalk.yellow("\nCancelled."));
    process.exit(0);
  }

  // Ensure ui-reusables is included when login-tabs is selected
  let finalModuleIds = selectedModules as string[];
  if (isLoginTabs && !finalModuleIds.includes("ui-reusables")) {
    finalModuleIds = ["ui-reusables", ...finalModuleIds];
  }

  const selectedModuleDefs = getModulesByIds(finalModuleIds);
  const targetDir = path.resolve(process.cwd(), projectName);

  console.log();
  console.log(chalk.white(`  📦 Project: ${chalk.bold(projectName)}`));
  console.log(chalk.white(`  📂 Path:    ${chalk.gray(targetDir)}`));
  console.log(
    chalk.white(
      `  🎨 Template: ${chalk.green(isLoginTabs ? "Login + Tabs" : "Default")}`
    )
  );
  console.log(
    chalk.white(
      `  🧩 Modules: ${chalk.green(selectedModuleDefs.map((m) => m.name).join(", ") || "none")}`
    )
  );
  console.log();

  // ─── Step 3: Create project directory and write base files ─────────
  const spinner = ora("Creating project...").start();

  try {
    const baseTemplates = generateBaseTemplates(projectName);

    for (const file of baseTemplates) {
      const filePath = path.join(targetDir, file.path);
      const content = replaceTemplateVars(file.content, { projectName });
      await writeFile(filePath, content);
    }

    spinner.text = "Writing module files...";

    // ─── Step 4: Write module template files ──────────────────────────
    for (const mod of selectedModuleDefs) {
      for (const file of mod.files) {
        const filePath = path.join(targetDir, file.path);
        const content = replaceTemplateVars(file.content, { projectName });
        await writeFile(filePath, content);
      }
    }

    // ─── Step 4.5: Write UI template files (override base files) ──────
    if (isLoginTabs) {
      spinner.text = "Writing UI template files...";
      const loginTabsTemplates = generateLoginTabsTemplates(projectName);
      for (const file of loginTabsTemplates) {
        const filePath = path.join(targetDir, file.path);
        const content = replaceTemplateVars(file.content, { projectName });
        await writeFile(filePath, content);
      }
    }

    // ─── Step 4.6: Copy assets directory (icon, splash, fonts) ──────
    spinner.text = "Copying assets...";
    const assetsSource = path.join(__dirname, "..", "templates", "assets");
    const assetsTarget = path.join(targetDir, "assets");
    if (fse.existsSync(assetsSource)) {
      fse.copySync(assetsSource, assetsTarget);
    }

    // ─── Step 5: Generate and merge package.json ──────────────────────
    spinner.text = "Generating package.json...";
    const pkgJson = generateBasePackageJson(projectName);

    const allDeps: Record<string, string> = {};
    const allDevDeps: Record<string, string> = {};
    for (const mod of selectedModuleDefs) {
      Object.assign(allDeps, mod.dependencies);
      Object.assign(allDevDeps, mod.devDependencies);
    }

    Object.assign(pkgJson.dependencies as Record<string, string>, allDeps);
    Object.assign(
      pkgJson.devDependencies as Record<string, string>,
      allDevDeps
    );

    const pkgPath = path.join(targetDir, "package.json");
    await writeJson(pkgPath, pkgJson);

    // ─── Step 6: Update app.json with plugin configurations ──────────
    spinner.text = "Configuring app.json...";
    await updateAppJson(targetDir, selectedModuleDefs, projectName);

    // ─── Step 7: Update babel.config.js with additional plugins ───────
    spinner.text = "Configuring Babel...";
    await updateBabelConfig(targetDir, selectedModuleDefs);

    // ─── Step 8: Update app/_layout.tsx with module providers/imports ─
    spinner.text = "Configuring layout...";
    await updateLayoutFile(targetDir, selectedModuleDefs);

    // ─── Step 9: Write .expo-bbase.json config ───────────────────────
    await writeProjectConfig(targetDir, {
      projectName,
      selectedModules: finalModuleIds,
      cliVersion: CLI_VERSION,
      uiTemplate: isLoginTabs ? "login-tabs" : "default",
    });

    // ─── Step 10: Run yarn install ────────────────────────────────────
    spinner.text = "Installing dependencies (yarn install)...";
    try {
      await execa("yarn", ["install"], {
        cwd: targetDir,
        timeout: 300_000,
      });
    } catch (installError: unknown) {
      const errMsg =
        installError instanceof Error
          ? installError.message
          : String(installError);
      spinner.warn("yarn install failed, please install manually");
      console.log(chalk.red(`  Error: ${errMsg}`));
      console.log(chalk.gray(`  cd ${projectName} && yarn install`));
    }

    // ─── Done! ────────────────────────────────────────────────────────
    spinner.succeed(chalk.green("Project created!"));

    console.log();
    console.log(chalk.bold("  🎉 Next steps:"));
    console.log(chalk.white(`     cd ${projectName}`));
    console.log(chalk.white("     npx expo start"));
    if (isLoginTabs) {
      console.log(chalk.gray("     → App starts at login page, sign in to see tabs"));
    }
    console.log();

    if (selectedModuleDefs.length > 0) {
      console.log(chalk.bold("  📋 Selected modules:"));
      for (const mod of selectedModuleDefs) {
        console.log(chalk.white(`     ✓ ${mod.name}`));
      }
      console.log();
    }
  } catch (error) {
    spinner.fail(chalk.red("Project creation failed"));
    console.error(error);
    process.exit(1);
  }
}

// ─── Upgrade Project ─────────────────────────────────────────────────────

export async function upgradeProject(targetDir: string): Promise<void> {
  console.log();
  console.log(
    chalk.bold.cyan("  ╔══════════════════════════════════════╗")
  );
  console.log(
    chalk.bold.cyan("  ║     expo-bbase — Upgrade              ║")
  );
  console.log(
    chalk.bold.cyan("  ╚══════════════════════════════════════╝")
  );
  console.log();

  const absDir = path.resolve(targetDir);
  const config = await readProjectConfig(absDir);

  if (!config) {
    console.error(
      chalk.red(
        `  ✖ No ${CONFIG_FILE} found in ${absDir}\n` +
          `  This directory doesn't appear to be an expo-bbase project.\n` +
          `  If it is, run "expo-bbase add" to register modules.`
      )
    );
    process.exit(1);
  }

  console.log(
    chalk.white(`  📂 Project:    ${chalk.bold(config.projectName)}`)
  );
  console.log(
    chalk.white(`  📋 CLI version: ${chalk.gray(config.cliVersion || "unknown")} → ${chalk.green(CLI_VERSION)}`)
  );
  console.log(
    chalk.white(
      `  🧩 Modules:    ${chalk.green(config.selectedModules.join(", ") || "none")}`
    )
  );
  console.log();

  const spinner = ora("Upgrading project...").start();

  try {
    const selectedModuleDefs = getModulesByIds(config.selectedModules);

    // ─── Step 1: Update module files (overwrite) ──────────────────────
    spinner.text = "Updating module files...";
    for (const mod of selectedModuleDefs) {
      for (const file of mod.files) {
        const filePath = path.join(absDir, file.path);
        const content = replaceTemplateVars(file.content, {
          projectName: config.projectName,
        });
        await writeFile(filePath, content);
      }
    }

    // ─── Step 2: Update dependencies in package.json ─────────────────
    spinner.text = "Updating dependencies...";
    const allDeps: Record<string, string> = {};
    const allDevDeps: Record<string, string> = {};
    for (const mod of selectedModuleDefs) {
      Object.assign(allDeps, mod.dependencies);
      Object.assign(allDevDeps, mod.devDependencies);
    }

    // Also update base dependencies
    const basePkg = generateBasePackageJson(config.projectName);
    Object.assign(allDeps, basePkg.dependencies as Record<string, string>);
    Object.assign(
      allDevDeps,
      basePkg.devDependencies as Record<string, string>
    );

    const pkgPath = path.join(absDir, "package.json");
    await mergeDependencies(pkgPath, allDeps, allDevDeps);

    // ─── Step 3: Update app.json plugins ─────────────────────────────
    spinner.text = "Updating app.json...";
    await updateAppJson(absDir, selectedModuleDefs, config.projectName);

    // ─── Step 4: Update babel.config.js ───────────────────────────────
    spinner.text = "Updating Babel config...";
    await updateBabelConfig(absDir, selectedModuleDefs);

    // ─── Step 5: Update _layout.tsx ──────────────────────────────────
    spinner.text = "Updating layout...";
    await updateLayoutFile(absDir, selectedModuleDefs);

    // ─── Step 6: Update .expo-bbase.json ─────────────────────────────
    config.cliVersion = CLI_VERSION;
    await writeProjectConfig(absDir, config);

    // ─── Step 7: yarn install ─────────────────────────────────────────
    spinner.text = "Installing updated dependencies (yarn install)...";
    try {
      await execa("yarn", ["install"], {
        cwd: absDir,
        timeout: 300_000,
      });
    } catch (installError: unknown) {
      const errMsg =
        installError instanceof Error
          ? installError.message
          : String(installError);
      spinner.warn("yarn install failed, please install manually");
      console.log(chalk.red(`  Error: ${errMsg}`));
    }

    spinner.succeed(chalk.green("Project upgraded!"));

    console.log();
    console.log(chalk.bold("  📋 Upgrade summary:"));
    console.log(chalk.white(`     CLI:      ${chalk.gray(config.cliVersion)} (before)`));
    console.log(chalk.white(`     Modules:  ${chalk.green(config.selectedModules.join(", "))}`));
    console.log();
    console.log(chalk.bold("  🎉 Run your project:"));
    console.log(chalk.white("     npx expo start"));
    console.log();
  } catch (error) {
    spinner.fail(chalk.red("Upgrade failed"));
    console.error(error);
    process.exit(1);
  }
}

// ─── Add Modules ─────────────────────────────────────────────────────────

export async function addModule(
  moduleIds: string[],
  targetDir: string
): Promise<void> {
  console.log();

  const absDir = path.resolve(targetDir);
  let config = await readProjectConfig(absDir);

  // If no config exists, try to infer from package.json
  if (!config) {
    const pkgPath = path.join(absDir, "package.json");
    if (!(await fse.pathExists(pkgPath))) {
      console.error(
        chalk.red(`  ✖ No package.json found in ${absDir}`)
      );
      process.exit(1);
    }
    const pkg = await fse.readJson(pkgPath);
    config = {
      projectName: pkg.name || path.basename(absDir),
      selectedModules: [],
      cliVersion: CLI_VERSION,
    };
    console.log(
      chalk.yellow(
        `  ⚠ No ${CONFIG_FILE} found. Creating one for project "${config.projectName}".`
      )
    );
  }

  // Interactive module selection if no module IDs provided
  if (moduleIds.length === 0) {
    const availableModules = modules.filter(
      (m) => !config!.selectedModules.includes(m.id)
    );

    if (availableModules.length === 0) {
      console.log(chalk.green("  ✓ All modules are already installed!"));
      process.exit(0);
    }

    const choices = availableModules.map((m) => ({
      title: `${chalk.bold(m.name)} — ${chalk.gray(m.description)}`,
      value: m.id,
      selected: false,
    }));

    const { selected } = await prompts({
      type: "multiselect",
      name: "selected",
      message: "Select modules to add (Space to toggle, Enter to confirm)",
      choices,
      hint: "- Space toggle · a select all/none · Enter confirm",
      instructions: false,
    });

    if (selected === undefined || selected.length === 0) {
      console.log(chalk.yellow("  No modules selected."));
      process.exit(0);
    }

    moduleIds = selected as string[];
  }

  // Validate module IDs
  const invalidIds = moduleIds.filter((id) => !getModuleById(id));
  if (invalidIds.length > 0) {
    console.error(
      chalk.red(`  ✖ Unknown module(s): ${invalidIds.join(", ")}`)
    );
    console.log(
      chalk.gray(
        `  Available: ${modules.map((m) => m.id).join(", ")}`
      )
    );
    process.exit(1);
  }

  // Filter out already installed modules
  const newModuleIds = moduleIds.filter(
    (id) => !config!.selectedModules.includes(id)
  );
  if (newModuleIds.length === 0) {
    console.log(
      chalk.yellow("  All specified modules are already installed.")
    );
    process.exit(0);
  }

  const newModuleDefs = getModulesByIds(newModuleIds);

  console.log(
    chalk.white(`  📂 Project:  ${chalk.bold(config.projectName)}`)
  );
  console.log(
    chalk.white(
      `  ➕ Adding:   ${chalk.green(newModuleDefs.map((m) => m.name).join(", "))}`
    )
  );
  console.log();

  const spinner = ora("Adding modules...").start();

  try {
    // ─── Step 1: Write module files ───────────────────────────────────
    spinner.text = "Writing module files...";
    for (const mod of newModuleDefs) {
      for (const file of mod.files) {
        const filePath = path.join(absDir, file.path);
        const content = replaceTemplateVars(file.content, {
          projectName: config!.projectName,
        });
        await writeFile(filePath, content);
      }
    }

    // ─── Step 2: Merge dependencies into existing package.json ───────
    spinner.text = "Updating dependencies...";
    const allDeps: Record<string, string> = {};
    const allDevDeps: Record<string, string> = {};
    for (const mod of newModuleDefs) {
      Object.assign(allDeps, mod.dependencies);
      Object.assign(allDevDeps, mod.devDependencies);
    }

    const pkgPath = path.join(absDir, "package.json");
    await mergeDependencies(pkgPath, allDeps, allDevDeps);

    // ─── Step 3: Update app.json plugins ─────────────────────────────
    spinner.text = "Updating app.json...";
    const existingModules = getModulesByIds(config!.selectedModules);
    await updateAppJson(
      absDir,
      [...existingModules, ...newModuleDefs],
      config!.projectName
    );

    // ─── Step 4: Update babel.config.js ─────────────────────────────
    spinner.text = "Updating Babel config...";
    await updateBabelConfig(absDir, newModuleDefs);

    // ─── Step 5: Update _layout.tsx ──────────────────────────────────
    spinner.text = "Updating layout...";
    await updateLayoutFile(absDir, newModuleDefs);

    // ─── Step 6: Update .expo-bbase.json ─────────────────────────────
    config!.selectedModules.push(...newModuleIds);
    config!.cliVersion = CLI_VERSION;
    await writeProjectConfig(absDir, config!);

    // ─── Step 7: yarn install ─────────────────────────────────────────
    spinner.text = "Installing dependencies (yarn install)...";
    try {
      await execa("yarn", ["install"], {
        cwd: absDir,
        timeout: 300_000,
      });
    } catch (installError: unknown) {
      const errMsg =
        installError instanceof Error
          ? installError.message
          : String(installError);
      spinner.warn("yarn install failed, please install manually");
      console.log(chalk.red(`  Error: ${errMsg}`));
    }

    spinner.succeed(chalk.green("Modules added!"));

    console.log();
    console.log(chalk.bold("  📋 Added modules:"));
    for (const mod of newModuleDefs) {
      console.log(chalk.white(`     ✓ ${mod.name} (${mod.id})`));
    }
    console.log();
    console.log(chalk.bold("  🧩 All installed modules:"));
    for (const id of config!.selectedModules) {
      const m = getModuleById(id);
      console.log(chalk.white(`     • ${m?.name || id}`));
    }
    console.log();
  } catch (error) {
    spinner.fail(chalk.red("Failed to add modules"));
    console.error(error);
    process.exit(1);
  }
}

// ─── Shared Helpers ───────────────────────────────────────────────────────

/**
 * Update the generated app.json with plugin configurations from selected modules.
 */
async function updateAppJson(
  targetDir: string,
  selectedModules: ModuleDef[],
  _projectName: string
): Promise<void> {
  const appJsonPath = path.join(targetDir, "app.json");
  if (!(await fse.pathExists(appJsonPath))) {
    return;
  }
  const appJson = await fse.readJson(appJsonPath);

  const existingPlugins: (string | [string, Record<string, unknown>])[] =
    appJson.expo?.plugins || [];

  for (const mod of selectedModules) {
    if (mod.appConfig?.plugins) {
      const modulePlugins = mod.appConfig.plugins as (
        | string
        | [string, Record<string, unknown>]
      )[];
      for (const plugin of modulePlugins) {
        const pluginName =
          typeof plugin === "string" ? plugin : plugin[0];
        const exists = existingPlugins.some((p) =>
          typeof p === "string" ? p === pluginName : p[0] === pluginName
        );
        if (!exists) {
          existingPlugins.push(plugin);
        }
      }
    }
  }

  appJson.expo.plugins = existingPlugins;
  await writeJson(appJsonPath, appJson);
}

/**
 * Update babel.config.js with additional plugins from selected modules.
 */
async function updateBabelConfig(
  targetDir: string,
  selectedModules: ModuleDef[]
): Promise<void> {
  const babelPath = path.join(targetDir, "babel.config.js");
  if (!(await fse.pathExists(babelPath))) {
    return;
  }

  let content = await fse.readFile(babelPath, "utf-8");

  const extraPlugins: string[] = [];
  for (const mod of selectedModules) {
    if (mod.babelPlugins && mod.babelPlugins.length > 0) {
      extraPlugins.push(...mod.babelPlugins);
    }
  }

  if (extraPlugins.length > 0) {
    // Filter out plugins that are already in the config
    const pluginsToAdd = extraPlugins.filter((p) => !content.includes(p));
    if (pluginsToAdd.length > 0) {
      const pluginStrings = pluginsToAdd
        .map((p) => `    "${p}"`)
        .join(",\n");
      content = content.replace(
        /plugins:\s*\[([^\]]*)\]/,
        `plugins: [$1${pluginStrings ? ",\n" + pluginStrings : ""}]`
      );
      await fse.writeFile(babelPath, content, "utf-8");
    }
  }
}

/**
 * Update app/_layout.tsx with imports and providers from selected modules.
 */
async function updateLayoutFile(
  targetDir: string,
  selectedModules: ModuleDef[]
): Promise<void> {
  const layoutPath = path.join(targetDir, "app/_layout.tsx");
  if (!(await fse.pathExists(layoutPath))) {
    return;
  }

  let content = await fse.readFile(layoutPath, "utf-8");

  const extraImports: string[] = [];
  const extraProviderPairs: { open: string; close: string }[] = [];

  for (const mod of selectedModules) {
    if (mod.layoutImports) {
      // Only add imports that don't already exist
      for (const imp of mod.layoutImports) {
        if (!content.includes(imp)) {
          extraImports.push(imp);
        }
      }
    }
    if (mod.layoutProviders) {
      for (const provider of mod.layoutProviders) {
        const match = provider.match(/^<(\w+)/);
        if (match) {
          const tagName = match[1];
          // Only add providers that don't already exist
          if (!content.includes(`<${tagName}`)) {
            extraProviderPairs.push({
              open: `      ${provider}`,
              close: `      </${tagName}>`,
            });
          }
        }
      }
    }
  }

  if (extraImports.length === 0 && extraProviderPairs.length === 0) {
    return;
  }

  if (extraImports.length > 0) {
    const lastImportIndex = content.lastIndexOf("import ");
    const lineEndIndex = content.indexOf("\n", lastImportIndex);
    const importBlock = "\n" + extraImports.join("\n");
    content =
      content.slice(0, lineEndIndex + 1) +
      importBlock +
      content.slice(lineEndIndex + 1);
  }

  if (extraProviderPairs.length > 0) {
    const returnMatch = content.indexOf("return (");
    if (returnMatch !== -1) {
      const openingProviders = extraProviderPairs
        .map((p) => p.open)
        .join("\n");
      const closingProviders = extraProviderPairs
        .reverse()
        .map((p) => p.close)
        .join("\n");

      const themeProviderOpen = content.indexOf("<ThemeProvider");
      const themeProviderClose = content.lastIndexOf("</ThemeProvider>");

      if (themeProviderOpen !== -1 && themeProviderClose !== -1) {
        content =
          content.slice(0, themeProviderOpen) +
          openingProviders +
          "\n" +
          content.slice(themeProviderOpen);

        const newThemeProviderClose =
          content.lastIndexOf("</ThemeProvider>");
        const afterClose =
          newThemeProviderClose + "</ThemeProvider>".length;
        content =
          content.slice(0, afterClose) +
          "\n" +
          closingProviders +
          content.slice(afterClose);
      }
    }
  }

  await fse.writeFile(layoutPath, content, "utf-8");
}

// ─── Run ───────────────────────────────────────────────────────────────────

run().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
