import * as vscode from "vscode";
import {
  isClaudeDevtoolsInstalled,
  ensureServerRunning,
  getServerUrl,
} from "./claude-devtools";

export function activate(context: vscode.ExtensionContext) {
  let devtoolsPanel: vscode.WebviewPanel | undefined;

  const openDevtools = vscode.commands.registerCommand(
    "claude-devtools-panel.open",
    async () => {
      if (process.platform !== "darwin") {
        const action = await vscode.window.showErrorMessage(
          "Claude DevTools Panel currently supports macOS only.",
          "Learn More"
        );
        if (action === "Learn More") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://github.com/matt1398/claude-devtools")
          );
        }
        return;
      }

      if (devtoolsPanel) {
        devtoolsPanel.reveal(vscode.ViewColumn.Beside);
        return;
      }

      if (!isClaudeDevtoolsInstalled()) {
        const action = await vscode.window.showErrorMessage(
          "Claude DevTools is not installed.",
          "Install with Homebrew",
          "Open GitHub"
        );
        if (action === "Install with Homebrew") {
          const terminal = vscode.window.createTerminal("Install Claude DevTools");
          terminal.show();
          terminal.sendText("brew install --cask claude-devtools");
        } else if (action === "Open GitHub") {
          vscode.env.openExternal(
            vscode.Uri.parse("https://github.com/matt1398/claude-devtools")
          );
        }
        return;
      }

      try {
        await ensureServerRunning();
      } catch {
        vscode.window.showErrorMessage(
          "Claude DevTools is not running. Please open the Claude DevTools app first, then try again."
        );
        return;
      }

      const serverUrl = getServerUrl();

      devtoolsPanel = vscode.window.createWebviewPanel(
        "claude-devtools-panel",
        "Claude DevTools",
        vscode.ViewColumn.Beside,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        }
      );

      devtoolsPanel.webview.html = getDevtoolsHtml(serverUrl);

      devtoolsPanel.onDidDispose(() => {
        devtoolsPanel = undefined;
      });
    }
  );

  context.subscriptions.push(openDevtools);
}

function getDevtoolsHtml(serverUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en" style="height:100%;margin:0;padding:0;">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="Content-Security-Policy"
    content="default-src 'none'; frame-src ${serverUrl}; style-src 'unsafe-inline';">
  <style>
    body { margin: 0; padding: 0; height: 100vh; overflow: hidden; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${serverUrl}"></iframe>
</body>
</html>`;
}

export function deactivate() {}
