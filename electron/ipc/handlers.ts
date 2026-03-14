import { ipcMain, BrowserWindow } from "electron";
import { CHANNELS } from "./channels.js";

export function registerHandlers(win: BrowserWindow): void {
  ipcMain.handle(CHANNELS.TASK_SUBMIT, (_event, desc: string) => {
    console.log("[main] submitTask →", desc);
    return { ok: true };
  });

  ipcMain.handle(CHANNELS.PLAN_APPROVE, (_event, plan: unknown) => {
    console.log("[main] approvePlan →", plan);
    return { ok: true };
  });

  ipcMain.handle(CHANNELS.PLAN_REJECT, (_event, reason: string) => {
    console.log("[main] rejectPlan →", reason);
    return { ok: true };
  });

  ipcMain.handle(CHANNELS.TASK_CANCEL, (_event, id: string) => {
    console.log("[main] cancelTask →", id);
    return { ok: true };
  });

  ipcMain.handle(CHANNELS.JOURNAL_READ, (_event, id: string) => {
    console.log("[main] readJournal →", id);
    return null; // Layer 3 will return real journal data
  });

  ipcMain.handle(CHANNELS.OUTPUT_OPEN, (_event, id: string) => {
    console.log("[main] openOutput →", id);
    // Layer 7+ will call shell.openPath() with the real bottle file path
    void win; // suppress unused warning until Layer 7
    return { ok: true };
  });
}
