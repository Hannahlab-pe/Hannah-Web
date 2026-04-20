"use client";

const upcomingMeetings = [
  {
    title: "Sprint Planning Q2",
    date: "Lun 21 Abr, 10:00 AM",
    attendees: ["AC", "MR", "LP", "JD"],
    type: "Planning",
    link: "#",
    notes: "Definir prioridades del sprint 14. Revisar backlog pendiente y asignar tareas del modulo de facturacion.",
  },
  {
    title: "Demo EDA v2.0",
    date: "Mar 22 Abr, 3:00 PM",
    attendees: ["AC", "ST", "RG"],
    type: "Demo",
    link: "#",
    notes: "Presentacion de nuevas funcionalidades del dashboard de analisis exploratorio de datos al equipo de producto.",
  },
  {
    title: "Review Automatizaciones",
    date: "Mie 23 Abr, 11:00 AM",
    attendees: ["MR", "LP"],
    type: "Review",
    link: "#",
    notes: "Revision de performance del bot de facturacion y estado del workflow de onboarding de clientes.",
  },
  {
    title: "Sprint Retrospectiva",
    date: "Vie 25 Abr, 4:00 PM",
    attendees: ["AC", "MR", "LP", "JD", "ST"],
    type: "Sprint",
    link: "#",
    notes: "Retrospectiva del sprint 13. Analizar metricas de velocidad y discutir mejoras en el proceso.",
  },
];

const pastMeetings = [
  {
    title: "Kickoff Proyecto Betondecken",
    date: "Lun 14 Abr, 9:00 AM",
    attendees: ["AC", "MR", "RG", "JD"],
    type: "Planning",
    notes: "Se definieron los modulos principales del ERP: inventario, facturacion, compras y produccion.",
  },
  {
    title: "Demo Bot WhatsApp",
    date: "Jue 10 Abr, 2:00 PM",
    attendees: ["AC", "ST"],
    type: "Demo",
    notes: "Se presento el flujo de respuestas automaticas. Pendiente: agregar soporte para imagenes y documentos.",
  },
  {
    title: "Review Sprint 13",
    date: "Vie 11 Abr, 11:00 AM",
    attendees: ["AC", "MR", "LP", "JD"],
    type: "Review",
    notes: "Se completaron 34 de 38 story points. Bloqueadores resueltos en modulo de sync de inventario.",
  },
  {
    title: "Planning Infraestructura Cloud",
    date: "Mar 8 Abr, 10:00 AM",
    attendees: ["MR", "LP", "ST"],
    type: "Sprint",
    notes: "Migracion a nueva arquitectura serverless. Estimacion de costos y timeline de 3 semanas.",
  },
];

const typeColors: Record<string, { bg: string; color: string }> = {
  Sprint: { bg: "rgba(74,139,0,0.10)", color: "var(--verde)" },
  Review: { bg: "rgba(99,102,241,0.10)", color: "#6366f1" },
  Planning: { bg: "rgba(236,72,153,0.10)", color: "#ec4899" },
  Demo: { bg: "rgba(245,158,11,0.10)", color: "#f59e0b" },
};

const avatarColors = ["#6366f1", "#ec4899", "var(--verde)", "#f59e0b", "#06b6d4"];

function MeetingCard({ meeting, isPast }: { meeting: { title: string; date: string; attendees: string[]; type: string; link?: string; notes: string }; isPast?: boolean }) {
  const tc = typeColors[meeting.type] || typeColors.Sprint;

  return (
    <div
      style={{
        background: "var(--bg)",
        border: "1px solid var(--border)",
        borderRadius: "14px",
        padding: "1.25rem 1.5rem",
        display: "flex",
        flexDirection: "column",
        gap: "0.85rem",
        opacity: isPast ? 0.75 : 1,
      }}
    >
      {/* Top row: type tag + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <span
          style={{
            display: "inline-block",
            padding: "0.2rem 0.65rem",
            borderRadius: "8px",
            fontSize: "0.7rem",
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            background: tc.bg,
            color: tc.color,
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          {meeting.type}
        </span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
          {meeting.date}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", margin: 0 }}>
        {meeting.title}
      </h3>

      {/* Notes preview */}
      <p
        style={{
          fontSize: "0.82rem",
          color: "var(--text-secondary)",
          fontFamily: "'Outfit', sans-serif",
          lineHeight: 1.55,
          margin: 0,
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}
      >
        {meeting.notes}
      </p>

      {/* Bottom row: avatars + join link */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
        {/* Attendee avatars */}
        <div style={{ display: "flex" }}>
          {meeting.attendees.map((initials, i) => (
            <div
              key={initials + i}
              style={{
                width: "30px",
                height: "30px",
                borderRadius: "50%",
                background: avatarColors[i % avatarColors.length],
                color: "#fff",
                fontSize: "0.65rem",
                fontWeight: 700,
                fontFamily: "'Outfit', sans-serif",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid var(--bg)",
                marginLeft: i > 0 ? "-8px" : "0",
                position: "relative",
                zIndex: meeting.attendees.length - i,
              }}
            >
              {initials}
            </div>
          ))}
        </div>

        {!isPast && meeting.link && (
          <a
            href={meeting.link}
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--verde)",
              fontFamily: "'Outfit', sans-serif",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            Unirse
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
              <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </a>
        )}

        {isPast && (
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--text-muted)",
              fontFamily: "'Outfit', sans-serif",
              display: "flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "14px", height: "14px" }}>
              <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Finalizada
          </span>
        )}
      </div>
    </div>
  );
}

export default function ReunionesPage() {
  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: "'Google Sans', system-ui" }}>
            Reuniones
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
            Agenda y gestiona tus reuniones de equipo
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
          Agendar reunion
        </button>
      </div>

      {/* Proximas reuniones */}
      <div style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "20px", height: "20px", color: "var(--verde)" }}>
            <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Proximas reuniones
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {upcomingMeetings.map((m) => (
            <MeetingCard key={m.title} meeting={m} />
          ))}
        </div>
      </div>

      {/* Reuniones pasadas */}
      <div>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "20px", height: "20px", color: "var(--text-muted)" }}>
            <path d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Reuniones pasadas
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1rem" }}>
          {pastMeetings.map((m) => (
            <MeetingCard key={m.title} meeting={m} isPast />
          ))}
        </div>
      </div>
    </div>
  );
}
