import type { IslandEvent } from "../core/types";

interface Props {
  events: IslandEvent[];
  cost: number | null;
}

const VILLAGER_EMOJI: Record<string, string> = {
  maple: "🐻",
  zucker: "🐙",
  marshal: "🐿️",
  sherb: "🐐",
  piper: "🦜",
  broccolo: "🐛",
  lily: "🐸",
  stitches: "🧸",
};

type ToolCallEvent = Extract<IslandEvent, { type: "tool_call" }>;

interface AgentSection {
  agentId: string;
  tools: ToolCallEvent[];
  done: boolean;
}

function buildAgentSections(events: IslandEvent[]): AgentSection[] {
  const sections: AgentSection[] = [];
  let current: AgentSection | null = null;

  for (const e of events) {
    if (e.type === "agent_activated") {
      if (current) current.done = true;
      current = { agentId: e.agentId, tools: [], done: false };
      sections.push(current);
    } else if (e.type === "tool_call" && current) {
      current.tools.push(e);
    } else if (e.type === "handoff" && current) {
      current.done = true;
    }
  }

  return sections;
}

export function WorkflowPanel({ events, cost }: Props) {
  const sections = buildAgentSections(events);
  const isComplete = events.some((e) => e.type === "task_complete");

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
      {sections.length === 0 && !isComplete && (
        <div
          style={{
            background: "#e8f5ef",
            border: "2px solid #4caf82",
            borderRadius: 10,
            padding: 16,
            fontSize: 14,
            color: "#2d5a3d",
            opacity: 0.8,
          }}
        >
          ⟳ Waiting for villagers to start…
        </div>
      )}

      {sections.map((section, i) => (
        <div
          key={i}
          style={{
            background: section.done || isComplete ? "#f0f7f4" : "#e8f5ef",
            border: `2px solid ${section.done || isComplete ? "#a8d5be" : "#4caf82"}`,
            borderRadius: 10,
            padding: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: section.tools.length > 0 ? 8 : 0,
            }}
          >
            <span style={{ fontSize: 20 }}>
              {VILLAGER_EMOJI[section.agentId] ?? "🏝️"}
            </span>
            <strong style={{ fontSize: 15, color: "#2d5a3d" }}>
              {section.agentId}
            </strong>
            <span
              style={{
                marginLeft: "auto",
                fontSize: 12,
                color: section.done ? "#2d5a3d" : "#4caf82",
              }}
            >
              {section.done ? "✓ done" : "⟳ working"}
            </span>
          </div>

          {section.tools.map((tool, j) => (
            <div
              key={j}
              style={{
                fontSize: 12,
                padding: "3px 0",
                color: "#555",
                display: "flex",
                gap: 6,
                alignItems: "center",
              }}
            >
              <span style={{ width: 14, textAlign: "center" }}>
                {tool.real ? "⚡" : "·"}
              </span>
              <span>{tool.tool}</span>
            </div>
          ))}
        </div>
      ))}

      {isComplete && cost !== null && (
        <div
          style={{
            background: "#2d5a3d",
            color: "#fff",
            borderRadius: 10,
            padding: 16,
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: 24, marginBottom: 4 }}>📬</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Delivered to mailbox</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>
            Cost: ${cost.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}
