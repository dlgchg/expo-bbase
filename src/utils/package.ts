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
 *
 * ALL module dependencies are included by default — module selection only
 * controls which code/template files are generated, not which packages are
 * installed. This avoids version-mismatch issues and ensures every project
 * is ready to use any module without extra installs.
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
      "reset-project": "node ./scripts/reset-project.js",
      android: "expo start --android",
      ios: "expo start --ios",
      web: "expo start --web",
      lint: "expo lint",
    },
    dependencies: {
      // ─── Expo core (aligned with create-expo-app SDK 54) ───────────
      expo: "~54.0.33",
      "expo-router": "~6.0.23",
      "expo-linking": "~8.0.12",
      "expo-constants": "~18.0.13",
      "expo-status-bar": "~3.0.9",
      "expo-splash-screen": "~31.0.13",
      "expo-font": "~14.0.11",
      "expo-haptics": "~15.0.8",
      "expo-image": "~3.0.11",
      "expo-symbols": "~1.0.8",
      "expo-system-ui": "~6.0.9",
      "expo-web-browser": "~15.0.10",

      // ─── React & React Native ─────────────────────────────────────
      react: "19.1.0",
      "react-dom": "19.1.0",
      "react-native": "0.81.5",
      "react-native-web": "~0.21.0",
      "@expo/vector-icons": "^15.0.3",
      "@react-navigation/bottom-tabs": "^7.4.0",
      "@react-navigation/elements": "^2.6.3",
      "@react-navigation/native": "^7.1.8",
      "react-native-safe-area-context": "~5.6.0",
      "react-native-screens": "~4.16.0",

      // ─── Animation (default in all projects) ──────────────────────
      "react-native-reanimated": "~4.1.1",
      "react-native-worklets": "~0.5.1",
      "react-native-gesture-handler": "~2.28.0",

      // ─── Styling ──────────────────────────────────────────────────
      nativewind: "^4.1.0",
      tailwindcss: "^3.4.0",
      "tailwindcss-animate": "^1.0.7",
      "react-native-svg": "15.12.1",

      // ─── Network ─────────────────────────────────────────────────
      "@tanstack/react-query": "^5.60.0",

      // ─── State ───────────────────────────────────────────────────
      zustand: "^5.0.0",

      // ─── Storage ─────────────────────────────────────────────────
      "react-native-mmkv": "^3.1.0",

      // ─── Payment ─────────────────────────────────────────────────
      "react-native-iap": "^12.15.0",

      // ─── Form ────────────────────────────────────────────────────
      "react-hook-form": "^7.54.0",
      "@hookform/resolvers": "^3.9.0",
      zod: "^3.24.0",

      // ─── Video ───────────────────────────────────────────────────
      "expo-av": "~16.0.8",

      // ─── Auth — Google ───────────────────────────────────────────
      "@react-native-google-signin/google-signin": "^13.1.0",

      // ─── Auth — Facebook ─────────────────────────────────────────
      "expo-auth-session": "~7.0.11",
      "expo-crypto": "~15.0.9",

      // ─── Auth — Apple ────────────────────────────────────────────
      "expo-apple-authentication": "~8.0.8",

      // ─── WebView ─────────────────────────────────────────────────
      "react-native-webview": "~13.15.0",

      // ─── i18n ────────────────────────────────────────────────────
      i18next: "^24.2.0",
      "react-i18next": "^15.2.0",
      "expo-localization": "~17.0.8",

      // ─── OTA ─────────────────────────────────────────────────────
      "expo-updates": "~29.0.17",

      // ─── Notifications ───────────────────────────────────────────
      "expo-notifications": "~0.32.17",

      // ─── Permissions ─────────────────────────────────────────────
      "expo-image-picker": "~17.0.11",
      "expo-camera": "~17.0.10",
      "expo-location": "~19.0.8",

      // ─── Bottom Sheet ────────────────────────────────────────────
      "@gorhom/bottom-sheet": "^5.1.0",

      // ─── FlashList ───────────────────────────────────────────────
      "@shopify/flash-list": "2.0.2",

      // ─── UI — reactnative.reusables ──────────────────────────────
      "class-variance-authority": "^0.7.1",
      clsx: "^2.1.1",
      "tailwind-merge": "^2.6.0",
      "@rn-primitives/slot": "^1.1.0",
      "@rn-primitives/types": "^1.1.0",
      "@rn-primitives/label": "^1.1.0",
      "@rn-primitives/separator": "^1.1.0",
      "@rn-primitives/alert-dialog": "^1.1.0",
      "@rn-primitives/portal": "^1.1.0",
    },
    devDependencies: {
      "@types/react": "~19.1.0",
      typescript: "~5.9.2",
      eslint: "^9.25.0",
      "eslint-config-expo": "~10.0.0",
    },
  };
}
