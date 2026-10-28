import { copyFile, mkdir, readdir, rm } from "node:fs/promises";
import path from "node:path";

import tailwind from "bun-plugin-tailwind";

import { ACTOR_META, COMBAT_TYPES, COMBATANT_TYPES, ITEM_META } from "./src/config/documentMeta";

// The manifest's documentTypes must declare exactly the subtypes the system registers data models for.
const manifest = (await Bun.file("public/system.json").json()) as {
    documentTypes: Record<string, Record<string, unknown>>;
  },
  expectedTypes: Record<string, readonly string[]> = {
    Actor: Object.keys(ACTOR_META),
    Combat: COMBAT_TYPES,
    Combatant: COMBATANT_TYPES,
    Item: Object.keys(ITEM_META),
  },
  typeErrors = Object.entries(expectedTypes).flatMap(([documentName, expected]) => {
    const declared = Object.keys(manifest.documentTypes[documentName] ?? {}).toSorted(),
      wanted = [...expected].toSorted();
    return declared.join(",") === wanted.join(",")
      ? []
      : [`${documentName}: system.json has [${declared.join(", ")}], config has [${wanted.join(", ")}]`];
  });

if (typeErrors.length > 0) {
  console.error("system.json documentTypes do not match src/config/documentMeta.ts:", typeErrors);
  process.exit(1);
}

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
    const srcPath = path.join(src, entry.name),
      destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

await copyDir(path.join(process.cwd(), "public"), outdir);

console.log("Robotech RPG system built successfully in dist/");
