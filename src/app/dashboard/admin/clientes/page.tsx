"use client";

import { useState, useEffect } from "react";
import LoadingSpinner from "@/components/shared/loading-spinner";
import { getClientes, crearCliente, toggleClienteActivo, type UsuarioSession } from "@/libs/api";

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

// ── Modal crear cliente ───────────────────────────────────────────
function ModalCrearCliente({ onClose, onCreado }: { onClose: () => void; onCreado: () => void }) {
  const [form, setForm] = useState({ nombre: "", email: "", password: "", empresa: "", telefono: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await crearCliente({
        nombre: form.nombre,
        email: form.email,
        password: form.password,
        empresa: form.empresa || undefined,
        telefono: form.telefono || undefined,
      });
      onCreado();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Error al crear cliente");
    } finally {
      setLoading(false);
    }
  }

  const field = (
    label: string,
    key: keyof typeof form,
    type = "text",
    required = true,
    placeholder = ""
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)" }}>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input
        type={type}
        required={required}
        placeholder={placeholder}
        value={form[key]}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        style={{
          padding: "0.5rem 0.75rem", borderRadius: "8px", fontSize: "0.8rem",
          border: "1px solid var(--border)", background: "var(--bg-soft)",
          color: "var(--text-primary)", outline: "none",
        }}
      />
    </div>
  );

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 50,
      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "var(--bg)", borderRadius: "16px", padding: "2rem",
        width: "100%", maxWidth: "440px", border: "1px solid var(--border)",
        display: "flex", flexDirection: "column", gap: "1.25rem",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Nuevo cliente</h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", fontSize: "1.2rem" }}>✕</button>
        </div>

        {error && (
          <div style={{ background: "rgba(239,68,68,0.08)", border: "1px solid #ef4444", borderRadius: "8px", padding: "0.6rem 0.9rem", fontSize: "0.75rem", color: "#ef4444" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.85rem" }}>
          {field("Nombre completo", "nombre")}
          {field("Email", "email", "email")}
          {field("Contraseña", "password", "password")}
          {field("Empresa", "empresa", "text", false, "Ej: Empresa S.A.")}
          {field("Teléfono", "telefono", "tel", false, "Ej: +52 55 1234 5678")}

          <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem" }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: "0.6rem", borderRadius: "8px", fontSize: "0.8rem",
              border: "1px solid var(--border)", background: "transparent",
              cursor: "pointer", color: "var(--text-secondary)", fontWeight: 500,
            }}>Cancelar</button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: "0.6rem", borderRadius: "8px", fontSize: "0.8rem",
              background: "var(--verde)", border: "none", color: "#fff",
              fontWeight: 600, cursor: loading ? "wait" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}>{loading ? "Creando..." : "Crear cliente"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ─────────────────────────────────────────────
export default function ClientesPage() {
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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Clientes</h1>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
            {clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrado{clientes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <button onClick={() => setModal(true)} style={{
          display: "flex", alignItems: "center", gap: "0.5rem",
          padding: "0.55rem 1rem", borderRadius: "10px", fontSize: "0.8rem", fontWeight: 600,
          background: "var(--verde)", border: "none", color: "#fff", cursor: "pointer",
        }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "15px", height: "15px" }}><path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" /></svg>
          Nuevo cliente
        </button>
      </div>

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

      {/* Lista */}
      {loading ? (
        <LoadingSpinner text="Cargando clientes..." />
      ) : filtrados.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)", fontSize: "0.85rem" }}>
          {search ? "No se encontraron resultados." : "Aún no hay clientes. Crea el primero."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filtrados.map((c: any) => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: "1rem",
              padding: "1rem 1.25rem", background: "var(--bg)", border: "1px solid var(--border)",
              borderRadius: "12px", flexWrap: "wrap",
            }}>
              <Avatar nombre={c.nombre} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>{c.nombre}</p>
                <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>{c.email}</p>
                {c.empresa && <p style={{ fontSize: "0.72rem", color: "var(--text-secondary)", margin: "0.1rem 0 0" }}>{c.empresa}</p>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexShrink: 0 }}>
                <Chip label={c.activo ? "Activo" : "Inactivo"} green={c.activo} />
                <button
                  onClick={() => handleToggle(c.id, c.activo)}
                  style={{
                    padding: "0.3rem 0.7rem", borderRadius: "8px", fontSize: "0.7rem", fontWeight: 500,
                    border: "1px solid var(--border)", background: "transparent",
                    cursor: "pointer", color: "var(--text-secondary)", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.color = "var(--verde)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
                >
                  {c.activo ? "Desactivar" : "Activar"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && <ModalCrearCliente onClose={() => setModal(false)} onCreado={cargar} />}
    </div>
  );
}
