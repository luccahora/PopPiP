(function () {
    "use strict";

    if (globalThis.__popPiPInstalled || !globalThis.PopPiPCore) return;
    globalThis.__popPiPInstalled = true;

    const FOCUS_CHECK_DELAY_MS = 100;
    const VIEWPORT_THRESHOLD = 0.15;
    const VIDEO_CACHE_MS = 750;
    const SITE_VIDEO_SELECTORS = Object.freeze({
        "youtube.com": ".html5-main-video",
        "youtu.be": "video",
        "twitch.tv": "video",
        "vimeo.com": "video"
    });
    const core = globalThis.PopPiPCore;
    let settings = core.mergeSettings();
    let cachedVideo = null;
    let cacheTime = 0;
    let pipState = { automatic: false, reason: null, video: null };
    let focusTimer = null;
    let observer = null;
    let observedVideo = null;

    function debugLog(...args) {
        if (settings.debug) console.debug("[PopPiP]", ...args);
    }

    async function readSettings() {
        try {
            const stored = await browser.storage.local.get("settings");
            settings = core.mergeSettings(stored.settings);
        } catch (error) {
            settings = core.mergeSettings();
            debugLog("Unable to read settings", error && error.message);
        }
        refreshObservation();
    }

    function enabledHere() { return core.isSiteEnabled(location.hostname, settings); }

    function getPlayingVideo() {
        if (cachedVideo && Date.now() - cacheTime < VIDEO_CACHE_MS && core.isPlaying(cachedVideo)) return cachedVideo;
        const selector = Object.entries(SITE_VIDEO_SELECTORS).find(([host]) => core.hostnameMatches(location.hostname, host));
        const preferred = selector ? document.querySelector(selector[1]) : null;
        const videos = Array.from(document.querySelectorAll("video"));
        if (preferred && !videos.includes(preferred)) videos.unshift(preferred);
        cachedVideo = core.selectPlayingVideo(videos, { width: innerWidth, height: innerHeight });
        cacheTime = Date.now();
        return cachedVideo;
    }

    function isVideoInPiP(video) {
        return document.pictureInPictureElement === video || video.webkitPresentationMode === "picture-in-picture";
    }

    async function enterPiP(reason) {
        if (!enabledHere() || pipState.automatic) return;
        const video = getPlayingVideo();
        if (!video || isVideoInPiP(video)) return;
        try {
            if (video.webkitSupportsPresentationMode && typeof video.webkitSetPresentationMode === "function") {
                video.webkitSetPresentationMode("picture-in-picture");
            } else if (typeof video.requestPictureInPicture === "function") {
                await video.requestPictureInPicture();
            } else return;
            pipState = { automatic: true, reason, video };
            debugLog("Entering PiP", reason);
        } catch (error) { debugLog("Unable to enter PiP", error && error.message); }
    }

    async function leavePiP(reason) {
        if (!core.shouldLeaveAutomaticPiP(pipState, reason)) return;
        const video = pipState.video;
        try {
            if (video && video.webkitPresentationMode === "picture-in-picture" && typeof video.webkitSetPresentationMode === "function") {
                video.webkitSetPresentationMode("inline");
            } else if (document.pictureInPictureElement === video && typeof document.exitPictureInPicture === "function") {
                await document.exitPictureInPicture();
            }
            debugLog("Leaving PiP", reason || pipState.reason);
        } catch (error) { debugLog("Unable to leave PiP", error && error.message); }
        finally { pipState = { automatic: false, reason: null, video: null }; }
    }

    function refreshObservation() {
        if (observer) observer.disconnect();
        observer = null;
        observedVideo = null;
        if (!enabledHere() || !settings.viewportExit || typeof IntersectionObserver !== "function") return;
        const video = getPlayingVideo();
        if (!video) return;
        observedVideo = video;
        observer = new IntersectionObserver(entries => {
            const entry = entries[0];
            if (!entry) return;
            if (entry.intersectionRatio < VIEWPORT_THRESHOLD && core.isPlaying(video)) enterPiP("viewport");
            else if (entry.intersectionRatio >= VIEWPORT_THRESHOLD) leavePiP("viewport");
        }, { threshold: [0, VIEWPORT_THRESHOLD, 1] });
        observer.observe(video);
    }

    document.addEventListener("visibilitychange", () => {
        if (!enabledHere() || !settings.tabSwitch) return;
        if (document.hidden) enterPiP("tab"); else leavePiP("tab");
    });
    window.addEventListener("blur", () => {
        if (!enabledHere() || !settings.appSwitch) return;
        clearTimeout(focusTimer);
        focusTimer = setTimeout(() => { if (!document.hasFocus() && !document.hidden) enterPiP("app"); }, FOCUS_CHECK_DELAY_MS);
    });
    window.addEventListener("focus", () => { clearTimeout(focusTimer); leavePiP("app"); });
    document.addEventListener("play", event => { if (event.target instanceof HTMLVideoElement) { cachedVideo = null; refreshObservation(); } }, true);
    document.addEventListener("leavepictureinpicture", () => { pipState = { automatic: false, reason: null, video: null }; }, true);
    document.addEventListener("webkitpresentationmodechanged", event => {
        if (event.target === pipState.video && event.target.webkitPresentationMode !== "picture-in-picture") pipState = { automatic: false, reason: null, video: null };
    }, true);
    browser.storage.onChanged.addListener((changes, area) => { if (area === "local" && changes.settings) readSettings(); });
    readSettings();
})();

