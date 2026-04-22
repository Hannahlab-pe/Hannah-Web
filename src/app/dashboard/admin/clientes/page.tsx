"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Dialog, Transition } from "@headlessui/react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import PageHeader from "@/components/shared/page-header";
import { getClientes, crearCliente, enviarBienvenida, toggleClienteActivo, type UsuarioSession } from "@/libs/api";

// ── Helpers ──────────────────────────────────────────────────────
function Chip({ label, green }: { label: string; green: boolean }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "0.2rem 0.6rem",
      borderRadius: "999px", fontSize: "0.65rem", fontWeight: 600,
      background: green ? "rgba(74,139,0,0.1)" : "rgba(239,68,68,0.08)",
      color: green ? "var(--verde)" : "#ef4444",
      border: `1px solid ${green ? "var(--verde)" : "#ef4444"}`,
    }}>{label}</span>
  );
}

function Avatar({ nombre }: { nombre: string }) {
  return (
    <div style={{
      width: "36px", height: "36px", borderRadius: "50%", background: "var(--verde)",
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "0.8rem", fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>{nombre.charAt(0).toUpperCase()}</div>
  );
}

// ── Generador de contraseña ───────────────────────────────────────
function generarPassword(len = 12): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$%";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

// ── Modal crear cliente ───────────────────────────────────────────
const INPUT_STYLE: React.CSSProperties = {
  padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem",
  border: "1px solid var(--border)", background: "var(--bg-soft)",
  color: "var(--text-primary)", outline: "none", width: "100%", boxSizing: "border-box",
};
const LABEL_STYLE: React.CSSProperties = {
  fontSize: "0.7rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.3rem", display: "block",
};

function ModalCrearCliente({ open, onClose, onCreado }: { open: boolean; onClose: () => void; onCreado: () => void }) {
  const [form, setForm] = useState({
    nombre: "", email: "", password: "", empresa: "", telefono: "", ruc: "", direccion: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [enviarCorreo, setEnviarCorreo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function set(key: keyof typeof form, val: string) {
    setForm((f) => ({ ...f, [key]: val }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const nuevo = await crearCliente({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        empresa: form.empresa || undefined,
        telefono: form.telefono || undefined,
        ruc: form.ruc || undefined,
        direccion: form.direccion || undefined,
      });
      if (enviarCorreo) {
        try {
          await enviarBienvenida(nuevo.id, form.password);
          setSuccessMsg("Cliente creado y correo de bienvenida enviado.");
        } catch {
          setSuccessMsg("Cliente creado, pero no se pudo enviar el correo.");
        }
        await new Promise((r) => setTimeout(r, 1800));
      }
      onCreado();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al crear cliente");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" style={{ position: "relative", zIndex: 50 }} onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)" }} />
        </Transition.Child>

        {/* Panel */}
        <div style={{ position: "fixed", inset: 0, overflowY: "auto" }}>
          <div style={{ display: "flex", minHeight: "100%", alignItems: "center", justifyContent: "center", padding: "1rem" }}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-150" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel style={{
                width: "100%", maxWidth: "680px",
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "18px", padding: "2rem",
                display: "flex", flexDirection: "column", gap: "1.25rem",
                boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
              }}>
                {/* Header */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <Dialog.Title style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                      Nuevo cliente
                    </Dialog.Title>
                    <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
                      Completa los datos para crear la cuenta del cliente
                    </p>
                  </div>
                  <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem", lineHeight: 1 }}>✕</button>
                </div>

                {/* Mensajes */}
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

                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {/* Datos personales */}
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Datos personales</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={LABEL_STYLE}>Nombre completo <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="text" required placeholder="Juan Pérez" value={form.nombre} onChange={(e) => set("nombre", e.target.value)} style={INPUT_STYLE} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={LABEL_STYLE}>Teléfono</label>
                      <input type="tel" placeholder="+51 999 123 456" value={form.telefono} onChange={(e) => set("telefono", e.target.value)} style={INPUT_STYLE} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={LABEL_STYLE}>Email <span style={{ color: "#ef4444" }}>*</span></label>
                      <input type="email" required placeholder="juan@empresa.com" value={form.email} onChange={(e) => set("email", e.target.value)} style={INPUT_STYLE} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={LABEL_STYLE}>RUC</label>
                      <input type="text" placeholder="20123456789" value={form.ruc} onChange={(e) => set("ruc", e.target.value)} style={INPUT_STYLE} />
                    </div>
                  </div>

                  {/* Empresa */}
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Empresa</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={LABEL_STYLE}>Nombre de empresa</label>
                      <input type="text" placeholder="Empresa S.A.C." value={form.empresa} onChange={(e) => set("empresa", e.target.value)} style={INPUT_STYLE} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <label style={LABEL_STYLE}>Dirección</label>
                      <input type="text" placeholder="Av. Principal 123, Lima" value={form.direccion} onChange={(e) => set("direccion", e.target.value)} style={INPUT_STYLE} />
                    </div>
                  </div>

                  {/* Acceso */}
                  <p style={{ fontSize: "0.65rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: 0 }}>Acceso a la plataforma</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <label style={LABEL_STYLE}>Contraseña temporal <span style={{ color: "#ef4444" }}>*</span></label>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                      <input
                        type={showPass ? "text" : "password"}
                        required
                        placeholder="Mín. 8 caracteres"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        style={{ ...INPUT_STYLE, flex: 1 }}
                      />
                      <button type="button" onClick={() => setShowPass((v) => !v)} style={{
                        padding: "0.5rem 0.65rem", borderRadius: "8px", border: "1px solid var(--border)",
                        background: "var(--bg-soft)", cursor: "pointer", color: "var(--text-secondary)", fontSize: "0.75rem", flexShrink: 0,
                      }}>
                        {showPass ? "Ocultar" : "Ver"}
                      </button>
                      <button type="button" onClick={() => set("password", generarPassword())} style={{
                        padding: "0.5rem 0.75rem", borderRadius: "8px", border: "1px solid var(--border)",
                        background: "var(--bg-soft)", cursor: "pointer", color: "var(--verde)", fontSize: "0.72rem", fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap",
                      }}>
                        Generar
                      </button>
                    </div>
                    {form.password && (
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: 0 }}>
                        Longitud: {form.password.length} caracteres
                      </p>
                    )}
                  </div>

                  {/* Checkbox correo */}
                  <label style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", padding: "0.75rem", borderRadius: "10px", border: "1px solid var(--border)", background: enviarCorreo ? "rgba(74,139,0,0.04)" : "var(--bg-soft)", transition: "all 0.15s" }}>
                    <input
                      type="checkbox"
                      checked={enviarCorreo}
                      onChange={(e) => setEnviarCorreo(e.target.checked)}
                      style={{ accentColor: "var(--verde)", width: "15px", height: "15px", flexShrink: 0 }}
                    />
                    <div>
                      <p style={{ fontSize: "0.78rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Enviar correo de bienvenida</p>
                      <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", margin: "0.15rem 0 0" }}>Se enviará un email con las credenciales al correo del cliente</p>
                    </div>
                  </label>

                  {/* Botones */}
                  <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.25rem" }}>
                    <button type="button" onClick={onClose} style={{
                      flex: 1, padding: "0.65rem", borderRadius: "9px", fontSize: "0.8rem",
                      border: "1px solid var(--border)", background: "transparent",
                      cursor: "pointer", color: "var(--text-secondary)", fontWeight: 500,
                    }}>Cancelar</button>
                    <button type="submit" disabled={loading} style={{
                      flex: 2, padding: "0.65rem", borderRadius: "9px", fontSize: "0.82rem",
                      background: "var(--verde)", border: "none", color: "#fff",
                      fontWeight: 600, cursor: loading ? "wait" : "pointer",
                      opacity: loading ? 0.75 : 1,
                    }}>
                      {loading ? (successMsg ? "Enviando correo..." : "Creando...") : "Crear cliente"}
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

// ── Página principal ─────────────────────────────────────────────
export default function ClientesPage() {
  const router = useRouter();
  const [clientes, setClientes] = useState<UsuarioSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(false);
  const [search, setSearch] = useState("");

  async function cargar() {
    setLoading(true);
    try {
      const data = await getClientes();
      setClientes(data.filter((u: any) => u.rol === "cliente"));
    } catch (err: any) {
      setError(err.message ?? "Error al cargar clientes");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { cargar(); }, []);

  async function handleToggle(id: string, activo: boolean) {
    await toggleClienteActivo(id, !activo);
    cargar();
  }

  const filtrados = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    (c.empresa ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <PageHeader
        title="Clientes"
        subtitle={`${clientes.length} cliente${clientes.length !== 1 ? "s" : ""} registrado${clientes.length !== 1 ? "s" : ""}`}
        action={{ label: "Nuevo cliente", onClick: () => setModal(true) }}
      />

      {/* Buscador */}
      <div style={{ position: "relative" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "15px", height: "15px", position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem",
            borderRadius: "10px", fontSize: "0.8rem",
            border: "1px solid var(--border)", background: "var(--bg)",
            color: "var(--text-primary)", outline: "none", boxSizing: "border-box",
          }}
        />
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "10px", padding: "0.75rem 1rem", fontSize: "0.8rem", color: "#ef4444" }}>
          {error}
        </div>
      )}

      {/* Grid de clientes */}
      {loading ? (
        <LoadingSpinner text="Cargando clientes..." />
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {search ? "No se encontraron resultados." : "Aún no hay clientes. Crea el primero."}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
          {filtrados.map((c: any) => (
            <div
              key={c.id}
              onClick={() => router.push(`/dashboard/admin/clientes/${c.id}`)}
              style={{
                background: "var(--bg)", border: "1px solid var(--border)",
                borderRadius: "14px", padding: "1.25rem",
                display: "flex", flexDirection: "column", gap: "1rem",
                cursor: "pointer",
                transition: "box-shadow 0.2s, border-color 0.2s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.07)"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = "none"; (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)"; }}
            >
              {/* Top: avatar + estado */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                <Avatar nombre={c.nombre} />
                <Chip label={c.activo ? "Activo" : "Inactivo"} green={c.activo} />
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: "0.88rem", color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.nombre}
                </p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.2rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {c.email}
                </p>
                {c.empresa && (
                  <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: "0.2rem 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {c.empresa}
                  </p>
                )}
              </div>

              {/* Acción */}
              <button
                onClick={(e) => { e.stopPropagation(); handleToggle(c.id, c.activo); }}
                style={{
                  width: "100%", padding: "0.45rem", borderRadius: "8px",
                  fontSize: "0.72rem", fontWeight: 500,
                  border: "1px solid var(--border)", background: "transparent",
                  cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.15s",
                }}
                onMouseEnter={(e) => { e.stopPropagation(); e.currentTarget.style.borderColor = c.activo ? "#ef4444" : "var(--verde)"; e.currentTarget.style.color = c.activo ? "#ef4444" : "var(--verde)"; e.currentTarget.style.background = c.activo ? "rgba(239,68,68,0.05)" : "rgba(74,139,0,0.05)"; }}
                onMouseLeave={(e) => { e.stopPropagation(); e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; e.currentTarget.style.background = "transparent"; }}
              >
                {c.activo ? "Desactivar cliente" : "Activar cliente"}
              </button>
            </div>
          ))}
        </div>
      )}

      <ModalCrearCliente open={modal} onClose={() => setModal(false)} onCreado={cargar} />
    </div>
  );
}
