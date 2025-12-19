import { describe, it } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

describe("User Service", () => {
  it("should have src directory", () => {
    const srcPath = path.join(rootDir, "src");
    assert.ok(fs.existsSync(srcPath), "src directory should exist");
  });

  it("should have app.js file", () => {
    const appPath = path.join(rootDir, "src", "app.js");
    assert.ok(fs.existsSync(appPath), "src/app.js should exist");
  });

  it("should have routes directory", () => {
    const routesPath = path.join(rootDir, "src", "routes");
    assert.ok(fs.existsSync(routesPath), "src/routes directory should exist");
  });

  it("should have user routes", () => {
    const userRoutesPath = path.join(rootDir, "src", "routes", "users");
    assert.ok(fs.existsSync(userRoutesPath), "src/routes/users directory should exist");
  });

  it("should have plugins directory", () => {
    const pluginsPath = path.join(rootDir, "src", "plugins");
    assert.ok(fs.existsSync(pluginsPath), "src/plugins directory should exist");
  });

  it("should have valid package.json", () => {
    const pkgPath = path.join(rootDir, "package.json");
    assert.ok(fs.existsSync(pkgPath), "package.json should exist");
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    assert.ok(pkg.scripts.start, "package.json should have start script");
    assert.ok(pkg.scripts.test, "package.json should have test script");
    assert.strictEqual(pkg.type, "module", "package.json should be type module");
  });
});
