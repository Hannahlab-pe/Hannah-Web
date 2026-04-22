export default function LoadingSpinner({
  text = "Cargando...",
  compact = false,
}: {
  text?: string;
  compact?: boolean;
}) {
  const size = compact ? "20px" : "36px";
  const border = compact ? "2px" : "3px";
  const padding = compact ? "1rem" : "4rem 2rem";
  const fontSize = compact ? "0.75rem" : "0.8rem";

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", gap: compact ? "0.5rem" : "0.85rem", padding,
    }}>
      <div style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
        <div style={{
          position: "absolute", inset: 0,
          border: `${border} solid var(--border)`,
          borderTop: `${border} solid var(--verde)`,
          borderRadius: "50%",
          animation: "hw-spin 0.7s linear infinite",
        }} />
      </div>
      <p style={{ fontSize, color: "var(--text-muted)", margin: 0 }}>{text}</p>
      <style>{`@keyframes hw-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
