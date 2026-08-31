const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../PopPiP Extension/Resources/core.js");

const video = { id: "video-1" };

test("PiP lifecycle transitions stay consistent across app and tab events", () => {
    let state = { automatic: false, reason: null, video: null };

    state = core.applyPiPTransition(state, { type: "enter", reason: "app", video });
    assert.deepEqual(state, { automatic: true, reason: "app", video });

    state = core.applyPiPTransition(state, { type: "leave", reason: "app" });
    assert.deepEqual(state, { automatic: false, reason: null, video: null });

    state = core.applyPiPTransition(state, { type: "enter", reason: "tab", video });
    assert.equal(state.automatic, true);
    assert.equal(state.reason, "tab");

    state = core.applyPiPTransition(state, { type: "leave", reason: "tab" });
    assert.deepEqual(state, { automatic: false, reason: null, video: null });
});

test("manual close resets automatic ownership and allows quick re-entry", () => {
    let state = { automatic: true, reason: "app", video };

    state = core.applyPiPTransition(state, { type: "manual-close" });
    assert.deepEqual(state, { automatic: false, reason: null, video: null });

    state = core.applyPiPTransition(state, { type: "enter", reason: "tab", video: { id: "video-2" } });
    assert.equal(state.automatic, true);
    assert.equal(state.reason, "tab");

    state = core.applyPiPTransition(state, { type: "leave", reason: "app" });
    assert.equal(state.automatic, true);
    assert.equal(state.reason, "tab");

    state = core.applyPiPTransition(state, { type: "leave", reason: "tab" });
    assert.deepEqual(state, { automatic: false, reason: null, video: null });
});
