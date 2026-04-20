"use client";

import { useState } from "react";

const headingFont = "'Google Sans', system-ui";
const bodyFont = "'Outfit', sans-serif";

type Priority = "Alta" | "Media" | "Baja";
type Status = "Abierto" | "En progreso" | "Resuelto";

interface Ticket {
  id: string;
  subject: string;
  priority: Priority;
  status: Status;
  created: string;
  lastResponse: string;
}

const tickets: Ticket[] = [
  { id: "#001", subject: "Error al generar reporte mensual en ERP", priority: "Alta", status: "Abierto", created: "10 Abr 2025", lastResponse: "Hace 2 horas" },
  { id: "#002", subject: "Solicitud de acceso al modulo de inventarios", priority: "Media", status: "Resuelto", created: "05 Abr 2025", lastResponse: "08 Abr 2025" },
  { id: "#003", subject: "Bot de WhatsApp no responde a consultas frecuentes", priority: "Alta", status: "En progreso", created: "08 Abr 2025", lastResponse: "Hace 5 horas" },
  { id: "#004", subject: "Actualizacion de credenciales de correo corporativo", priority: "Baja", status: "Resuelto", created: "01 Abr 2025", lastResponse: "03 Abr 2025" },
  { id: "#005", subject: "Dashboard muestra datos desactualizados", priority: "Media", status: "Resuelto", created: "28 Mar 2025", lastResponse: "30 Mar 2025" },
  { id: "#006", subject: "Configuracion de permisos de usuario para nuevo empleado", priority: "Media", status: "Resuelto", created: "25 Mar 2025", lastResponse: "26 Mar 2025" },
  { id: "#007", subject: "Integracion con pasarela de pago presenta timeout", priority: "Alta", status: "Abierto", created: "12 Abr 2025", lastResponse: "Hace 30 min" },
  { id: "#008", subject: "Solicitud de backup manual de base de datos", priority: "Baja", status: "Resuelto", created: "20 Mar 2025", lastResponse: "21 Mar 2025" },
];

function getPriorityStyle(priority: Priority) {
  switch (priority) {
    case "Alta": return { bg: "rgba(229,62,62,0.1)", color: "#E53E3E" };
    case "Media": return { bg: "rgba(221,167,32,0.1)", color: "#D69E2E" };
    case "Baja": return { bg: "rgba(113,128,150,0.1)", color: "#718096" };
  }
}

function getStatusStyle(status: Status) {
  switch (status) {
    case "Abierto": return { bg: "rgba(49,130,206,0.1)", color: "#3182CE", dot: "#3182CE" };
    case "En progreso": return { bg: "rgba(221,167,32,0.1)", color: "#D69E2E", dot: "#D69E2E" };
    case "Resuelto": return { bg: "rgba(56,161,105,0.1)", color: "#38A169", dot: "#38A169" };
  }
}

export default function SoportePage() {
  const [filter, setFilter] = useState<"Todos" | Status>("Todos");

  const filteredTickets = filter === "Todos"
    ? tickets
    : tickets.filter((t) => t.status === filter);

  const stats = [
    { label: "Abiertos", value: tickets.filter((t) => t.status === "Abierto").length, color: "#3182CE", bg: "rgba(49,130,206,0.1)" },
    { label: "En progreso", value: tickets.filter((t) => t.status === "En progreso").length, color: "#D69E2E", bg: "rgba(221,167,32,0.1)" },
    { label: "Resueltos", value: tickets.filter((t) => t.status === "Resuelto").length, color: "#38A169", bg: "rgba(56,161,105,0.1)" },
  ];

  const statusFilters: ("Todos" | Status)[] = ["Todos", "Abierto", "En progreso", "Resuelto"];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: headingFont }}>
            Soporte
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: bodyFont }}>
            Tickets y comunicacion con el equipo
          </p>
        </div>
        <button
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.6rem 1.25rem", borderRadius: "10px", border: "none",
            background: "var(--verde)", color: "#fff", fontSize: "0.875rem",
            fontWeight: 600, fontFamily: bodyFont, cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Nuevo ticket
        </button>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              padding: "1.25rem", borderRadius: "14px",
              background: "var(--bg)", border: "1px solid var(--border)",
              display: "flex", flexDirection: "column", gap: "0.25rem",
            }}
          >
            <span style={{ fontSize: "2rem", fontWeight: 700, color: stat.color, fontFamily: headingFont }}>
              {stat.value}
            </span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-muted)", fontFamily: bodyFont }}>
              {stat.label}
            </span>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {statusFilters.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            style={{
              padding: "0.45rem 1rem", borderRadius: "8px", border: "1px solid",
              borderColor: filter === s ? "var(--verde)" : "var(--border)",
              background: filter === s ? "rgba(74,139,0,0.1)" : "var(--bg)",
              color: filter === s ? "var(--verde)" : "var(--text-secondary)",
              fontSize: "0.8rem", fontWeight: 600, fontFamily: bodyFont, cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Tickets list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "60px 1fr 80px 110px 100px 110px",
          padding: "0.6rem 1rem", fontSize: "0.75rem", fontWeight: 600,
          color: "var(--text-muted)", fontFamily: bodyFont, textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          <span>No.</span>
          <span>Asunto</span>
          <span>Prioridad</span>
          <span>Estado</span>
          <span>Creado</span>
          <span>Respuesta</span>
        </div>

        {filteredTickets.map((ticket) => {
          const pStyle = getPriorityStyle(ticket.priority);
          const sStyle = getStatusStyle(ticket.status);
          return (
            <div
              key={ticket.id}
              style={{
                display: "grid", gridTemplateColumns: "60px 1fr 80px 110px 100px 110px",
                alignItems: "center", padding: "0.85rem 1rem", borderRadius: "12px",
                background: "var(--bg)", border: "1px solid var(--border)",
                cursor: "pointer", transition: "border-color 0.15s ease",
              }}
            >
              {/* Ticket number */}
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--verde)", fontFamily: bodyFont }}>
                {ticket.id}
              </span>

              {/* Subject */}
              <span style={{
                fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)",
                fontFamily: bodyFont, overflow: "hidden", textOverflow: "ellipsis",
                whiteSpace: "nowrap", paddingRight: "0.75rem",
              }}>
                {ticket.subject}
              </span>

              {/* Priority */}
              <span style={{
                display: "inline-block", padding: "0.2rem 0.5rem", borderRadius: "6px",
                fontSize: "0.7rem", fontWeight: 600, fontFamily: bodyFont,
                background: pStyle.bg, color: pStyle.color, textAlign: "center",
                width: "fit-content",
              }}>
                {ticket.priority}
              </span>

              {/* Status */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span style={{
                  width: "7px", height: "7px", borderRadius: "50%",
                  background: sStyle.dot, flexShrink: 0,
                }} />
                <span style={{
                  fontSize: "0.75rem", fontWeight: 600, color: sStyle.color,
                  fontFamily: bodyFont,
                }}>
                  {ticket.status}
                </span>
              </div>

              {/* Created */}
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
                {ticket.created}
              </span>

              {/* Last response */}
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
                {ticket.lastResponse}
              </span>
            </div>
          );
        })}
      </div>

      {/* Contacto directo */}
      <div style={{
        marginTop: "2rem", padding: "1.5rem", borderRadius: "16px",
        background: "var(--bg)", border: "1px solid var(--border)",
      }}>
        <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: headingFont }}>
          Contacto directo
        </h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: bodyFont, marginBottom: "1rem" }}>
          Para consultas urgentes, contacta directamente con nuestro equipo
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* WhatsApp */}
          <a
            href="https://wa.me/51999999999"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.65rem 1.25rem", borderRadius: "10px",
              background: "rgba(37,211,102,0.1)", border: "1px solid rgba(37,211,102,0.2)",
              color: "#25D366", fontSize: "0.85rem", fontWeight: 600,
              fontFamily: bodyFont, textDecoration: "none", cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "18px", height: "18px" }}>
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>

          {/* Email */}
          <a
            href="mailto:soporte@hannahlab.com"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.5rem",
              padding: "0.65rem 1.25rem", borderRadius: "10px",
              background: "rgba(74,139,0,0.08)", border: "1px solid rgba(74,139,0,0.15)",
              color: "var(--verde)", fontSize: "0.85rem", fontWeight: 600,
              fontFamily: bodyFont, textDecoration: "none", cursor: "pointer",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}>
              <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            soporte@hannahlab.com
          </a>
        </div>
      </div>
    </div>
  );
}
