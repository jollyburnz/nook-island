import { useEffect, useState } from "react";
import { initBridge, destroyBridge } from "./core/bridge";
import { eventBus } from "./core/eventBus";
import type { IslandEvent } from "./core/types";
import { TownHall } from "./components/TownHall";
import { PlanApproval } from "./components/PlanApproval";
import { WorkflowPanel } from "./components/WorkflowPanel";

// Layer 11: Full UI — task input → plan approval → live workflow panel
type Phase = "idle" | "plan_proposed" | "executing" | "complete" | "error";
type Plan = { task: string; steps: { villager: string; action: string }[] };

export default function App() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [events, setEvents] = useState<IslandEvent[]>([]);
  const [cost, setCost] = useState<number | null>(null);

  useEffect(() => {
    initBridge();

    const unsub = eventBus.subscribe((raw) => {
      const e = raw as IslandEvent;
      if (!e?.type) return;

      if (e.type === "plan_proposed") {
        setCurrentPlan(e.plan);
        setPhase("plan_proposed");
      } else if (e.type === "plan_approved") {
        setPhase("executing");
      } else if (e.type === "task_complete") {
        setCost(e.cost_usd);
        setPhase("complete");
        setEvents((prev) => [...prev, e]);
      } else if (e.type === "agent_error") {
        setPhase("error");
      } else if (
        e.type === "agent_activated" ||
        e.type === "tool_call" ||
        e.type === "handoff"
      ) {
        setEvents((prev) => [...prev, e]);
      }
    });

    return () => {
      unsub();
      destroyBridge();
    };
  }, []);

  const resetToIdle = () => {
    setPhase("idle");
    setCurrentPlan(null);
    setEvents([]);
    setCost(null);
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#78b8a0",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {phase === "idle" && (
        // onSubmit sets phase optimistically while waiting for plan_proposed
        // event from backend (which will set currentPlan when it arrives).
        <TownHall onSubmit={() => setPhase("plan_proposed")} />
      )}

      {phase === "plan_proposed" && currentPlan && (
        // onApprove is a no-op: phase transitions via plan_approved IslandEvent.
        // UI click → IPC → orchestrator emits plan_approved → eventBus → executing.
        <PlanApproval
          plan={currentPlan}
          onApprove={() => {}}
          onReject={resetToIdle}
        />
      )}

      {phase === "plan_proposed" && !currentPlan && (
        <div style={{ color: "#2d5a3d", fontSize: 14, opacity: 0.8 }}>
          ⟳ Sherb is planning…
        </div>
      )}

      {(phase === "executing" || phase === "complete") && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            width: "100%",
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <WorkflowPanel events={events} cost={cost} />
          {phase === "complete" && (
            <button
              onClick={resetToIdle}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                background: "#fff",
                border: "2px solid #2d5a3d",
                cursor: "pointer",
                fontSize: 13,
                color: "#2d5a3d",
              }}
            >
              ← New task
            </button>
          )}
        </div>
      )}

      {phase === "error" && (
        <div style={{ textAlign: "center", color: "#2d5a3d" }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>⚠️</div>
          <p style={{ margin: "0 0 16px" }}>Something went wrong</p>
          <button
            onClick={resetToIdle}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              background: "#2d5a3d",
              color: "#fff",
              border: "none",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            ← Try again
          </button>
        </div>
      )}
    </div>
  );
}
