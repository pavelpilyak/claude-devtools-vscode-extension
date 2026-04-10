# Claude DevTools Panel

Embed [Claude DevTools](https://github.com/matt1398/claude-devtools) as a tab inside Cursor/VS Code.

Claude DevTools visualizes your Claude Code sessions — file operations, token usage, tool calls, subagent traces, and more.

## Prerequisites

- **macOS** (Windows/Linux not yet supported)
- **Claude DevTools** — `brew install --cask claude-devtools`

## Installation

1. Download the latest `.vsix` from the [Releases page](https://github.com/pavelpilyak/claude-devtools-vscode-extension/releases).
2. In Cursor/VS Code: `Cmd+Shift+P` → **Extensions: Install from VSIX…** → pick the downloaded file.

Or from the command line:

```sh
cursor --install-extension claude-devtools-panel-0.3.0.vsix
# or
code --install-extension claude-devtools-panel-0.3.0.vsix
```

## Usage

1. Open the Claude DevTools app
2. `Cmd+Shift+P` → **Claude DevTools: Open**

The extension auto-configures the Claude DevTools HTTP server on first run and loads the full UI in a Cursor tab.

## How it works

Claude DevTools includes a built-in HTTP server (Fastify on `localhost:3456`). The extension enables it via `~/.claude/claude-devtools-config.json` and loads the UI in a webview iframe.

No API keys or network access required — it reads session logs from `~/.claude/` on your machine.

## Credits

This extension is just a thin wrapper around [matt1398/claude-devtools](https://github.com/matt1398/claude-devtools) — all the actual visualization work is theirs. Go star their repo.
