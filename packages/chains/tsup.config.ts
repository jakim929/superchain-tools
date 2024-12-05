import { defineConfig } from "tsup";

export default defineConfig({
  name: "@superchain-tools/chains",
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  splitting: false,
  sourcemap: true,
  clean: true,
});
