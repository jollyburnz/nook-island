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
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      {sections.length === 0 && !isComplete && (
        <div
          style={{
            background: "#d8ccb6",           // Parchment
            border: "2px solid #9e8364",     // Worn Terra
            borderRadius: 6,
            padding: 14,
            fontSize: 13,
            color: "#3d4e3c",
            opacity: 0.85,
          }}
        >
          ⟳ Waiting for villagers to start…
        </div>
      )}

      {sections.map((section, i) => {
        const active = !section.done && !isComplete;
        return (
          <div
            key={i}
            style={{
              background: "#fff8e7",                                           // Cream Press
              border: `2px solid ${active ? "#f9a916" : "#2b2b26"}`,          // Amber active / Ink done
              borderRadius: 6,
              padding: 14,
              boxShadow: active ? "2px 2px 0 #f9a916" : "2px 2px 0 #2b2b26",
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
              <span style={{ fontSize: 18 }}>
                {VILLAGER_EMOJI[section.agentId] ?? "🏝️"}
              </span>
              <strong style={{ fontSize: 14, color: "#3d4e3c", fontWeight: 800 }}>
                {section.agentId}
              </strong>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: 11,
                  fontWeight: 600,
                  color: active ? "#f9a916" : "#9e8364",   // Amber active / Worn Terra done
                }}
              >
                {section.done || isComplete ? "✓ done" : "⟳ working"}
              </span>
            </div>

            {section.tools.map((tool, j) => (
              <div
                key={j}
                style={{
                  fontSize: 12,
                  padding: "2px 0",
                  color: "#9e8364",           // Worn Terra for tool list
                  display: "flex",
                  gap: 6,
                  alignItems: "center",
                }}
              >
                <span style={{ width: 14, textAlign: "center", color: "#f9a916" }}>
                  {tool.real ? "⚡" : "·"}
                </span>
                <span>{tool.tool}</span>
              </div>
            ))}
          </div>
        );
      })}

      {isComplete && cost !== null && (
        <div
          style={{
            background: "#3d4e3c",          // Undergrowth
            color: "#fff8e7",
            border: "2px solid #2b2b26",
            borderRadius: 6,
            padding: 14,
            textAlign: "center",
            boxShadow: "3px 3px 0 #2b2b26",
          }}
        >
          <div style={{ fontSize: 22, marginBottom: 4 }}>📬</div>
          <div style={{ fontSize: 14, fontWeight: 800 }}>Delivered to mailbox</div>
          <div style={{ fontSize: 12, opacity: 0.75, marginTop: 4 }}>
            Cost: ${cost.toFixed(4)}
          </div>
        </div>
      )}
    </div>
  );
}
