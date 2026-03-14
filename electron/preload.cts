// CommonJS preload — compiled to dist-electron/preload.cjs
// Must be .cts (not .ts) because "type":"module" in package.json makes .js → ESM,
// and Electron's internal require() cannot load ESM preloads.
//
// Channel strings inlined to avoid CJS→ESM static import issue.
// Keep in sync with electron/ipc/channels.ts.
import { contextBridge, ipcRenderer } from "electron";

// ── channel constants (keep in sync with electron/ipc/channels.ts) ────────────
const TASK_SUBMIT   = "island:task:submit";
const PLAN_APPROVE  = "island:plan:approve";
const PLAN_REJECT   = "island:plan:reject";
const TASK_CANCEL   = "island:task:cancel";
const JOURNAL_READ  = "island:journal:read";
const OUTPUT_OPEN   = "island:output:open";
const ISLAND_EVENT  = "island:event";
const PLAN_PROPOSED = "island:plan:proposed";
const TASK_COMPLETE = "island:task:complete";
const AGENT_ERROR   = "island:agent:error";
// ─────────────────────────────────────────────────────────────────────────────

contextBridge.exposeInMainWorld("nookIsland", {
  // Renderer → Main (invoke/handle pattern)
  submitTask:  (desc: string)   => ipcRenderer.invoke(TASK_SUBMIT, desc),
  approvePlan: (plan: unknown)  => ipcRenderer.invoke(PLAN_APPROVE, plan),
  rejectPlan:  (reason: string) => ipcRenderer.invoke(PLAN_REJECT, reason),
  cancelTask:  (id: string)     => ipcRenderer.invoke(TASK_CANCEL, id),
  readJournal: (id: string)     => ipcRenderer.invoke(JOURNAL_READ, id),
  openOutput:  (id: string)     => ipcRenderer.invoke(OUTPUT_OPEN, id),

  // Main → Renderer (on pattern)
  onEvent:        (cb: (e: unknown) => void) =>
    ipcRenderer.on(ISLAND_EVENT,  (_, e) => cb(e)),
  onPlanProposed: (cb: (p: unknown) => void) =>
    ipcRenderer.on(PLAN_PROPOSED, (_, p) => cb(p)),
  onTaskComplete: (cb: (o: unknown) => void) =>
    ipcRenderer.on(TASK_COMPLETE, (_, o) => cb(o)),
  onAgentError:   (cb: (e: unknown) => void) =>
    ipcRenderer.on(AGENT_ERROR,   (_, e) => cb(e)),

  removeAllListeners: () => {
    [ISLAND_EVENT, PLAN_PROPOSED, TASK_COMPLETE, AGENT_ERROR,
     TASK_SUBMIT, PLAN_APPROVE, PLAN_REJECT, TASK_CANCEL,
     JOURNAL_READ, OUTPUT_OPEN].forEach(ch => ipcRenderer.removeAllListeners(ch));
  },
});
