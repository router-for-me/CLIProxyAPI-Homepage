/*
 * CLIProxyAPI — Homepage Bootstrap & System 6 Menu Bar Controller
 * Coordinates bilingual switching, CRT phosphor display modes, snippet copy buttons,
 * and the Macintosh System 6 menu bar clock.
 */
(function (global) {
    "use strict";

    function formatMenuClock(dateObj) {
        var now = dateObj instanceof Date ? dateObj : new Date();
        var hours = now.getHours();
        var minutes = now.getMinutes();
        var suffix = hours >= 12 ? "PM" : "AM";
        var h12 = hours % 12;
        if (h12 === 0) {
            h12 = 12;
        }
        var minPadded = minutes < 10 ? "0" + String(minutes) : String(minutes);
        return String(h12) + ":" + minPadded + " " + suffix;
    }

    function initApp(rootDoc) {
        var doc = rootDoc || global.document;
        if (!doc || typeof doc.querySelectorAll !== "function") {
            return;
        }

        var ns = global.CPAHomepage || {};
        var i18n = ns.i18n;
        var terminal = ns.terminal;

        if (i18n) {
            i18n.applyTranslations(doc);
        }

        if (terminal) {
            terminal.initTerminal(doc);
        }

        // Bind language toggle buttons in the System 6 menu bar
        var langButtons = doc.querySelectorAll("[data-lang-toggle]");
        for (var i = 0; i < langButtons.length; i++) {
            (function (btn) {
                btn.addEventListener("click", function () {
                    var target = btn.dataset ? btn.dataset.langToggle : btn.getAttribute("data-lang-toggle");
                    if (i18n && target) {
                        i18n.setLocale(target, doc);
                    }
                });
            })(langButtons[i]);
        }

        // Bind CRT phosphor display mode buttons
        var crtButtons = doc.querySelectorAll("[data-crt-theme]");
        for (var j = 0; j < crtButtons.length; j++) {
            (function (btn) {
                btn.addEventListener("click", function () {
                    var theme = btn.dataset ? btn.dataset.crtTheme : btn.getAttribute("data-crt-theme");
                    if (terminal && theme) {
                        terminal.setPhosphorTheme(theme, doc);
                    }
                });
            })(crtButtons[j]);
        }

        // Bind Quick Start snippet copy buttons
        var snippetButtons = doc.querySelectorAll("[data-copy-snippet]");
        for (var k = 0; k < snippetButtons.length; k++) {
            (function (btn) {
                btn.addEventListener("click", function () {
                    var cmd = btn.dataset ? btn.dataset.copySnippet : btn.getAttribute("data-copy-snippet");
                    if (!terminal || !cmd) {
                        return;
                    }
                    terminal.copyText(cmd).then(function (ok) {
                        if (!ok) {
                            return;
                        }
                        if (btn._copyTimer && typeof global.clearTimeout === "function") {
                            global.clearTimeout(btn._copyTimer);
                        }
                        btn.textContent = i18n ? i18n.t("qs.copied") : "Copied";
                        btn._copyTimer = global.setTimeout(function () {
                            btn._copyTimer = null;
                            btn.textContent = i18n ? i18n.t("qs.copy") : "Copy";
                        }, 1500);
                    });
                });
            })(snippetButtons[k]);
        }

        // Update localized terminal hint in place without clearing user's terminal output
        if (i18n && typeof i18n.onLocaleChange === "function" && terminal && typeof terminal.refreshLocaleText === "function") {
            i18n.onLocaleChange(function () {
                terminal.refreshLocaleText();
            });
        }

        // Initialize and tick the System 6 menu bar clock
        var clockEl = doc.querySelector ? doc.querySelector("[data-menu-clock]") : null;
        if (clockEl) {
            clockEl.textContent = formatMenuClock(new Date());
            if (typeof global.setInterval === "function") {
                global.setInterval(function () {
                    clockEl.textContent = formatMenuClock(new Date());
                }, 15000);
            }
        }
    }

    global.CPAHomepage = global.CPAHomepage || {};
    global.CPAHomepage.main = {
        initApp: initApp,
        formatMenuClock: formatMenuClock
    };

    if (global.document) {
        if (global.document.readyState === "loading" && typeof global.document.addEventListener === "function") {
            global.document.addEventListener("DOMContentLoaded", function () {
                initApp(global.document);
            });
        } else {
            initApp(global.document);
        }
    }
})(typeof window !== "undefined" ? window : globalThis);
