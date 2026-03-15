interface PlanStep {
  villager: string;
  action: string;
}

interface Plan {
  task: string;
  steps: PlanStep[];
}

const VILLAGER_EMOJI: Record<string, string> = {
  maple: "🐻",
  zucker: "🐙",
  marshal: "🐿️",
  sherb: "🐐",
};

interface Props {
  plan: Plan;
  onApprove: () => void;
  onReject: () => void;
}

export function PlanApproval({ plan, onApprove, onReject }: Props) {
  const handleApprove = async () => {
    await window.nookIsland.approvePlan(plan);
    onApprove();
  };

  const handleReject = async () => {
    await window.nookIsland.rejectPlan("player rejected");
    onReject();
  };

  return (
    <div
      style={{
        maxWidth: 520,
        width: "100%",
        background: "#f0f7f4",
        borderRadius: 12,
        padding: 24,
        border: "2px solid #a8d5be",
        margin: "0 24px",
      }}
    >
      <h2 style={{ margin: "0 0 4px", fontSize: 18, color: "#2d5a3d" }}>
        🐐 Sherb&apos;s Plan
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, opacity: 0.7, color: "#2d5a3d" }}>
        {plan.task}
      </p>
      <ol
        style={{
          margin: "0 0 20px",
          paddingLeft: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {plan.steps.map((step, i) => (
          <li key={i} style={{ fontSize: 14, color: "#2d5a3d" }}>
            <strong>
              {VILLAGER_EMOJI[step.villager] ?? "🏝️"} {step.villager}
            </strong>{" "}
            — {step.action}
          </li>
        ))}
      </ol>
      <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
        <button
          onClick={() => void handleReject()}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "2px solid #ccc",
            background: "#fff",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Reject
        </button>
        <button
          onClick={() => void handleApprove()}
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
          Approve →
        </button>
      </div>
    </div>
  );
}
