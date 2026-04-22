"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAdminProyectos, getProyectosComoEncargado, getClientes, crearProyecto, getUsuarioGuardado, type UsuarioSession } from "@/libs/api";

// ── Helpers ──────────────────────────────────────────────────────
const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  en_progreso: { label: "En progreso", color: "var(--verde)" },
  completado: { label: "Completado", color: "#3b82f6" },
  pausado: { label: "Pausado", color: "#6b7280" },
};

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ height: "5px", borderRadius: "999px", background: "var(--bg-soft)", width: "100%", overflow: "hidden" }}>
      <div style={{ width: `${value}%`, height: "100%", background: "var(--verde)", borderRadius: "999px", transition: "width 0.4s" }} />
    </div>
  );
}

// ── Modal crear proyecto ──────────────────────────────────────────
function ModalCrearProyecto({ clientes, subadmins, onClose, onCreado }: {
  clientes: UsuarioSession[];
  subadmins: UsuarioSession[];
  onClose: () => void;
  onCreado: () => void;
}) {
  const [form, setForm] = useState({ nombre: "", descripcion: "", clienteId: "", fechaEntrega: "" });
  const [encargadosIds, setEncargadosIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function toggleEncargado(id: string) {
    setEncargadosIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await crearProyecto({
        nombre: form.nombre,
        descripcion: form.descripcion || undefined,
        clienteId: form.clienteId,
        fechaEntrega: form.fechaEntrega || undefined,
        encargadosIds: encargadosIds.length > 0 ? encargadosIds : undefined,
      });
      onCreado();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al crear proyecto");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem",
    border: "1px solid var(--border)", background: "var(--bg-soft)",
    color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: "var(--bg)", borderRadius: "16px", padding: "2rem 2.5rem", width: "100%", maxWidth: "640px", border: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nuevo proyecto</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}>✕</button>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.75rem", color: "#ef4444" }}>{error}</div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {/* Fila 1: Cliente + Nombre */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Cliente <span style={{ color: "#ef4444" }}>*</span></label>
              <select required value={form.clienteId} onChange={(e) => setForm((f) => ({ ...f, clienteId: e.target.value }))} style={inputStyle}>
                <option value="">Seleccionar cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.nombre} {c.empresa ? `· ${c.empresa}` : ""}</option>
                ))}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Nombre del proyecto <span style={{ color: "#ef4444" }}>*</span></label>
              <input required type="text" placeholder="Ej: Web corporativa..." value={form.nombre} onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))} style={inputStyle} />
            </div>
          </div>

          {/* Descripción */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Descripción</label>
            <textarea rows={2} value={form.descripcion} onChange={(e) => setForm((f) => ({ ...f, descripcion: e.target.value }))} style={{ ...inputStyle, resize: "vertical" as const }} />
          </div>

          {/* Encargados */}
          {subadmins.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Encargados del equipo</label>
              <div style={{ border: "1px solid var(--border)", borderRadius: "8px", background: "var(--bg-soft)", maxHeight: "110px", overflowY: "auto", padding: "0.4rem 0", display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                {subadmins.map((s) => (
                  <label
                    key={s.id}
                    style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.35rem 0.75rem", cursor: "pointer", fontSize: "0.78rem", color: "var(--text-primary)", userSelect: "none" }}
                  >
                    <input
                      type="checkbox"
                      checked={encargadosIds.includes(s.id)}
                      onChange={() => toggleEncargado(s.id)}
                      style={{ accentColor: "var(--verde)", width: "14px", height: "14px", cursor: "pointer" }}
                    />
                    {s.nombre}{s.empresa ? ` · ${s.empresa}` : ""}
                  </label>
                ))}
              </div>
              {encargadosIds.length > 0 && (
                <p style={{ fontSize: "0.7rem", color: "var(--verde)", margin: 0 }}>{encargadosIds.length} encargado{encargadosIds.length > 1 ? "s" : ""} seleccionado{encargadosIds.length > 1 ? "s" : ""}</p>
              )}
            </div>
          )}

          {/* Fecha entrega */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>Fecha de entrega</label>
            <input type="date" value={form.fechaEntrega} onChange={(e) => setForm((f) => ({ ...f, fechaEntrega: e.target.value }))} style={inputStyle} />
          </div>

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 500 }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.6rem", borderRadius: "8px", fontSize: "0.8rem", background: "var(--verde)", border: "none", color: "#fff", fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Creando..." : "Crear proyecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página ─────────────────────────────────────────────────────────
export default function AdminProyectosPage() {
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [clientes, setClientes] = useState<UsuarioSession[]>([]);
  const [subadmins, setSubadmins] = useState<UsuarioSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();

  const usuario = getUsuarioGuardado();
  const isAdmin = usuario?.rol === "admin";

  async function cargar() {
    setLoading(true);
    try {
      if (isAdmin) {
        const [ps, cs] = await Promise.all([getAdminProyectos(), getClientes()]);
        setProyectos(ps);
        setClientes(cs.filter((c: any) => c.rol === "cliente"));
        setSubadmins(cs.filter((c: any) => c.rol === "subadmin"));
      } else {
        const ps = await getProyectosComoEncargado();
        setProyectos(ps);
      }
    } catch (err: any) {
      setError(err.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  const filtrados = proyectos.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (p.cliente?.nombre ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "960px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
            {isAdmin ? "Proyectos" : "Mis proyectos asignados"}
          </h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
            {proyectos.length} proyecto{proyectos.length !== 1 ? "s" : ""}{isAdmin ? " en total" : " asignados a ti"}
          </p>
        </div>
        {isAdmin && (
          <button onClick={() => setModal(true)} style={{
            display: "flex", alignItems: "center", gap: "0.5rem",
            padding: "0.55rem 1rem", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600,
            background: "var(--verde)", border: "none", color: "#fff", cursor: "pointer",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "15px", height: "15px" }}><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" /></svg>
            Nuevo proyecto
          </button>
        )}
      </div>

      {/* Buscador */}
      <div style={{ position: "relative" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "15px", height: "15px", position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" />
        </svg>
        <input type="text" placeholder="Buscar por nombre o cliente..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem", borderRadius: "10px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "10px", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#ef4444" }}>{error}</div>
      )}

      {loading ? (
        <LoadingSpinner text="Cargando proyectos..." />
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {search ? "Sin resultados." : isAdmin ? "Aún no hay proyectos. Crea el primero." : "Aún no tienes proyectos asignados."}
        </div>
      ) : (
        <div style={{ display: "grid", gap: "0.75rem" }}>
          {filtrados.map((p) => {
            const estado = ESTADO_LABELS[p.estado] ?? { label: p.estado, color: "var(--text-muted)" };
            return (
              <div
                key={p.id}
                onClick={() => router.push(`/dashboard/admin/proyectos/${p.id}`)}
                style={{ padding: "1.25rem 1.5rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "14px", display: "flex", flexDirection: "column", gap: "0.75rem", cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", margin: 0 }}>{p.nombre}</p>
                    {p.descripcion && <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.2rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.descripcion}</p>}
                    {p.cliente && (
                      <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: "0.25rem 0 0" }}>
                        Cliente: <strong>{p.cliente.nombre}</strong>{p.cliente.empresa ? ` · ${p.cliente.empresa}` : ""}
                      </p>
                    )}
                  </div>
                  <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 600, background: `${estado.color}18`, color: estado.color, border: `1px solid ${estado.color}`, flexShrink: 0 }}>
                    {estado.label}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{ flex: 1 }}><ProgressBar value={p.progreso ?? 0} /></div>
                  <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--verde)", width: "2.5rem", textAlign: "right" }}>{p.progreso ?? 0}%</span>
                </div>
                {p.fechaEntrega && (
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>
                    Entrega: {new Date(p.fechaEntrega).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isAdmin && modal && <ModalCrearProyecto clientes={clientes} subadmins={subadmins} onClose={() => setModal(false)} onCreado={cargar} />}
    </div>
  );
}
