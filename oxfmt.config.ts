import { defineConfig } from "oxfmt";
import ultracite from "ultracite/oxfmt";

export default defineConfig({
  ...ultracite,
  endOfLine: "lf",
  printWidth: 120,
  quoteStyle: "double",
  sortImports: true,
  sortPackageJson: true,
  sortTailwindcss: true,
});
