"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerHandlers = registerHandlers;
const electron_1 = require("electron");
const channels_1 = require("./channels");
function registerHandlers(win) {
    electron_1.ipcMain.handle(channels_1.CHANNELS.TASK_SUBMIT, (_event, desc) => {
        console.log("[main] submitTask →", desc);
        return { ok: true };
    });
    electron_1.ipcMain.handle(channels_1.CHANNELS.PLAN_APPROVE, (_event, plan) => {
        console.log("[main] approvePlan →", plan);
        return { ok: true };
    });
    electron_1.ipcMain.handle(channels_1.CHANNELS.PLAN_REJECT, (_event, reason) => {
        console.log("[main] rejectPlan →", reason);
        return { ok: true };
    });
    electron_1.ipcMain.handle(channels_1.CHANNELS.TASK_CANCEL, (_event, id) => {
        console.log("[main] cancelTask →", id);
        return { ok: true };
    });
    electron_1.ipcMain.handle(channels_1.CHANNELS.JOURNAL_READ, (_event, id) => {
        console.log("[main] readJournal →", id);
        return null; // Layer 3 will return real journal data
    });
    electron_1.ipcMain.handle(channels_1.CHANNELS.OUTPUT_OPEN, (_event, id) => {
        console.log("[main] openOutput →", id);
        // Layer 7+ will call shell.openPath() with the real bottle file path
        void win; // suppress unused warning until Layer 7
        return { ok: true };
    });
}
//# sourceMappingURL=handlers.js.map