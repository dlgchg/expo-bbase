import { writeJson, readJson } from "./file";

interface PackageJsonDeps {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Merge dependencies into a package.json file.
 */
export async function mergeDependencies(
  pkgPath: string,
  deps: Record<string, string>,
  devDeps: Record<string, string>
): Promise<void> {
  const pkg = await readJson<PackageJsonDeps>(pkgPath);

  pkg.dependencies = {
    ...(pkg.dependencies || {}),
    ...deps,
  };

  pkg.devDependencies = {
    ...(pkg.devDependencies || {}),
    ...devDeps,
  };

  await writeJson(pkgPath, pkg);
}

/**
 * Generate base package.json content for a new Expo project.
 */
export function generateBasePackageJson(
  projectName: string
): Record<string, unknown> {
  return {
    name: projectName,
    version: "1.0.0",
    main: "expo-router/entry",
    scripts: {
      start: "expo start",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web",
      lint: "eslint .",
    },
    dependencies: {
      expo: "~54.0.0",
      "expo-router": "~5.0.0",
      "expo-linking": "~7.0.0",
      "expo-constants": "~18.0.0",
      "expo-status-bar": "~2.0.0",
      "expo-splash-screen": "~1.0.0",
      react: "19.0.0",
      "react-native": "0.79.0",
      "react-native-safe-area-context": "5.4.0",
      "react-native-screens": "~4.6.0",
      nativewind: "^4.1.0",
      tailwindcss: "^3.4.0",
    },
    devDependencies: {
      "@types/react": "~19.0.0",
      typescript: "^5.5.0",
    },
  };
}
