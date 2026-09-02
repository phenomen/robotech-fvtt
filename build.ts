import { rm, mkdir, copyFile, readdir } from "node:fs/promises";
import path from "node:path";

import tailwind from "bun-plugin-tailwind";

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
