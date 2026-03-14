// IPC channel names shared between main process and preload.
// Defined here so both sides always use the same string literals.
export const CHANNELS = {
    // Renderer → Main
    TASK_SUBMIT: "island:task:submit",
    PLAN_APPROVE: "island:plan:approve",
    PLAN_REJECT: "island:plan:reject",
    TASK_CANCEL: "island:task:cancel",
    JOURNAL_READ: "island:journal:read",
    OUTPUT_OPEN: "island:output:open",
    // Main → Renderer
    ISLAND_EVENT: "island:event",
    PLAN_PROPOSED: "island:plan:proposed",
    TASK_COMPLETE: "island:task:complete",
    AGENT_ERROR: "island:agent:error",
    NOTIFICATION: "island:notification",
};
//# sourceMappingURL=channels.js.map