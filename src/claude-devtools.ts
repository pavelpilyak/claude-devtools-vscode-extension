import { existsSync, readFileSync, writeFileSync, mkdirSync } from "fs";
import * as path from "path";
import * as os from "os";
import * as http from "http";

const HOME = os.homedir();

const APP_BUNDLE_PATHS = [
  "/Applications/claude-devtools.app",
  path.join(HOME, "Applications", "claude-devtools.app"),
];

// claude-devtools default port — this is what the app uses, not our choice
const DEFAULT_PORT = 3456;
const CONFIG_PATH = path.join(HOME, ".claude", "claude-devtools-config.json");

function findAppBundle(): string | null {
  for (const p of APP_BUNDLE_PATHS) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function isClaudeDevtoolsInstalled(): boolean {
  return findAppBundle() !== null;
}

/**
 * Check if the claude-devtools HTTP server is reachable.
 */
export function isServerRunning(port = DEFAULT_PORT): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
      res.resume();
      resolve(res.statusCode === 200);
    });
    req.on("error", () => resolve(false));
    req.setTimeout(2000, () => {
      req.destroy();
      resolve(false);
    });
  });
}

/**
 * Ensure ~/.claude/claude-devtools-config.json has httpServer.enabled = true.
 * Returns true if config was changed (app needs restart), false if already set.
 */
function ensureHttpServerConfig(port: number): boolean {
  let config: any = {};

  try {
    const raw = readFileSync(CONFIG_PATH, "utf8");
    config = JSON.parse(raw);
  } catch {
    // File doesn't exist or is invalid — start fresh
  }

  if (config.httpServer?.enabled === true && config.httpServer?.port === port) {
    return false;
  }

  config.httpServer = {
    ...(config.httpServer || {}),
    enabled: true,
    port,
  };

  const dir = path.dirname(CONFIG_PATH);
  mkdirSync(dir, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2) + "\n");
  return true;
}

/**
 * Ensure the HTTP server config exists and the server is reachable.
 * If not, prompt the user to open claude-devtools manually.
 */
export async function ensureServerRunning(port = DEFAULT_PORT): Promise<void> {
  if (await isServerRunning(port)) return;

  ensureHttpServerConfig(port);

  throw new Error(
    "Claude DevTools HTTP server is not running.\n\n" +
    "Please open Claude DevTools manually, then run this command again.\n" +
    "(The HTTP server has been auto-enabled in its config.)"
  );
}

export function getServerUrl(port = DEFAULT_PORT): string {
  return `http://127.0.0.1:${port}`;
}
