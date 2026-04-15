import { defineConfig } from "tsup"

export default defineConfig({
  entry: ["index.ts"],
  format: ["cjs", "esm"],
  dts: true,
  target: "es2020",
  bundle: true,
  clean: true,
})
