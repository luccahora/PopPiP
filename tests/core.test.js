const test = require("node:test");
const assert = require("node:assert/strict");
const core = require("../PopPiP Extension/Resources/core.js");

function video({ paused = false, ended = false, currentTime = 10, readyState = 4, muted = false, duration = 300, rect = {} } = {}) {
    const box = { left: 0, top: 0, right: 640, bottom: 360, width: 640, height: 360, ...rect };
    return { paused, ended, currentTime, readyState, muted, duration, getBoundingClientRect: () => box };
}
const viewport = { width: 1280, height: 720 };

test("selects the only playing video", () => assert.equal(core.selectPlayingVideo([video()], viewport) !== null, true));
test("ignores paused and ended videos", () => {
    assert.equal(core.selectPlayingVideo([video({ paused: true }), video({ ended: true })], viewport), null);
});
test("ignores videos that have not started or are not ready", () => {
    assert.equal(core.selectPlayingVideo([video({ currentTime: 0 }), video({ readyState: 1 })], viewport), null);
});
test("ignores tiny previews", () => {
    assert.equal(core.selectPlayingVideo([video({ rect: { width: 100, height: 60, right: 100, bottom: 60 } })], viewport), null);
});
test("prefers a larger visible video", () => {
    const small = video({ rect: { width: 320, height: 180, right: 320, bottom: 180 } });
    const large = video();
    assert.equal(core.selectPlayingVideo([small, large], viewport), large);
});
test("prefers the visible player when two videos are playing", () => {
    const offscreen = video({ rect: { left: 0, top: 900, right: 1000, bottom: 1460, width: 1000, height: 560 } });
    const visible = video();
    assert.equal(core.selectPlayingVideo([offscreen, visible], viewport), visible);
});
test("supports Safari PiP APIs for compatible players", () => {
    const video = { webkitSupportsPresentationMode: true, webkitSetPresentationMode() {}, requestPictureInPicture: null };
    assert.equal(core.supportsPictureInPicture(video), true);
    assert.equal(core.videoDiagnostic(video).code, "ready");
});

test("reports unsupported players cleanly", () => {
    const video = { paused: false, ended: false, currentTime: 10, readyState: 4, requestPictureInPicture: null };
    assert.equal(core.supportsPictureInPicture(video), false);
    assert.equal(core.videoDiagnostic(video).code, "unsupported-player");
});

test("diagnostic handles a missing video", () => {
    assert.equal(core.videoDiagnostic(null).code, "no-video");
});

test("automatic PiP closes only for its own reason", () => {
    const state = { automatic: true, reason: "tab" };
    assert.equal(core.shouldLeaveAutomaticPiP(state, "tab"), true);
    assert.equal(core.shouldLeaveAutomaticPiP(state, "app"), false);
    assert.equal(core.shouldLeaveAutomaticPiP({ automatic: false, reason: null }, "tab"), false);
});

