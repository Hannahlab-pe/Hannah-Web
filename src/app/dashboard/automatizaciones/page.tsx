"use client";

const automations = [
  {
    name: "Bot Facturacion Automatica",
    type: "Bot",
    status: "Activo",
    lastExecution: "Hoy, 14:32",
    successRate: 98.5,
  },
  {
    name: "Script Sync Inventario",
    type: "Script",
    status: "Activo",
    lastExecution: "Hoy, 13:10",
    successRate: 100,
  },
  {
    name: "Workflow Onboarding Clientes",
    type: "Workflow",
    status: "Pausado",
    lastExecution: "Ayer, 17:45",
    successRate: 94.2,
  },
  {
    name: "Bot Respuestas WhatsApp",
    type: "Bot",
    status: "Activo",
    lastExecution: "Hoy, 14:58",
    successRate: 97.1,
  },
  {
    name: "Script Backup DB",
    type: "Script",
    status: "Pausado",
    lastExecution: "15 Abr, 03:00",
    successRate: 99.8,
  },
  {
    name: "Workflow Aprobacion Compras",
    type: "Workflow",
    status: "Error",
    lastExecution: "Hoy, 09:22",
    successRate: 87.3,
  },
  {
    name: "Bot Scraping Precios",
    type: "Bot",
    status: "Pausado",
    lastExecution: "14 Abr, 22:00",
    successRate: 91.6,
  },
  {
    name: "Script Reportes Diarios",
    type: "Script",
    status: "Pausado",
    lastExecution: "Hoy, 06:00",
    successRate: 100,
  },
];

const statusColor: Record<string, string> = {
  Activo: "#22c55e",
  Pausado: "#f59e0b",
  Error: "#ef4444",
};

const typeBg: Record<string, string> = {
  Bot: "rgba(74,139,0,0.10)",
  Script: "rgba(99,102,241,0.10)",
  Workflow: "rgba(236,72,153,0.10)",
};

const typeColor: Record<string, string> = {
  Bot: "var(--verde)",
  Script: "#6366f1",
  Workflow: "#ec4899",
};

export default function AutomatizacionesPage() {
  const stats = [
    { label: "Total", value: 12, color: "var(--text-primary)" },
    { label: "Activas", value: 3, color: "#22c55e" },
    { label: "Completadas", value: 8, color: "#6366f1" },
    { label: "Error", value: 1, color: "#ef4444" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: "'Google Sans', system-ui" }}>
            Automatizaciones
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
            Monitorea el estado y rendimiento de tus automatizaciones
          </p>
        </div>
        <button
          style={{
            background: "var(--verde)",
            color: "#fff",
            border: "none",
            borderRadius: "10px",
            padding: "0.6rem 1.25rem",
            fontSize: "0.875rem",
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "18px", height: "18px" }}>
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Nueva automatizacion
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              background: "var(--bg)",
              border: "1px solid var(--border)",
              borderRadius: "14px",
              padding: "1.25rem 1.5rem",
            }}
          >
            <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", marginBottom: "0.35rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "1.75rem", fontWeight: 700, color: stat.color, fontFamily: "'Google Sans', system-ui" }}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div
        style={{
          background: "var(--bg)",
          border: "1px solid var(--border)",
          borderRadius: "16px",
          overflow: "hidden",
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "2fr 1fr 1fr 1.2fr 0.8fr 0.8fr",
            padding: "0.85rem 1.5rem",
            background: "var(--bg-soft)",
            borderBottom: "1px solid var(--border)",
            gap: "0.5rem",
          }}
        >
          {["Nombre", "Tipo", "Estado", "Ultima ejecucion", "Exito", "Acciones"].map((h) => (
            <span
              key={h}
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "var(--text-muted)",
                fontFamily: "'Outfit', sans-serif",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
              }}
            >
              {h}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {automations.map((item, i) => (
          <div
            key={item.name}
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1.2fr 0.8fr 0.8fr",
              padding: "1rem 1.5rem",
              borderBottom: i < automations.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            {/* Name */}
            <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}>
              {item.name}
            </span>

            {/* Type badge */}
            <span>
              <span
                style={{
                  display: "inline-block",
                  padding: "0.2rem 0.65rem",
                  borderRadius: "8px",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  fontFamily: "'Outfit', sans-serif",
                  background: typeBg[item.type],
                  color: typeColor[item.type],
                }}
              >
                {item.type}
              </span>
            </span>

            {/* Status */}
            <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: statusColor[item.status],
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
                {item.status}
              </span>
            </span>

            {/* Last execution */}
            <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
              {item.lastExecution}
            </span>

            {/* Success rate */}
            <span style={{ fontSize: "0.85rem", fontWeight: 600, color: item.successRate >= 95 ? "#22c55e" : item.successRate >= 90 ? "#f59e0b" : "#ef4444", fontFamily: "'Outfit', sans-serif" }}>
              {item.successRate}%
            </span>

            {/* Actions */}
            <span style={{ display: "flex", gap: "0.5rem" }}>
              <button
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.3rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Ver detalles"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "16px", height: "16px" }}>
                  <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <button
                style={{
                  background: "none",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "0.3rem",
                  cursor: "pointer",
                  color: "var(--text-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Configurar"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "16px", height: "16px" }}>
                  <path d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
