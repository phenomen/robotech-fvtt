import { defineConfig } from "oxlint";

export default defineConfig({
  categories: {
    correctness: "error",
    pedantic: "error",
    perf: "error",
    restriction: "error",
    style: "error",
    suspicious: "error",
  },
  env: { browser: true },
  ignorePatterns: ["dist", "foundry"],
  options: {
    // Suppressions must keep earning their place; this deletes them when they stop.
    reportUnusedDisableDirectives: "error",
    typeAware: true,
    typeCheck: true,
  },
  // A directory glob only matches when it starts with `**/`. `"src/types/**"` silently
  // matches nothing; `"**/src/types/**"` works. Bare filenames like `"build.ts"` are fine.
  overrides: [
    {
      files: ["*.config.ts"],
      rules: { "import/no-default-export": "off" },
    },
    {
      // A Bun build script, not browser code, and its console output is the point.
      files: ["build.ts"],
      rules: {
        "import/no-nodejs-modules": "off",
        "no-console": "off",
        "unicorn/max-nested-calls": "off",
        "unicorn/no-process-exit": "off",
      },
    },
    {
      // These files describe Foundry's and vendors' API surface, not ours.
      files: ["**/src/types/**", "**/*.d.ts"],
      rules: {
        "max-classes-per-file": "off",
        "typescript/method-signature-style": "off",
      },
    },
    {
      files: ["**/src/components/ui/**"],
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
        // `ui/` is the one layer allowed to style, so it passes `className` down.
        "react/forbid-component-props": "off",
      },
    },
  ],
  // `unicorn`, `typescript`, and `oxc` are on by default but naming any plugin
  // replaces the default set, so they have to be repeated. Core rules are always
  plugins: ["import", "jsx-a11y", "oxc", "promise", "react", "typescript", "unicorn"],
  rules: {
    // Rewrites comments that are already written.
    "capitalized-comments": "off",
    // Foundry document and sheet subclasses override instance methods that never
    // touch `this`.
    "class-methods-use-this": "off",
    complexity: "off",
    "func-style": ["error", "declaration", { allowArrowFunctions: true }],
    "id-length": "off",
    // The project is named-exports-only and uses barrels as folder modules, so the
    // default-export and export-placement rules all invert.
    "import/exports-last": "off",
    "import/group-exports": "off",
    "import/max-dependencies": "off",
    "import/no-named-export": "off",
    "import/prefer-default-export": "off",
    "import/unambiguous": "off",
    "init-declarations": "off",
    // Sheet components and game-rule functions outgrow any line or statement budget
    // worth enforcing mechanically.
    "max-lines": "off",
    "max-lines-per-function": "off",
    "max-params": "off",
    "max-statements": "off",
    // Foundry's namespaced constructors are not all PascalCase.
    "new-cap": "off",
    "no-await-in-loop": "off",
    // Diagnostics stay, stray debugging does not.
    "no-console": ["error", { allow: ["error", "warn"] }],
    "no-continue": "off",
    "no-duplicate-imports": ["error", { allowSeparateTypeImports: true }],
    // `!!value` is the shorter form and is used throughout. The fixer's `Boolean(x)`
    // also drops TypeScript's narrowing.
    "no-implicit-coercion": "off",
    // Dice counts, thresholds, and step values are the domain.
    "no-magic-numbers": "off",
    "no-ternary": "off",
    // Foundry treats `undefined` as "leave this field alone" in update payloads.
    "no-undefined": "off",
    // Foundry's own API is `_preUpdate`, `_renderHTML`, `_onClose`.
    "no-underscore-dangle": "off",
    // Hoisted declarations are fine; a real temporal-dead-zone read is not.
    "no-use-before-define": ["error", { classes: false, functions: false, variables: false }],
    // `void actor.update(...)` is the documented fire-and-forget form, and it appears
    // in expression position inside JSX handlers.
    "no-void": "off",
    // One declaration per statement. The category default is "always", whose fixer
    // chains declarators with commas and then makes `sort-vars` demand they be
    // alphabetised.
    "one-var": ["error", "never"],
    // Rules that ban language features the codebase is built on.
    "oxc/no-async-await": "off",
    // Barrel files are the folder-as-module structure described in AGENTS.md.
    "oxc/no-barrel-file": "off",
    "oxc/no-optional-chaining": "off",
    "oxc/no-rest-spread-properties": "off",
    "prefer-destructuring": "off",
    "react/function-component-definition": [
      "error",
      { namedComponents: "function-declaration", unnamedComponents: "arrow-function" },
    ],
    "react/jsx-boolean-value": "off",
    "react/jsx-filename-extension": "off",
    "react/jsx-max-depth": "off",
    // Only ever flags the separators around localized text (`:`, `/`, `{" "}`), never
    // untranslated copy.
    "react/jsx-no-literals": "off",
    "react/jsx-props-no-spreading": "off",
    // Fixed-slot arrays (drama lines, stress boxes, effect changes) carry no id of
    // their own: the index is the identity. Document lists still key by `item.id`.
    "react/no-array-index-key": "off",
    "react/no-multi-comp": "off",
    // A Fast Refresh rule; Foundry reloads the world instead.
    "react/only-export-components": "off",
    // Data models are classes by design; the rule reads them as components.
    "react/prefer-function-component": "off",
    // The react-jsx transform makes the React import unnecessary.
    "react/react-in-jsx-scope": "off",
    "require-await": "off",
    // oxfmt owns import order.
    "sort-imports": "off",
    "typescript/explicit-function-return-type": "off",
    "typescript/explicit-member-accessibility": "off",
    // `defineSchema` returns an inferred field tree that cannot be spelled out.
    "typescript/explicit-module-boundary-types": "off",
    // Data models declare schema fields as bare class properties.
    "typescript/no-extraneous-class": "off",
    // Foundry hooks are typed `Promise<boolean | void>`.
    "typescript/no-invalid-void-type": "off",
    // The Foundry client types are loose at the boundary; narrowing happens in
    // `@/utils/documents` and `@/models/documents`.
    "typescript/no-unsafe-argument": "off",
    "typescript/no-unsafe-assignment": "off",
    "typescript/no-unsafe-member-access": "off",
    "typescript/no-unsafe-type-assertion": "off",
    "typescript/parameter-properties": "off",
    "typescript/prefer-readonly-parameter-types": "off",
    // Foundry override signatures are async whether or not the body awaits.
    "typescript/require-await": "off",
    // Keep the awaited frame in stack traces.
    "typescript/return-await": ["error", "always"],
    // Foundry values are often `0` or `""` where falsy is the intended check.
    "typescript/strict-boolean-expressions": "off",
    "unicorn/explicit-length-check": "off",
    // Files are named after their primary export, so both cases are legal; this still
    // catches kebab-case and snake_case.
    "unicorn/filename-case": ["error", { cases: { camelCase: true, pascalCase: true } }],
    "unicorn/no-array-callback-reference": "off",
    // Foundry stores and returns `null`, not `undefined`.
    "unicorn/no-null": "off",
    // https://github.com/oxc-project/oxc/issues/21949
    "unicorn/number-literal-case": "off",
    "unicorn/prefer-ternary": "off",
    "unicorn/text-encoding-identifier-case": ["error", { withDash: true }],
  },
});
