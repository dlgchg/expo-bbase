import type { TemplateFile } from "../types";

/**
 * Generate base template files that are included in every project.
 * These form the core Expo Router + NativeWind project structure.
 */
export function generateBaseTemplates(projectName: string): TemplateFile[] {
  return [
    // ─── app/_layout.tsx ────────────────────────────────────────────────
    {
      path: "app/_layout.tsx",
      content: `import "../global.css";
import { DarkTheme, DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { useColorScheme } from "react-native";

import { Colors } from "@/constants/Colors";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
    </ThemeProvider>
  );
}
`,
    },

    // ─── app/(tabs)/_layout.tsx ─────────────────────────────────────────
    {
      path: "app/(tabs)/_layout.tsx",
      content: `import { Tabs } from "expo-router";
import { Platform } from "react-native";

import { Colors } from "@/constants/Colors";
import { useColorScheme } from "@/hooks/useColorScheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerStyle: {
          backgroundColor: Colors[colorScheme ?? "light"].background,
        },
        headerShadowVisible: false,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
          },
          default: {},
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "Explore",
          tabBarIcon: () => null,
        }}
      />
    </Tabs>
  );
}
`,
    },

    // ─── app/(tabs)/index.tsx ───────────────────────────────────────────
    {
      path: "app/(tabs)/index.tsx",
      content: `import { Image, StyleSheet, Platform } from "react-native";
import { HelloWave } from "@/components/HelloWave";
import { ThemedText } from "@/components/Themed";
import { ThemedView } from "@/components/Themed";
import { Link } from "expo-router";

export default function HomeScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">${projectName}</ThemedText>
        <HelloWave />
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{" "}
          <ThemedText type="defaultSemiBold">
            {Platform.select({ ios: "cmd + d", android: "cmd + m" })}
          </ThemedText>{" "}
          to open developer tools.
        </ThemedText>
      </ThemedView>
      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Step 2: Explore</ThemedText>
        <ThemedText>
          Tap the Explore tab to learn more about what's included in this starter.
        </ThemedText>
        <Link href="/explore">
          <ThemedText type="link">Go to Explore →</ThemedText>
        </Link>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
});
`,
    },

    // ─── app/(tabs)/explore.tsx ─────────────────────────────────────────
    {
      path: "app/(tabs)/explore.tsx",
      content: `import { StyleSheet, Image, Platform } from "react-native";
import { ThemedText } from "@/components/Themed";
import { ThemedView } from "@/components/Themed";

export default function ExploreScreen() {
  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title">Explore</ThemedText>
      <ThemedText style={styles.subtitle}>
        This screen shows what you can do with this scaffolded project.
      </ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginTop: 8,
  },
});
`,
    },

    // ─── app/+not-found.tsx ─────────────────────────────────────────────
    {
      path: "app/+not-found.tsx",
      content: `import { Link, Stack } from "expo-router";
import { StyleSheet } from "react-native";
import { ThemedText } from "@/components/Themed";
import { ThemedView } from "@/components/Themed";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
      <ThemedView style={styles.container}>
        <ThemedText type="title">This screen doesn't exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link">Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
`,
    },

    // ─── src/components/Themed.tsx ───────────────────────────────────────
    {
      path: "components/Themed.tsx",
      content: `import { Text, type TextProps, View, type ViewProps } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { Colors } from "@/constants/Colors";

/** Themed text component that adapts to light/dark mode */
export function ThemedText({
  style,
  type = "default",
  ...rest
}: TextProps & { type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link" }) {
  const colorScheme = useColorScheme();
  const color = Colors[colorScheme ?? "light"].text;

  return (
    <Text
      style={[
        { color },
        type === "default" ? { fontSize: 16, lineHeight: 24 } : undefined,
        type === "title" ? { fontSize: 28, fontWeight: "bold", lineHeight: 32 } : undefined,
        type === "defaultSemiBold" ? { fontSize: 16, lineHeight: 24, fontWeight: "600" } : undefined,
        type === "subtitle" ? { fontSize: 20, fontWeight: "bold" } : undefined,
        type === "link" ? { fontSize: 16, lineHeight: 24, color: Colors[colorScheme ?? "light"].tint } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

/** Themed view component that adapts to light/dark mode */
export function ThemedView({ style, ...rest }: ViewProps) {
  const colorScheme = useColorScheme();
  const backgroundColor = Colors[colorScheme ?? "light"].background;

  return <View style={[{ backgroundColor }, style]} {...rest} />;
}
`,
    },

    // ─── src/components/HelloWave.tsx ────────────────────────────────────
    {
      path: "components/HelloWave.tsx",
      content: `import { useEffect } from "react";
import { Animated, Easing } from "react-native";
import { ThemedText } from "./Themed";

export function HelloWave() {
  const rotationAnim = new Animated.Value(0);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(rotationAnim, {
          toValue: 1,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(rotationAnim, {
          toValue: 0,
          duration: 150,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [rotationAnim]);

  return (
    <Animated.View
      style={{
        transform: [
          {
            rotate: rotationAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["0deg", "14deg"],
            }),
          },
        ],
      }}
    >
      <ThemedText style={{ fontSize: 28 }}>👋</ThemedText>
    </Animated.View>
  );
}
`,
    },

    // ─── src/hooks/useColorScheme.ts ─────────────────────────────────────
    {
      path: "hooks/useColorScheme.ts",
      content: `import { useColorScheme as useRNColorScheme } from "react-native";

/**
 * Returns the current color scheme (light or dark).
 * Defaults to "light" if the system preference is not available.
 */
export function useColorScheme(): "light" | "dark" {
  return useRNColorScheme() ?? "light";
}
`,
    },

    // ─── src/constants/Colors.ts ─────────────────────────────────────────
    {
      path: "constants/Colors.ts",
      content: `/**
 * Color tokens for light and dark themes.
 * Used by Themed components and navigation theming.
 */
export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: "#0a7ea4",
    tabIconDefault: "#687076",
    tabIconSelected: "#0a7ea4",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: "#fff",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: "#fff",
  },
};
`,
    },

    // ─── src/types/index.ts ─────────────────────────────────────────────
    {
      path: "types/index.ts",
      content: `/** Global type definitions */

/** Extend this to declare module-specific types */
declare global {
  // Add global type augmentations here
}

export {};
`,
    },

    // ─── app.json ────────────────────────────────────────────────────────
    {
      path: "app.json",
      content: `{
  "expo": {
    "name": "${projectName}",
    "slug": "${projectName}",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "light",
    "splash": {
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.${projectName}.app"
    },
    "android": {
      "package": "com.${projectName}.app"
    },
    "plugins": [
      "expo-router",
      "expo-splash-screen"
    ]
  }
}
`,
    },

    // ─── tsconfig.json ───────────────────────────────────────────────────
    {
      path: "tsconfig.json",
      content: `{
  "compilerOptions": {
    "target": "ESNext",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "lib": ["ESNext"],
    "strict": true,
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["**/*.ts", "**/*.tsx", ".expo/types/**/*.ts", "expo-env.d.ts"],
  "exclude": ["node_modules"]
}
`,
    },

    // ─── tailwind.config.js ──────────────────────────────────────────────
    {
      path: "tailwind.config.js",
      content: `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
    },
  },
  plugins: [],
};
`,
    },

    // ─── metro.config.js ─────────────────────────────────────────────────
    {
      path: "metro.config.js",
      content: `const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, { input: "./global.css" });
`,
    },

    // ─── babel.config.js ─────────────────────────────────────────────────
    {
      path: "babel.config.js",
      content: `module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind", reanimated: false, worklets: false }],
      "nativewind/babel",
    ],
    plugins: [],
  };
};
`,
    },

    // ─── global.css (NativeWind CSS variables for rnr components) ─────────
    {
      path: "global.css",
      content: `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 5.9% 10%;
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
`,
    },

    // ─── .gitignore ─────────────────────────────────────────────────────
    {
      path: ".gitignore",
      content: `# Learn more https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files

# dependencies
node_modules/

# Expo
.expo/
dist/
web-build/

# Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# Metro
.metro-health-check*

# debug
npm-debug.*
yarn-debug.*
yarn-error.*

# macOS
.DS_Store
*.pem

# local env files
.env*.local

# typescript
*.tsbuildinfo

# generated files
expo-env.d.ts
`,
    },
  ];
}
