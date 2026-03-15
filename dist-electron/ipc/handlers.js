import { ipcMain, shell } from "electron";
import { CHANNELS } from "./channels.js";
import { getTaskPaths } from "../tasks.js";
import { runTwoStepSherb } from "../orchestrator.js";
let pendingPlanApproval = null;
export function registerHandlers(win) {
    ipcMain.handle(CHANNELS.TASK_SUBMIT, async (_event, desc) => {
        void runTwoStepSherb(win, desc, async () => {
            return new Promise((resolve) => {
                pendingPlanApproval = resolve;
            });
        });
        return { ok: true };
    });
    ipcMain.handle(CHANNELS.PLAN_APPROVE, () => {
        pendingPlanApproval?.(true);
        pendingPlanApproval = null;
        return { ok: true };
    });
    ipcMain.handle(CHANNELS.PLAN_REJECT, () => {
        pendingPlanApproval?.(false);
        pendingPlanApproval = null;
        return { ok: true };
    });
    ipcMain.handle(CHANNELS.TASK_CANCEL, () => {
        pendingPlanApproval?.(false);
        pendingPlanApproval = null;
        return { ok: true };
    });
    ipcMain.handle(CHANNELS.JOURNAL_READ, (_event, id) => {
        console.log("[main] readJournal →", id);
        return null;
    });
    ipcMain.handle(CHANNELS.OUTPUT_OPEN, async (_event, id) => {
        const { bottle } = getTaskPaths(id);
        const result = await shell.openPath(bottle);
        return result ? { ok: false, error: result } : { ok: true };
    });
}
//# sourceMappingURL=handlers.js.map