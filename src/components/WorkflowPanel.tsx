import { useEffect, useRef } from "react";
import type { IslandEvent } from "../core/types";

interface Props {
  events: IslandEvent[];
  cost: number | null;
}

const VILLAGER_EMOJI: Record<string, string> = {
  maple: "🐻", zucker: "🐙", marshal: "🐿️", sherb: "🐐",
  piper: "🦜", broccolo: "🐛", lily: "🐸", stitches: "🧸",
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
  const activeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [sections.length, sections[sections.length - 1]?.tools.length]);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>

      {/* Header */}
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color: "#9e8364",
          paddingBottom: 4,
          borderBottom: "1.5px solid #d8ccb6",
        }}
      >
        🏝️ Village Pipeline
      </div>

      {/* Waiting state */}
      {sections.length === 0 && !isComplete && (
        <div
          style={{
            background: "#f0e8d8",
            border: "1.5px dashed #c4b89a",
            borderRadius: 6,
            padding: "10px 12px",
            fontSize: 12,
            color: "#9e8364",
          }}
        >
          ⟳ Waiting for villagers…
        </div>
      )}

      {/* Agent cards */}
      {sections.map((section, i) => {
        const active = !section.done && !isComplete;
        return (
          <div
            key={i}
            ref={active ? activeRef : null}
            style={{
              background: active ? "#fffdf4" : "#f8f2e4",
              border: `2px solid ${active ? "#f9a916" : "#c4b89a"}`,
              borderRadius: 6,
              padding: "10px 12px",
              boxShadow: active ? "2px 2px 0 #f9a916" : "none",
              transition: "border-color 0.2s, box-shadow 0.2s",
            }}
          >
            {/* Agent header row */}
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 17 }}>
                {VILLAGER_EMOJI[section.agentId] ?? "🏝️"}
              </span>
              <span style={{ fontSize: 13, fontWeight: 800, color: "#2b2b26", flex: 1 }}>
                {section.agentId}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  color: active ? "#f9a916" : section.done || isComplete ? "#3d4e3c" : "#9e8364",
                  background: active ? "#fff3c8" : section.done || isComplete ? "#d4eacc" : "transparent",
                  padding: active || section.done || isComplete ? "2px 6px" : undefined,
                  borderRadius: 4,
                }}
              >
                {section.done || isComplete ? "✓ done" : "⟳ working"}
              </span>
            </div>

            {/* Tool list */}
            {section.tools.length > 0 && (
              <div
                style={{
                  marginTop: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 3,
                  paddingLeft: 4,
                  borderLeft: "2px solid #e8dcc8",
                }}
              >
                {section.tools.map((tool, j) => (
                  <div
                    key={j}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      fontSize: 11,
                      color: "#7a6a52",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 10,
                        lineHeight: 1,
                        color: tool.real ? "#f9a916" : "#c4b89a",
                        fontWeight: 700,
                        width: 12,
                        textAlign: "center",
                      }}
                    >
                      {tool.real ? "⚡" : "·"}
                    </span>
                    <span
                      style={{
                        background: tool.real ? "#fff3c8" : "#f0e8d8",
                        border: `1px solid ${tool.real ? "#f9d060" : "#ddd0ba"}`,
                        borderRadius: 4,
                        padding: "1px 6px",
                        fontFamily: "monospace",
                        fontSize: 10.5,
                        color: tool.real ? "#7a4f00" : "#9e8364",
                      }}
                    >
                      {tool.tool}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Completion banner */}
      {isComplete && cost !== null && (
        <div
          style={{
            background: "#3d4e3c",
            color: "#fff8e7",
            border: "2px solid #2b2b26",
            borderRadius: 6,
            padding: "12px 14px",
            textAlign: "center",
            boxShadow: "3px 3px 0 #2b2b26",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <span style={{ fontSize: 20 }}>📬</span>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800 }}>Delivered to mailbox</div>
            <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>
              ${cost.toFixed(4)} spent
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
