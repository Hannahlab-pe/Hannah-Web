"use client";

import { useState } from "react";

const projects = [
  {
    name: "Automatizacion Ventas Bosch",
    client: "Bosch Peru",
    status: "En progreso",
    progress: 72,
    lastUpdate: "12 Abr 2026",
    team: [
      { initials: "JR", color: "#4A8B00" },
      { initials: "ML", color: "#2563EB" },
      { initials: "KT", color: "#9333EA" },
    ],
    tags: ["Python", "FastAPI", "PostgreSQL"],
  },
  {
    name: "ERP Odoo - Betondecken",
    client: "Betondecken SAC",
    status: "En progreso",
    progress: 45,
    lastUpdate: "15 Abr 2026",
    team: [
      { initials: "AP", color: "#DC2626" },
      { initials: "JR", color: "#4A8B00" },
    ],
    tags: ["Odoo", "Python", "XML"],
  },
  {
    name: "Web Corporativa v2",
    client: "Hannah Lab",
    status: "Completado",
    progress: 100,
    lastUpdate: "08 Abr 2026",
    team: [
      { initials: "ML", color: "#2563EB" },
      { initials: "SR", color: "#F59E0B" },
    ],
    tags: ["Next.js", "React", "Vercel"],
  },
  {
    name: "Bot WhatsApp Entel",
    client: "Entel Peru",
    status: "En progreso",
    progress: 58,
    lastUpdate: "14 Abr 2026",
    team: [
      { initials: "KT", color: "#9333EA" },
      { initials: "AP", color: "#DC2626" },
      { initials: "JR", color: "#4A8B00" },
    ],
    tags: ["Node.js", "WhatsApp API", "Redis"],
  },
  {
    name: "Dashboard Analytics",
    client: "Grupo Romero",
    status: "Pausado",
    progress: 30,
    lastUpdate: "02 Abr 2026",
    team: [
      { initials: "SR", color: "#F59E0B" },
      { initials: "ML", color: "#2563EB" },
    ],
    tags: ["React", "D3.js", "BigQuery"],
  },
  {
    name: "Migracion Cloud Weber",
    client: "Weber Saint-Gobain",
    status: "En progreso",
    progress: 85,
    lastUpdate: "16 Abr 2026",
    team: [
      { initials: "JR", color: "#4A8B00" },
      { initials: "KT", color: "#9333EA" },
    ],
    tags: ["AWS", "Terraform", "Docker"],
  },
];

const filters = ["Todos", "En progreso", "Completados", "Pausados"];

const statusColors: Record<string, { bg: string; text: string }> = {
  "En progreso": { bg: "rgba(37, 99, 235, 0.1)", text: "#2563EB" },
  Completado: { bg: "rgba(74, 139, 0, 0.1)", text: "#4A8B00" },
  Pausado: { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" },
};

export default function ProyectosPage() {
  const [activeFilter, setActiveFilter] = useState("Todos");

  const filtered = projects.filter((p) => {
    if (activeFilter === "Todos") return true;
    if (activeFilter === "Completados") return p.status === "Completado";
    if (activeFilter === "Pausados") return p.status === "Pausado";
    return p.status === "En progreso";
  });

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "1.5rem" }}>
        <h1
          style={{
            fontSize: "1.75rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            marginBottom: "0.25rem",
            fontFamily: "'Google Sans', system-ui",
          }}
        >
          Proyectos
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Gestiona y revisa el progreso de tus proyectos activos
        </p>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: "0.5rem 1.1rem",
              borderRadius: "999px",
              border: activeFilter === f ? "1.5px solid var(--verde)" : "1px solid var(--border)",
              background: activeFilter === f ? "rgba(74,139,0,0.08)" : "var(--bg)",
              color: activeFilter === f ? "var(--verde)" : "var(--text-secondary)",
              fontSize: "0.82rem",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "'Outfit', sans-serif",
              transition: "all 0.2s ease",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Project Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "1rem",
        }}
      >
        {filtered.map((project) => {
          const sc = statusColors[project.status] || statusColors["En progreso"];
          return (
            <div
              key={project.name}
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)",
                borderRadius: "14px",
                padding: "1.4rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.9rem",
                transition: "box-shadow 0.2s ease, border-color 0.2s ease",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
              }}
            >
              {/* Top row: name + status */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.75rem" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontFamily: "'Google Sans', system-ui",
                      marginBottom: "0.2rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {project.name}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--text-muted)",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {project.client}
                  </p>
                </div>
                <span
                  style={{
                    padding: "0.25rem 0.7rem",
                    borderRadius: "999px",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    background: sc.bg,
                    color: sc.text,
                    whiteSpace: "nowrap",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {project.status}
                </span>
              </div>

              {/* Progress bar */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      color: "var(--text-muted)",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    Progreso
                  </span>
                  <span
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: 700,
                      color: "var(--text-primary)",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {project.progress}%
                  </span>
                </div>
                <div
                  style={{
                    height: "6px",
                    borderRadius: "999px",
                    background: "var(--bg-soft)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${project.progress}%`,
                      borderRadius: "999px",
                      background: project.status === "Completado" ? "#4A8B00" : project.status === "Pausado" ? "#F59E0B" : "#2563EB",
                      transition: "width 0.5s ease",
                    }}
                  />
                </div>
              </div>

              {/* Tags */}
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    style={{
                      padding: "0.2rem 0.55rem",
                      borderRadius: "6px",
                      fontSize: "0.68rem",
                      fontWeight: 500,
                      background: "var(--bg-soft)",
                      color: "var(--text-secondary)",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Footer: avatars + date */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderTop: "1px solid var(--border)",
                  paddingTop: "0.75rem",
                  marginTop: "0.1rem",
                }}
              >
                <div style={{ display: "flex" }}>
                  {project.team.map((member, i) => (
                    <div
                      key={member.initials + i}
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: member.color,
                        color: "#fff",
                        fontSize: "0.6rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        marginLeft: i > 0 ? "-6px" : "0",
                        border: "2px solid var(--bg)",
                        fontFamily: "'Outfit', sans-serif",
                      }}
                    >
                      {member.initials}
                    </div>
                  ))}
                </div>
                <span
                  style={{
                    fontSize: "0.72rem",
                    color: "var(--text-muted)",
                    fontFamily: "'Outfit', sans-serif",
                  }}
                >
                  {project.lastUpdate}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
