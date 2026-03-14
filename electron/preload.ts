import { contextBridge, ipcRenderer } from "electron";
import { CHANNELS } from "./ipc/channels";

contextBridge.exposeInMainWorld("nookIsland", {
  // Renderer → Main (invoke/handle pattern)
  submitTask:  (desc: string)   => ipcRenderer.invoke(CHANNELS.TASK_SUBMIT, desc),
  approvePlan: (plan: unknown)  => ipcRenderer.invoke(CHANNELS.PLAN_APPROVE, plan),
  rejectPlan:  (reason: string) => ipcRenderer.invoke(CHANNELS.PLAN_REJECT, reason),
  cancelTask:  (id: string)     => ipcRenderer.invoke(CHANNELS.TASK_CANCEL, id),
  readJournal: (id: string)     => ipcRenderer.invoke(CHANNELS.JOURNAL_READ, id),
  openOutput:  (id: string)     => ipcRenderer.invoke(CHANNELS.OUTPUT_OPEN, id),

  // Main → Renderer (on pattern)
  onEvent:        (cb: (e: unknown) => void) =>
    ipcRenderer.on(CHANNELS.ISLAND_EVENT,  (_, e) => cb(e)),
  onPlanProposed: (cb: (p: unknown) => void) =>
    ipcRenderer.on(CHANNELS.PLAN_PROPOSED, (_, p) => cb(p)),
  onTaskComplete: (cb: (o: unknown) => void) =>
    ipcRenderer.on(CHANNELS.TASK_COMPLETE, (_, o) => cb(o)),
  onAgentError:   (cb: (e: unknown) => void) =>
    ipcRenderer.on(CHANNELS.AGENT_ERROR,   (_, e) => cb(e)),

  removeAllListeners: () =>
    Object.values(CHANNELS).forEach(ch => ipcRenderer.removeAllListeners(ch)),
});
