import { rm, mkdir, copyFile, readFile, readdir } from "node:fs/promises";
import path from "node:path";

import tailwind from "bun-plugin-tailwind";

import { ACTOR_META, COMBAT_TYPES, COMBATANT_TYPES, ITEM_META } from "./src/config/documentMeta";

interface SystemManifest {
  version?: string;
  documentTypes?: {
    Actor?: Record<string, unknown>;
    Combat?: Record<string, unknown>;
    Combatant?: Record<string, unknown>;
    Item?: Record<string, unknown>;
  };
}

function compareTypes(scope: string, expected: string[], declared: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const expectedTypes = new Set(expected);
  for (const type of expected) {
    if (!(type in declared)) {
      problems.push(`missing ${scope}.${type}`);
    }
  }
  for (const type of Object.keys(declared)) {
    if (!expectedTypes.has(type)) {
      problems.push(`unknown ${scope}.${type}`);
    }
  }
  return problems;
}

/**
 * The registry is the source of truth for subtypes; the manifest must list exactly those keys or
 * Foundry rejects them at runtime. Fail the build instead.
 */
async function validateManifest(): Promise<void> {
  const pkg = JSON.parse(await readFile(path.join(process.cwd(), "package.json"), "utf-8")) as { version?: string };
  const manifest = JSON.parse(
    await readFile(path.join(process.cwd(), "public", "system.json"), "utf-8")
  ) as SystemManifest;
  if (pkg.version !== manifest.version) {
    console.error(`version mismatch: package.json ${pkg.version} vs system.json ${manifest.version}`);
    process.exit(1);
  }

  const declared = {
    Actor: manifest.documentTypes?.Actor ?? {},
    Combat: manifest.documentTypes?.Combat ?? {},
    Combatant: manifest.documentTypes?.Combatant ?? {},
    Item: manifest.documentTypes?.Item ?? {},
  };
  const problems = [
    ...compareTypes("Actor", Object.keys(ACTOR_META), declared.Actor),
    ...compareTypes("Item", Object.keys(ITEM_META), declared.Item),
    ...compareTypes("Combat", [...COMBAT_TYPES], declared.Combat),
    ...compareTypes("Combatant", [...COMBATANT_TYPES], declared.Combatant),
  ];

  if (problems.length > 0) {
    console.error(`system.json documentTypes mismatch:\n  ${problems.join("\n  ")}`);
    process.exit(1);
  }
}

await validateManifest();

const outdir = path.join(process.cwd(), "dist");
await rm(outdir, { force: true, recursive: true });
await mkdir(outdir, { recursive: true });

// Build JS entrypoint
const jsBuild = await Bun.build({
  entrypoints: ["src/robotech.ts"],
  minify: true,
  naming: "robotech.js",
  outdir,
  sourcemap: false,
  target: "browser",
});

if (!jsBuild.success) {
  console.error("JS Build failed:", jsBuild.logs);
  process.exit(1);
}

// Build CSS
const cssBuild = await Bun.build({
  entrypoints: ["src/styles/robotech.css"],
  minify: true,
  naming: "robotech.css",
  outdir,
  plugins: [tailwind],
});

if (!cssBuild.success) {
  console.error("CSS Build failed:", cssBuild.logs);
  process.exit(1);
}

// Copy public assets & manifest into dist
async function copyDir(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readdir(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

await copyDir(path.join(process.cwd(), "public"), outdir);

console.log("Robotech RPG system built successfully in dist/");
