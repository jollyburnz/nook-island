// Wires all window.nookIsland IPC listeners → eventBus.
// Call initBridge() once at app startup; call destroyBridge() on teardown.

import { eventBus } from "./eventBus";

let initialized = false;

export function initBridge(): void {
  if (initialized) return;
  if (!window.nookIsland) return; // no-op outside Electron
  initialized = true;

  window.nookIsland.onEvent((e)        => eventBus.emit(e));
  window.nookIsland.onPlanProposed((p) => eventBus.emit(p));
  window.nookIsland.onTaskComplete((o) => eventBus.emit(o));
  window.nookIsland.onAgentError((e)   => eventBus.emit(e));
}

export function destroyBridge(): void {
  if (!window.nookIsland) return; // no-op outside Electron
  window.nookIsland.removeAllListeners();
  initialized = false;
}
