import { useEffect, useState } from "react";
import { initBridge, destroyBridge } from "./core/bridge";
import { eventBus } from "./core/eventBus";
import type { IslandEvent } from "./core/types";
import { NookCanvas } from "./canvas/NookCanvas";
import { IslandHUD } from "./canvas/hud/IslandHUD";

// Layer 12: PixiJS canvas world + glass-card HUD overlay
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
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Layer 0: PixiJS island world canvas */}
      <NookCanvas />

      {/* Layer 10: React glass-card HUD panels */}
      <IslandHUD
        phase={phase}
        plan={currentPlan}
        events={events}
        cost={cost}
        onSubmit={() => setPhase("plan_proposed")}
        onReject={resetToIdle}
        onReset={resetToIdle}
      />
    </div>
  );
}
