const { describe, it } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

describe("Game Service", () => {
  it("should have server.js file", () => {
    const serverPath = path.join(__dirname, "server.js");
    assert.ok(fs.existsSync(serverPath), "server.js should exist");
  });

  it("should have public directory", () => {
    const publicPath = path.join(__dirname, "public");
    assert.ok(fs.existsSync(publicPath), "public directory should exist");
  });

  it("should have game files in public directory", () => {
    const indexPath = path.join(__dirname, "public", "index.html");
    const gamePath = path.join(__dirname, "public", "game.js");
    
    assert.ok(fs.existsSync(indexPath), "public/index.html should exist");
    assert.ok(fs.existsSync(gamePath), "public/game.js should exist");
  });

  it("should have valid package.json", () => {
    const pkgPath = path.join(__dirname, "package.json");
    assert.ok(fs.existsSync(pkgPath), "package.json should exist");
    
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    assert.ok(pkg.scripts.start, "package.json should have start script");
    assert.ok(pkg.scripts.test, "package.json should have test script");
    assert.ok(pkg.dependencies.express, "package.json should have express dependency");
  });
});
