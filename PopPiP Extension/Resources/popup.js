(async function () {
    "use strict";
    const core = globalThis.PopPiPCore;
    const translations = Object.freeze({
        en: {
            subtitle: "Automatic Picture-in-Picture for Safari", languageHeading: "Language",
            languageLabel: "Interface language", settings: "Settings", enable: "Enable PopPiP",
            tabSwitch: "PiP on tab switch", appSwitch: "PiP on app switch",
            viewportExit: "PiP when video leaves viewport", websiteAccess: "Website access",
            enableSite: "Enable on this website", disableSite: "Disable on this website",
            enableAll: "Enable on all permitted websites",
            safariAccess: "Safari controls which websites the extension may access.",
            advanced: "Advanced", debug: "Debug logging", active: "Active on this website",
            disabled: "Disabled on this website", openWebsite: "Open a website to configure PopPiP",
            saved: "Saved locally.", saveError: "Unable to save settings.",
            accessError: "Safari did not provide access to the current website.",
            defaults: "Using default settings.",
            ready: "PopPiP is ready on this player.", noVideo: "No video is playing.",
            permissionRequired: "Website permission is required in Safari.",
            unsupportedPlayer: "PiP is unavailable on this player."
        },
        "pt-BR": {
            subtitle: "Picture-in-Picture automático para Safari", languageHeading: "Idioma",
            languageLabel: "Idioma da interface", settings: "Configurações", enable: "Ativar PopPiP",
            tabSwitch: "PiP ao trocar de aba", appSwitch: "PiP ao trocar de aplicativo",
            viewportExit: "PiP quando o vídeo sair da tela", websiteAccess: "Acesso a sites",
            enableSite: "Ativar neste site", disableSite: "Desativar neste site",
            enableAll: "Ativar em todos os sites permitidos",
            safariAccess: "O Safari controla quais sites a extensão pode acessar.",
            advanced: "Avançado", debug: "Registro de depuração", active: "Ativo neste site",
            disabled: "Desativado neste site", openWebsite: "Abra um site para configurar o PopPiP",
            saved: "Salvo localmente.", saveError: "Não foi possível salvar as configurações.",
            accessError: "O Safari não forneceu acesso ao site atual.",
            defaults: "Usando as configurações padrão.",
            ready: "O PopPiP está pronto para este player.", noVideo: "Nenhum vídeo está reproduzindo.",
            permissionRequired: "É necessário permitir o site no Safari.",
            unsupportedPlayer: "O PiP não está disponível neste player."
        }
    });
    const settingKeys = ["enabled", "tabSwitch", "appSwitch", "viewportExit", "enableAllSites", "debug"];
    const controls = Object.fromEntries(settingKeys.map(key => [key, document.getElementById(key)]));
    const status = document.getElementById("site-status");
    const message = document.getElementById("message");
    let hostname = "";
    let settings = core.mergeSettings();

    function text(key) { return translations[settings.language][key]; }
    function setMessage(key) { message.textContent = key ? (translations[settings.language][key] || key) : ""; }
    function diagnosticText(code) {
        switch (code) {
            case "ready": return text("ready");
            case "no-video": return text("noVideo");
            case "site-disabled": return text("permissionRequired");
            case "unsupported-player": return text("unsupportedPlayer");
            default: return text("noVideo");
        }
    }
    function translateInterface() {
        document.documentElement.lang = settings.language;
        document.querySelectorAll("[data-i18n]").forEach(element => {
            element.textContent = text(element.dataset.i18n);
        });
        document.getElementById("language").value = settings.language;
        document.getElementById("language").setAttribute("aria-label", text("languageLabel"));
    }
    function render() {
        translateInterface();
        for (const key of settingKeys) controls[key].checked = Boolean(settings[key]);
        const active = core.isSiteEnabled(hostname, settings);
        status.textContent = hostname ? text(active ? "active" : "disabled") : text("openWebsite");
        document.getElementById("enable-site").disabled = !hostname;
        document.getElementById("disable-site").disabled = !hostname;
    }
    async function refreshStatus() {
        try {
            const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
            const parsed = tab && tab.url ? new URL(tab.url) : null;
            if (!parsed || !["http:", "https:"].includes(parsed.protocol)) {
                status.textContent = text("openWebsite");
                setMessage("");
                return;
            }
            hostname = core.normalizeHostname(parsed.hostname);
            render();
            if (!core.isSiteEnabled(hostname, settings)) {
                status.textContent = text("permissionRequired");
                setMessage("permissionRequired");
                return;
            }
            try {
                const response = await browser.tabs.sendMessage(tab.id, { type: "popPipGetStatus" });
                const code = response && response.code ? response.code : "no-video";
                status.textContent = diagnosticText(code);
                if (code === "ready") setMessage("");
                else if (code === "site-disabled") setMessage("permissionRequired");
                else if (code === "unsupported-player") setMessage("unsupportedPlayer");
                else setMessage("noVideo");
            } catch (_) {
                status.textContent = text("noVideo");
                setMessage("noVideo");
            }
        } catch (_) {
            setMessage("accessError");
            status.textContent = text("openWebsite");
        }
    }
    async function save() {
        try { await browser.storage.local.set({ settings }); setMessage("saved"); }
        catch (_) { setMessage("saveError"); }
        render();
    }
    try { const stored = await browser.storage.local.get("settings"); settings = core.mergeSettings(stored.settings); }
    catch (_) { setMessage("defaults"); }
    for (const key of settingKeys) controls[key].addEventListener("change", () => {
        settings[key] = controls[key].checked; save();
        refreshStatus();
    });
    document.getElementById("language").addEventListener("change", event => {
        settings.language = event.target.value === "pt-BR" ? "pt-BR" : "en";
        save();
        refreshStatus();
    });
    document.getElementById("enable-site").addEventListener("click", () => {
        settings.enabledSites = [...new Set([...settings.enabledSites, hostname])];
        settings.disabledSites = settings.disabledSites.filter(item => item !== hostname); save();
        refreshStatus();
    });
    document.getElementById("disable-site").addEventListener("click", () => {
        settings.disabledSites = [...new Set([...settings.disabledSites, hostname])];
        settings.enabledSites = settings.enabledSites.filter(item => item !== hostname); save();
        refreshStatus();
    });
    render();
    refreshStatus();
})();
