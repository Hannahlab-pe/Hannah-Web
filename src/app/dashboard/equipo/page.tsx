"use client";

import { useState, useEffect } from "react";
import { getMiEquipo, getUsuarioGuardado } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const AVATAR_COLORS = ["#4A8B00", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];

function Avatar({ nombre, size = 40 }: { nombre: string; size?: number }) {
  const bg = AVATAR_COLORS[nombre.charCodeAt(0) % AVATAR_COLORS.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: bg,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {nombre.trim().charAt(0).toUpperCase()}
    </div>
  );
}

export default function MiEquipoPage() {
  const [equipo, setEquipo] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const yo = getUsuarioGuardado();

  // El usuario es principal si NO tiene clientePrincipal
  const soyPrincipal = !yo?.clientePrincipal;

  useEffect(() => {
    getMiEquipo()
      .then(setEquipo)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner text="Cargando equipo..." />;

  // El primero de la lista es siempre el principal
  const principal = equipo[0];
  const miembros = equipo.slice(1);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "'Google Sans', system-ui" }}>
          Mi equipo
        </h1>
        <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)", margin: "0.25rem 0 0", fontFamily: "'Outfit', sans-serif" }}>
          Todos los miembros de tu organización con acceso al portal
        </p>
      </div>

      {equipo.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "16px", background: "var(--bg)" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>No hay miembros en tu equipo aún.</p>
        </div>
      ) : (
        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>

          {/* Cabecera */}
          <div style={{ padding: "0.7rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
            <span style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              {equipo.length} {equipo.length === 1 ? "persona" : "personas"} con acceso
            </span>
          </div>

          {equipo.map((m, i) => {
            const esPrincipal = i === 0;
            const soyYo = m.id === yo?.id;
            return (
              <div
                key={m.id}
                style={{
                  display: "flex", alignItems: "center", gap: "1rem",
                  padding: "1rem 1.25rem",
                  borderBottom: i < equipo.length - 1 ? "1px solid var(--border)" : "none",
                  background: soyYo ? "rgba(74,139,0,0.03)" : "transparent",
                }}
              >
                <div style={{ position: "relative" }}>
                  <Avatar nombre={m.nombre} size={40} />
                  {soyYo && (
                    <span style={{
                      position: "absolute", bottom: -1, right: -1,
                      width: 12, height: 12, borderRadius: "50%",
                      background: "var(--verde)", border: "2px solid var(--bg)",
                    }} />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                      {m.nombre}
                    </p>
                    {soyYo && (
                      <span style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--verde)", background: "rgba(74,139,0,0.1)", padding: "0.1rem 0.45rem", borderRadius: "4px", border: "1px solid rgba(74,139,0,0.2)" }}>
                        Tú
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
                    {m.email}{m.telefono ? ` · ${m.telefono}` : ""}
                  </p>
                </div>

                <span style={{
                  fontSize: "0.65rem", fontWeight: 600,
                  padding: "0.22rem 0.6rem", borderRadius: "6px", flexShrink: 0,
                  background: esPrincipal ? "rgba(37,99,235,0.08)" : "rgba(74,139,0,0.08)",
                  color: esPrincipal ? "#2563eb" : "var(--verde)",
                  border: `1px solid ${esPrincipal ? "rgba(37,99,235,0.18)" : "rgba(74,139,0,0.18)"}`,
                }}>
                  {esPrincipal ? "Responsable" : "Miembro"}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Nota */}
      <div style={{ display: "flex", gap: "0.65rem", padding: "0.85rem 1rem", background: "rgba(37,99,235,0.05)", border: "1px solid rgba(37,99,235,0.12)", borderRadius: "10px", alignItems: "flex-start" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="1.8" style={{ width: 16, height: 16, flexShrink: 0, marginTop: "1px" }}>
          <path d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <p style={{ fontSize: "0.75rem", color: "#3b82f6", margin: 0, lineHeight: 1.5 }}>
          {soyPrincipal
            ? "Eres el responsable de esta cuenta. Contacta al equipo Hannah Lab para agregar o eliminar miembros de tu organización."
            : "Tienes acceso a todos los proyectos y tickets de tu organización. Contacta al equipo Hannah Lab si necesitas cambios en los accesos."}
        </p>
      </div>
    </div>
  );
}
