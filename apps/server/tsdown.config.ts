import { defineConfig } from "tsdown";

export default defineConfig({
  entry: "./src/index.ts",
  format: "esm",
  outDir: "./dist",
  clean: true,
  deps: {
    // Rolldown breaks its CommonJS initialization when the output runs in Bun.
    neverBundle: true,
    alwaysBundle: [/@weer.itsmichal.dev\/.*/],
  },
});
