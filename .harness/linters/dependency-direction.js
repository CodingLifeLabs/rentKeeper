#!/usr/bin/env node

/**
 * Layer dependency direction linter.
 *
 * Allowed import direction (top → bottom only):
 *   types → config → repo → service → runtime → ui
 *
 * A file in a higher layer (e.g. repo) must NOT import from a lower layer
 * (e.g. service, runtime, ui).
 */

const fs = require("fs");
const path = require("path");

const LAYERS = ["types", "config", "repo", "service", "runtime", "ui"];
const SRC = path.resolve(process.argv[2] || "src");

const violations = [];

function getLayer(filePath) {
  const rel = path.relative(SRC, filePath);
  for (const layer of LAYERS) {
    if (rel.startsWith(layer + path.sep) || rel.startsWith(layer + "/")) {
      return layer;
    }
  }
  return null;
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (/\.(ts|tsx)$/.test(entry.name)) {
      checkFile(full);
    }
  }
}

function checkFile(filePath) {
  const fileLayer = getLayer(filePath);
  if (!fileLayer) return;

  const fileIndex = LAYERS.indexOf(fileLayer);
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(?:import\s+.*?from\s+|require\s*\(\s*)['"](@?\.\/|@\/)(.*?)['"]/);
    if (!match) continue;

    const importPath = match[2];
    for (let j = fileIndex + 1; j < LAYERS.length; j++) {
      const forbidden = LAYERS[j];
      if (
        importPath.startsWith(forbidden + "/") ||
        importPath.startsWith(forbidden)
      ) {
        const rel = path.relative(SRC, filePath);
        violations.push({
          file: rel,
          line: i + 1,
          importLayer: forbidden,
          fileLayer,
          message: `${rel}:${i + 1}: "${fileLayer}" imports from "${forbidden}" (reverse dependency)`,
        });
      }
    }
  }
}

if (!fs.existsSync(SRC)) {
  console.error(`Source directory not found: ${SRC}`);
  process.exit(1);
}

walk(SRC);

if (violations.length > 0) {
  console.error("❌ 레이어 의존성 검사 실패 (" + violations.length + "건 위반)\n");
  for (const v of violations) {
    console.error(`  ${v.message}`);
    console.error(`    FIX: Move shared logic to "${v.fileLayer}" or a higher layer (types/config).`);
    console.error(`         "${v.fileLayer}" must not depend on "${v.importLayer}".\n`);
  }
  process.exit(1);
} else {
  console.log("✅ 레이어 의존성 검사 통과 (위반: 0건)");
}
