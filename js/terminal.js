/*
 * CLIProxyAPI — Interactive Retro CRT Terminal Emulator
 * Simulates genuine CLIProxyAPI flags, OAuth flows, Bubbletea TUI, and LAN discovery.
 * Uses pure textContent DOM creation to prevent HTML/XSS injection and parses CLI
 * invocations with Go flag-compatible syntax and type rules.
 */
(function (global) {
    "use strict";

    var THEME_KEY = "cpa_homepage_crt_theme";
    var PROMPT_PREFIX = "guest@macintosh ~ % ";

    var presets = {
        oauth: {
            command: "./cli-proxy-api --claude-login",
            lines: [
                { text: PROMPT_PREFIX + "./cli-proxy-api --claude-login", kind: "cmd" },
                { text: "CLIProxyAPI Version: v8.12.0, Commit: 905e70c4, BuiltAt: 1984-01-24T09:00:00Z", kind: "muted" },
                { text: "[oauth] Starting Anthropic Claude Code authorization flow..." },
                { text: "[oauth] Callback listener bound on http://127.0.0.1:54545/callback" },
                { text: "[oauth] Browser session verified -> token exchange succeeded." },
                { text: "[store] Saved credential: auths/claude-pro-seat-01.json (round-robin pool: 3 active)", kind: "cmd" },
                { text: "" },
                { text: PROMPT_PREFIX + "./cli-proxy-api --codex-device-login --no-browser", kind: "cmd" },
                { text: "[oauth] Visit https://auth.openai.com/codex/device and enter code: MAC8-8317" },
                { text: "[store] Saved credential: auths/codex-plus-seat-02.json (round-robin pool: 2 active)", kind: "cmd" }
            ]
        },
        routing: {
            command: "./cli-proxy-api --config config.yaml",
            lines: [
                { text: PROMPT_PREFIX + "./cli-proxy-api --config config.yaml", kind: "cmd" },
                { text: "CLIProxyAPI Version: v8.12.0  |  Listening on http://127.0.0.1:8317", kind: "muted" },
                { text: "[registry] Loaded 7 upstream providers (11 CLI OAuth accounts + 2 API keys)" },
                { text: "[routes]   OpenAI Chat/Responses : POST /v1/chat/completions, /v1/responses" },
                { text: "[routes]   Anthropic Messages    : POST /v1/messages" },
                { text: "[routes]   Gemini & Interactions : POST /v1beta/models/*, /v1beta/interactions" },
                { text: "" },
                { text: "[200] POST /v1/messages          model=claude-opus-5-5     acct=claude-01  stream=sse  412ms", kind: "cmd" },
                { text: "[200] POST /v1/responses         model=gpt-6.1-sol         acct=codex-02   stream=ws   289ms", kind: "cmd" },
                { text: "[200] POST /v1/chat/completions  model=gemini-3.8-flash    acct=antig-01   stream=sse  194ms", kind: "cmd" }
            ]
        },
        tui: {
            command: "./cli-proxy-api --tui --standalone",
            lines: [
                { text: PROMPT_PREFIX + "./cli-proxy-api --tui --standalone", kind: "cmd" },
                { text: "+--------------------------------------------------------------------------+", kind: "ascii" },
                { text: "| CLIProxyAPI TUI  [1:Dashboard]  2:OAuth  3:Auth Files  4:Keys  5:Logs    |", kind: "ascii" },
                { text: "+--------------------------------------------------------------------------+", kind: "ascii" },
                { text: "| Server Status : RUNNING (embedded standalone)     Endpoint : :8317       |", kind: "ascii" },
                { text: "| Auth Accounts : 11 Ready / 0 Cooldown             API Keys : 3 Configured|", kind: "ascii" },
                { text: "| Active Pools  : Codex (3) · Claude (3) · Antigravity (2) · Kimi (2) · xAI|", kind: "ascii" },
                { text: "| Hotkeys       : [Tab] Switch Pane   [r] Refresh   [l] EN/ZH   [q] Quit   |", kind: "ascii" },
                { text: "+--------------------------------------------------------------------------+", kind: "ascii" }
            ]
        },
        discover: {
            command: "./cli-proxy-api discover --timeout 3",
            lines: [
                { text: PROMPT_PREFIX + "./cli-proxy-api discover --timeout 3", kind: "cmd" },
                { text: "Scanning LAN via DNS-SD (_ai-gateway._tcp, timeout=3s)...", kind: "muted" },
                { text: "INSTANCE              HOST                 PORT   PROTO   VERSION" },
                { text: "macintosh-se-lab      192.168.1.24         8317   http    v8.12.0", kind: "cmd" },
                { text: "build-box-mini        192.168.1.88         8317   http    v8.12.0", kind: "cmd" },
                { text: "2 gateway instance(s) discovered on local network. (Tip: pass --json for jq)", kind: "muted" }
            ]
        }
    };

    // Ordered strictly according to cmd/server/main.go:736-757 dispatch precedence
    var loginProviders = [
        { key: "antigravity-login", name: "Google Antigravity / Gemini", file: "antigravity-seat.json" },
        { key: "codex-login", name: "OpenAI Codex", file: "codex-oauth-seat.json" },
        { key: "codex-device-login", name: "OpenAI Codex (Device Flow)", file: "codex-device-seat.json" },
        { key: "claude-login", name: "Anthropic Claude Code", file: "claude-code-seat.json" },
        { key: "kimi-login", name: "Kimi Code (.com)", file: "kimi-code-seat.json" },
        { key: "kimi-ai-login", name: "Kimi Code (.ai)", file: "kimi-ai-seat.json" },
        { key: "xai-login", name: "xAI Grok Build", file: "xai-grok-seat.json" },
        { key: "devin-login", name: "Devin CLI", file: "devin-cli-seat.json" },
        { key: "meta-login", name: "Meta Muse Code", file: "meta-muse-seat.json" }
    ];

    // Exact flag specifications synchronized with cmd/server/main.go (h/help are handled as FlagSet built-ins)
    var SERVER_FLAG_SPECS = {
        "codex-login": "bool",
        "codex-device-login": "bool",
        "claude-login": "bool",
        "no-browser": "bool",
        "oauth-callback-port": "int",
        "login-proxy": "string",
        "antigravity-login": "bool",
        "kimi-login": "bool",
        "kimi-ai-login": "bool",
        "xai-login": "bool",
        "devin-login": "bool",
        "meta-login": "bool",
        "discover": "bool",
        "discover-timeout": "int",
        "discover-json": "bool",
        "discover-service-type": "string",
        "discover-include": "string",
        "discover-exclude": "string",
        "config": "string",
        "vertex-import": "string",
        "vertex-import-prefix": "string",
        "siwc-bind": "string",
        "password": "string",
        "home-jwt": "string",
        "home-disable-cluster-discovery": "bool",
        "tui": "bool",
        "standalone": "bool",
        "management-base-url": "string",
        "local-model": "bool"
    };

    var DISCOVER_FLAG_SPECS = {
        "timeout": "int",
        "json": "bool",
        "service-type": "string",
        "config": "string",
        "include": "string",
        "exclude": "string"
    };

    var GO_BOOL_LITERALS = {
        "1": true,
        "t": true,
        "T": true,
        "TRUE": true,
        "true": true,
        "True": true,
        "0": false,
        "f": false,
        "F": false,
        "FALSE": false,
        "false": false,
        "False": false
    };

    var state = {
        root: null,
        outputEl: null,
        screenEl: null,
        inputEl: null,
        copyBtn: null,
        welcomeLineEl: null,
        activePreset: "oauth",
        currentCommand: presets.oauth.command,
        theme: "green",
        history: [],
        historyIndex: 0,
        copyTimer: null
    };

    function getI18n() {
        return global.CPAHomepage && global.CPAHomepage.i18n ? global.CPAHomepage.i18n : null;
    }

    function translate(key, fallback) {
        var i18n = getI18n();
        return i18n ? i18n.t(key) : fallback;
    }

    function clearOutput() {
        state.welcomeLineEl = null;
        if (!state.outputEl) {
            return;
        }
        if (typeof state.outputEl.replaceChildren === "function") {
            state.outputEl.replaceChildren();
        } else if (state.outputEl.children) {
            while (state.outputEl.firstChild) {
                state.outputEl.removeChild(state.outputEl.firstChild);
            }
        }
    }

    function appendLine(text, kind) {
        var doc = (state.root && state.root.createElement ? state.root : global.document);
        if (!state.outputEl || !doc || typeof doc.createElement !== "function") {
            return null;
        }
        var lineEl = doc.createElement("div");
        var cls = "term-line";
        if (kind === "cmd") {
            cls += " is-cmd";
        } else if (kind === "muted") {
            cls += " is-muted";
        } else if (kind === "warn") {
            cls += " is-warn";
        } else if (kind === "ascii") {
            cls += " is-ascii";
        }
        lineEl.className = cls;
        lineEl.textContent = String(text);
        state.outputEl.appendChild(lineEl);
        state.outputEl.scrollTop = state.outputEl.scrollHeight;
        return lineEl;
    }

    function updatePresetButtons() {
        var scope = state.root || global.document;
        if (!scope || typeof scope.querySelectorAll !== "function") {
            return;
        }
        var buttons = scope.querySelectorAll("[data-preset]");
        for (var i = 0; i < buttons.length; i++) {
            var btn = buttons[i];
            var id = btn.dataset ? btn.dataset.preset : btn.getAttribute("data-preset");
            var isActive = id === state.activePreset;
            if (btn.classList && typeof btn.classList.toggle === "function") {
                btn.classList.toggle("is-active", isActive);
            }
            if (typeof btn.setAttribute === "function") {
                btn.setAttribute("aria-pressed", isActive ? "true" : "false");
            }
        }
    }

    function loadPreset(presetId) {
        var key = Object.prototype.hasOwnProperty.call(presets, presetId) ? presetId : "oauth";
        var preset = presets[key];
        state.activePreset = key;
        state.currentCommand = preset.command;
        clearOutput();
        state.welcomeLineEl = appendLine("# " + translate("term.welcomeHint", "Interactive CLI shell ready."), "muted");
        for (var i = 0; i < preset.lines.length; i++) {
            appendLine(preset.lines[i].text, preset.lines[i].kind);
        }
        if (state.outputEl) {
            state.outputEl.scrollTop = 0;
        }
        updatePresetButtons();
    }

    function refreshLocaleText() {
        if (state.welcomeLineEl) {
            state.welcomeLineEl.textContent = "# " + translate("term.welcomeHint", "Interactive CLI shell ready.");
        }
    }

    function tokenizeShell(input) {
        var argv = [];
        var current = "";
        var hasToken = false;
        var quoteChar = null;

        for (var i = 0; i < input.length; i++) {
            var ch = input.charAt(i);
            if (quoteChar === "'") {
                if (ch === "'") {
                    quoteChar = null;
                } else {
                    current += ch;
                }
                continue;
            }
            if (quoteChar === '"') {
                if (ch === '"') {
                    quoteChar = null;
                } else if (ch === "\\" && i + 1 < input.length) {
                    var nextCh = input.charAt(i + 1);
                    if (nextCh === '"' || nextCh === "\\" || nextCh === "$" || nextCh === "`") {
                        current += nextCh;
                        i += 1;
                    } else {
                        current += ch;
                    }
                } else {
                    current += ch;
                }
                continue;
            }

            if (ch === "'" || ch === '"') {
                quoteChar = ch;
                hasToken = true;
                continue;
            }
            if (ch === "\\") {
                if (i + 1 < input.length) {
                    current += input.charAt(i + 1);
                    hasToken = true;
                    i += 1;
                    continue;
                }
                return { argv: [], error: "parse error: trailing backslash" };
            }
            if (/\s/.test(ch)) {
                if (hasToken) {
                    argv.push(current);
                    current = "";
                    hasToken = false;
                }
                continue;
            }
            current += ch;
            hasToken = true;
        }

        if (quoteChar !== null) {
            return { argv: [], error: "parse error: unterminated quoted string" };
        }
        if (hasToken) {
            argv.push(current);
        }
        return { argv: argv, error: null };
    }

    // Matches Go strconv.ParseInt(s, 0, 64) base auto-detection and int64 bounds
    function parseGoInt(raw) {
        if (typeof raw !== "string" || raw.length === 0) {
            return null;
        }
        var sign = 1n;
        var body = raw;
        if (body.charAt(0) === "+" || body.charAt(0) === "-") {
            if (body.charAt(0) === "-") {
                sign = -1n;
            }
            body = body.slice(1);
        }
        if (body.length === 0) {
            return null;
        }

        var prefix = "";
        var digits = body;
        var validPattern = /^[0-9]+(?:_[0-9]+)*$/;

        if (body.length >= 2 && body.charAt(0) === "0") {
            var p = body.charAt(1);
            if (p === "x" || p === "X") {
                prefix = "0x";
                digits = body.slice(2);
                validPattern = /^_?[0-9a-fA-F]+(?:_[0-9a-fA-F]+)*$/;
            } else if (p === "b" || p === "B") {
                prefix = "0b";
                digits = body.slice(2);
                validPattern = /^_?[01]+(?:_[01]+)*$/;
            } else if (p === "o" || p === "O") {
                prefix = "0o";
                digits = body.slice(2);
                validPattern = /^_?[0-7]+(?:_[0-7]+)*$/;
            } else {
                prefix = "0o";
                digits = body.slice(1);
                validPattern = /^_?[0-7]+(?:_[0-7]+)*$/;
            }
        }

        if (!validPattern.test(digits)) {
            return null;
        }
        var cleaned = digits.replace(/_/g, "");
        if (cleaned.length === 0) {
            return null;
        }

        var bigVal;
        try {
            bigVal = sign * BigInt(prefix + cleaned);
        } catch (_err) {
            return null;
        }

        var minInt64 = -9223372036854775808n;
        var maxInt64 = 9223372036854775807n;
        if (bigVal < minInt64 || bigVal > maxInt64) {
            return null;
        }
        return Number(bigVal);
    }

    function parseCliInvocation(cmdText) {
        var lex = tokenizeShell(cmdText);
        if (lex.error) {
            return { isCliBinary: true, subcommand: null, values: {}, restArgs: [], helpRequested: false, error: lex.error };
        }
        var argv = lex.argv;
        if (argv.length === 0) {
            return { isCliBinary: false, subcommand: null, values: {}, restArgs: [], helpRequested: false, error: null };
        }

        var bin = argv[0];
        if (bin !== "cli-proxy-api" && bin !== "./cli-proxy-api") {
            return { isCliBinary: false, subcommand: null, values: {}, restArgs: [], helpRequested: false, error: null };
        }

        var subcommand = null;
        var allowed = SERVER_FLAG_SPECS;
        var i = 1;
        if (argv.length > 1 && argv[1] === "discover") {
            subcommand = "discover";
            allowed = DISCOVER_FLAG_SPECS;
            i = 2;
        }

        var values = {};
        var restArgs = [];
        while (i < argv.length) {
            var s = argv[i];

            // Go FlagSet.parseOne: non-flag argument or lone "-" stops flag parsing
            if (s.length < 2 || s.charAt(0) !== "-") {
                restArgs = argv.slice(i);
                break;
            }

            var numMinuses = 1;
            if (s.charAt(1) === "-") {
                numMinuses = 2;
                // "--" terminates flag parsing and preserves remaining args
                if (s.length === 2) {
                    restArgs = argv.slice(i + 1);
                    break;
                }
            }

            var body = s.slice(numMinuses);
            if (body.length === 0 || body.charAt(0) === "-" || body.charAt(0) === "=") {
                return {
                    isCliBinary: true,
                    subcommand: subcommand,
                    values: values,
                    restArgs: [],
                    helpRequested: false,
                    error: "bad flag syntax: " + s
                };
            }

            var eqPos = body.indexOf("=");
            var hasEquals = eqPos >= 0;
            var name = hasEquals ? body.slice(0, eqPos) : body;
            var inlineVal = hasEquals ? body.slice(eqPos + 1) : "";

            if (!Object.prototype.hasOwnProperty.call(allowed, name)) {
                if (name === "help" || name === "h") {
                    return {
                        isCliBinary: true,
                        subcommand: subcommand,
                        values: values,
                        restArgs: [],
                        helpRequested: true,
                        error: null
                    };
                }
                return {
                    isCliBinary: true,
                    subcommand: subcommand,
                    values: values,
                    restArgs: [],
                    helpRequested: false,
                    error: "flag provided but not defined: -" + name + " (run 'cli-proxy-api -h' for valid flags)"
                };
            }

            var kind = allowed[name];
            if (kind === "bool") {
                if (hasEquals) {
                    if (!Object.prototype.hasOwnProperty.call(GO_BOOL_LITERALS, inlineVal)) {
                        return {
                            isCliBinary: true,
                            subcommand: subcommand,
                            values: values,
                            restArgs: [],
                            helpRequested: false,
                            error: 'invalid boolean value "' + inlineVal + '" for -' + name + ": parse error"
                        };
                    }
                    values[name] = GO_BOOL_LITERALS[inlineVal];
                } else {
                    values[name] = true;
                }
                i += 1;
                continue;
            }

            var rawArg = "";
            if (hasEquals) {
                rawArg = inlineVal;
                i += 1;
            } else {
                if (i + 1 >= argv.length) {
                    return {
                        isCliBinary: true,
                        subcommand: subcommand,
                        values: values,
                        restArgs: [],
                        helpRequested: false,
                        error: "flag needs an argument: -" + name
                    };
                }
                rawArg = argv[i + 1];
                i += 2;
            }

            if (kind === "int") {
                var parsedInt = parseGoInt(rawArg);
                if (parsedInt === null) {
                    return {
                        isCliBinary: true,
                        subcommand: subcommand,
                        values: values,
                        restArgs: [],
                        helpRequested: false,
                        error: 'invalid value "' + rawArg + '" for flag -' + name + ": parse error"
                    };
                }
                values[name] = parsedInt;
            } else {
                values[name] = rawArg;
            }
        }

        return {
            isCliBinary: true,
            subcommand: subcommand,
            values: values,
            restArgs: restArgs,
            helpRequested: false,
            error: null
        };
    }

    function buildCliHelpLines() {
        return [
            { text: "Usage of ./cli-proxy-api:", kind: "cmd" },
            { text: "  Subcommands:" },
            { text: "    discover [--timeout 3] [--json] [--service-type _ai-gateway._tcp] [--include if0] [--exclude lo0]" },
            { text: "  OAuth & Credential Flags:" },
            { text: "    --codex-login              Login to Codex using OAuth" },
            { text: "    --codex-device-login       Login to Codex using device code flow" },
            { text: "    --claude-login             Login to Claude using OAuth" },
            { text: "    --antigravity-login        Login to Antigravity using OAuth" },
            { text: "    --kimi-login               Login to Kimi (.com) using OAuth" },
            { text: "    --kimi-ai-login            Login to Kimi.ai using OAuth" },
            { text: "    --xai-login                Login to xAI using OAuth" },
            { text: "    --devin-login              Login to Devin using OAuth" },
            { text: "    --meta-login               Login to Meta using OAuth" },
            { text: "    --no-browser               Do not open browser automatically for OAuth" },
            { text: "    --oauth-callback-port int  Override OAuth callback port" },
            { text: "    --login-proxy string       Proxy URL for OAuth login (http/https/socks5/socks5h)" },
            { text: "    --vertex-import string     Import Vertex service account key JSON file" },
            { text: "  Server & Terminal UI Flags:" },
            { text: "    --config string            Configuration file path (default config.yaml)" },
            { text: "    --tui                      Start with Bubbletea terminal management UI" },
            { text: "    --standalone               In TUI mode, start an embedded local server" },
            { text: "    --management-base-url url  Remote management URL for TUI client mode" },
            { text: "    --local-model              Use embedded model catalogs without remote fetch" }
        ];
    }

    function buildDiscoverHelpLines() {
        return [
            { text: "Usage of discover:", kind: "cmd" },
            { text: "  --config string         Configure File Path" },
            { text: "  --exclude value         Comma-separated interface names to skip" },
            { text: "  --include value         Comma-separated interface names to scan" },
            { text: "  --json                  Output in JSON format" },
            { text: "  --service-type string   DNS-SD service type (default _ai-gateway._tcp)" },
            { text: "  --timeout int           Discovery timeout in seconds (default 3)" }
        ];
    }

    function renderHelpLines(forDiscover) {
        var helpLines = forDiscover ? buildDiscoverHelpLines() : buildCliHelpLines();
        for (var h = 0; h < helpLines.length; h++) {
            appendLine(helpLines[h].text, helpLines[h].kind);
        }
    }

    function renderDiscoverOutput(asJson) {
        if (asJson) {
            appendLine("[");
            appendLine('  {"name":"macintosh-se-lab","host":"192.168.1.24","port":8317,"service":"_ai-gateway._tcp","version":"v8.12.0"},', "cmd");
            appendLine('  {"name":"build-box-mini","host":"192.168.1.88","port":8317,"service":"_ai-gateway._tcp","version":"v8.12.0"}', "cmd");
            appendLine("]");
            return;
        }
        var discLines = presets.discover.lines.slice(1);
        for (var dIdx = 0; dIdx < discLines.length; dIdx++) {
            appendLine(discLines[dIdx].text, discLines[dIdx].kind);
        }
    }

    function renderOAuthLogin(item, headless) {
        appendLine("[oauth] Provider: " + item.name);
        if (headless) {
            appendLine("[oauth] --no-browser active: print authorization URL to stdout only.", "muted");
        }
        appendLine("[oauth] Token verified -> saved to auths/" + item.file, "cmd");
    }

    function renderTuiPreview() {
        var tuiLines = presets.tui.lines.slice(1);
        for (var tIdx = 0; tIdx < tuiLines.length; tIdx++) {
            appendLine(tuiLines[tIdx].text, tuiLines[tIdx].kind);
        }
    }

    function executeCommand(rawInput) {
        var text = typeof rawInput === "string" ? rawInput.trim() : "";
        if (text === "") {
            appendLine(PROMPT_PREFIX, "muted");
            return;
        }

        state.history.push(text);
        state.historyIndex = state.history.length;
        state.currentCommand = text;

        var lower = text.toLowerCase();
        if (lower === "clear" || lower === "cls") {
            clearOutput();
            return;
        }

        appendLine(PROMPT_PREFIX + text, "cmd");

        var cliCheck = parseCliInvocation(text);
        if (cliCheck.isCliBinary) {
            if (cliCheck.error) {
                appendLine(cliCheck.error, "warn");
                return;
            }

            if (cliCheck.helpRequested) {
                renderHelpLines(cliCheck.subcommand === "discover");
                return;
            }

            var v = cliCheck.values;
            if (cliCheck.subcommand === "discover" || v.discover === true || v["discover-json"] === true) {
                var jsonMode = cliCheck.subcommand === "discover"
                    ? Boolean(v.json)
                    : Boolean(v["discover-json"]);
                renderDiscoverOutput(jsonMode);
                return;
            }

            // Precedence matches cmd/server/main.go:730-757: vertex-import -> siwc-bind -> login flags -> tui -> server
            if (typeof v["vertex-import"] === "string" && v["vertex-import"].length > 0) {
                appendLine("[vertex] Imported service account key (" + v["vertex-import"] + ") -> saved under auths/", "cmd");
                return;
            }

            if (typeof v["siwc-bind"] === "string" && v["siwc-bind"].length > 0) {
                appendLine("[siwc] Bound SIWC credentials to " + v["siwc-bind"], "cmd");
                return;
            }

            for (var p = 0; p < loginProviders.length; p++) {
                var loginItem = loginProviders[p];
                if (v[loginItem.key] === true) {
                    renderOAuthLogin(loginItem, v["no-browser"] === true);
                    return;
                }
            }

            if (v.tui === true) {
                renderTuiPreview();
                return;
            }

            var srvLines = presets.routing.lines.slice(1);
            for (var sIdx = 0; sIdx < srvLines.length; sIdx++) {
                appendLine(srvLines[sIdx].text, srvLines[sIdx].kind);
            }
            return;
        }

        // Demo shell built-in shortcuts (non cli-proxy-api binary invocations)
        if (lower === "help" || lower === "?") {
            appendLine("Available interactive demo commands:", "muted");
            appendLine("  help                       Show this demo command overview");
            appendLine("  cli-proxy-api -h           Print genuine CLIProxyAPI command-line flags");
            appendLine("  providers                  List supported upstream providers & login flags");
            appendLine("  ./cli-proxy-api --claude-login   Simulate OAuth login (works with any --*-login)");
            appendLine("  ./cli-proxy-api --tui      Preview the built-in Bubbletea terminal UI");
            appendLine("  cli-proxy-api discover --json    Simulate DNS-SD LAN gateway discovery");
            appendLine("  version                    Print binary build info");
            appendLine("  clear                      Clear terminal screen");
            return;
        }

        if (lower === "-h" || lower === "--help") {
            renderHelpLines();
            return;
        }

        if (lower === "version") {
            appendLine("CLIProxyAPI Version: v8.12.0, Runtime: Go 1.26+, Arch: darwin/arm64", "cmd");
            return;
        }

        if (lower === "providers") {
            appendLine("PROVIDER         CLI FLAG               COMPATIBLE PROTOCOLS", "muted");
            appendLine("OpenAI / Codex   --codex-login          OpenAI Chat, Responses, WebSocket");
            appendLine("Anthropic        --claude-login         Claude Messages, OpenAI Chat");
            appendLine("Gemini / Antig.  --antigravity-login    Gemini Native, Interactions, OpenAI");
            appendLine("Kimi (Moonshot)  --kimi-login           OpenAI Chat, Anthropic Compatible");
            appendLine("xAI Grok         --xai-login            OpenAI Chat, Responses, WebSocket");
            appendLine("Meta Muse        --meta-login           OpenAI Compatible & Muse Code");
            appendLine("Devin            --devin-login          Routed SWE-2 / GPT-6 / Claude Models");
            return;
        }

        if (lower === "oauth") {
            loadPreset("oauth");
            return;
        }

        if (lower === "tui") {
            renderTuiPreview();
            return;
        }

        if (lower === "discover" || lower === "discover --json" || lower === "discover -json") {
            renderDiscoverOutput(lower.indexOf("json") >= 0);
            return;
        }

        for (var s = 0; s < loginProviders.length; s++) {
            var shortcut = loginProviders[s];
            if (text === "--" + shortcut.key || text === "-" + shortcut.key) {
                renderOAuthLogin(shortcut, false);
                return;
            }
        }

        if (lower.indexOf("curl ") === 0) {
            appendLine('{"id":"chatcmpl-1984","object":"chat.completion","model":"claude-opus-5-5","choices":[{"message":{"role":"assistant","content":"Hello from CLIProxyAPI."}}]}', "cmd");
            return;
        }

        appendLine("cli-proxy-api: " + translate("term.unknownCmd", "Command not recognized in demo shell. Type 'help' or click a preset above."), "warn");
    }

    function navigateHistory(direction) {
        if (state.history.length === 0) {
            return "";
        }
        var step = direction < 0 ? -1 : 1;
        var next = state.historyIndex + step;
        if (next < 0) {
            next = 0;
        }
        if (next >= state.history.length) {
            state.historyIndex = state.history.length;
            return "";
        }
        state.historyIndex = next;
        return String(state.history[state.historyIndex] || "");
    }

    function setPhosphorTheme(theme, rootOverride) {
        var valid = theme === "amber" || theme === "mono" ? theme : "green";
        state.theme = valid;
        var i18n = getI18n();
        if (i18n && typeof i18n.safeStorageSet === "function") {
            i18n.safeStorageSet(THEME_KEY, valid);
        }

        var scope = rootOverride || state.root || global.document;
        var screen = state.screenEl || (scope && scope.querySelector ? scope.querySelector("[data-term-screen]") : null);
        if (screen && screen.classList) {
            screen.classList.remove("theme-green", "theme-amber", "theme-mono");
            screen.classList.add("theme-" + valid);
        }

        if (scope && typeof scope.querySelectorAll === "function") {
            var crtButtons = scope.querySelectorAll("[data-crt-theme]");
            for (var i = 0; i < crtButtons.length; i++) {
                var btn = crtButtons[i];
                var btnTheme = btn.dataset ? btn.dataset.crtTheme : btn.getAttribute("data-crt-theme");
                var active = btnTheme === valid;
                if (btn.classList && typeof btn.classList.toggle === "function") {
                    btn.classList.toggle("is-active", active);
                }
                if (typeof btn.setAttribute === "function") {
                    btn.setAttribute("aria-pressed", active ? "true" : "false");
                }
            }
        }
        return valid;
    }

    function getPhosphorTheme() {
        return state.theme;
    }

    function fallbackExecCopy(text) {
        var doc = (state.root && state.root.createElement ? state.root : global.document);
        if (!doc || !doc.body || typeof doc.createElement !== "function") {
            return false;
        }
        var area = doc.createElement("textarea");
        area.value = String(text);
        area.setAttribute("readonly", "readonly");
        area.style.position = "fixed";
        area.style.top = "-9999px";
        area.style.opacity = "0";
        doc.body.appendChild(area);
        var ok = false;
        try {
            if (typeof area.select === "function") {
                area.select();
            }
            if (typeof doc.execCommand === "function") {
                ok = Boolean(doc.execCommand("copy"));
            }
        } catch (_err) {
            ok = false;
        } finally {
            doc.body.removeChild(area);
        }
        return ok;
    }

    function copyText(text) {
        var payload = String(text || "");
        var nav = global.navigator;
        if (nav && nav.clipboard && typeof nav.clipboard.writeText === "function") {
            return nav.clipboard.writeText(payload).then(
                function () {
                    return true;
                },
                function () {
                    return fallbackExecCopy(payload);
                }
            );
        }
        return Promise.resolve(fallbackExecCopy(payload));
    }

    function flashButtonText(btn, copiedKey, idleKey) {
        if (!btn) {
            return;
        }
        if (state.copyTimer && typeof global.clearTimeout === "function") {
            global.clearTimeout(state.copyTimer);
        }
        btn.textContent = translate(copiedKey, "Copied!");
        state.copyTimer = global.setTimeout(function () {
            state.copyTimer = null;
            btn.textContent = translate(idleKey, "Copy Command");
        }, 1600);
    }

    function copyCurrentCommand() {
        return copyText(state.currentCommand).then(function (ok) {
            if (ok && state.copyBtn) {
                flashButtonText(state.copyBtn, "term.copied", "term.copy");
            }
            return ok;
        });
    }

    function initTerminal(root) {
        var scope = root || global.document;
        state.root = scope;
        if (!scope || typeof scope.querySelector !== "function") {
            return;
        }

        state.outputEl = scope.querySelector("[data-term-output]");
        state.screenEl = scope.querySelector("[data-term-screen]");
        state.inputEl = scope.querySelector("[data-term-input]");
        state.copyBtn = scope.querySelector("[data-term-copy]");

        var i18n = getI18n();
        var savedTheme = i18n && typeof i18n.safeStorageGet === "function" ? i18n.safeStorageGet(THEME_KEY) : null;
        setPhosphorTheme(savedTheme || "green", scope);

        var presetBtns = scope.querySelectorAll("[data-preset]");
        for (var i = 0; i < presetBtns.length; i++) {
            (function (btn) {
                btn.addEventListener("click", function () {
                    var id = btn.dataset ? btn.dataset.preset : btn.getAttribute("data-preset");
                    loadPreset(id);
                });
            })(presetBtns[i]);
        }

        if (state.copyBtn && typeof state.copyBtn.addEventListener === "function") {
            state.copyBtn.addEventListener("click", function () {
                copyCurrentCommand();
            });
        }

        if (state.inputEl && typeof state.inputEl.addEventListener === "function") {
            state.inputEl.addEventListener("keydown", function (ev) {
                if (ev.key === "Enter") {
                    ev.preventDefault();
                    var val = state.inputEl.value;
                    state.inputEl.value = "";
                    executeCommand(val);
                } else if (ev.key === "ArrowUp") {
                    ev.preventDefault();
                    state.inputEl.value = navigateHistory(-1);
                } else if (ev.key === "ArrowDown") {
                    ev.preventDefault();
                    state.inputEl.value = navigateHistory(1);
                }
            });
        }

        if (typeof scope.querySelectorAll === "function") {
            var quickChips = scope.querySelectorAll("[data-quick-cmd]");
            for (var q = 0; q < quickChips.length; q++) {
                (function (chip) {
                    chip.addEventListener("click", function () {
                        var cmd = chip.dataset ? chip.dataset.quickCmd : chip.getAttribute("data-quick-cmd");
                        if (cmd) {
                            executeCommand(cmd);
                            if (state.inputEl && typeof state.inputEl.focus === "function") {
                                state.inputEl.focus();
                            }
                        }
                    });
                })(quickChips[q]);
            }
        }

        loadPreset("oauth");
    }

    global.CPAHomepage = global.CPAHomepage || {};
    global.CPAHomepage.terminal = {
        presets: presets,
        flagSpecs: {
            server: SERVER_FLAG_SPECS,
            discover: DISCOVER_FLAG_SPECS
        },
        initTerminal: initTerminal,
        loadPreset: loadPreset,
        refreshLocaleText: refreshLocaleText,
        parseCliInvocation: parseCliInvocation,
        executeCommand: executeCommand,
        navigateHistory: navigateHistory,
        setPhosphorTheme: setPhosphorTheme,
        getPhosphorTheme: getPhosphorTheme,
        copyText: copyText,
        copyCurrentCommand: copyCurrentCommand
    };
})(typeof window !== "undefined" ? window : globalThis);
