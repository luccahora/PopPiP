(function (root, factory) {
    const api = factory();
    if (typeof module === "object" && module.exports) module.exports = api;
    else root.PopPiPCore = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
    "use strict";

    const DEFAULT_SETTINGS = Object.freeze({
        enabled: true,
        tabSwitch: true,
        appSwitch: true,
        viewportExit: false,
        enableAllSites: false,
        enabledSites: [],
        disabledSites: [],
        language: "en",
        debug: false
    });

    function normalizeHostname(value) {
        return String(value || "").trim().toLowerCase().replace(/^\.+|\.+$/g, "");
    }

    function hostnameMatches(hostname, rule) {
        const host = normalizeHostname(hostname);
        const candidate = normalizeHostname(rule);
        return Boolean(host && candidate && (host === candidate || host.endsWith(`.${candidate}`)));
    }

    function mergeSettings(value) {
        const input = value && typeof value === "object" ? value : {};
        const language = input.language === "pt-BR" ? "pt-BR" : "en";
        return {
            ...DEFAULT_SETTINGS,
            ...input,
            language,
            enabledSites: Array.isArray(input.enabledSites) ? input.enabledSites.map(normalizeHostname).filter(Boolean) : [],
            disabledSites: Array.isArray(input.disabledSites) ? input.disabledSites.map(normalizeHostname).filter(Boolean) : []
        };
    }

    function isSiteEnabled(hostname, settings) {
        const host = normalizeHostname(hostname);
        const value = mergeSettings(settings);
        if (!value.enabled || !host) return false;
        if (value.disabledSites.some(rule => hostnameMatches(host, rule))) return false;
        return value.enableAllSites || value.enabledSites.some(rule => hostnameMatches(host, rule));
    }

    function isPlaying(video) {
        return Boolean(video && !video.paused && !video.ended && Number(video.currentTime) > 0 && Number(video.readyState) >= 2);
    }

    function supportsPictureInPicture(video) {
        return Boolean(video && (
            (video.webkitSupportsPresentationMode && typeof video.webkitSetPresentationMode === "function") ||
            typeof video.requestPictureInPicture === "function"
        ));
    }

    function videoDiagnostic(video) {
        if (!video) return { code: "no-video", ok: false, message: "No video is playing." };
        if (!supportsPictureInPicture(video)) return { code: "unsupported-player", ok: false, message: "PiP is unavailable on this player." };
        return { code: "ready", ok: true, message: "PopPiP can enter Picture-in-Picture on this video." };
    }

    function videoScore(video, viewport) {
        if (!isPlaying(video)) return Number.NEGATIVE_INFINITY;
        const rect = video.getBoundingClientRect();
        const width = Math.max(0, Number(rect.width) || 0);
        const height = Math.max(0, Number(rect.height) || 0);
        if (width < 160 || height < 90) return Number.NEGATIVE_INFINITY;
        const viewWidth = viewport.width;
        const viewHeight = viewport.height;
        const visibleWidth = Math.max(0, Math.min(rect.right, viewWidth) - Math.max(rect.left, 0));
        const visibleHeight = Math.max(0, Math.min(rect.bottom, viewHeight) - Math.max(rect.top, 0));
        const visibleArea = visibleWidth * visibleHeight;
        const centerX = rect.left + width / 2;
        const centerY = rect.top + height / 2;
        const distance = Math.hypot(centerX - viewWidth / 2, centerY - viewHeight / 2);
        const mutedPreviewPenalty = video.muted && Number(video.duration) < 60 ? width * height : 0;
        return visibleArea * 3 + width * height - distance - mutedPreviewPenalty;
    }

    function selectPlayingVideo(videos, viewport) {
        const view = viewport || { width: 0, height: 0 };
        return Array.from(videos || []).reduce((best, video) => {
            const score = videoScore(video, view);
            return score > best.score ? { video, score } : best;
        }, { video: null, score: Number.NEGATIVE_INFINITY }).video;
    }

    function shouldLeaveAutomaticPiP(state, reason) {
        return Boolean(state && state.automatic && (!reason || state.reason === reason));
    }

    function applyPiPTransition(state, action) {
        const base = state && typeof state === "object" ? state : { automatic: false, reason: null, video: null };
        const next = { automatic: Boolean(base.automatic), reason: base.reason || null, video: base.video || null };
        if (!action || typeof action !== "object") return next;
        switch (action.type) {
            case "enter":
                if (!action.video) return next;
                return { automatic: true, reason: action.reason || null, video: action.video };
            case "leave":
                return shouldLeaveAutomaticPiP(next, action.reason) ? { automatic: false, reason: null, video: null } : next;
            case "manual-close":
            case "reset":
                return { automatic: false, reason: null, video: null };
            default:
                return next;
        }
    }

    return {
        DEFAULT_SETTINGS, normalizeHostname, hostnameMatches, mergeSettings,
        isSiteEnabled, isPlaying, supportsPictureInPicture, videoDiagnostic,
        videoScore, selectPlayingVideo, shouldLeaveAutomaticPiP, applyPiPTransition
    };
});
