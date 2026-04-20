export default function DashboardLoading() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
        <div style={{
          width: "32px", height: "32px", border: "3px solid var(--border)",
          borderTop: "3px solid var(--verde)", borderRadius: "50%",
          animation: "spin 0.6s linear infinite",
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
