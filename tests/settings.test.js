const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../PopPiP Extension/Resources/core.js");

test("defaults are conservative", () => {
    const value = core.mergeSettings();
    assert.equal(value.enabled, true);
    assert.equal(value.viewportExit, false);
    assert.equal(value.enableAllSites, false);
    assert.equal(value.language, "en");
    assert.deepEqual(value.enabledSites, []);
});
test("supports English and Brazilian Portuguese language settings", () => {
    assert.equal(core.mergeSettings({ language: "pt-BR" }).language, "pt-BR");
    assert.equal(core.mergeSettings({ language: "unsupported" }).language, "en");
});
test("invalid storage value falls back safely", () => assert.deepEqual(core.mergeSettings("broken"), core.mergeSettings()));
test("site must be explicitly enabled", () => {
    assert.equal(core.isSiteEnabled("example.com", {}), false);
    assert.equal(core.isSiteEnabled("example.com", { enabledSites: ["example.com"] }), true);
});
test("a whitelist hostname includes subdomains", () => {
    assert.equal(core.isSiteEnabled("video.example.com", { enabledSites: ["example.com"] }), true);
});
test("disabled list wins over whitelist and all-sites mode", () => {
    const value = { enableAllSites: true, enabledSites: ["example.com"], disabledSites: ["private.example.com"] };
    assert.equal(core.isSiteEnabled("private.example.com", value), false);
    assert.equal(core.isSiteEnabled("public.example.com", value), true);
});
test("global disable wins", () => assert.equal(core.isSiteEnabled("example.com", { enabled: false, enableAllSites: true }), false));
