"use client";

import { useState, useEffect } from "react";
import { getAdminReuniones, getClientes, getProyectosPorCliente, crearReunion, type UsuarioSession } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";
import PageHeader from "@/components/shared/page-header";
import { toast } from "sonner";

const TIPOS = [
  { value: "kickoff",     label: "Kickoff" },
  { value: "seguimiento", label: "Seguimiento" },
  { value: "revision",    label: "Revisión" },
  { value: "entrega",     label: "Entrega" },
  { value: "otro",        label: "Otro" },
];

const TIPO_COLORS: Record<string, { bg: string; color: string }> = {
  kickoff:    { bg: "rgba(6,182,212,0.10)",   color: "#06b6d4" },
  seguimiento:{ bg: "rgba(74,139,0,0.10)",    color: "var(--verde)" },
  revision:   { bg: "rgba(99,102,241,0.10)",  color: "#6366f1" },
  entrega:    { bg: "rgba(245,158,11,0.10)",  color: "#f59e0b" },
  otro:       { bg: "rgba(107,114,128,0.10)", color: "#6b7280" },
};

const inputStyle: React.CSSProperties = {
  padding: "0.55rem 0.75rem", borderRadius: "8px", fontSize: "0.82rem",
  border: "1px solid var(--border)", background: "var(--bg-soft)",
  color: "var(--text-primary)", outline: "none", width: "100%",
  boxSizing: "border-box", fontFamily: "'Outfit', sans-serif",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.73rem", fontWeight: 600, color: "var(--text-secondary)",
  fontFamily: "'Outfit', sans-serif", display: "block", marginBottom: "0.3rem",
};

function ModalCrearReunion({ clientes, onClose, onCreada }: {
  clientes: UsuarioSession[];
  onClose: () => void;
  onCreada: () => void;
}) {
  const [form, setForm] = useState({
    titulo: "", tipo: "seguimiento", fecha: "", duracionMinutos: "60",
    linkMeet: "", descripcion: "", clienteId: "", proyectoId: "",
  });
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!form.clienteId) { setProyectos([]); return; }
    getProyectosPorCliente(form.clienteId).then(setProyectos).catch(() => {});
  }, [form.clienteId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clienteId) { toast.error("Selecciona un cliente"); return; }
    if (!form.fecha) { toast.error("Selecciona fecha y hora"); return; }
    setLoading(true);
    try {
      await crearReunion({
        titulo: form.titulo,
        tipo: form.tipo,
        fecha: form.fecha,
        duracionMinutos: form.duracionMinutos ? Number(form.duracionMinutos) : undefined,
        linkMeet: form.linkMeet || undefined,
        descripcion: form.descripcion || undefined,
        proyectoId: form.proyectoId || undefined,
        clienteId: form.clienteId,
      });
      toast.success("Reunión creada");
      onCreada();
      onClose();
    } catch (err: any) {
      toast.error(err?.message ?? "Error al crear la reunión");
    }
    setLoading(false);
  }

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{ background: "var(--bg)", borderRadius: "18px", padding: "2rem", width: "100%", maxWidth: "540px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1.25rem", maxHeight: "90vh", overflowY: "auto" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "'Google Sans', system-ui" }}>
            Nueva reunión
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem", lineHeight: 1 }}>✕</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {/* Cliente */}
          <div>
            <label style={labelStyle}>Cliente *</label>
            <select required value={form.clienteId} onChange={(e) => setForm(f => ({ ...f, clienteId: e.target.value, proyectoId: "" }))} style={inputStyle}>
              <option value="">Seleccionar cliente…</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}{c.empresa ? ` · ${c.empresa}` : ""}</option>)}
            </select>
          </div>

          {/* Título + Tipo */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 160px", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Título *</label>
              <input required type="text" value={form.titulo} onChange={(e) => setForm(f => ({ ...f, titulo: e.target.value }))} placeholder="Ej: Kickoff del proyecto" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Tipo</label>
              <select value={form.tipo} onChange={(e) => setForm(f => ({ ...f, tipo: e.target.value }))} style={inputStyle}>
                {TIPOS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Fecha + Duración */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Fecha y hora *</label>
              <input required type="datetime-local" value={form.fecha} onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Duración (min)</label>
              <input type="number" min="15" max="480" value={form.duracionMinutos} onChange={(e) => setForm(f => ({ ...f, duracionMinutos: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          {/* Link Meet */}
          <div>
            <label style={labelStyle}>Link de reunión</label>
            <input type="url" value={form.linkMeet} onChange={(e) => setForm(f => ({ ...f, linkMeet: e.target.value }))} placeholder="https://meet.google.com/..." style={inputStyle} />
          </div>

          {/* Proyecto relacionado */}
          {proyectos.length > 0 && (
            <div>
              <label style={labelStyle}>Proyecto relacionado</label>
              <select value={form.proyectoId} onChange={(e) => setForm(f => ({ ...f, proyectoId: e.target.value }))} style={inputStyle}>
                <option value="">Sin proyecto específico</option>
                {proyectos.map(p => <option key={p.id} value={p.id}>{p.nombre}</option>)}
              </select>
            </div>
          )}

          {/* Descripción / Agenda */}
          <div>
            <label style={labelStyle}>Descripción / Agenda</label>
            <textarea
              value={form.descripcion}
              onChange={(e) => setForm(f => ({ ...f, descripcion: e.target.value }))}
              placeholder="Puntos a tratar, objetivos de la reunión…"
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>

          {/* Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.65rem", borderRadius: "8px", fontSize: "0.82rem", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 500, fontFamily: "'Outfit', sans-serif" }}>
              Cancelar
            </button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.65rem", borderRadius: "8px", fontSize: "0.82rem", background: "var(--verde)", border: "none", color: "#fff", fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1, fontFamily: "'Outfit', sans-serif" }}>
              {loading ? "Creando…" : "Crear reunión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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

export default function AdminReunionesPage() {
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [clientes, setClientes] = useState<UsuarioSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);

  async function cargar() {
    setLoading(true);
    try {
      const [rs, cs] = await Promise.all([getAdminReuniones(), getClientes()]);
      setReuniones(rs.sort((a: any, b: any) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()));
      setClientes(cs.filter((c: any) => c.rol === "cliente"));
    } catch { /* silencioso */ }
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  const proximas = reuniones.filter(r => !isPast(r.fecha));
  const pasadas  = reuniones.filter(r => isPast(r.fecha));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Reuniones"
        subtitle={`${reuniones.length} reunión${reuniones.length !== 1 ? "es" : ""}`}
        action={{ label: "Nueva reunión", onClick: () => setModal(true) }}
      />

      {loading ? <LoadingSpinner text="Cargando reuniones…" /> : reuniones.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "16px" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0, fontFamily: "'Outfit', sans-serif" }}>No hay reuniones programadas.</p>
        </div>
      ) : (
        <>
          {proximas.length > 0 && (
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
                Próximas — {proximas.length}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {proximas.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime()).map((r) => (
                  <ReunionCard key={r.id} r={r} />
                ))}
              </div>
            </div>
          )}

          {pasadas.length > 0 && (
            <div>
              <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "0.75rem", fontFamily: "'Outfit', sans-serif" }}>
                Pasadas — {pasadas.length}
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", opacity: 0.75 }}>
                {pasadas.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()).map((r) => (
                  <ReunionCard key={r.id} r={r} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {modal && <ModalCrearReunion clientes={clientes} onClose={() => setModal(false)} onCreada={cargar} />}
    </div>
  );
}

function ReunionCard({ r }: { r: any }) {
  const tc = TIPO_COLORS[r.tipo] ?? TIPO_COLORS.otro;
  const past = isPast(r.fecha);

  return (
    <div style={{ padding: "1rem 1.25rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", alignItems: "flex-start", gap: "1rem", flexWrap: "wrap" }}>
      {/* Icon */}
      <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: tc.bg, border: `1px solid ${tc.color}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: "2px" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke={tc.color} strokeWidth="1.5" style={{ width: "18px", height: "18px" }}>
          <path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.2rem" }}>
          <span style={{ padding: "0.15rem 0.5rem", borderRadius: "6px", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.4px", background: tc.bg, color: tc.color, fontFamily: "'Outfit', sans-serif" }}>
            {r.tipo ?? "Reunion"}
          </span>
          {r.proyecto && (
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
              · {r.proyecto.nombre}
            </span>
          )}
        </div>
        <p style={{ fontWeight: 600, fontSize: "0.88rem", color: "var(--text-primary)", margin: 0, fontFamily: "'Google Sans', system-ui" }}>{r.titulo}</p>
        {r.descripcion && (
          <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", margin: "0.25rem 0 0", lineHeight: 1.5, fontFamily: "'Outfit', sans-serif", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {r.descripcion}
          </p>
        )}
        <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.3rem 0 0", fontFamily: "'Outfit', sans-serif" }}>
          {fmt(r.fecha)}
          {r.duracionMinutos ? ` · ${r.duracionMinutos} min` : ""}
          {r.cliente ? ` · ${r.cliente.nombre}` : ""}
        </p>
      </div>

      {/* Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
        {r.linkMeet && !past && (
          <a href={r.linkMeet} target="_blank" rel="noopener noreferrer" style={{ padding: "0.35rem 0.85rem", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 600, background: "var(--verde)", color: "#fff", textDecoration: "none", display: "flex", alignItems: "center", gap: "0.35rem", fontFamily: "'Outfit', sans-serif" }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
              <path d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Unirse
          </a>
        )}
        {past && (
          <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", fontStyle: "italic" }}>Pasada</span>
        )}
      </div>
    </div>
  );
}
