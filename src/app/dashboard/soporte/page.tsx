"use client";

import { useState, useEffect } from "react";
import { getMisTickets, crearTicket } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const headingFont = "'Google Sans', system-ui";
const bodyFont = "'Outfit', sans-serif";

const TIPO_CONFIG: Record<string, { label: string; sublabel: string; icon: string; color: string; bg: string; border: string }> = {
  comentario: { label: "Comentario",        sublabel: "Comparte una opinion o nota general",  icon: "💬", color: "#6B7280", bg: "rgba(107,114,128,0.07)", border: "rgba(107,114,128,0.25)" },
  aporte:     { label: "Aporte / Sugerencia", sublabel: "Propone una mejora o nueva idea",     icon: "💡", color: "#2563EB", bg: "rgba(37,99,235,0.07)",   border: "rgba(37,99,235,0.25)" },
  incidencia: { label: "Incidencia",         sublabel: "Reporta un problema funcional o de flujo", icon: "⚠️", color: "#D97706", bg: "rgba(217,119,6,0.07)",  border: "rgba(217,119,6,0.25)" },
  bug:        { label: "Bug / Error técnico", sublabel: "Reporta un error tecnico o de codigo",  icon: "🐛", color: "#DC2626", bg: "rgba(220,38,38,0.07)",   border: "rgba(220,38,38,0.25)" },
};

const PRIORIDAD_STYLE: Record<string, { bg: string; color: string }> = {
  alta:  { bg: "rgba(220,38,38,0.1)",    color: "#DC2626" },
  media: { bg: "rgba(217,119,6,0.1)",    color: "#D97706" },
  baja:  { bg: "rgba(107,114,128,0.1)",  color: "#6B7280" },
};

const ESTADO_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  abierto:     { bg: "rgba(37,99,235,0.1)",   color: "#2563EB", dot: "#2563EB" },
  pendiente:   { bg: "rgba(37,99,235,0.1)",   color: "#2563EB", dot: "#2563EB" },
  en_progreso: { bg: "rgba(217,119,6,0.1)",   color: "#D97706", dot: "#D97706" },
  respondido:  { bg: "rgba(22,163,74,0.1)",   color: "#16A34A", dot: "#16A34A" },
  resuelto:    { bg: "rgba(22,163,74,0.1)",   color: "#16A34A", dot: "#16A34A" },
  cerrado:     { bg: "rgba(107,114,128,0.1)", color: "#6B7280", dot: "#6B7280" },
};

function fmt(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function TipoChip({ tipo }: { tipo: string }) {
  const cfg = TIPO_CONFIG[tipo?.toLowerCase()] ?? TIPO_CONFIG.comentario;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: bodyFont }}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

type FilterKey = "todos" | "abierto" | "en_progreso" | "resuelto";

export default function SoportePage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("todos");

  // nuevo reporte
  const [tipoSeleccionado, setTipoSeleccionado] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", descripcion: "", prioridad: "media" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  function load() {
    setLoading(true);
    getMisTickets()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tipoSeleccionado) return;
    setEnviando(true);
    setError("");
    try {
      await crearTicket({ ...form, tipo: tipoSeleccionado });
      setExito(true);
      setForm({ titulo: "", descripcion: "", prioridad: "media" });
      setTipoSeleccionado(null);
      load();
      setTimeout(() => setExito(false), 3500);
    } catch (err: any) {
      setError(err.message ?? "Error al enviar el reporte");
    } finally {
      setEnviando(false);
    }
  }

  const abiertos   = tickets.filter((t) => t.estado === "abierto" || t.estado === "pendiente").length;
  const enProgreso = tickets.filter((t) => t.estado === "en_progreso").length;
  const resueltos  = tickets.filter((t) => ["resuelto", "respondido", "cerrado"].includes(t.estado)).length;

  const filtered = tickets.filter((t) => {
    if (filter === "todos") return true;
    if (filter === "abierto") return t.estado === "abierto" || t.estado === "pendiente";
    if (filter === "en_progreso") return t.estado === "en_progreso";
    if (filter === "resuelto") return ["resuelto", "respondido", "cerrado"].includes(t.estado);
    return true;
  });

  const inputStyle: React.CSSProperties = {
    padding: "0.6rem 0.85rem", borderRadius: "8px", fontSize: "0.82rem",
    border: "1px solid var(--border)", background: "var(--bg-soft)",
    color: "var(--text-primary)", outline: "none", width: "100%",
    boxSizing: "border-box", fontFamily: bodyFont,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Header */}
      <div>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: headingFont }}>Reportes & Mensajes</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: bodyFont }}>Envianos comentarios, sugerencias, incidencias o bugs sobre tu proyecto</p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
        {[
          { label: "Abiertos",    value: abiertos,    color: "#2563EB" },
          { label: "En progreso", value: enProgreso,  color: "#D97706" },
          { label: "Resueltos",   value: resueltos,   color: "#16A34A" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "1.1rem 1.25rem", borderRadius: "14px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            <span style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color, fontFamily: headingFont, lineHeight: 1 }}>{loading ? "—" : s.value}</span>
            <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", fontFamily: bodyFont }}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Nuevo reporte */}
      <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", overflow: "hidden" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)" }}>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", margin: 0, fontFamily: headingFont }}>Nuevo reporte</p>
          <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", margin: "0.2rem 0 0", fontFamily: bodyFont }}>Selecciona el tipo y completa el formulario</p>
        </div>

        <div style={{ padding: "1.5rem" }}>

          {/* Exito banner */}
          {exito && (
            <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(22,163,74,0.08)", border: "1px solid #16A34A", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span style={{ fontSize: "1rem" }}>✅</span>
              <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#16A34A", fontFamily: bodyFont }}>Reporte enviado correctamente. El equipo lo revisará pronto.</span>
            </div>
          )}

          {/* 4 type cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
              const selected = tipoSeleccionado === key;
              return (
                <button
                  key={key}
                  onClick={() => setTipoSeleccionado(selected ? null : key)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "flex-start",
                    gap: "0.35rem", padding: "0.9rem 1rem", borderRadius: "12px",
                    border: `2px solid ${selected ? cfg.color : cfg.border}`,
                    background: selected ? cfg.bg : "var(--bg-soft)",
                    cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, background 0.15s",
                  }}
                >
                  <span style={{ fontSize: "1.25rem", lineHeight: 1 }}>{cfg.icon}</span>
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: selected ? cfg.color : "var(--text-primary)", fontFamily: headingFont }}>{cfg.label}</span>
                  <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: bodyFont, lineHeight: 1.4 }}>{cfg.sublabel}</span>
                </button>
              );
            })}
          </div>

          {/* Form — visible only when tipo selected */}
          {tipoSeleccionado && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem", paddingTop: "0.25rem", borderTop: `2px solid ${TIPO_CONFIG[tipoSeleccionado].color}30` }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", paddingTop: "1rem" }}>
                <span style={{ fontSize: "1rem" }}>{TIPO_CONFIG[tipoSeleccionado].icon}</span>
                <span style={{ fontSize: "0.85rem", fontWeight: 700, color: TIPO_CONFIG[tipoSeleccionado].color, fontFamily: headingFont }}>
                  {TIPO_CONFIG[tipoSeleccionado].label}
                </span>
              </div>

              {error && (
                <div style={{ padding: "0.6rem 0.9rem", borderRadius: "8px", background: "rgba(220,38,38,0.08)", border: "1px solid #DC2626", fontSize: "0.75rem", color: "#DC2626", fontFamily: bodyFont }}>
                  {error}
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", fontFamily: bodyFont, marginBottom: "0.35rem" }}>
                  Asunto <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  required
                  value={form.titulo}
                  onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                  style={inputStyle}
                  placeholder="Resume el tema en pocas palabras"
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", fontFamily: bodyFont, marginBottom: "0.35rem" }}>
                  Descripcion <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  value={form.descripcion}
                  onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                  style={{ ...inputStyle, resize: "vertical" }}
                  placeholder="Describe con detalle..."
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: "0.75rem", alignItems: "flex-end" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", fontFamily: bodyFont, marginBottom: "0.35rem" }}>Prioridad</label>
                  <select value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value }))} style={inputStyle}>
                    <option value="baja">Baja</option>
                    <option value="media">Media</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={enviando}
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "8px", border: "none",
                    background: TIPO_CONFIG[tipoSeleccionado].color, color: "#fff",
                    fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                    fontFamily: bodyFont, opacity: enviando ? 0.7 : 1, whiteSpace: "nowrap",
                  }}
                >
                  {enviando ? "Enviando..." : "Enviar reporte"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* History */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", flexWrap: "wrap", gap: "0.5rem" }}>
          <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", margin: 0, fontFamily: headingFont }}>Historial de reportes</p>
          <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            {([["todos", "Todos"], ["abierto", "Abiertos"], ["en_progreso", "En progreso"], ["resuelto", "Resueltos"]] as [FilterKey, string][]).map(([key, label]) => (
              <button key={key} onClick={() => setFilter(key)} style={{
                padding: "0.35rem 0.85rem", borderRadius: "7px", border: "1px solid",
                borderColor: filter === key ? "var(--verde)" : "var(--border)",
                background: filter === key ? "rgba(74,139,0,0.08)" : "var(--bg)",
                color: filter === key ? "var(--verde)" : "var(--text-secondary)",
                fontSize: "0.78rem", fontWeight: 500, cursor: "pointer", fontFamily: bodyFont,
              }}>{label}</button>
            ))}
          </div>
        </div>

        {loading ? (
          <LoadingSpinner text="Cargando reportes..." />
        ) : filtered.length === 0 ? (
          <div style={{ padding: "2.5rem", textAlign: "center", borderRadius: "14px", border: "1px dashed var(--border)" }}>
            <p style={{ color: "var(--text-muted)", fontFamily: bodyFont, fontSize: "0.85rem" }}>No hay reportes en esta categoría.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {filtered.map((t) => {
              const ps = PRIORIDAD_STYLE[t.prioridad?.toLowerCase()] ?? PRIORIDAD_STYLE.media;
              const es = ESTADO_STYLE[t.estado?.toLowerCase()] ?? ESTADO_STYLE.abierto;
              return (
                <div key={t.id} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem", flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: headingFont }}>{t.titulo}</p>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.2rem 0 0", fontFamily: bodyFont }}>{fmt(t.creadoEn ?? t.createdAt)}</p>
                    </div>
                    <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0, flexWrap: "wrap", alignItems: "center" }}>
                      {t.tipo && <TipoChip tipo={t.tipo} />}
                      <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 600, background: ps.bg, color: ps.color, fontFamily: bodyFont }}>{t.prioridad}</span>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 600, background: es.bg, color: es.color, fontFamily: bodyFont }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: es.dot, flexShrink: 0 }} />
                        {t.estado?.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                  {t.respuesta && (
                    <div style={{ background: "rgba(22,163,74,0.06)", border: "1px solid rgba(22,163,74,0.3)", borderRadius: "8px", padding: "0.6rem 0.85rem" }}>
                      <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "#16A34A", margin: "0 0 0.2rem", fontFamily: bodyFont }}>Respuesta del equipo:</p>
                      <p style={{ fontSize: "0.78rem", color: "var(--text-secondary)", margin: 0, fontFamily: bodyFont, lineHeight: 1.5 }}>{t.respuesta}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
