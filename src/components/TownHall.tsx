import { useState } from "react";

interface Props {
  onSubmit: () => void;
}

export function TownHall({ onSubmit }: Props) {
  const [desc, setDesc] = useState("");

  const handleSubmit = async () => {
    if (!desc.trim()) return;
    await window.nookIsland.submitTask(desc.trim());
    setDesc("");
    onSubmit();
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 600, width: "100%", padding: "0 24px" }}>
      <h2 style={{ margin: 0, fontSize: 18, color: "#2d5a3d" }}>
        🏝️ What should the villagers work on?
      </h2>
      <textarea
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void handleSubmit();
        }}
        placeholder="Describe the task..."
        rows={4}
        style={{
          padding: 12,
          borderRadius: 8,
          border: "2px solid #a8d5be",
          fontSize: 14,
          resize: "vertical",
          fontFamily: "inherit",
          background: "#f0f7f4",
          outline: "none",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, opacity: 0.6, color: "#2d5a3d" }}>Tip: ⌘↵ to submit</span>
        <button
          onClick={() => void handleSubmit()}
          disabled={!desc.trim()}
          style={{
            padding: "10px 20px",
            borderRadius: 8,
            background: "#2d5a3d",
            color: "#fff",
            border: "none",
            fontSize: 14,
            cursor: desc.trim() ? "pointer" : "not-allowed",
            opacity: desc.trim() ? 1 : 0.5,
          }}
        >
          ✉️ Drop task
        </button>
      </div>
    </div>
  );
}
