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
  piper: "🦜",
  broccolo: "🐛",
  lily: "🐸",
  stitches: "🧸",
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
    <div style={{ width: "100%" }}>
      <h2 style={{ margin: "0 0 4px", fontSize: 18, color: "#3d4e3c", fontWeight: 800 }}>
        🐐 Sherb&apos;s Plan
      </h2>
      <p style={{ margin: "0 0 16px", fontSize: 13, opacity: 0.7, color: "#3d4e3c" }}>
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
          <li key={i} style={{ fontSize: 14, color: "#2b2b26" }}>
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
            borderRadius: 6,
            border: "2px solid #2b2b26",
            background: "#d8ccb6",       // Parchment
            color: "#2b2b26",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 600,
            fontFamily: "inherit",
            boxShadow: "2px 2px 0 #2b2b26",
          }}
        >
          Reject
        </button>
        <button
          onClick={() => void handleApprove()}
          style={{
            padding: "8px 16px",
            borderRadius: 6,
            background: "#3d4e3c",
            color: "#fff8e7",
            border: "2px solid #2b2b26",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "inherit",
            boxShadow: "2px 2px 0 #2b2b26",
          }}
        >
          Approve →
        </button>
      </div>
    </div>
  );
}
