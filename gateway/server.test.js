const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

describe("Gateway Service", () => {
  it("should have server.js file", () => {
    const serverPath = path.join(__dirname, "server.js");
    assert.ok(fs.existsSync(serverPath), "server.js should exist");
  });

  it("should have routes directory", () => {
    const routesPath = path.join(__dirname, "routes");
    assert.ok(fs.existsSync(routesPath), "routes directory should exist");
  });

  it("should have game routes module", () => {
    const gamePath = path.join(__dirname, "routes", "game.js");
    assert.ok(fs.existsSync(gamePath), "routes/game.js should exist");
  });

  it("should have valid package.json", () => {
    const pkgPath = path.join(__dirname, "package.json");
    assert.ok(fs.existsSync(pkgPath), "package.json should exist");
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    assert.ok(pkg.scripts.start, "package.json should have start script");
    assert.ok(pkg.scripts.test, "package.json should have test script");
  });
});
