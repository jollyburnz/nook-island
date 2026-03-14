"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const path_1 = __importDefault(require("path"));
const handlers_1 = require("./ipc/handlers");
const data_1 = require("./data");
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
const isDev = process.env.NODE_ENV === "development" || !electron_1.app.isPackaged;
function createWindow() {
    const win = new electron_1.BrowserWindow({
        width: 1280,
        height: 800,
        minWidth: 900,
        minHeight: 600,
        title: "Nook Island",
        backgroundColor: "#78b8a0", // cozy island green while loading
        webPreferences: {
            preload: path_1.default.join(__dirname, "preload.js"),
            contextIsolation: true,
            nodeIntegration: false,
            sandbox: false, // needed so preload can use require
        },
    });
    if (isDev) {
        win.loadURL("http://localhost:5173");
        win.webContents.openDevTools();
    }
    else {
        win.loadFile(path_1.default.join(__dirname, "../dist/index.html"));
    }
    (0, handlers_1.registerHandlers)(win);
    // Open external links in the system browser, not Electron
    win.webContents.setWindowOpenHandler(({ url }) => {
        electron_1.shell.openExternal(url);
        return { action: "deny" };
    });
}
electron_1.app.whenReady().then(async () => {
    await (0, data_1.initDataDir)();
    createWindow();
    electron_1.app.on("activate", () => {
        // Re-create window on macOS dock click if no windows are open
        if (electron_1.BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});
electron_1.app.on("window-all-closed", () => {
    // On macOS, apps conventionally stay active until Cmd+Q
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
//# sourceMappingURL=main.js.map