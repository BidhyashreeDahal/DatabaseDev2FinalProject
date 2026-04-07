import fs from "node:fs";
import path from "node:path";

const apiRoot = path.resolve(process.cwd(), "src", "app", "api");

const PUBLIC_METHODS = new Set([
  "/api/auth/login#POST",
  "/api/auth/logout#POST",
]);

const AUTH_ONLY_METHODS = new Set([
  "/api/auth/me#GET",
]);

const TODO_STUB_METHODS = new Set([
  "/api/acquisitions/[id]#GET",
  "/api/sales/[id]#GET",
  "/api/sources/[id]#GET",
  "/api/sources/[id]#PATCH",
  "/api/sources/[id]#DELETE",
  "/api/users/[id]#GET",
  "/api/users/[id]#PATCH",
  "/api/users/[id]#DELETE",
]);

const METHOD_REGEX = /export\s+async\s+function\s+(GET|POST|PUT|PATCH|DELETE)\s*\(/g;

function listRouteFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listRouteFiles(fullPath));
      continue;
    }
    if (entry.isFile() && entry.name === "route.js") {
      files.push(fullPath);
    }
  }

  return files;
}

function toApiRoute(filePath) {
  const rel = path.relative(apiRoot, filePath).replace(/\\/g, "/");
  const routePart = rel.replace(/\/route\.js$/, "");
  return `/api/${routePart}`;
}

function getMethods(content) {
  const methods = new Set();
  let match;

  while ((match = METHOD_REGEX.exec(content)) !== null) {
    methods.add(match[1]);
  }

  return [...methods];
}

function main() {
  if (!fs.existsSync(apiRoot)) {
    console.error("API root not found:", apiRoot);
    process.exit(1);
  }

  const files = listRouteFiles(apiRoot);
  const errors = [];
  const warnings = [];

  for (const file of files) {
    const route = toApiRoute(file);
    const content = fs.readFileSync(file, "utf8");
    const methods = getMethods(content);

    for (const method of methods) {
      const key = `${route}#${method}`;

      if (PUBLIC_METHODS.has(key)) {
        continue;
      }

      if (TODO_STUB_METHODS.has(key)) {
        warnings.push(`TODO stub skipped: ${key}`);
        continue;
      }

      if (!content.includes("getSessionUser(")) {
        errors.push(`Missing getSessionUser check for ${key}`);
        continue;
      }

      if (!AUTH_ONLY_METHODS.has(key) && !content.includes("hasPermission(")) {
        errors.push(`Missing hasPermission check for ${key}`);
      }
    }
  }

  if (warnings.length > 0) {
    console.log("Guard check warnings:");
    for (const warning of warnings) {
      console.log(`  - ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.error("Guard check failures:");
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log("Guard checks passed: protected route methods include auth and RBAC checks (excluding TODO stubs).");
}

main();
