import { defineConfig } from "oxlint";
import core from "ultracite/oxlint/core";
import { jsPluginSettings, selectJsPlugins } from "ultracite/oxlint/js-plugins";
import react from "ultracite/oxlint/react";

const jsPlugins = selectJsPlugins(["react-doctor"]);

const ignorePatterns = [...(core.ignorePatterns ?? []), "foundry/**"];

export default defineConfig({
  extends: [core, react, jsPlugins],
  ignorePatterns,
  jsPlugins: jsPlugins.jsPlugins,
  options: {
    typeAware: true,
    typeCheck: true,
  },
  overrides: [
    {
      files: ["src/components/ui/**"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            paths: [
              {
                message: "Import the specific module (e.g. `@/utils/cn`) instead of the utils barrel.",
                name: "@/utils",
              },
            ],
          },
        ],
      },
    },
    {
      files: ["src/types/**", "**/*.d.ts"],
      rules: {
        "max-classes-per-file": "off",
        "typescript/method-signature-style": "off",
        "typescript/no-extraneous-class": "off",
        "typescript/no-unsafe-argument": "off",
        "typescript/no-unsafe-assignment": "off",
        "typescript/no-unsafe-call": "off",
        "typescript/no-unsafe-member-access": "off",
        "typescript/no-unsafe-return": "off",
        "typescript/no-unsafe-type-assertion": "off",
      },
    },
  ],
  rules: {
    "class-methods-use-this": "off",
    complexity: "off",
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "max-classes-per-file": "off",
    "no-await-in-loop": "off",
    "no-use-before-define": "off",
    "no-void": "off",
    "oxc/no-barrel-file": "off",
    "prefer-destructuring": "off",
    "react-doctor/async-await-in-loop": "off",
    "react-doctor/no-flush-sync": "off",
    "react-doctor/react-compiler-no-manual-memoization": "off",
    "react-doctor/server-sequential-independent-await": "off",
    "react/function-component-definition": [
      "error",
      { namedComponents: "function-declaration", unnamedComponents: "arrow-function" },
    ],
    "react/prefer-function-component": "off",
    "require-await": "off",
    "typescript/no-extraneous-class": "off",
    "typescript/no-invalid-void-type": "off",
    "typescript/no-unsafe-argument": "off",
    "typescript/no-unsafe-assignment": "off",
    "typescript/no-unsafe-call": "off",
    "typescript/no-unsafe-member-access": "off",
    "typescript/no-unsafe-return": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/parameter-properties": "off",
    "typescript/strict-boolean-expressions": "off",
    "unicorn/filename-case": "off",
    "unicorn/prefer-ternary": "off",
  },
  settings: jsPluginSettings,
});
