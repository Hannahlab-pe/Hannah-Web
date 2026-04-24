"use client";

import { useState, useEffect } from "react";
import { getMisReuniones } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  kickoff:    { bg: "rgba(6,182,212,0.10)",   color: "#06b6d4" },
  seguimiento:{ bg: "rgba(74,139,0,0.10)",    color: "var(--verde)" },
  revision:   { bg: "rgba(99,102,241,0.10)",  color: "#6366f1" },
  entrega:    { bg: "rgba(245,158,11,0.10)",  color: "#f59e0b" },
  otro:       { bg: "rgba(107,114,128,0.10)", color: "#6b7280" },
};

function getTipo(tipo?: string) {
  return (tipo ?? "general").toLowerCase();
}

function fmt(fecha: string) {
  return new Date(fecha).toLocaleString("es-PE", {
    weekday: "short", day: "2-digit", month: "short",
    year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

function isPast(fecha: string) {
  return new Date(fecha) < new Date();
}

function MeetingCard({ reunion }: { reunion: any }) {
  const past = isPast(reunion.fecha);
  const tc = TIPO_COLORS[getTipo(reunion.tipo)] ?? TIPO_COLORS.general;
  return (
    <div style={{
      background: "var(--bg)", border: "1px solid var(--border)",
      borderRadius: "14px", padding: "1.25rem 1.5rem",
      display: "flex", flexDirection: "column", gap: "0.85rem",
      opacity: past ? 0.75 : 1,
    }}>
      {/* Type + date */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{
          display: "inline-block", padding: "0.2rem 0.65rem", borderRadius: "8px",
          fontSize: "0.7rem", fontWeight: 600, fontFamily: "'Outfit', sans-serif",
          background: tc.bg, color: tc.color, textTransform: "uppercase", letterSpacing: "0.5px",
        }}>
          {reunion.tipo ?? "Reunion"}
        </span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
          {fmt(reunion.fecha)}
        </span>
      </div>

      {/* Title */}
      <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", margin: 0 }}>
        {reunion.titulo}
      </h3>

      {/* Descripción / Agenda */}
      {(reunion.descripcion || reunion.notas) && (
        <p style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif", margin: 0, lineHeight: 1.5 }}>
          {reunion.descripcion || reunion.notas}
        </p>
      )}
      {/* Proyecto */}
      {reunion.proyecto && (
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.35rem", fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "12px", height: "12px" }}>
            <path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {reunion.proyecto.nombre}
        </span>
      )}

      {/* Footer */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--border)", paddingTop: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
        <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
          {reunion.duracionMinutos ? `${reunion.duracionMinutos} min` : ""}
        </span>
        {reunion.linkMeet && !past && (
          <a
            href={reunion.linkMeet}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: "0.4rem",
              padding: "0.4rem 0.85rem", borderRadius: "8px", border: "none",
              background: "var(--verde)", color: "#fff", fontSize: "0.75rem",
              fontWeight: 600, textDecoration: "none", fontFamily: "'Outfit', sans-serif",
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "13px", height: "13px" }}>
              <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Unirse
          </a>
        )}
        {past && (
          <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", fontStyle: "italic" }}>Reunion pasada</span>
        )}
      </div>
    </div>
  );
}

export default function ReunionesPage() {
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMisReuniones()
      .then(setReuniones)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const proximas = reuniones.filter((r) => !isPast(r.fecha)).sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  const pasadas  = reuniones.filter((r) => isPast(r.fecha)).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: "'Google Sans', system-ui" }}>
          Reuniones
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
          Proximas reuniones y agenda del proyecto
        </p>
      </div>

      {loading ? (
        <LoadingSpinner text="Cargando reuniones..." />
      ) : reuniones.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", borderRadius: "16px", border: "1px dashed var(--border)" }}>
          <p style={{ color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>No hay reuniones programadas.</p>
        </div>
      ) : (
        <>
          {/* Proximas */}
          {proximas.length > 0 && (
            <div style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "1rem" }}>
                Proximas reuniones
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
                {proximas.map((r) => <MeetingCard key={r.id} reunion={r} />)}
              </div>
            </div>
          )}

          {/* Pasadas */}
          {pasadas.length > 0 && (
            <div>
              <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "1rem" }}>
                Reuniones pasadas
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
                {pasadas.map((r) => <MeetingCard key={r.id} reunion={r} />)}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
