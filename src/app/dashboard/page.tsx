"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

const stats = [
  { label: "Proyectos activos", value: "4", change: "+1 este mes", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}><path d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: "Automatizaciones", value: "12", change: "3 en ejecucion", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: "Tareas completadas", value: "89", change: "+15 esta semana", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}><path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
  { label: "Tickets soporte", value: "2", change: "1 pendiente", icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}><path d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" strokeLinecap="round" strokeLinejoin="round" /></svg> },
];

const recentActivity = [
  { title: "Bot de facturacion ejecutado", time: "Hace 5 min", status: "success" },
  { title: "Despliegue web actualizado", time: "Hace 1 hora", status: "success" },
  { title: "Ticket #142 respondido", time: "Hace 3 horas", status: "info" },
  { title: "Nuevo reporte generado", time: "Hace 5 horas", status: "success" },
  { title: "Mantenimiento programado", time: "Manana 2:00 AM", status: "warning" },
];

const projects = [
  { name: "Automatizacion Ventas", progress: 85, status: "En progreso" },
  { name: "ERP Odoo - Modulo Inventario", progress: 60, status: "En progreso" },
  { name: "Web Corporativa v2", progress: 100, status: "Completado" },
  { name: "Bot WhatsApp", progress: 30, status: "Iniciando" },
];

export default function DashboardPage() {
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".dash-el", { opacity: 0, y: 20 }, {
        opacity: 1, y: 0, duration: 0.6, stagger: 0.08, ease: "power3.out",
      });
    }, pageRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef}>
      {/* Header */}
      <div className="dash-el" style={{ opacity: 0, marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
          Buen dia, Cliente
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
          Aqui tienes un resumen de tus proyectos y automatizaciones.
        </p>
      </div>

      {/* Stats grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem", marginBottom: "1.5rem" }} className="dash-stats lg:!grid-cols-4 md:!grid-cols-2 !grid-cols-1">
        {stats.map((stat) => (
          <div key={stat.label} className="dash-el" style={{
            opacity: 0, padding: "1.25rem", borderRadius: "16px",
            background: "var(--bg)", border: "1px solid var(--border)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
              <div style={{
                width: "36px", height: "36px", borderRadius: "10px",
                background: "rgba(74,139,0,0.08)", border: "1px solid rgba(74,139,0,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--verde)",
              }}>
                {stat.icon}
              </div>
            </div>
            <p style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", margin: 0, lineHeight: 1 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", margin: "0.25rem 0 0", fontWeight: 500 }}>
              {stat.label}
            </p>
            <p style={{ fontSize: "0.7rem", color: "var(--verde)", margin: "0.25rem 0 0", fontWeight: 600 }}>
              {stat.change}
            </p>
          </div>
        ))}
      </div>

      {/* Two columns: Activity + Projects */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }} className="lg:!grid-cols-2 !grid-cols-1">

        {/* Recent activity */}
        <div className="dash-el" style={{
          opacity: 0, padding: "1.5rem", borderRadius: "16px",
          background: "var(--bg)", border: "1px solid var(--border)",
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
            Actividad reciente
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {recentActivity.map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.5rem 0", borderBottom: i < recentActivity.length - 1 ? "1px solid var(--border-light)" : "none" }}>
                <div style={{
                  width: "8px", height: "8px", borderRadius: "50%", flexShrink: 0,
                  background: item.status === "success" ? "#22c55e" : item.status === "warning" ? "#f59e0b" : "var(--verde)",
                }} />
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 500, color: "var(--text-primary)", margin: 0 }}>{item.title}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0 }}>{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects */}
        <div className="dash-el" style={{
          opacity: 0, padding: "1.5rem", borderRadius: "16px",
          background: "var(--bg)", border: "1px solid var(--border)",
        }}>
          <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
            Proyectos
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {projects.map((proj) => (
              <div key={proj.name}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.35rem" }}>
                  <p style={{ fontSize: "0.8rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{proj.name}</p>
                  <span style={{
                    fontSize: "0.6rem", padding: "2px 8px", borderRadius: "9999px", fontWeight: 600,
                    background: proj.progress === 100 ? "rgba(34,197,94,0.1)" : "rgba(74,139,0,0.08)",
                    color: proj.progress === 100 ? "#22c55e" : "var(--verde)",
                  }}>
                    {proj.status}
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <div style={{ flex: 1, height: "6px", borderRadius: "3px", background: "var(--border)" }}>
                    <div style={{
                      height: "100%", borderRadius: "3px", width: `${proj.progress}%`,
                      background: proj.progress === 100 ? "#22c55e" : "var(--verde)",
                      transition: "width 1s ease",
                    }} />
                  </div>
                  <span style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-secondary)", minWidth: "30px" }}>
                    {proj.progress}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="dash-el" style={{ opacity: 0, marginTop: "1rem" }}>
        <div style={{
          padding: "1.25rem 1.5rem", borderRadius: "16px",
          background: "var(--bg)", border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem",
        }}>
          <div>
            <p style={{ fontSize: "0.9rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>Necesitas ayuda?</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>Nuestro equipo esta disponible 24/7</p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <a href="https://wa.me/51984323201" target="_blank" rel="noopener noreferrer" style={{
              padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.8rem",
              fontWeight: 600, textDecoration: "none", transition: "all 0.3s",
              background: "#25D366", color: "#fff", display: "flex", alignItems: "center", gap: "0.4rem",
            }}>
              <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "14px", height: "14px" }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
              WhatsApp
            </a>
            <a href="mailto:operaciones@hannahlab.com" style={{
              padding: "0.5rem 1rem", borderRadius: "10px", fontSize: "0.8rem",
              fontWeight: 600, textDecoration: "none", transition: "all 0.3s",
              background: "var(--bg-soft)", color: "var(--text-secondary)",
              border: "1px solid var(--border)",
            }}>
              Email
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
