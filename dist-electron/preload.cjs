"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// CommonJS preload — compiled to dist-electron/preload.cjs
// Must be .cts (not .ts) because "type":"module" in package.json makes .js → ESM,
// and Electron's internal require() cannot load ESM preloads.
//
// Channel strings inlined to avoid CJS→ESM static import issue.
// Keep in sync with electron/ipc/channels.ts.
const electron_1 = require("electron");
// ── channel constants (keep in sync with electron/ipc/channels.ts) ────────────
const TASK_SUBMIT = "island:task:submit";
const PLAN_APPROVE = "island:plan:approve";
const PLAN_REJECT = "island:plan:reject";
const TASK_CANCEL = "island:task:cancel";
const JOURNAL_READ = "island:journal:read";
const OUTPUT_OPEN = "island:output:open";
const ISLAND_EVENT = "island:event";
const PLAN_PROPOSED = "island:plan:proposed";
const TASK_COMPLETE = "island:task:complete";
const AGENT_ERROR = "island:agent:error";
// ─────────────────────────────────────────────────────────────────────────────
electron_1.contextBridge.exposeInMainWorld("nookIsland", {
    // Renderer → Main (invoke/handle pattern)
    submitTask: (desc) => electron_1.ipcRenderer.invoke(TASK_SUBMIT, desc),
    approvePlan: (plan) => electron_1.ipcRenderer.invoke(PLAN_APPROVE, plan),
    rejectPlan: (reason) => electron_1.ipcRenderer.invoke(PLAN_REJECT, reason),
    cancelTask: (id) => electron_1.ipcRenderer.invoke(TASK_CANCEL, id),
    readJournal: (id) => electron_1.ipcRenderer.invoke(JOURNAL_READ, id),
    openOutput: (id) => electron_1.ipcRenderer.invoke(OUTPUT_OPEN, id),
    // Main → Renderer (on pattern)
    onEvent: (cb) => electron_1.ipcRenderer.on(ISLAND_EVENT, (_, e) => cb(e)),
    onPlanProposed: (cb) => electron_1.ipcRenderer.on(PLAN_PROPOSED, (_, p) => cb(p)),
    onTaskComplete: (cb) => electron_1.ipcRenderer.on(TASK_COMPLETE, (_, o) => cb(o)),
    onAgentError: (cb) => electron_1.ipcRenderer.on(AGENT_ERROR, (_, e) => cb(e)),
    removeAllListeners: () => {
        [ISLAND_EVENT, PLAN_PROPOSED, TASK_COMPLETE, AGENT_ERROR,
            TASK_SUBMIT, PLAN_APPROVE, PLAN_REJECT, TASK_CANCEL,
            JOURNAL_READ, OUTPUT_OPEN].forEach(ch => electron_1.ipcRenderer.removeAllListeners(ch));
    },
});
//# sourceMappingURL=preload.cjs.map