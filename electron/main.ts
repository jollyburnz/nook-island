import { app, BrowserWindow, shell } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { registerHandlers } from "./ipc/handlers.js";
import { initDataDir } from "./data.js";
import { runMapleTest } from "./agentTest.js";

const __dirname = fileURLToPath(new URL(".", import.meta.url));

// Fix PATH for macOS — ensures CLI tools (node, claude) are accessible from main process
// Must be set before createWindow()
if (process.platform === "darwin") {
  process.env.PATH = [
    "/usr/local/bin",
    "/opt/homebrew/bin",
    "/usr/bin",
    "/bin",
    process.env.PATH,
  ]
    .filter(Boolean)
    .join(":");
}

const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Nook Island",
    backgroundColor: "#78b8a0", // cozy island green while loading
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false, // needed so preload can use require
    },
  });

  if (isDev) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  registerHandlers(win);

  // Open external links in the system browser, not Electron
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });
}

app.whenReady().then(async () => {
  await initDataDir();

  // Layer 4 smoke test — remove after Layer 5 is built
  if (process.env.NOOK_LAYER4_TEST === "1") {
    await runMapleTest();
  }

  createWindow();

  app.on("activate", () => {
    // Re-create window on macOS dock click if no windows are open
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  // On macOS, apps conventionally stay active until Cmd+Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});
