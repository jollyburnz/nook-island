// Type declarations for the IPC bridge exposed by the preload script.
// Consumed by all renderer-side code via window.nookIsland.*

interface NookIslandBridge {
  // Renderer → Main
  submitTask:  (desc: string)   => Promise<{ ok: boolean }>;
  approvePlan: (plan: unknown)  => Promise<{ ok: boolean }>;
  rejectPlan:  (reason: string) => Promise<{ ok: boolean }>;
  cancelTask:  (id: string)     => Promise<{ ok: boolean }>;
  readJournal: (id: string)     => Promise<unknown>;
  openOutput:  (id: string)     => Promise<{ ok: boolean }>;

  // Main → Renderer
  onEvent:            (cb: (e: unknown) => void) => void;
  onPlanProposed:     (cb: (p: unknown) => void) => void;
  onTaskComplete:     (cb: (o: unknown) => void) => void;
  onAgentError:       (cb: (e: unknown) => void) => void;
  removeAllListeners: () => void;
}

declare global {
  interface Window {
    nookIsland: NookIslandBridge;
  }
}

export {};
