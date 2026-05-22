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
      expo: "~54.0.34",
      "expo-router": "~6.0.23",
      "expo-linking": "~8.0.12",
      "expo-constants": "~18.0.13",
      "expo-status-bar": "~3.0.9",
      "expo-splash-screen": "~31.0.13",
      "expo-font": "~14.0.11",
      react: "19.1.0",
      "react-native": "0.81.5",
      "react-native-safe-area-context": "~5.6.0",
      "react-native-screens": "~4.16.0",
      "react-native-reanimated": "~4.1.1",
      "react-native-worklets": "~0.5.1",
      "react-native-gesture-handler": "~2.28.0",
      nativewind: "^4.1.0",
      tailwindcss: "^3.4.0",
      "react-native-svg": "^15.8.0",
    },
    devDependencies: {
      "@types/react": "~19.1.0",
      typescript: "~5.9.2",
    },
  };
}
