"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const channels_1 = require("./ipc/channels");
electron_1.contextBridge.exposeInMainWorld("nookIsland", {
    // Renderer → Main (invoke/handle pattern)
    submitTask: (desc) => electron_1.ipcRenderer.invoke(channels_1.CHANNELS.TASK_SUBMIT, desc),
    approvePlan: (plan) => electron_1.ipcRenderer.invoke(channels_1.CHANNELS.PLAN_APPROVE, plan),
    rejectPlan: (reason) => electron_1.ipcRenderer.invoke(channels_1.CHANNELS.PLAN_REJECT, reason),
    cancelTask: (id) => electron_1.ipcRenderer.invoke(channels_1.CHANNELS.TASK_CANCEL, id),
    readJournal: (id) => electron_1.ipcRenderer.invoke(channels_1.CHANNELS.JOURNAL_READ, id),
    openOutput: (id) => electron_1.ipcRenderer.invoke(channels_1.CHANNELS.OUTPUT_OPEN, id),
    // Main → Renderer (on pattern)
    onEvent: (cb) => electron_1.ipcRenderer.on(channels_1.CHANNELS.ISLAND_EVENT, (_, e) => cb(e)),
    onPlanProposed: (cb) => electron_1.ipcRenderer.on(channels_1.CHANNELS.PLAN_PROPOSED, (_, p) => cb(p)),
    onTaskComplete: (cb) => electron_1.ipcRenderer.on(channels_1.CHANNELS.TASK_COMPLETE, (_, o) => cb(o)),
    onAgentError: (cb) => electron_1.ipcRenderer.on(channels_1.CHANNELS.AGENT_ERROR, (_, e) => cb(e)),
    removeAllListeners: () => Object.values(channels_1.CHANNELS).forEach(ch => electron_1.ipcRenderer.removeAllListeners(ch)),
});
//# sourceMappingURL=preload.js.map