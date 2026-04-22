"use client";

import { useState, useEffect } from "react";
import { getAdminReuniones, getClientes, crearReunion, type UsuarioSession } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";
import PageHeader from "@/components/shared/page-header";

function ModalCrearReunion({ clientes, onClose, onCreada }: {
  clientes: UsuarioSession[];
  onClose: () => void;
  onCreada: () => void;
}) {
  const [form, setForm] = useState({ titulo: "", tipo: "videollamada", fecha: "", duracionMinutos: "60", linkMeet: "", clienteId: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputStyle = { padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "var(--bg-soft)", color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box" as const };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await crearReunion({ titulo: form.titulo, tipo: form.tipo, fecha: form.fecha, duracionMinutos: Number(form.duracionMinutos), linkMeet: form.linkMeet || undefined, clienteId: form.clienteId });
      onCreada(); onClose();
    } catch (err: any) { setError(err.message ?? "Error"); }
    setLoading(false);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--bg)", borderRadius: "16px", padding: "2rem", width: "100%", maxWidth: "460px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1.2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nueva reunion</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}>✕</button>
        </div>
        {error && <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.75rem", color: "#ef4444" }}>{error}</div>}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Cliente *</label>
            <select required value={form.clienteId} onChange={(e) => setForm(f => ({ ...f, clienteId: e.target.value }))} style={inputStyle}>
              <option value="">Seleccionar...</option>
              {clientes.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          {[["Titulo", "titulo", "text"], ["Link de Meet", "linkMeet", "url"]].map(([label, key, type]) => (
            <div key={key} style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>{label}</label>
              <input type={type} value={(form as any)[key]} onChange={(e) => setForm(f => ({ ...f, [key]: e.target.value }))} style={inputStyle} required={key === "titulo"} />
            </div>
          ))}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Fecha y hora *</label>
              <input required type="datetime-local" value={form.fecha} onChange={(e) => setForm(f => ({ ...f, fecha: e.target.value }))} style={inputStyle} />
            </div>
            <div style={{ width: "100px", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Duracion (min)</label>
              <input type="number" min="15" max="480" value={form.duracionMinutos} onChange={(e) => setForm(f => ({ ...f, duracionMinutos: e.target.value }))} style={inputStyle} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.3rem" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 500 }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.6rem", borderRadius: "8px", fontSize: "0.8rem", background: "var(--verde)", border: "none", color: "#fff", fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creando..." : "Crear reunion"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
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
      setReuniones(rs);
      setClientes(cs.filter((c: any) => c.rol === "cliente"));
    } catch { /* silencioso */ }
    setLoading(false);
  }

  useEffect(() => { cargar(); }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Reuniones"
        subtitle={`${reuniones.length} reunion${reuniones.length !== 1 ? "es" : ""}`}
        action={{ label: "Nueva reunión", onClick: () => setModal(true) }}
      />

      {loading ? <LoadingSpinner text="Cargando reuniones..." /> : reuniones.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "3rem 0" }}>No hay reuniones.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {reuniones.map((r) => (
            <div key={r.id} style={{ padding: "1rem 1.25rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(74,139,0,0.08)", border: "1px solid var(--verde)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--verde)" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}><path d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>{r.titulo}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
                  {new Date(r.fecha).toLocaleString("es-MX", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  {r.duracionMinutos && ` · ${r.duracionMinutos} min`}
                </p>
                {r.cliente && <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: "0.1rem 0 0" }}>{r.cliente.nombre}</p>}
              </div>
              {r.linkMeet && (
                <a href={r.linkMeet} target="_blank" rel="noopener noreferrer" style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600, background: "rgba(74,139,0,0.08)", border: "1px solid var(--verde)", color: "var(--verde)", textDecoration: "none", flexShrink: 0 }}>
                  Unirse
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {modal && <ModalCrearReunion clientes={clientes} onClose={() => setModal(false)} onCreada={cargar} />}
    </div>
  );
}
