# CLIProxyAPI — 1980s Apple Style CLI Homepage

A zero-dependency, offline-capable static homepage for **CLIProxyAPI**, styled after 1980s Apple editorial print advertisements (Apple Garamond typography, warm cream paper stock, six-color rainbow stripes, Snow White platinum monitor bezel, and Macintosh System 6 window chrome) with an interactive phosphor CLI terminal at its center.

## Directory Layout

```text
docs/homepage/
├── index.html          # Entry HTML (five sections, inline 1-bit & rainbow SVGs)
├── README.md           # Documentation (this file)
├── css/
│   └── apple80s.css    # 1980s Apple design tokens, System 6 chrome, CRT phosphor themes
└── js/
    ├── i18n.js         # Symmetric EN / Simplified Chinese dictionary & safe storage
    ├── terminal.js     # Interactive CLI terminal emulator aligned with cmd/server flags
    └── main.js         # Menu bar controls, clock, smooth navigation, app bootstrap
```

## Preview Locally

### Option 1: Open Directly in Browser

Double-click `docs/homepage/index.html` or open it via `file://`. All scripts use classic `<script defer>` loading without external CDN requests so the page works completely offline.

### Option 2: Serve via Python HTTP Server

```bash
python3 -m http.server 8080 --directory docs/homepage
```

Then visit `http://localhost:8080`.

## Key Features Highlighted

- **Interactive CLI Terminal**: Preset walkthroughs and live command parsing (`help`, `cli-proxy-api -h`, `providers`, `--claude-login`, `--codex-login`, `--tui`, `discover --json`, `clear`) plus P1 Green, P3 Amber, and 1-Bit Monochrome display modes.
- **Bilingual Toggle**: Instant English / Simplified Chinese (`EN / ZH`) switch in the Macintosh System 6 menu bar.
