const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "..", "node_modules", "tinymce");
const dest = path.join(__dirname, "..", "public", "tinymce");

function copyDir(from, to) {
  fs.mkdirSync(to, { recursive: true });
  for (const entry of fs.readdirSync(from, { withFileTypes: true })) {
    if (entry.name === "tinymce.d.ts" || entry.name === "CHANGELOG.md") continue;
    const s = path.join(from, entry.name);
    const d = path.join(to, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else fs.copyFileSync(s, d);
  }
}

if (!fs.existsSync(src)) {
  console.warn("[copy-tinymce] tinymce not installed, skip");
  process.exit(0);
}

fs.rmSync(dest, { recursive: true, force: true });
copyDir(src, dest);
console.log("[copy-tinymce] synced to public/tinymce");
