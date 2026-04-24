"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getUsuarioGuardado, getPerfil, actualizarPerfil, cambiarPassword } from "@/libs/api";

const ROL_LABEL: Record<string, string> = {
  admin: "Administrador",
  subadmin: "Subadministrador",
  cliente: "Cliente",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px",
  border: "1px solid var(--border)", background: "var(--bg-soft)",
  color: "var(--text-primary)", fontSize: "0.85rem", fontFamily: "'Outfit', sans-serif",
  outline: "none", boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.78rem", fontWeight: 500, color: "var(--text-muted)",
  fontFamily: "'Outfit', sans-serif", marginBottom: "0.35rem", display: "block",
};

const sectionStyle: React.CSSProperties = {
  padding: "1.5rem", borderRadius: "16px", background: "var(--bg)", border: "1px solid var(--border)",
};

const sectionTitleStyle: React.CSSProperties = {
  fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)",
  fontFamily: "'Google Sans', system-ui", marginBottom: "1rem",
  paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)",
};

function guardarEnLocalStorage(datos: Record<string, unknown>) {
  try {
    const raw = localStorage.getItem("hw_usuario");
    const actual = raw ? JSON.parse(raw) : {};
    localStorage.setItem("hw_usuario", JSON.stringify({ ...actual, ...datos }));
  } catch { /* ignorar */ }
}

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(() => getUsuarioGuardado());

  // Campos editables de perfil
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);

  // Campos de contraseña
  const [passActual, setPassActual] = useState("");
  const [passNueva, setPassNueva] = useState("");
  const [passConfirm, setPassConfirm] = useState("");
  const [guardandoPass, setGuardandoPass] = useState(false);

  useEffect(() => {
    getPerfil()
      .then((data) => {
        setUsuario(data);
        setNombre(data.nombre ?? "");
        setTelefono(data.telefono ?? "");
        setEmpresa(data.empresa ?? "");
      })
      .catch(() => {
        // Usar datos de localStorage si falla
        const local = getUsuarioGuardado();
        if (local) {
          setNombre(local.nombre ?? "");
          setTelefono(local.telefono ?? "");
          setEmpresa(local.empresa ?? "");
        }
      });
  }, []);

  const initial = (nombre || usuario?.nombre || "?").charAt(0).toUpperCase();
  const rolLabel = ROL_LABEL[usuario?.rol ?? ""] ?? usuario?.rol ?? "—";

  async function handleGuardarPerfil(e: React.FormEvent) {
    e.preventDefault();
    if (!nombre.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    setGuardandoPerfil(true);
    try {
      const actualizado = await actualizarPerfil({
        nombre: nombre.trim(),
        telefono: telefono.trim() || undefined,
        empresa: empresa.trim() || undefined,
      });
      setUsuario(actualizado);
      guardarEnLocalStorage({ nombre: actualizado.nombre, telefono: actualizado.telefono, empresa: actualizado.empresa });
      toast.success("Perfil actualizado correctamente");
    } catch (err: any) {
      toast.error(err?.message ?? "Error al actualizar el perfil");
    } finally {
      setGuardandoPerfil(false);
    }
  }

  async function handleCambiarPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!passActual || !passNueva || !passConfirm) {
      toast.error("Completa todos los campos de contraseña");
      return;
    }
    if (passNueva.length < 6) {
      toast.error("La nueva contraseña debe tener al menos 6 caracteres");
      return;
    }
    if (passNueva !== passConfirm) {
      toast.error("Las contraseñas nuevas no coinciden");
      return;
    }
    setGuardandoPass(true);
    try {
      await cambiarPassword({ passwordActual: passActual, passwordNueva: passNueva });
      setPassActual("");
      setPassNueva("");
      setPassConfirm("");
      toast.success("Contraseña actualizada correctamente");
    } catch (err: any) {
      toast.error(err?.message ?? "Error al cambiar la contraseña");
    } finally {
      setGuardandoPass(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: "'Google Sans', system-ui" }}>Perfil</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>Administra tu cuenta y configuración de seguridad</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* Left: avatar + info */}
        <div style={{ ...sectionStyle, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          <div style={{ width: "88px", height: "88px", borderRadius: "50%", background: "linear-gradient(135deg, var(--verde), rgba(74,139,0,0.7))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.1rem", boxShadow: "0 4px 12px rgba(74,139,0,0.2)" }}>
            <span style={{ fontSize: "2.1rem", fontWeight: 700, color: "#fff", fontFamily: "'Google Sans', system-ui" }}>{initial}</span>
          </div>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "0.25rem" }}>
            {nombre || usuario?.nombre || "—"}
          </h2>
          <span style={{ display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(74,139,0,0.1)", color: "var(--verde)", fontSize: "0.7rem", fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: "1.25rem", border: "1px solid rgba(74,139,0,0.15)" }}>
            {rolLabel}
          </span>

          <div style={{ width: "100%", textAlign: "left" }}>
            {[
              { path: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", label: "Email", value: usuario?.email },
              { path: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z", label: "Rol", value: rolLabel },
              { path: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z", label: "Teléfono", value: telefono || "—" },
              { path: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21", label: "Empresa", value: empresa || "—" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.65rem", padding: "0.65rem 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "7px", background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ width: "15px", height: "15px" }}>
                    <path d={item.path} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.68rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: "0.82rem", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", margin: 0 }}>{item.value ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: forms */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Datos personales */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Datos personales</h3>
            <form onSubmit={handleGuardarPerfil}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Nombre completo</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Tu nombre"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Teléfono</label>
                    <input
                      type="text"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+51 999 999 999"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Empresa</label>
                    <input
                      type="text"
                      value={empresa}
                      onChange={(e) => setEmpresa(e.target.value)}
                      placeholder="Nombre de tu empresa"
                      style={inputStyle}
                    />
                  </div>
                </div>
                <div>
                  <label style={labelStyle}>Email</label>
                  <input
                    type="email"
                    value={usuario?.email ?? ""}
                    disabled
                    style={{ ...inputStyle, opacity: 0.55, cursor: "not-allowed" }}
                  />
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.3rem", fontFamily: "'Outfit', sans-serif" }}>
                    El email no se puede cambiar. Contacta al administrador si necesitas actualizarlo.
                  </p>
                </div>
              </div>
              <div style={{ marginTop: "1.25rem" }}>
                <button
                  type="submit"
                  disabled={guardandoPerfil}
                  style={{ padding: "0.65rem 1.4rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: guardandoPerfil ? "not-allowed" : "pointer", opacity: guardandoPerfil ? 0.7 : 1, fontFamily: "'Outfit', sans-serif" }}
                >
                  {guardandoPerfil ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>

          {/* Seguridad / Cambiar contraseña */}
          <div style={sectionStyle}>
            <h3 style={sectionTitleStyle}>Cambiar contraseña</h3>
            <form onSubmit={handleCambiarPassword}>
              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Contraseña actual</label>
                  <input
                    type="password"
                    value={passActual}
                    onChange={(e) => setPassActual(e.target.value)}
                    placeholder="Ingresa tu contraseña actual"
                    autoComplete="current-password"
                    style={inputStyle}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                  <div>
                    <label style={labelStyle}>Nueva contraseña</label>
                    <input
                      type="password"
                      value={passNueva}
                      onChange={(e) => setPassNueva(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      autoComplete="new-password"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>Confirmar contraseña</label>
                    <input
                      type="password"
                      value={passConfirm}
                      onChange={(e) => setPassConfirm(e.target.value)}
                      placeholder="Repite la nueva contraseña"
                      autoComplete="new-password"
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginTop: "1.25rem" }}>
                <button
                  type="submit"
                  disabled={guardandoPass}
                  style={{ padding: "0.65rem 1.4rem", borderRadius: "8px", border: "none", background: guardandoPass ? "var(--border)" : "#1e293b", color: guardandoPass ? "var(--text-muted)" : "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: guardandoPass ? "not-allowed" : "pointer", fontFamily: "'Outfit', sans-serif" }}
                >
                  {guardandoPass ? "Actualizando..." : "Actualizar contraseña"}
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .perfil-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
