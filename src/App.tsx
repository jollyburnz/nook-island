import { useEffect } from "react";
import { initBridge, destroyBridge } from "./core/bridge";
import { eventBus } from "./core/eventBus";

// Layer 6: events flow through eventBus — UI added in Layers 11-12
export default function App() {
  useEffect(() => {
    initBridge();
    const unsub = eventBus.subscribe((e) => {
      console.log("[eventBus]", e);
    });
    return () => {
      unsub();
      destroyBridge();
    };
  }, []);

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
        color: "#2d5a3d",
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🏝️</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0 }}>Nook Island</h1>
        <p style={{ marginTop: 8, opacity: 0.7, fontSize: 14 }}>
          Layer 6 — event bus active · check DevTools console
        </p>
      </div>
    </div>
  );
}
