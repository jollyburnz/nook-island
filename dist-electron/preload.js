import { contextBridge, ipcRenderer } from "electron";
import { CHANNELS } from "./ipc/channels.js";
contextBridge.exposeInMainWorld("nookIsland", {
    // Renderer → Main (invoke/handle pattern)
    submitTask: (desc) => ipcRenderer.invoke(CHANNELS.TASK_SUBMIT, desc),
    approvePlan: (plan) => ipcRenderer.invoke(CHANNELS.PLAN_APPROVE, plan),
    rejectPlan: (reason) => ipcRenderer.invoke(CHANNELS.PLAN_REJECT, reason),
    cancelTask: (id) => ipcRenderer.invoke(CHANNELS.TASK_CANCEL, id),
    readJournal: (id) => ipcRenderer.invoke(CHANNELS.JOURNAL_READ, id),
    openOutput: (id) => ipcRenderer.invoke(CHANNELS.OUTPUT_OPEN, id),
    // Main → Renderer (on pattern)
    onEvent: (cb) => ipcRenderer.on(CHANNELS.ISLAND_EVENT, (_, e) => cb(e)),
    onPlanProposed: (cb) => ipcRenderer.on(CHANNELS.PLAN_PROPOSED, (_, p) => cb(p)),
    onTaskComplete: (cb) => ipcRenderer.on(CHANNELS.TASK_COMPLETE, (_, o) => cb(o)),
    onAgentError: (cb) => ipcRenderer.on(CHANNELS.AGENT_ERROR, (_, e) => cb(e)),
    removeAllListeners: () => Object.values(CHANNELS).forEach(ch => ipcRenderer.removeAllListeners(ch)),
});
//# sourceMappingURL=preload.js.map