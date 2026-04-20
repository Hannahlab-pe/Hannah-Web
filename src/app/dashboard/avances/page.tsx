"use client";

const timelineEntries = [
  {
    date: "16 Abr 2026",
    title: "Deploy realizado - Migracion Cloud Weber",
    description:
      "Se completo el deploy de la infraestructura en AWS con Terraform. Todos los servicios migrados estan operativos en produccion con zero downtime.",
    color: "#4A8B00",
    category: "Deploy",
  },
  {
    date: "15 Abr 2026",
    title: "Modulo de inventario completado - ERP Odoo",
    description:
      "Finalizacion del modulo de inventario con integracion de codigo de barras y reportes automaticos para Betondecken. Incluye validacion de stock en tiempo real.",
    color: "#2563EB",
    category: "Modulo",
  },
  {
    date: "14 Abr 2026",
    title: "Nuevo feature - Bot WhatsApp Entel",
    description:
      "Se implemento el flujo de atencion automatizada con IA para consultas frecuentes. El bot ahora resuelve el 60% de tickets sin intervencion humana.",
    color: "#4A8B00",
    category: "Feature",
  },
  {
    date: "12 Abr 2026",
    title: "Sprint review - Automatizacion Ventas Bosch",
    description:
      "Revision del sprint 8 con el equipo de Bosch. Se aprobaron los workflows de cotizacion automatica y se definio el backlog para el siguiente sprint.",
    color: "#F59E0B",
    category: "Reunion",
  },
  {
    date: "10 Abr 2026",
    title: "Bug corregido - Web Corporativa v2",
    description:
      "Se corrigio un problema critico de renderizado en Safari iOS que afectaba la seccion de servicios. Tambien se optimizo la carga de imagenes con lazy loading.",
    color: "#DC2626",
    category: "Bug fix",
  },
  {
    date: "08 Abr 2026",
    title: "Reunion con cliente - Grupo Romero",
    description:
      "Reunion de kick-off para retomar el proyecto Dashboard Analytics. Se acordaron nuevas fechas de entrega y se redefinieron prioridades del backlog.",
    color: "#F59E0B",
    category: "Reunion",
  },
  {
    date: "05 Abr 2026",
    title: "Deploy staging - Bot WhatsApp Entel",
    description:
      "Deploy del bot en ambiente de staging para pruebas de integracion con el sistema CRM de Entel. Pruebas de carga programadas para la proxima semana.",
    color: "#2563EB",
    category: "Deploy",
  },
  {
    date: "03 Abr 2026",
    title: "Nuevo feature - ERP Odoo Betondecken",
    description:
      "Implementacion del modulo de compras con aprobacion multinivel. Incluye notificaciones por correo y dashboard de seguimiento de ordenes de compra.",
    color: "#4A8B00",
    category: "Feature",
  },
  {
    date: "01 Abr 2026",
    title: "Migracion de base de datos - Weber",
    description:
      "Se completo la migracion de 2.3 millones de registros desde el servidor on-premise hacia RDS en AWS. Validacion de integridad de datos al 100%.",
    color: "#2563EB",
    category: "Modulo",
  },
  {
    date: "28 Mar 2026",
    title: "Sprint planning - Automatizacion Ventas Bosch",
    description:
      "Planificacion del sprint 8 con foco en la integracion del modulo de reportes con Power BI y la automatizacion del pipeline de ventas regional.",
    color: "#F59E0B",
    category: "Reunion",
  },
];

const categoryColors: Record<string, { bg: string; text: string }> = {
  Deploy: { bg: "rgba(74, 139, 0, 0.1)", text: "#4A8B00" },
  Modulo: { bg: "rgba(37, 99, 235, 0.1)", text: "#2563EB" },
  Feature: { bg: "rgba(74, 139, 0, 0.1)", text: "#4A8B00" },
  Reunion: { bg: "rgba(245, 158, 11, 0.1)", text: "#F59E0B" },
  "Bug fix": { bg: "rgba(220, 38, 38, 0.1)", text: "#DC2626" },
};

export default function AvancesPage() {
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
          Avances
        </h1>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--text-secondary)",
            fontFamily: "'Outfit', sans-serif",
          }}
        >
          Timeline de actualizaciones y milestones de tus proyectos
        </p>
      </div>

      {/* Timeline */}
      <div style={{ position: "relative", paddingLeft: "2rem" }}>
        {/* Vertical line */}
        <div
          style={{
            position: "absolute",
            left: "7px",
            top: "8px",
            bottom: "8px",
            width: "2px",
            background: "var(--border)",
            borderRadius: "999px",
          }}
        />

        <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
          {timelineEntries.map((entry, i) => (
            <div
              key={i}
              style={{
                position: "relative",
                paddingBottom: "1.25rem",
              }}
            >
              {/* Status dot */}
              <div
                style={{
                  position: "absolute",
                  left: "-2rem",
                  top: "1.4rem",
                  width: "16px",
                  height: "16px",
                  borderRadius: "50%",
                  background: entry.color,
                  border: "3px solid var(--bg)",
                  boxShadow: `0 0 0 2px ${entry.color}33`,
                  zIndex: 1,
                }}
              />

              {/* Card */}
              <div
                style={{
                  background: "var(--bg)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  padding: "1.15rem 1.3rem",
                  transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
                  (e.currentTarget as HTMLDivElement).style.borderColor = entry.color;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                  (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                }}
              >
                {/* Date + category */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    marginBottom: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.72rem",
                      color: "var(--text-muted)",
                      fontFamily: "'Outfit', sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {entry.date}
                  </span>
                  <span
                    style={{
                      padding: "0.15rem 0.6rem",
                      borderRadius: "999px",
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      background: categoryColors[entry.category]?.bg || "var(--bg-soft)",
                      color: categoryColors[entry.category]?.text || "var(--text-secondary)",
                      fontFamily: "'Outfit', sans-serif",
                    }}
                  >
                    {entry.category}
                  </span>
                </div>

                {/* Title */}
                <h3
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 700,
                    color: "var(--text-primary)",
                    fontFamily: "'Google Sans', system-ui",
                    marginBottom: "0.35rem",
                    lineHeight: 1.35,
                  }}
                >
                  {entry.title}
                </h3>

                {/* Description */}
                <p
                  style={{
                    fontSize: "0.82rem",
                    color: "var(--text-secondary)",
                    fontFamily: "'Outfit', sans-serif",
                    lineHeight: 1.55,
                    margin: 0,
                  }}
                >
                  {entry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
