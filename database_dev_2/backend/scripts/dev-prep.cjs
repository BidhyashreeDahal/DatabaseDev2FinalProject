const fs = require("node:fs");
const path = require("node:path");

const nextDir = path.join(process.cwd(), ".next");
const requiredDirs = [
  path.join(nextDir, "dev"),
  path.join(nextDir, "dev", "server"),
  path.join(nextDir, "dev", "cache"),
];

try {
  fs.rmSync(nextDir, { recursive: true, force: true });
} catch (error) {
  console.warn("[dev-prep] Failed to clear .next directory:", error?.message || error);
}

for (const dir of requiredDirs) {
  fs.mkdirSync(dir, { recursive: true });
}

console.log("[dev-prep] .next directory reset complete.");
