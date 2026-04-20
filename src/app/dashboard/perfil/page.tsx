"use client";

import { useState, useEffect } from "react";
import { getUsuarioGuardado, getPerfil } from "@/libs/api";

export default function PerfilPage() {
  const [usuario, setUsuario] = useState(() => getUsuarioGuardado());
  const [notifications, setNotifications] = useState({ email: true, whatsapp: true, weekly: false });
  const [passwordFields, setPasswordFields] = useState({ current: "", new: "", confirm: "" });
  const [timezone, setTimezone] = useState("America/Lima");
  const [language, setLanguage] = useState("es");

  useEffect(() => {
    getPerfil().then((data) => setUsuario(data)).catch(() => {});
  }, []);

  const initial = usuario?.nombre?.charAt(0).toUpperCase() ?? "?";
  const rolLabel = usuario?.rol === "admin" ? "Administrador" : "Cliente";

  const Toggle = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange} style={{
      width: "44px", height: "24px", borderRadius: "12px", border: "none",
      background: checked ? "var(--verde)" : "var(--border)",
      position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0,
    }}>
      <span style={{
        position: "absolute", top: "2px", left: checked ? "22px" : "2px",
        width: "20px", height: "20px", borderRadius: "50%", background: "#fff",
        transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
      }} />
    </button>
  );

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.65rem 0.85rem", borderRadius: "8px",
    border: "1px solid var(--border)", background: "var(--bg-soft)",
    color: "var(--text-primary)", fontSize: "0.85rem", fontFamily: "'Outfit', sans-serif",
    outline: "none", boxSizing: "border-box",
  };

  const selectStyle: React.CSSProperties = {
    ...inputStyle, appearance: "none" as const,
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: "no-repeat", backgroundPosition: "right 0.75rem center", paddingRight: "2rem",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "0.8rem", fontWeight: 500, color: "var(--text-muted)",
    fontFamily: "'Outfit', sans-serif", marginBottom: "0.35rem", display: "block",
  };

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)",
    fontFamily: "'Google Sans', system-ui", marginBottom: "1rem",
    paddingBottom: "0.75rem", borderBottom: "1px solid var(--border)",
  };

  const profileItems = [
    { icon: "M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75", label: "Email", value: usuario?.email ?? "—" },
    ...(usuario?.empresa ? [{ icon: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21", label: "Empresa", value: usuario.empresa }] : []),
    ...(usuario?.telefono ? [{ icon: "M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z", label: "Telefono", value: usuario.telefono }] : []),
    { icon: "M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z", label: "Rol", value: rolLabel },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: "'Google Sans', system-ui" }}>Perfil</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>Administra tu cuenta, preferencias y configuracion de seguridad</p>
      </div>

      {/* Two Columns Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1.5rem", alignItems: "start" }}>

        {/* Left Column */}
        <div style={{ padding: "2rem", borderRadius: "16px", background: "var(--bg)", border: "1px solid var(--border)", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
          {/* Avatar */}
          <div style={{ width: "96px", height: "96px", borderRadius: "50%", background: "linear-gradient(135deg, var(--verde), rgba(74,139,0,0.7))", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "1.25rem", boxShadow: "0 4px 12px rgba(74,139,0,0.2)" }}>
            <span style={{ fontSize: "2.25rem", fontWeight: 700, color: "#fff", fontFamily: "'Google Sans', system-ui" }}>{initial}</span>
          </div>

          <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "0.25rem" }}>
            {usuario?.nombre ?? "—"}
          </h2>
          <span style={{ display: "inline-block", padding: "0.25rem 0.65rem", borderRadius: "6px", background: "rgba(74,139,0,0.1)", color: "var(--verde)", fontSize: "0.72rem", fontWeight: 600, fontFamily: "'Outfit', sans-serif", marginBottom: "1.25rem", border: "1px solid rgba(74,139,0,0.15)" }}>
            {rolLabel}
          </span>

          {/* Profile Details */}
          <div style={{ width: "100%", textAlign: "left" }}>
            {profileItems.map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 0", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ width: "16px", height: "16px" }}>
                    <path d={item.icon} strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", marginBottom: "0.1rem" }}>{item.label}</p>
                  <p style={{ fontSize: "0.85rem", color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          {/* Notificaciones */}
          <div style={{ padding: "1.5rem", borderRadius: "16px", background: "var(--bg)", border: "1px solid var(--border)" }}>
            <h3 style={sectionTitleStyle}>Notificaciones</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {[
                { key: "email" as const,    title: "Actualizaciones por Email",  desc: "Recibe notificaciones de proyectos y facturas por correo" },
                { key: "whatsapp" as const, title: "Alertas por WhatsApp",       desc: "Notificaciones instantaneas de cambios importantes" },
                { key: "weekly" as const,   title: "Reporte Semanal",            desc: "Resumen semanal del progreso de tus proyectos" },
              ].map((item) => (
                <div key={item.key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 0.85rem", borderRadius: "10px", background: "var(--bg-soft)", gap: "1rem" }}>
                  <div>
                    <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif", marginBottom: "0.15rem" }}>{item.title}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>{item.desc}</p>
                  </div>
                  <Toggle checked={notifications[item.key]} onChange={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })} />
                </div>
              ))}
            </div>
          </div>

          {/* Seguridad */}
          <div style={{ padding: "1.5rem", borderRadius: "16px", background: "var(--bg)", border: "1px solid var(--border)" }}>
            <h3 style={sectionTitleStyle}>Seguridad</h3>
            <div style={{ display: "grid", gap: "0.85rem" }}>
              <div>
                <label style={labelStyle}>Contrasena Actual</label>
                <input type="password" value={passwordFields.current} onChange={(e) => setPasswordFields({ ...passwordFields, current: e.target.value })} placeholder="Ingresa tu contrasena actual" style={inputStyle} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
                <div>
                  <label style={labelStyle}>Nueva Contrasena</label>
                  <input type="password" value={passwordFields.new} onChange={(e) => setPasswordFields({ ...passwordFields, new: e.target.value })} placeholder="Nueva contrasena" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Confirmar Contrasena</label>
                  <input type="password" value={passwordFields.confirm} onChange={(e) => setPasswordFields({ ...passwordFields, confirm: e.target.value })} placeholder="Confirmar contrasena" style={inputStyle} />
                </div>
              </div>
              <button style={{ padding: "0.65rem 1.25rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif", width: "fit-content" }}>
                Actualizar Contrasena
              </button>
            </div>
          </div>

          {/* Preferencias */}
          <div style={{ padding: "1.5rem", borderRadius: "16px", background: "var(--bg)", border: "1px solid var(--border)" }}>
            <h3 style={sectionTitleStyle}>Preferencias</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem" }}>
              <div>
                <label style={labelStyle}>Zona Horaria</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} style={selectStyle}>
                  <option value="America/Lima">America/Lima (UTC-5)</option>
                  <option value="America/Bogota">America/Bogota (UTC-5)</option>
                  <option value="America/Mexico_City">America/Mexico City (UTC-6)</option>
                  <option value="America/Santiago">America/Santiago (UTC-4)</option>
                  <option value="America/Buenos_Aires">America/Buenos Aires (UTC-3)</option>
                  <option value="Europe/Madrid">Europe/Madrid (UTC+1)</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Idioma</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} style={selectStyle}>
                  <option value="es">Espanol</option>
                  <option value="en">English</option>
                  <option value="pt">Portugues</option>
                </select>
              </div>
            </div>
            <button style={{ marginTop: "1rem", padding: "0.65rem 1.25rem", borderRadius: "8px", border: "none", background: "var(--verde)", color: "#fff", fontSize: "0.82rem", fontWeight: 600, cursor: "pointer", fontFamily: "'Outfit', sans-serif" }}>
              Guardar Preferencias
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          div[style*="gridTemplateColumns: \\"340px 1fr\\""] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
