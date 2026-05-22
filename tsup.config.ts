import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  format: ["cjs"],
  target: "node18",
  outDir: "dist",
  clean: true,
  dts: false,
  splitting: false,
  sourcemap: true,
});
