// Typed events that flow through the renderer event bus.
// Main process emits these via CHANNELS.ISLAND_EVENT (from Layer 8 onward).
// During the smoke test (Layers 4-7), raw SDK messages arrive instead —
// they are emitted as `unknown` and will match once the main process sends
// proper typed events.

export type IslandEvent =
  | { type: "task_received";   taskId: string; description: string; timestamp: string }
  | { type: "plan_proposed";   taskId: string; agentId: string; plan: unknown[] }
  | { type: "plan_approved";   taskId: string; plan: unknown[] }
  | { type: "agent_activated"; taskId: string; agentId: string }
  | { type: "thought";         taskId: string; agentId: string; text: string }
  | { type: "tool_call";       taskId: string; agentId: string; tool: string; args: unknown; real: boolean }
  | { type: "tool_result";     taskId: string; agentId: string; tool: string; result: unknown; real: boolean }
  | { type: "handoff";         taskId: string; fromAgent: string; toAgent: string; summary?: string }
  | { type: "task_complete";   taskId: string; outputPath: string; cost_usd: number }
  | { type: "agent_error";     taskId: string; agentId: string; error: string };
