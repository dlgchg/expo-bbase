import chalk from "chalk";
import prompts from "prompts";
import ora from "ora";
import path from "path";
import { Command } from "commander";
import { registerCreateCommand } from "./commands/create";
import { modules, getModulesByIds } from "./modules";
import { generateBaseTemplates } from "./templates/base";
import { writeFile, writeJson, replaceTemplateVars } from "./utils/file";
import { generateBasePackageJson } from "./utils/package";
import type { ModuleDef } from "./types";
import { execa } from "execa";

/**
 * Main entry point for the CLI.
 */
export async function run(): Promise<void> {
  const program = new Command();

  program
    .name("expo-bbase")
    .description("Expo SDK 54+ 脚手架 CLI 工具")
    .version("1.0.0");

  // Register the default action: npx expo-bbase <project-name>
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

  await program.parseAsync(process.argv);
}

/**
 * Create a new Expo project with interactive module selection.
 */
export async function createProject(projectName: string): Promise<void> {
  console.log();
  console.log(
    chalk.bold.cyan("  ╔══════════════════════════════════════╗")
  );
  console.log(
    chalk.bold.cyan("  ║     expo-bbase — Expo 脚手架工具      ║")
  );
  console.log(
    chalk.bold.cyan("  ╚══════════════════════════════════════╝")
  );
  console.log();

  // ─── Step 1: Interactive module selection ──────────────────────────
  const choices = modules.map((m) => ({
    title: `${chalk.bold(m.name)} — ${chalk.gray(m.description)}`,
    value: m.id,
    selected: m.defaultChecked,
  }));

  const { selectedModules } = await prompts({
    type: "multiselect",
    name: "selectedModules",
    message: "选择需要的功能模块（空格切换，回车确认）",
    choices,
    hint: "- 空格切换选择 · a 全选/取消 · 回车确认",
    instructions: false,
  });

  // User cancelled the prompt
  if (selectedModules === undefined) {
    console.log(chalk.yellow("\n已取消创建项目。"));
    process.exit(0);
  }

  const selectedModuleDefs = getModulesByIds(selectedModules as string[]);
  const targetDir = path.resolve(process.cwd(), projectName);

  console.log();
  console.log(chalk.white(`  📦 项目名称: ${chalk.bold(projectName)}`));
  console.log(
    chalk.white(`  📂 目标路径: ${chalk.gray(targetDir)}`)
  );
  console.log(
    chalk.white(
      `  🧩 选择模块: ${chalk.green(selectedModuleDefs.map((m) => m.name).join(", ") || "无")}`
    )
  );
  console.log();

  // ─── Step 2: Create project directory and write base files ─────────
  const spinner = ora("正在创建项目...").start();

  try {
    // Generate base template files
    const baseTemplates = generateBaseTemplates(projectName);

    // Write all base files
    for (const file of baseTemplates) {
      const filePath = path.join(targetDir, file.path);
      const content = replaceTemplateVars(file.content, {
        projectName,
      });
      await writeFile(filePath, content);
    }

    spinner.text = "正在写入模块文件...";

    // ─── Step 3: Write module template files ──────────────────────────
    for (const mod of selectedModuleDefs) {
      for (const file of mod.files) {
        const filePath = path.join(targetDir, file.path);
        const content = replaceTemplateVars(file.content, {
          projectName,
        });
        await writeFile(filePath, content);
      }
    }

    // ─── Step 4: Generate and merge package.json ──────────────────────
    spinner.text = "正在生成 package.json...";
    const pkgJson = generateBasePackageJson(projectName);

    // Collect all dependencies from selected modules
    const allDeps: Record<string, string> = {};
    const allDevDeps: Record<string, string> = {};
    for (const mod of selectedModuleDefs) {
      Object.assign(allDeps, mod.dependencies);
      Object.assign(allDevDeps, mod.devDependencies);
    }

    // Merge into base package.json
    Object.assign(pkgJson.dependencies as Record<string, string>, allDeps);
    Object.assign(
      pkgJson.devDependencies as Record<string, string>,
      allDevDeps
    );

    const pkgPath = path.join(targetDir, "package.json");
    await writeJson(pkgPath, pkgJson);

    // ─── Step 5: Update app.json with plugin configurations ──────────
    spinner.text = "正在配置 app.json...";
    await updateAppJson(targetDir, selectedModuleDefs, projectName);

    // ─── Step 6: Update babel.config.js with additional plugins ───────
    spinner.text = "正在配置 Babel...";
    await updateBabelConfig(targetDir, selectedModuleDefs);

    // ─── Step 7: Update app/_layout.tsx with module providers/imports ─
    spinner.text = "正在配置入口文件...";
    await updateLayoutFile(targetDir, selectedModuleDefs);

    // ─── Step 8: Run npm install ──────────────────────────────────────
    spinner.text = "正在安装依赖 (npm install)...";
    try {
      await execa("npm", ["install"], {
        cwd: targetDir,
        timeout: 300_000, // 5 minute timeout
      });
    } catch (installError) {
      spinner.warn("npm install 失败，请手动运行 npm install");
      console.log(
        chalk.gray(`  cd ${projectName} && npm install`)
      );
    }

    // ─── Done! ────────────────────────────────────────────────────────
    spinner.succeed(chalk.green("项目创建成功！"));

    console.log();
    console.log(chalk.bold("  🎉 下一步："));
    console.log(chalk.white(`     cd ${projectName}`));
    console.log(chalk.white("     npx expo start"));
    console.log();

    if (selectedModuleDefs.length > 0) {
      console.log(chalk.bold("  📋 已选模块："));
      for (const mod of selectedModuleDefs) {
        console.log(chalk.white(`     ✓ ${mod.name}`));
      }
      console.log();
    }
  } catch (error) {
    spinner.fail(chalk.red("项目创建失败"));
    console.error(error);
    process.exit(1);
  }
}

/**
 * Update the generated app.json with plugin configurations from selected modules.
 */
async function updateAppJson(
  targetDir: string,
  selectedModules: ModuleDef[],
  projectName: string
): Promise<void> {
  const appJsonPath = path.join(targetDir, "app.json");
  const appJson = await import("fs-extra").then((fs) =>
    fs.readJson(appJsonPath)
  );

  // Collect all plugin configs
  const existingPlugins: (string | [string, Record<string, unknown>])[] =
    appJson.expo?.plugins || [];

  for (const mod of selectedModules) {
    if (mod.appConfig?.plugins) {
      const modulePlugins = mod.appConfig.plugins as (
        | string
        | [string, Record<string, unknown>]
      )[];
      for (const plugin of modulePlugins) {
        // Avoid duplicate plugin entries
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
  const fs = await import("fs-extra");

  let content = await fs.readFile(babelPath, "utf-8");

  const extraPlugins: string[] = [];
  for (const mod of selectedModules) {
    if (mod.babelPlugins) {
      extraPlugins.push(...mod.babelPlugins);
    }
  }

  if (extraPlugins.length > 0) {
    // Insert additional plugins before the closing bracket of the plugins array
    const pluginStrings = extraPlugins
      .map((p) => `    "${p}"`)
      .join(",\n");
    content = content.replace(
      /plugins:\s*\[([^\]]*)\]/,
      `plugins: [$1${pluginStrings ? ",\n" + pluginStrings : ""}]`
    );
    await fs.writeFile(babelPath, content, "utf-8");
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
  const fs = await import("fs-extra");

  let content = await fs.readFile(layoutPath, "utf-8");

  // Collect imports and providers
  const extraImports: string[] = [];
  const extraProviderPairs: { open: string; close: string }[] = [];

  for (const mod of selectedModules) {
    if (mod.layoutImports) {
      extraImports.push(...mod.layoutImports);
    }
    if (mod.layoutProviders) {
      for (const provider of mod.layoutProviders) {
        // Parse opening and closing tags
        const match = provider.match(/^<(\w+)/);
        if (match) {
          const tagName = match[1];
          extraProviderPairs.push({
            open: `      ${provider}`,
            close: `      </${tagName}>`,
          });
        }
      }
    }
  }

  if (extraImports.length === 0 && extraProviderPairs.length === 0) {
    return;
  }

  // Add imports after the existing import block
  if (extraImports.length > 0) {
    const lastImportIndex = content.lastIndexOf("import ");
    const lineEndIndex = content.indexOf("\n", lastImportIndex);
    const importBlock = "\n" + extraImports.join("\n");
    content =
      content.slice(0, lineEndIndex + 1) +
      importBlock +
      content.slice(lineEndIndex + 1);
  }

  // Wrap the return statement content with providers
  if (extraProviderPairs.length > 0) {
    // Find the innermost returned JSX (the <Stack> component)
    const returnMatch = content.indexOf("return (");
    if (returnMatch !== -1) {
      // Build provider wrappers
      const openingProviders = extraProviderPairs.map((p) => p.open).join("\n");
      const closingProviders = extraProviderPairs
        .reverse()
        .map((p) => p.close)
        .join("\n");

      // Find <ThemeProvider> opening and closing
      const themeProviderOpen = content.indexOf("<ThemeProvider");
      const themeProviderClose = content.lastIndexOf("</ThemeProvider>");

      if (themeProviderOpen !== -1 && themeProviderClose !== -1) {
        // Insert opening providers before <ThemeProvider>
        content =
          content.slice(0, themeProviderOpen) +
          openingProviders +
          "\n" +
          content.slice(themeProviderOpen);

        // Recalculate position after insertion
        const newThemeProviderClose =
          content.lastIndexOf("</ThemeProvider>");
        const afterClose = newThemeProviderClose + "</ThemeProvider>".length;
        content =
          content.slice(0, afterClose) +
          "\n" +
          closingProviders +
          content.slice(afterClose);
      }
    }
  }

  await fs.writeFile(layoutPath, content, "utf-8");
}

// Run the CLI when executed directly
run().catch((error) => {
  console.error(chalk.red("Fatal error:"), error);
  process.exit(1);
});
