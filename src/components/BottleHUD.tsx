import type { IslandEvent } from "../core/types";

interface Props {
  events: IslandEvent[];
}

const VILLAGER_EMOJI: Record<string, string> = {
  maple: "🐻", zucker: "🐙", marshal: "🐿️", sherb: "🐐",
  piper: "🦜", broccolo: "🐛", lily: "🐸", stitches: "🧸",
};

type BottleState =
  | { status: "idle" }
  | { status: "at"; villager: string }
  | { status: "traveling"; from: string; to: string }
  | { status: "delivered" };

interface PipelineNode {
  villager: string;
  done: boolean;
}

function deriveBottleState(events: IslandEvent[]): {
  state: BottleState;
  pipeline: PipelineNode[];
} {
  let state: BottleState = { status: "idle" };
  const pipeline: PipelineNode[] = [];
  const activated = new Set<string>();

  for (const e of events) {
    if (e.type === "agent_activated") {
      if (!activated.has(e.agentId)) {
        activated.add(e.agentId);
        // Mark previous node done when next activates
        if (pipeline.length > 0) pipeline[pipeline.length - 1].done = true;
        pipeline.push({ villager: e.agentId, done: false });
      }
      state = { status: "at", villager: e.agentId };
    } else if (e.type === "handoff") {
      state = { status: "traveling", from: e.fromAgent, to: e.toAgent };
    } else if (e.type === "task_complete") {
      if (pipeline.length > 0) pipeline[pipeline.length - 1].done = true;
      state = { status: "delivered" };
    }
  }

  return { state, pipeline };
}

export function BottleHUD({ events }: Props) {
  const { state, pipeline } = deriveBottleState(events);
  if (state.status === "idle" || pipeline.length === 0) return null;

  const statusText = (() => {
    if (state.status === "at") {
      const emoji = VILLAGER_EMOJI[state.villager] ?? "🏝️";
      return `${emoji} ${state.villager} is working…`;
    }
    if (state.status === "traveling") {
      const toEmoji = VILLAGER_EMOJI[state.to] ?? "🏝️";
      return `🍾 traveling to ${toEmoji} ${state.to}…`;
    }
    if (state.status === "delivered") {
      return "📬 Delivered to mailbox!";
    }
    return "";
  })();

  return (
    <div
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-start",
      }}
    >
      {/* Pipeline nodes */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 0,
          background: "#fff8e7",
          border: "2px solid #2b2b26",
          borderRadius: 8,
          boxShadow: "3px 3px 0 #2b2b26",
          padding: "8px 12px",
        }}
      >
        {pipeline.map((node, i) => {
          const isActive =
            (state.status === "at" && state.villager === node.villager) ||
            (state.status === "traveling" && state.to === node.villager && !node.done);
          const isTraveling =
            state.status === "traveling" && state.from === node.villager;

          return (
            <div key={node.villager} style={{ display: "flex", alignItems: "center", gap: 0 }}>
              {/* Arrow connector */}
              {i > 0 && (
                <div
                  style={{
                    width: 22,
                    textAlign: "center",
                    fontSize: 11,
                    color: pipeline[i - 1].done ? "#3d4e3c" : "#c4b89a",
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {isTraveling ? "🍾" : "→"}
                </div>
              )}

              {/* Node */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 2,
                  padding: "4px 7px",
                  borderRadius: 6,
                  background: isActive
                    ? "#f9a916"
                    : node.done
                    ? "#3d4e3c"
                    : "#e8dcc8",
                  border: `1.5px solid ${isActive ? "#c07d00" : node.done ? "#2b2b26" : "#c4b89a"}`,
                  transition: "background 0.2s",
                  minWidth: 38,
                }}
              >
                <span style={{ fontSize: 16, lineHeight: 1 }}>
                  {VILLAGER_EMOJI[node.villager] ?? "🏝️"}
                </span>
                <span
                  style={{
                    fontSize: 9,
                    fontWeight: 700,
                    color: isActive ? "#2b2b26" : node.done ? "#fff8e7" : "#7a6a52",
                    letterSpacing: 0.3,
                    textTransform: "uppercase",
                  }}
                >
                  {node.villager}
                </span>
              </div>
            </div>
          );
        })}

        {/* Delivered mailbox cap */}
        {state.status === "delivered" && (
          <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
            <div style={{ width: 22, textAlign: "center", fontSize: 11, color: "#3d4e3c", fontWeight: 700 }}>
              →
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "4px 7px",
                borderRadius: 6,
                background: "#3d4e3c",
                border: "1.5px solid #2b2b26",
                minWidth: 38,
              }}
            >
              <span style={{ fontSize: 16, lineHeight: 1 }}>📬</span>
              <span style={{ fontSize: 9, fontWeight: 700, color: "#fff8e7", letterSpacing: 0.3, textTransform: "uppercase" }}>
                done
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status line */}
      <div
        style={{
          background: "#fff8e7",
          border: "2px solid #2b2b26",
          borderRadius: 6,
          boxShadow: "3px 3px 0 #2b2b26",
          padding: "5px 12px",
          fontSize: 12,
          fontWeight: 600,
          color: state.status === "delivered" ? "#3d4e3c" : "#2b2b26",
          fontFamily: "'Nunito', 'Rubik', system-ui, sans-serif",
        }}
      >
        {statusText}
      </div>
    </div>
  );
}
