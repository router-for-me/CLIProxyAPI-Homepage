/*
 * CLIProxyAPI — Bilingual Dictionary & Safe Storage State Module
 * Provides English (default) and Simplified Chinese UI copy with graceful fallback
 * when browser storage is unavailable (e.g., strict privacy mode or file:// protocol).
 */
(function (global) {
    "use strict";

    var STORAGE_KEY = "cpa_homepage_locale";
    var memoryStore = {};
    var listeners = [];

    function safeStorageGet(key) {
        try {
            if (global.localStorage && typeof global.localStorage.getItem === "function") {
                var val = global.localStorage.getItem(key);
                if (typeof val === "string") {
                    return val;
                }
            }
        } catch (_err) {
            // Fall back silently to in-memory map when storage is blocked.
        }
        return Object.prototype.hasOwnProperty.call(memoryStore, key) ? memoryStore[key] : null;
    }

    function safeStorageSet(key, value) {
        memoryStore[key] = String(value);
        try {
            if (global.localStorage && typeof global.localStorage.setItem === "function") {
                global.localStorage.setItem(key, String(value));
            }
        } catch (_err) {
            // Keep value in memoryStore only when localStorage throws.
        }
    }

    var dictionaries = {
        en: {
            "nav.overview": "Overview",
            "nav.terminal": "Terminal",
            "nav.topology": "Architecture",
            "nav.capabilities": "Capabilities",
            "nav.quickstart": "Quick Start",
            "crt.green": "CRT: P1 Green",
            "crt.amber": "CRT: P3 Amber",
            "crt.mono": "CRT: 1-Bit",
            "hero.badge": "CLI PROXY SERVER · GO 1.26+ · MIT OPEN SOURCE",
            "hero.title": "Introducing CLIProxyAPI.",
            "hero.subtitle": "One command line. Every frontier model.",
            "hero.lead": "A compiled Go command-line proxy server that turns your CLI OAuth subscriptions and API keys into unified OpenAI, Gemini, Claude, Codex, and Grok compatible local endpoints—with round-robin load balancing and a built-in terminal UI.",
            "hero.ctaQuickstart": "Start in Terminal",
            "hero.ctaDocs": "Read the Manual",
            "hero.ctaGithub": "GitHub Repository",
            "term.preset.oauth": "01 · OAuth Login",
            "term.preset.routing": "02 · Proxy & Routing",
            "term.preset.tui": "03 · Terminal UI (--tui)",
            "term.preset.discover": "04 · LAN Discover",
            "term.copy": "Copy Command",
            "term.copied": "Copied!",
            "term.windowTitle": "cli-proxy-api — ttys000 — 80x24",
            "term.inputLabel": "Enter a CLIProxyAPI demo command",
            "term.placeholder": "Type 'help', 'providers', 'discover --json', or '--claude-login' and press Return...",
            "term.chinBrand": "Macintosh CLI Edition · Port 8317",
            "term.tryLabel": "Try:",
            "term.powerReady": "ONLINE",
            "term.unknownCmd": "Command not recognized in demo shell. Type 'help' or click a preset above.",
            "term.welcomeHint": "Interactive CLI shell ready. Click a preset button above or type 'help' below.",
            "topo.kicker": "SYSTEM ARCHITECTURE",
            "topo.title": "Built like a UNIX tool. Speaks every modern AI protocol.",
            "topo.desc": "Point Claude Code, Codex CLI, OpenAI SDKs, or Gemini clients at localhost:8317. CLIProxyAPI normalizes reasoning budgets, translates wire protocols, and rotates accounts automatically.",
            "topo.windowTitle": "Routing_Topology.txt — Read-Only",
            "topo.caption": "Canonical Thinking Pipeline -> Protocol Translator -> Per-Provider Runtime Executor (Streaming SSE, Non-Streaming & WebSockets).",
            "cap.kicker": "BUILT FOR THE COMMAND LINE",
            "cap.title": "Six reasons developers live in CLIProxyAPI.",
            "cap.desc": "No bloated GUI wrappers required—just a single compiled Go binary designed for shells, SSH sessions, containers, and local workstations.",
            "cap.c1.title": "Zero-Key CLI OAuth",
            "cap.c1.desc": "Authenticate Codex, Claude Code, Antigravity, Kimi, xAI, Meta, and Devin directly from your terminal, including headless --no-browser and device-code flows.",
            "cap.c2.title": "Universal Protocol Bridge",
            "cap.c2.desc": "Expose OpenAI (Chat & Responses), Anthropic Messages, and Gemini (including Interactions) endpoints with streaming SSE, WebSockets, tools, and vision.",
            "cap.c3.title": "Multi-Account Round-Robin",
            "cap.c3.desc": "Pool multiple CLI subscriptions and API keys per provider. Requests rotate across healthy credentials automatically to smooth out rate limits.",
            "cap.c4.title": "Bubbletea Terminal UI",
            "cap.c4.desc": "Launch an interactive full-screen terminal dashboard with --tui --standalone to inspect accounts, manage API keys, trigger OAuth, and tail live logs.",
            "cap.c5.title": "LAN Gateway Discovery",
            "cap.c5.desc": "Run cli-proxy-api discover to scan _ai-gateway._tcp via DNS-SD on your local network, with clean --json output ready for shell pipelines.",
            "cap.c6.title": "Embeddable Go SDK & Stores",
            "cap.c6.desc": "Embed sdk/cliproxy directly into Go services, hot-reload YAML config, and persist credentials on disk, PostgreSQL, Git, or Object Storage.",
            "prov.kicker": "SUPPORTED UPSTREAM CHANNELS & CLI FLAGS",
            "prov.openai.models": "GPT-6 Astra / Sol / Terra / Luna & Codex OAuth",
            "prov.claude.models": "Claude Fable 5.1, Opus 5.5, Sonnet 5.5, Haiku 5.5",
            "prov.gemini.models": "Gemini 4 Argon, 3.8 Flash, AI Studio, Vertex & Antigravity",
            "prov.kimi.models": "Kimi K3.1 Pro, K3 (1M context) via OAuth or API Key",
            "prov.xai.models": "Grok 4.7 & Grok Build via CLI OAuth or API Key",
            "prov.meta.models": "Muse Wonder Full, Muse Wonder & Muse Spark 1.3",
            "prov.devin.models": "SWE-2, SWE-2 Flash & routed account models",
            "qs.kicker": "THREE-STEP TERMINAL SETUP",
            "qs.title": "Up and routing in sixty seconds.",
            "qs.desc": "Build from Go 1.26+ source or download a prebuilt binary, log in from your shell, and start serving requests locally.",
            "qs.s1.step": "STEP 01 · BUILD & CONFIG",
            "qs.s1.title": "Compile the CLI binary",
            "qs.s1.desc": "Build the single Go binary and initialize config.yaml from the included template.",
            "qs.s2.step": "STEP 02 · AUTHENTICATE",
            "qs.s2.title": "Log in via CLI OAuth",
            "qs.s2.desc": "Sign in with one flag—credentials are stored cleanly under auths/ for round-robin routing.",
            "qs.s3.step": "STEP 03 · SERVE OR TUI",
            "qs.s3.title": "Launch server or Terminal UI",
            "qs.s3.desc": "Run headless in the background or open the built-in Bubbletea TUI console.",
            "qs.copy": "Copy",
            "qs.copied": "Copied",
            "footer.colophon": "CLIProxyAPI — Crafted for the command line in the spirit of 1984 personal computing. Open-source under the MIT License.",
            "footer.linkGithub": "GitHub",
            "footer.linkDocs": "Documentation",
            "footer.linkMgmt": "Management API",
            "footer.linkDesktop": "EasyCLIProxyAPI Desktop"
        },
        zh: {
            "nav.overview": "概览",
            "nav.terminal": "命令行终端",
            "nav.topology": "路由架构",
            "nav.capabilities": "核心特性",
            "nav.quickstart": "快速上手",
            "crt.green": "显像: P1 翠绿",
            "crt.amber": "显像: P3 琥珀",
            "crt.mono": "显像: 1-Bit 黑白",
            "hero.badge": "命令行代理服务器 · GO 1.26+ · MIT 开源协议",
            "hero.title": "认识 CLIProxyAPI。",
            "hero.subtitle": "一行命令，统御前沿模型。",
            "hero.lead": "一款由 Go 编译而成的纯正命令行代理服务器——只需在终端执行简单的 OAuth 登录，即可将多平台 CLI 订阅与密钥统一转换为兼容 OpenAI、Gemini、Claude、Codex 与 Grok 的本地标准 API 端点，原生内置多账号轮询负载均衡与终端管理界面。",
            "hero.ctaQuickstart": "三步终端上手",
            "hero.ctaDocs": "阅读官方文档",
            "hero.ctaGithub": "GitHub 代码仓库",
            "term.preset.oauth": "01 · OAuth 登录",
            "term.preset.routing": "02 · 代理与轮询路由",
            "term.preset.tui": "03 · 终端面板 (--tui)",
            "term.preset.discover": "04 · 局域网发现",
            "term.copy": "复制命令",
            "term.copied": "已复制！",
            "term.windowTitle": "cli-proxy-api — ttys000 — 80x24",
            "term.inputLabel": "输入 CLIProxyAPI 演示命令",
            "term.placeholder": "输入 'help'、'providers'、'discover --json' 或 '--claude-login' 后按回车...",
            "term.chinBrand": "Macintosh 命令行特别版 · 端口 8317",
            "term.tryLabel": "试试：",
            "term.powerReady": "运行中",
            "term.unknownCmd": "演示终端未识别该命令。请输入 'help' 查看可用指令，或点击上方场景按钮。",
            "term.welcomeHint": "交互式 CLI 终端已就绪 —— 点击上方预设按钮，或在下方输入 'help' 体验。",
            "topo.kicker": "系统路由架构",
            "topo.title": "恪守 UNIX 命令行哲学，贯通现代 AI 协议。",
            "topo.desc": "将 Claude Code、Codex CLI、OpenAI SDK 或 Gemini 客户端接入本地 8317 端口，CLIProxyAPI 自动完成思考配置归一化、协议互转与多账户健康轮询。",
            "topo.windowTitle": "Routing_Topology.txt — 只读架构视图",
            "topo.caption": "标准思考归一化管道（Canonical Thinking）-> 跨协议转换器 -> 多提供商运行时执行器（支持流式 SSE、非流式与 WebSocket）。",
            "cap.kicker": "专为命令行而生",
            "cap.title": "令终端开发者钟爱 CLIProxyAPI 的六大理由。",
            "cap.desc": "告别臃肿套壳界面——单个轻量级 Go 编译二进制文件，从容胜任本地终端、远程 SSH 会话与容器化部署。",
            "cap.c1.title": "免密钥 CLI OAuth 授权",
            "cap.c1.desc": "一行命令完成 Codex、Claude Code、Antigravity、Kimi、xAI、Meta 与 Devin 登录，支持无头服务器 --no-browser 与设备码模式。",
            "cap.c2.title": "全协议无缝桥接转换",
            "cap.c2.desc": "同时暴露 OpenAI（Chat 与 Responses）、Anthropic Messages 及 Gemini（含 Interactions）兼容接口，支持流式、WebSocket、工具调用与多模态。",
            "cap.c3.title": "多账户轮询负载均衡",
            "cap.c3.desc": "同一提供商可挂载多个 CLI 订阅账号或 API 密钥，自动在健康凭据间轮询调度以分摊限流配额。",
            "cap.c4.title": "内置 Bubbletea 终端面板",
            "cap.c4.desc": "通过 --tui --standalone 直接在终端内启动全屏交互式管理台，一站式查看状态、管理密钥、触发 OAuth 并追踪实时日志。",
            "cap.c5.title": "局域网网关零配置发现",
            "cap.c5.desc": "内置 cli-proxy-api discover 子命令，基于 DNS-SD 扫描局域网 _ai-gateway._tcp 实例，支持 --json 纯净输出供脚本管道消费。",
            "cap.c6.title": "可嵌入 Go SDK 与多元存储",
            "cap.c6.desc": "提供 sdk/cliproxy 可直接嵌入自有 Go 服务，支持配置热重载以及本地文件、PostgreSQL、Git 与对象存储后端。",
            "prov.kicker": "原生支持的上游渠道与 CLI 参数",
            "prov.openai.models": "GPT-6 Astra / Sol / Terra / Luna 与 Codex OAuth",
            "prov.claude.models": "Claude Fable 5.1、Opus 5.5、Sonnet 5.5、Haiku 5.5",
            "prov.gemini.models": "Gemini 4 Argon、3.8 Flash、AI Studio、Vertex 与 Antigravity",
            "prov.kimi.models": "Kimi K3.1 Pro、K3（百万上下文）OAuth 或 API Key",
            "prov.xai.models": "Grok 4.7 与 Grok Build（支持 CLI OAuth 登录）",
            "prov.meta.models": "Muse Wonder Full、Muse Wonder 与 Muse Spark 1.3",
            "prov.devin.models": "SWE-2、SWE-2 Flash 及账户路由模型",
            "qs.kicker": "三步终端部署",
            "qs.title": "六十秒内，在命令行完成启动与路由。",
            "qs.desc": "使用 Go 1.26+ 编译源码或直接运行预编译二进制，在终端登录账号即可立即开始代理请求。",
            "qs.s1.step": "步骤 01 · 编译与配置",
            "qs.s1.title": "构建 CLI 二进制文件",
            "qs.s1.desc": "编译单文件二进制，并从示例模板复制生成本地 config.yaml。",
            "qs.s2.step": "步骤 02 · 终端登录",
            "qs.s2.title": "执行 CLI OAuth 授权",
            "qs.s2.desc": "使用对应提供商登录标志完成授权，凭据自动存入 auths/ 目录参与轮询。",
            "qs.s3.step": "步骤 03 · 启动服务或 TUI",
            "qs.s3.title": "启动代理或进入终端面板",
            "qs.s3.desc": "直接启动高性能 HTTP 代理，或加上 --tui --standalone 打开交互式终端界面。",
            "qs.copy": "复制",
            "qs.copied": "已复制",
            "footer.colophon": "CLIProxyAPI —— 致敬 1984 个人计算黄金时代，专为命令行匠心打造。基于 MIT 许可证开源。",
            "footer.linkGithub": "GitHub 仓库",
            "footer.linkDocs": "用户手册",
            "footer.linkMgmt": "管理 API 文档",
            "footer.linkDesktop": "EasyCLIProxyAPI 桌面版"
        }
    };

    var currentLocale = "en";
    var saved = safeStorageGet(STORAGE_KEY);
    if (saved === "zh" || saved === "en") {
        currentLocale = saved;
    }

    function normalizeLocale(locale) {
        return locale === "zh" ? "zh" : "en";
    }

    function getLocale() {
        return currentLocale;
    }

    function t(key, localeOverride) {
        var lang = localeOverride ? normalizeLocale(localeOverride) : currentLocale;
        var table = dictionaries[lang] || dictionaries.en;
        if (Object.prototype.hasOwnProperty.call(table, key)) {
            return table[key];
        }
        if (Object.prototype.hasOwnProperty.call(dictionaries.en, key)) {
            return dictionaries.en[key];
        }
        return key;
    }

    function applyTranslations(root) {
        var scope = root || global.document;
        if (!scope || typeof scope.querySelectorAll !== "function") {
            return;
        }
        if (scope.documentElement) {
            scope.documentElement.lang = currentLocale === "zh" ? "zh-CN" : "en";
        }

        var textNodes = scope.querySelectorAll("[data-i18n]");
        for (var i = 0; i < textNodes.length; i++) {
            var el = textNodes[i];
            var key = el.dataset ? el.dataset.i18n : el.getAttribute("data-i18n");
            if (key) {
                el.textContent = t(key);
            }
        }

        var placeholderNodes = scope.querySelectorAll("[data-i18n-placeholder]");
        for (var j = 0; j < placeholderNodes.length; j++) {
            var inputEl = placeholderNodes[j];
            var pKey = inputEl.dataset
                ? inputEl.dataset.i18nPlaceholder
                : inputEl.getAttribute("data-i18n-placeholder");
            if (pKey) {
                inputEl.placeholder = t(pKey);
            }
        }

        var toggleBtns = scope.querySelectorAll("[data-lang-toggle]");
        for (var k = 0; k < toggleBtns.length; k++) {
            var btn = toggleBtns[k];
            var targetLang = btn.dataset ? btn.dataset.langToggle : btn.getAttribute("data-lang-toggle");
            var active = targetLang === currentLocale;
            if (btn.classList && typeof btn.classList.toggle === "function") {
                btn.classList.toggle("is-active", active);
            }
            if (typeof btn.setAttribute === "function") {
                btn.setAttribute("aria-pressed", active ? "true" : "false");
            }
        }
    }

    function setLocale(locale, root) {
        var nextLocale = normalizeLocale(locale);
        var changed = nextLocale !== currentLocale;
        currentLocale = nextLocale;
        safeStorageSet(STORAGE_KEY, currentLocale);
        applyTranslations(root);
        if (changed) {
            for (var i = 0; i < listeners.length; i++) {
                try {
                    listeners[i](currentLocale);
                } catch (_err) {
                    // Keep remaining listeners running cleanly.
                }
            }
        }
        return currentLocale;
    }

    function onLocaleChange(fn) {
        if (typeof fn === "function") {
            listeners.push(fn);
        }
    }

    global.CPAHomepage = global.CPAHomepage || {};
    global.CPAHomepage.i18n = {
        dictionaries: dictionaries,
        getLocale: getLocale,
        setLocale: setLocale,
        t: t,
        applyTranslations: applyTranslations,
        onLocaleChange: onLocaleChange,
        safeStorageGet: safeStorageGet,
        safeStorageSet: safeStorageSet
    };
})(typeof window !== "undefined" ? window : globalThis);
