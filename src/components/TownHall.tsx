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
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%" }}>
      <h2 style={{ margin: 0, fontSize: 18, color: "#3d4e3c", fontWeight: 800 }}>
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
          borderRadius: 6,
          border: "2px solid #9e8364",   // Worn Terra
          fontSize: 14,
          resize: "vertical",
          fontFamily: "inherit",
          background: "#fff8e7",          // Cream Press
          outline: "none",
          color: "#2b2b26",
        }}
      />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 12, opacity: 0.6, color: "#3d4e3c" }}>Tip: ⌘↵ to submit</span>
        <button
          onClick={() => void handleSubmit()}
          disabled={!desc.trim()}
          style={{
            padding: "10px 20px",
            borderRadius: 6,
            background: "#3d4e3c",        // Undergrowth
            color: "#fff8e7",
            border: "2px solid #2b2b26",
            boxShadow: "2px 2px 0 #2b2b26",
            fontSize: 14,
            fontWeight: 700,
            fontFamily: "inherit",
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
