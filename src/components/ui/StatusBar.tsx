import { useAppStore } from "@/store/useAppStore";

export function StatusBar() {
  const { activeSection, animationEnabled, soundEnabled } = useAppStore();

  return (
    <div
      className="fixed right-0 bottom-0 left-0 z-50 flex items-center gap-4 px-4 py-1"
      style={{
        height: "28px",
        background: "rgba(5,8,18,0.95)",
        borderTop: "1px solid rgba(196,145,2,0.1)",
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: "9px",
        color: "rgba(224,221,216,0.3)",
      }}
    >
      <span
        style={{
          color: "#00ff88",
          display: "flex",
          alignItems: "center",
          gap: "4px",
        }}
      >
        <span
          style={{
            width: "5px",
            height: "5px",
            borderRadius: "50%",
            background: "#00ff88",
            boxShadow: "0 0 5px #00ff88",
            display: "inline-block",
            animation: "glow-pulse 1.5s ease-in-out infinite",
          }}
        />
        ONLINE
      </span>
      <span>section: {activeSection}</span>
      <span>animations: {animationEnabled ? "ON" : "OFF"}</span>
      <span>sound: {soundEnabled ? "ON" : "OFF"}</span>
      <span style={{ marginLeft: "auto" }}>MSCS @ ASU · 2026</span>
    </div>
  );
}
