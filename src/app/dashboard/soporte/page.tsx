"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import { getMisTickets, crearTicket, getMisProyectos } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const headingFont = "'Google Sans', system-ui";
const bodyFont = "'Outfit', sans-serif";

// ── SVG icons ────────────────────────────────────────────────────
function IconChat({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}
function IconLightbulb({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M9 21h6M12 3a6 6 0 016 6c0 2.22-1.21 4.16-3 5.2V18H9v-3.8C7.21 13.16 6 11.22 6 9a6 6 0 016-6z" />
    </svg>
  );
}
function IconAlertTriangle({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}
function IconBug({ size = 20, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <path d="M8 2l1.88 1.88M14.12 3.88L16 2M9 7.13v-1a3.003 3.003 0 116 0v1" />
      <path d="M12 20c-3.3 0-6-2.7-6-6v-3a6 6 0 0112 0v3c0 3.3-2.7 6-6 6z" />
      <path d="M6 13H2M22 13h-4M6 19l-2 2M18 19l2 2M6 7l-2-2M18 7l2-2" />
    </svg>
  );
}
function IconX({ size = 18, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}
function IconCheck({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
function IconPlus({ size = 16, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function TipoIcon({ tipo, size = 16, color }: { tipo: string; size?: number; color?: string }) {
  const c = color ?? TIPO_CONFIG[tipo]?.color ?? "#6B7280";
  switch (tipo) {
    case "aporte":     return <IconLightbulb size={size} color={c} />;
    case "incidencia": return <IconAlertTriangle size={size} color={c} />;
    case "bug":        return <IconBug size={size} color={c} />;
    default:           return <IconChat size={size} color={c} />;
  }
}

// ── Config types ─────────────────────────────────────────────────
const TIPO_CONFIG: Record<string, { label: string; sublabel: string; color: string; bg: string; border: string }> = {
  comentario: { label: "Comentario",          sublabel: "Comparte una opinion o nota general",       color: "#6B7280", bg: "rgba(107,114,128,0.07)", border: "rgba(107,114,128,0.25)" },
  aporte:     { label: "Aporte / Sugerencia", sublabel: "Propone una mejora o nueva idea",           color: "#2563EB", bg: "rgba(37,99,235,0.07)",   border: "rgba(37,99,235,0.25)"   },
  incidencia: { label: "Incidencia",          sublabel: "Reporta un problema funcional o de flujo",  color: "#D97706", bg: "rgba(217,119,6,0.07)",   border: "rgba(217,119,6,0.25)"   },
  bug:        { label: "Bug / Error tecnico", sublabel: "Reporta un error tecnico o de codigo",      color: "#DC2626", bg: "rgba(220,38,38,0.07)",    border: "rgba(220,38,38,0.25)"   },
};

const PRIORIDAD_STYLE: Record<string, { bg: string; color: string }> = {
  alta:  { bg: "rgba(220,38,38,0.1)",   color: "#DC2626" },
  media: { bg: "rgba(217,119,6,0.1)",   color: "#D97706" },
  baja:  { bg: "rgba(107,114,128,0.1)", color: "#6B7280" },
};

const ESTADO_STYLE: Record<string, { bg: string; color: string; dot: string }> = {
  abierto:     { bg: "rgba(37,99,235,0.1)",   color: "#2563EB", dot: "#2563EB" },
  pendiente:   { bg: "rgba(37,99,235,0.1)",   color: "#2563EB", dot: "#2563EB" },
  en_progreso: { bg: "rgba(217,119,6,0.1)",   color: "#D97706", dot: "#D97706" },
  respondido:  { bg: "rgba(22,163,74,0.1)",   color: "#16A34A", dot: "#16A34A" },
  resuelto:    { bg: "rgba(22,163,74,0.1)",   color: "#16A34A", dot: "#16A34A" },
  cerrado:     { bg: "rgba(107,114,128,0.1)", color: "#6B7280", dot: "#6B7280" },
};

const INPUT_STYLE: React.CSSProperties = {
  padding: "0.6rem 0.85rem", borderRadius: "8px", fontSize: "0.82rem",
  border: "1px solid var(--border)", background: "var(--bg-soft)",
  color: "var(--text-primary)", outline: "none", width: "100%",
  boxSizing: "border-box", fontFamily: bodyFont,
};
const LABEL_STYLE: React.CSSProperties = {
  display: "block", fontSize: "0.75rem", fontWeight: 600,
  color: "var(--text-secondary)", fontFamily: bodyFont, marginBottom: "0.35rem",
};

function fmt(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Chip ─────────────────────────────────────────────────────────
function TipoChip({ tipo }: { tipo: string }) {
  const cfg = TIPO_CONFIG[tipo?.toLowerCase()] ?? TIPO_CONFIG.comentario;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.55rem", borderRadius: "6px", fontSize: "0.68rem", fontWeight: 600, background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`, fontFamily: bodyFont }}>
      <TipoIcon tipo={tipo} size={11} color={cfg.color} />
      {cfg.label}
    </span>
  );
}

// ── Dialog form ───────────────────────────────────────────────────
function DialogNuevoReporte({
  open, tipo, proyectos, onClose, onCreado,
}: {
  open: boolean;
  tipo: string | null;
  proyectos: { id: string; nombre: string }[];
  onClose: () => void;
  onCreado: () => void;
}) {
  const [form, setForm] = useState({ titulo: "", descripcion: "", prioridad: "media", proyectoId: "" });
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState("");

  // Reset form when dialog opens
  useEffect(() => {
    if (open) { setForm({ titulo: "", descripcion: "", prioridad: "media", proyectoId: "" }); setError(""); }
  }, [open, tipo]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tipo) return;
    setEnviando(true);
    setError("");
    try {
      await crearTicket({
        ...form,
        tipo,
        proyectoId: form.proyectoId || undefined,
      });
      onCreado();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al enviar el reporte");
    } finally {
      setEnviando(false);
    }
  }

  const cfg = tipo ? TIPO_CONFIG[tipo] : null;

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" style={{ position: "relative", zIndex: 50 }} onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        </Transition.Child>

        <div style={{ position: "fixed", inset: 0, overflowY: "auto" }}>
          <div style={{ display: "flex", minHeight: "100%", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel style={{
                width: "100%", maxWidth: "500px", background: "var(--bg)",
                border: "1px solid var(--border)", borderRadius: "18px", padding: "2rem",
                display: "flex", flexDirection: "column", gap: "1.25rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
                    {cfg && (
                      <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: cfg.bg, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <TipoIcon tipo={tipo!} size={18} color={cfg.color} />
                      </div>
                    )}
                    <div>
                      <Dialog.Title style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: headingFont }}>
                        {cfg?.label ?? "Nuevo reporte"}
                      </Dialog.Title>
                      <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.15rem 0 0", fontFamily: bodyFont }}>
                        {cfg?.sublabel}
                      </p>
                    </div>
                  </div>
                  <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", flexShrink: 0, padding: "0.25rem", lineHeight: 1 }}>
                    <IconX size={18} />
                  </button>
                </div>

                {error && (
                  <div style={{ padding: "0.6rem 0.9rem", borderRadius: "8px", background: "rgba(220,38,38,0.08)", border: "1px solid #DC2626", fontSize: "0.75rem", color: "#DC2626", fontFamily: bodyFont }}>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <label style={LABEL_STYLE}>Proyecto relacionado</label>
                    <select
                      value={form.proyectoId}
                      onChange={(e) => setForm((f) => ({ ...f, proyectoId: e.target.value }))}
                      style={INPUT_STYLE}
                    >
                      <option value="">— Sin proyecto especifico —</option>
                      {proyectos.map((p) => (
                        <option key={p.id} value={p.id}>{p.nombre}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={LABEL_STYLE}>Asunto <span style={{ color: "#DC2626" }}>*</span></label>
                    <input
                      required
                      value={form.titulo}
                      onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
                      style={INPUT_STYLE}
                      placeholder="Resume el tema en pocas palabras"
                    />
                  </div>

                  <div>
                    <label style={LABEL_STYLE}>Descripcion <span style={{ color: "#DC2626" }}>*</span></label>
                    <textarea
                      required
                      rows={4}
                      value={form.descripcion}
                      onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))}
                      style={{ ...INPUT_STYLE, resize: "vertical" }}
                      placeholder="Describe con detalle..."
                    />
                  </div>

                  <div>
                    <label style={LABEL_STYLE}>Prioridad</label>
                    <select value={form.prioridad} onChange={(e) => setForm((f) => ({ ...f, prioridad: e.target.value }))} style={INPUT_STYLE}>
                      <option value="baja">Baja</option>
                      <option value="media">Media</option>
                      <option value="alta">Alta</option>
                    </select>
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
                    <button type="button" onClick={onClose} style={{ padding: "0.55rem 1.2rem", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--bg-soft)", color: "var(--text-secondary)", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: bodyFont }}>
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={enviando}
                      style={{
                        padding: "0.55rem 1.4rem", borderRadius: "8px", border: "none",
                        background: cfg?.color ?? "var(--verde)", color: "#fff",
                        fontSize: "0.82rem", fontWeight: 700, cursor: "pointer",
                        fontFamily: bodyFont, opacity: enviando ? 0.7 : 1,
                      }}
                    >
                      {enviando ? "Enviando..." : "Enviar reporte"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// ── Page ─────────────────────────────────────────────────────────
type FilterKey = "todos" | "abierto" | "en_progreso" | "resuelto";

export default function SoportePage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [proyectos, setProyectos] = useState<{ id: string; nombre: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("todos");
  const [dialogTipo, setDialogTipo] = useState<string | null>(null);
  const [exito, setExito] = useState(false);

  function load() {
    setLoading(true);
    getMisTickets()
      .then(setTickets)
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    load();
    getMisProyectos()
      .then((ps) => setProyectos(ps.map((p: any) => ({ id: p.id, nombre: p.nombre }))))
      .catch(() => {});
  }, []);

  function handleCreado() {
    load();
    setExito(true);
    setTimeout(() => setExito(false), 4000);
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

  return (
    <>
      <DialogNuevoReporte
        open={dialogTipo !== null}
        tipo={dialogTipo}
        proyectos={proyectos}
        onClose={() => setDialogTipo(null)}
        onCreado={handleCreado}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

        {/* Header */}
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: headingFont }}>Reportes & Mensajes</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: bodyFont }}>Envianos comentarios, sugerencias, incidencias o bugs sobre tu proyecto</p>
        </div>

        {/* Success banner */}
        {exito && (
          <div style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(22,163,74,0.08)", border: "1px solid #16A34A", display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <IconCheck size={16} color="#16A34A" />
            <span style={{ fontSize: "0.82rem", fontWeight: 600, color: "#16A34A", fontFamily: bodyFont }}>Reporte enviado correctamente. El equipo lo revisara pronto.</span>
          </div>
        )}

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "0.75rem" }}>
          {[
            { label: "Abiertos",    value: abiertos,   color: "#2563EB" },
            { label: "En progreso", value: enProgreso, color: "#D97706" },
            { label: "Resueltos",   value: resueltos,  color: "#16A34A" },
          ].map((s) => (
            <div key={s.label} style={{ padding: "1.1rem 1.25rem", borderRadius: "14px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "0.15rem" }}>
              <span style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color, fontFamily: headingFont, lineHeight: 1 }}>{loading ? "—" : s.value}</span>
              <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", fontFamily: bodyFont }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Type cards */}
        <div>
          <p style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", fontFamily: headingFont, marginBottom: "0.75rem", textTransform: "uppercase", letterSpacing: "0.06em" }}>Nuevo reporte</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(175px, 1fr))", gap: "0.75rem" }}>
            {Object.entries(TIPO_CONFIG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => setDialogTipo(key)}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "0.5rem",
                  padding: "1rem 1.1rem", borderRadius: "14px",
                  border: `1.5px solid ${cfg.border}`, background: cfg.bg,
                  cursor: "pointer", textAlign: "left", transition: "border-color 0.15s, box-shadow 0.15s",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = cfg.color; (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 0 3px ${cfg.color}18`; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = cfg.border; (e.currentTarget as HTMLButtonElement).style.boxShadow = "none"; }}
              >
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: `${cfg.color}15`, border: `1px solid ${cfg.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <TipoIcon tipo={key} size={16} color={cfg.color} />
                </div>
                <div>
                  <p style={{ fontSize: "0.83rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: headingFont }}>{cfg.label}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.2rem 0 0", fontFamily: bodyFont, lineHeight: 1.4 }}>{cfg.sublabel}</p>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", marginTop: "0.25rem" }}>
                  <IconPlus size={12} color={cfg.color} />
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: cfg.color, fontFamily: bodyFont }}>Crear</span>
                </div>
              </button>
            ))}
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
              <p style={{ color: "var(--text-muted)", fontFamily: bodyFont, fontSize: "0.85rem" }}>No hay reportes en esta categoria.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              {filtered.map((t) => {
                const ps = PRIORIDAD_STYLE[t.prioridad?.toLowerCase()] ?? PRIORIDAD_STYLE.media;
                const es = ESTADO_STYLE[t.estado?.toLowerCase()] ?? ESTADO_STYLE.abierto;
                return (
                  <div
                    key={t.id}
                    onClick={() => router.push(`/dashboard/soporte/${t.id}`)}
                    style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.5rem", cursor: "pointer", transition: "border-color 0.15s" }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
                  >
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
    </>
  );
}
