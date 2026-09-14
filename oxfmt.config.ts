import { defineConfig } from "oxfmt";

export default defineConfig({
  ignorePatterns: ["dist", "foundry"],
  printWidth: 120,
  proseWrap: "never",
  sortImports: true,
  // `cn()` is the class-merge helper, so its arguments hold Tailwind classes too.
  sortTailwindcss: { functions: ["cn"] },
  trailingComma: "es5",
});
