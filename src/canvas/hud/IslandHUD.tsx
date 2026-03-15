import type { CSSProperties } from "react";
import { TownHall } from "../../components/TownHall";
import { PlanApproval } from "../../components/PlanApproval";
import { WorkflowPanel } from "../../components/WorkflowPanel";
import type { IslandEvent } from "../../core/types";

type Phase = "idle" | "plan_proposed" | "executing" | "complete" | "error";
type Plan = { task: string; steps: { villager: string; action: string }[] };

interface Props {
  phase: Phase;
  plan: Plan | null;
  events: IslandEvent[];
  cost: number | null;
  onSubmit: () => void;
  onReject: () => void;
  onReset: () => void;
}

const glass: CSSProperties = {
  background: "rgba(255, 255, 255, 0.88)",
  backdropFilter: "blur(12px)",
  WebkitBackdropFilter: "blur(12px)",
  borderRadius: 16,
  padding: 24,
  boxShadow: "0 8px 32px rgba(0,0,0,0.20)",
  border: "1.5px solid rgba(255,255,255,0.65)",
};

export function IslandHUD({
  phase, plan, events, cost, onSubmit, onReject, onReset,
}: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 10,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      {/* Idle: centered task input */}
      {phase === "idle" && (
        <div style={{ ...glass, pointerEvents: "auto" }}>
          <TownHall onSubmit={onSubmit} />
        </div>
      )}

      {/* Plan proposed: plan ready to approve */}
      {phase === "plan_proposed" && plan && (
        <div style={{ ...glass, pointerEvents: "auto" }}>
          <PlanApproval plan={plan} onApprove={() => {}} onReject={onReject} />
        </div>
      )}

      {/* Plan proposed but plan not yet arrived (Sherb thinking) */}
      {phase === "plan_proposed" && !plan && (
        <div style={{ ...glass, pointerEvents: "none", color: "#2d5a3d", fontSize: 15 }}>
          ⟳ Sherb is planning…
        </div>
      )}

      {/* Executing / complete: workflow panel pinned top-right */}
      {(phase === "executing" || phase === "complete") && (
        <div
          style={{
            position: "fixed",
            top: 24,
            right: 24,
            pointerEvents: "auto",
            maxHeight: "calc(100vh - 48px)",
            overflowY: "auto",
          }}
        >
          <div style={glass}>
            <WorkflowPanel events={events} cost={cost} />
            {phase === "complete" && (
              <button
                onClick={onReset}
                style={{
                  marginTop: 12,
                  width: "100%",
                  padding: "8px 0",
                  borderRadius: 8,
                  background: "#2d5a3d",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 13,
                }}
              >
                ← New task
              </button>
            )}
          </div>
        </div>
      )}

      {/* Error */}
      {phase === "error" && (
        <div style={{ ...glass, textAlign: "center", pointerEvents: "auto" }}>
          <div style={{ fontSize: 32 }}>⚠️</div>
          <p style={{ margin: "8px 0 16px", color: "#2d5a3d" }}>Something went wrong</p>
          <button
            onClick={onReset}
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
