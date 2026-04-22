"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { getClientes, crearMiembro, toggleClienteActivo, enviarBienvenida, type UsuarioSession } from "@/libs/api";
import PageHeader from "@/components/shared/page-header";
import LoadingSpinner from "@/components/shared/loading-spinner";

// ── Helpers ───────────────────────────────────────────────────────
function generarPassword(len = 12): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

const INP: React.CSSProperties = {
  padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem",
  border: "1px solid var(--border)", background: "var(--bg-soft)",
  color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box",
};
const LBL: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.3rem", display: "block",
};

// ── Avatar ────────────────────────────────────────────────────────
function Avatar({ nombre, size = 40 }: { nombre: string; size?: number }) {
  const colors = ["#4A8B00", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
  const color = colors[nombre.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: size * 0.38, fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {nombre.charAt(0).toUpperCase()}
    </div>
  );
}

// ── Modal nuevo miembro ───────────────────────────────────────────
function ModalNuevoMiembro({ open, onClose, onCreado }: {
  open: boolean; onClose: () => void; onCreado: () => void;
}) {
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [enviarCorreo, setEnviarCorreo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function reset() {
    setNombre(""); setEmail(""); setTelefono(""); setPassword("");
    setShowPass(false); setEnviarCorreo(true); setError(""); setSuccessMsg("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(""); setSuccessMsg("");
    try {
      const nuevo = await crearMiembro({
        nombre, email, password,
        telefono: telefono || undefined,
      });
      if (enviarCorreo) {
        try {
          await enviarBienvenida(nuevo.id, password);
          setSuccessMsg("Miembro creado y credenciales enviadas por correo.");
        } catch {
          setSuccessMsg("Miembro creado, pero no se pudo enviar el correo.");
        }
        await new Promise((r) => setTimeout(r, 1800));
      }
      reset();
      onCreado();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al crear miembro");
    } finally {
      setLoading(false);
    }
  }

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
                width: "100%", maxWidth: "500px",
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "16px", padding: "2rem",
                display: "flex", flexDirection: "column", gap: "1.1rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                  <div>
                    <Dialog.Title style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      Nuevo miembro del equipo
                    </Dialog.Title>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
                      Se creará con rol <strong style={{ color: "var(--text-primary)" }}>Subadmin</strong>
                    </p>
                  </div>
                  <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem", lineHeight: 1 }}>✕</button>
                </div>

                {error && (
                  <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.75rem", color: "#ef4444" }}>
                    {error}
                  </div>
                )}
                {successMsg && (
                  <div style={{ background: "rgba(74,139,0,0.08)", border: "1px solid var(--verde)", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.75rem", color: "var(--verde)" }}>
                    {successMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <div>
                      <label style={LBL}>Nombre completo <span style={{ color: "#ef4444" }}>*</span></label>
                      <input required type="text" placeholder="Ana García" value={nombre} onChange={(e) => setNombre(e.target.value)} style={INP} />
                    </div>
                    <div>
                      <label style={LBL}>Teléfono</label>
                      <input type="tel" placeholder="+51 999 123 456" value={telefono} onChange={(e) => setTelefono(e.target.value)} style={INP} />
                    </div>
                  </div>

                  <div>
                    <label style={LBL}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                    <input required type="email" placeholder="ana@hannahlab.com" value={email} onChange={(e) => setEmail(e.target.value)} style={INP} />
                  </div>

                  <div>
                    <label style={LBL}>Contraseña temporal <span style={{ color: "#ef4444" }}>*</span></label>
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <input
                        required type={showPass ? "text" : "password"}
                        placeholder="Mín. 8 caracteres"
                        value={password} onChange={(e) => setPassword(e.target.value)}
                        style={{ ...INP, flex: 1 }}
                      />
                      <button type="button" onClick={() => setShowPass((v) => !v)} style={{
                        padding: "0.5rem 0.6rem", borderRadius: "8px", border: "1px solid var(--border)",
                        background: "var(--bg-soft)", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.75rem", flexShrink: 0,
                      }}>
                        {showPass ? "Ocultar" : "Ver"}
                      </button>
                      <button type="button" onClick={() => setPassword(generarPassword())} style={{
                        padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border)",
                        background: "var(--bg-soft)", cursor: "pointer", color: "var(--verde)", fontSize: "0.72rem", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap",
                      }}>
                        Generar
                      </button>
                    </div>
                    {password && (
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "0.3rem 0 0" }}>
                        Longitud: {password.length} caracteres
                      </p>
                    )}
                  </div>

                  {/* Checkbox correo */}
                  <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", padding: "0.7rem", borderRadius: "10px", border: "1px solid var(--border)", background: enviarCorreo ? "rgba(74,139,0,0.04)" : "var(--bg-soft)" }}>
                    <input type="checkbox" checked={enviarCorreo} onChange={(e) => setEnviarCorreo(e.target.checked)} style={{ accentColor: "var(--verde)", width: "15px", height: "15px", flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Enviar correo de bienvenida</p>
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>Envía las credenciales de acceso al correo del miembro</p>
                    </div>
                  </label>

                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                    <button type="button" onClick={onClose} style={{ flex: 1, padding: "0.6rem", borderRadius: "8px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "transparent", cursor: "pointer", color: "var(--text-secondary)", fontWeight: 500 }}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={loading} style={{ flex: 2, padding: "0.6rem", borderRadius: "8px", fontSize: "0.82rem", background: "var(--verde)", border: "none", color: "#fff", fontWeight: 600, cursor: loading ? "wait" : "pointer", opacity: loading ? 0.7 : 1 }}>
                      {loading ? (successMsg ? "Enviando correo..." : "Creando...") : "Agregar al equipo"}
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

// ── Página principal ──────────────────────────────────────────────
export default function EquipoPage() {
  const router = useRouter();
  const [equipo, setEquipo] = useState<UsuarioSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");

  async function cargar() {
    setLoading(true);
    try {
      const todos = await getClientes();
      setEquipo(todos.filter((u: any) => u.rol === "subadmin"));
    } catch (err: any) {
      setError(err.message ?? "Error al cargar equipo");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function handleToggle(id: string, activo: boolean) {
    await toggleClienteActivo(id, !activo);
    cargar();
  }

  const filtrados = equipo.filter((m) =>
    m.nombre.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase())
  );

  const activos = equipo.filter((m) => (m as any).activo).length;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Equipo"
        subtitle={`${activos} miembro${activos !== 1 ? "s" : ""} activo${activos !== 1 ? "s" : ""} · ${equipo.length} total`}
        action={{ label: "Nuevo miembro", onClick: () => setModal(true) }}
      />

      {/* Buscador */}
      <div style={{ position: "relative" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "15px", height: "15px", position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" />
        </svg>
        <input
          type="text" placeholder="Buscar miembro..."
          value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem", borderRadius: "10px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }}
        />
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "10px", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {loading ? (
        <LoadingSpinner text="Cargando equipo..." />
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", border: "1px dashed var(--border)", borderRadius: "14px" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>👥</div>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0, fontWeight: 500 }}>
            {search ? "No se encontraron miembros." : "Aún no hay miembros en el equipo."}
          </p>
          {!search && (
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", margin: "0.4rem 0 0" }}>
              Agrega el primer miembro con el botón de arriba.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {filtrados.map((m: any) => (
            <div
              key={m.id}
              onClick={() => router.push(`/dashboard/admin/equipo/${m.id}`)}
              style={{
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "1.25rem",
                display: "flex", flexDirection: "column", gap: "1rem",
                cursor: "pointer", transition: "box-shadow 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
            >
              {/* Fila 1: avatar + badge estado */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Avatar nombre={m.nombre} size={38} />
                <span style={{
                  fontSize: "0.6rem", fontWeight: 700,
                  padding: "0.2rem 0.6rem", borderRadius: "999px",
                  background: m.activo ? "rgba(74,139,0,0.1)" : "rgba(239,68,68,0.08)",
                  color: m.activo ? "var(--verde)" : "#ef4444",
                  border: `1px solid ${m.activo ? "var(--verde)" : "#ef4444"}`,
                }}>
                  {m.activo ? "Activo" : "Inactivo"}
                </span>
              </div>

              {/* Fila 2: nombre + email */}
              <div style={{ minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.nombre}
                </p>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.2rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {m.email}
                </p>
              </div>

              {/* Fila 3: chips + fecha */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <span style={{
                    fontSize: "0.58rem", fontWeight: 700, padding: "0.15rem 0.5rem",
                    borderRadius: "4px", background: "rgba(139,92,246,0.1)",
                    color: "#8b5cf6", border: "1px solid rgba(139,92,246,0.2)",
                    textTransform: "uppercase", letterSpacing: "0.06em",
                  }}>
                    Subadmin
                  </span>
                  {m.telefono && (
                    <span style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>{m.telefono}</span>
                  )}
                </div>
                {m.creadoEn && (
                  <p style={{ fontSize: "0.67rem", color: "var(--text-muted)", margin: 0 }}>
                    Desde {new Date(m.creadoEn).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" })}
                  </p>
                )}
              </div>

              {/* Botón acción */}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggle(m.id, m.activo); }}
                style={{
                  width: "100%", padding: "0.45rem", borderRadius: "8px",
                  fontSize: "0.72rem", fontWeight: 500,
                  border: "1px solid var(--border)", background: "transparent",
                  cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.stopPropagation(); e.currentTarget.style.borderColor = m.activo ? "#ef4444" : "var(--verde)"; e.currentTarget.style.color = m.activo ? "#ef4444" : "var(--verde)"; e.currentTarget.style.background = m.activo ? "rgba(239,68,68,0.05)" : "rgba(74,139,0,0.05)"; }}
                onMouseLeave={(e) => { e.stopPropagation(); e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
              >
                {m.activo ? "Desactivar miembro" : "Activar miembro"}
              </button>
            </div>
          ))}
        </div>
      )}

      <ModalNuevoMiembro open={modal} onClose={() => setModal(false)} onCreado={cargar} />
    </div>
  );
}
