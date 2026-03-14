// Layer 1: stub preload — contextBridge wiring added in Layer 2
// The contextIsolation boundary is already enforced by main.ts webPreferences.

// Layer 2 will expose window.nookIsland via contextBridge.exposeInMainWorld()
// using the IPC channels defined in electron/ipc/channels.ts

export {};
