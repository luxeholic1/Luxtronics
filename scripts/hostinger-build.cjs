const { cpSync, existsSync, mkdirSync, rmSync } = require("fs");
const { join, resolve } = require("path");

const root = resolve(".");
const distDir = join(root, "dist");
const buildDir = join(root, "build");

if (!existsSync(join(distDir, "index.html"))) {
  console.error("dist/index.html not found.");
  console.error("Run npm run build:source locally and commit dist/ before deploying through Hostinger Git.");
  process.exit(1);
}

rmSync(buildDir, { recursive: true, force: true });
mkdirSync(buildDir, { recursive: true });
cpSync(distDir, buildDir, { recursive: true });

console.log("Hostinger build complete: copied committed dist/ to build/.");
