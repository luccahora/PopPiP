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
            defaults: "Using default settings."
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
            defaults: "Usando as configurações padrão."
        }
    });
    const settingKeys = ["enabled", "tabSwitch", "appSwitch", "viewportExit", "enableAllSites", "debug"];
    const controls = Object.fromEntries(settingKeys.map(key => [key, document.getElementById(key)]));
    const status = document.getElementById("site-status");
    const message = document.getElementById("message");
    let hostname = "";
    let settings = core.mergeSettings();

    function text(key) { return translations[settings.language][key]; }
    function setMessage(key) { message.textContent = key ? text(key) : ""; }
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
    async function save() {
        try { await browser.storage.local.set({ settings }); setMessage("saved"); }
        catch (_) { setMessage("saveError"); }
        render();
    }
    try {
        const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
        const parsed = tab && tab.url ? new URL(tab.url) : null;
        if (parsed && (parsed.protocol === "http:" || parsed.protocol === "https:")) hostname = core.normalizeHostname(parsed.hostname);
    } catch (_) { setMessage("accessError"); }
    try { const stored = await browser.storage.local.get("settings"); settings = core.mergeSettings(stored.settings); }
    catch (_) { setMessage("defaults"); }
    for (const key of settingKeys) controls[key].addEventListener("change", () => { settings[key] = controls[key].checked; save(); });
    document.getElementById("language").addEventListener("change", event => {
        settings.language = event.target.value === "pt-BR" ? "pt-BR" : "en";
        save();
    });
    document.getElementById("enable-site").addEventListener("click", () => {
        settings.enabledSites = [...new Set([...settings.enabledSites, hostname])];
        settings.disabledSites = settings.disabledSites.filter(item => item !== hostname); save();
    });
    document.getElementById("disable-site").addEventListener("click", () => {
        settings.disabledSites = [...new Set([...settings.disabledSites, hostname])];
        settings.enabledSites = settings.enabledSites.filter(item => item !== hostname); save();
    });
    render();
})();
