"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutApi, getUsuarioGuardado, type UsuarioSession } from "@/libs/api";

// ── Iconos ────────────────────────────────────────────────────────
const Icon = ({ d }: { d: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
    style={{ width: "17px", height: "17px", flexShrink: 0 }}>
    <path d={d} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Menús por rol ────────────────────────────────────────────────
const menuSubadmin = [
  {
    label: "General",
    items: [
      { label: "Inicio",        href: "/dashboard",               icon: <Icon d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
      { label: "Mis proyectos", href: "/dashboard/admin/proyectos", icon: <Icon d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /> },
    ],
  },
  {
    label: "Gestión",
    items: [
      { label: "Tickets",    href: "/dashboard/admin/tickets",    icon: <Icon d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /> },
      { label: "Reuniones",  href: "/dashboard/admin/reuniones",  icon: <Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /> },
      { label: "Documentos", href: "/dashboard/admin/documentos", icon: <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { label: "Perfil", href: "/dashboard/perfil", icon: <Icon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> },
    ],
  },
];

const menuAdmin = [
  {
    label: "General",
    items: [
      { label: "Inicio",    href: "/dashboard",               icon: <Icon d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
      { label: "Clientes",  href: "/dashboard/admin/clientes", icon: <Icon d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /> },
      { label: "Proyectos", href: "/dashboard/admin/proyectos", icon: <Icon d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /> },
    ],
  },
  {
    label: "Gestión",
    items: [
      { label: "Tickets",    href: "/dashboard/admin/tickets",    icon: <Icon d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /> },
      { label: "Reuniones",  href: "/dashboard/admin/reuniones",  icon: <Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /> },
      { label: "Facturas",   href: "/dashboard/admin/facturas",   icon: <Icon d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /> },
      { label: "Documentos", href: "/dashboard/admin/documentos", icon: <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { label: "Perfil", href: "/dashboard/perfil", icon: <Icon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> },
    ],
  },
];

const menuCliente = [
  {
    label: "General",
    items: [
      { label: "Inicio",    href: "/dashboard",          icon: <Icon d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
      { label: "Proyectos", href: "/dashboard/proyectos", icon: <Icon d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /> },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Reuniones",  href: "/dashboard/reuniones",  icon: <Icon d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /> },
      { label: "Documentos", href: "/dashboard/documentos", icon: <Icon d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /> },
    ],
  },
  {
    label: "Cuenta",
    items: [
      { label: "Soporte",     href: "/dashboard/soporte",     icon: <Icon d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /> },
      { label: "Facturación", href: "/dashboard/facturacion", icon: <Icon d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /> },
      { label: "Perfil",      href: "/dashboard/perfil",      icon: <Icon d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /> },
    ],
  },
];

const SIDEBAR_W = 240;
const SIDEBAR_W_COLLAPSED = 68;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [usuario, setUsuario] = useState<UsuarioSession | null>(null);

  useEffect(() => {
    setUsuario(getUsuarioGuardado());
    const saved = localStorage.getItem("hw_sidebar_collapsed");
    if (saved === "true") setCollapsed(true);
  }, []);

  function toggleCollapsed() {
    setCollapsed((v) => {
      localStorage.setItem("hw_sidebar_collapsed", String(!v));
      return !v;
    });
  }

  const isAdmin = usuario?.rol === "admin";
  const isSubadmin = usuario?.rol === "subadmin";
  const menuSections = isAdmin ? menuAdmin : isSubadmin ? menuSubadmin : menuCliente;
  const inicial = usuario?.nombre?.charAt(0).toUpperCase() ?? "U";
  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  function handleLogout() {
    logoutApi();
    document.cookie = "hw_token=; path=/; max-age=0";
    router.push("/login");
  }

  const sidebarContent = (
    <>
      {/* ── Logo (+ toggle solo cuando expandido) ── */}
      <div style={{
        padding: collapsed ? "1.1rem 0" : "1.1rem 1rem",
        display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: "1px solid var(--border)",
        minHeight: "56px",
      }}>
        <Link href="/inicio" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.55rem" }}>
          <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
            <Image src="/images/logos/hannah.png" alt="H" width={18} height={18} style={{ objectFit: "contain" }} />
          </div>
          {!collapsed && (
            <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", whiteSpace: "nowrap" }}>
              Hannah<span style={{ color: "var(--verde)" }}>Lab</span>
            </span>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            title="Colapsar sidebar"
            style={{
              background: "var(--bg-soft)", border: "1px solid var(--border)",
              borderRadius: "7px", cursor: "pointer", padding: "5px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "var(--text-muted)", transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(74,139,0,0.08)"; e.currentTarget.style.color = "var(--verde)"; e.currentTarget.style.borderColor = "var(--verde)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-soft)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ width: "14px", height: "14px" }}>
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Menú ── */}
      <div style={{ flex: 1, padding: collapsed ? "0.75rem 0.5rem" : "0.75rem 0.65rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.25rem" }}>
        {menuSections.map((section) => (
          <div key={section.label} style={{ marginBottom: "0.5rem" }}>
            {!collapsed && (
              <p style={{
                fontSize: "0.58rem", fontWeight: 700, color: "var(--text-muted)",
                textTransform: "uppercase", letterSpacing: "0.1em",
                padding: "0 0.5rem", marginBottom: "0.25rem", marginTop: "0.5rem",
              }}>
                {section.label}
              </p>
            )}
            {collapsed && <div style={{ height: "0.5rem" }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    prefetch={true}
                    title={collapsed ? item.label : undefined}
                    style={{
                      display: "flex", alignItems: "center",
                      gap: collapsed ? 0 : "0.65rem",
                      justifyContent: collapsed ? "center" : "flex-start",
                      padding: collapsed ? "0.6rem" : "0.55rem 0.65rem",
                      borderRadius: "10px",
                      textDecoration: "none",
                      fontSize: "0.8rem",
                      fontWeight: isActive ? 600 : 500,
                      transition: "all 0.15s",
                      color: isActive ? "var(--verde)" : "var(--text-secondary)",
                      background: isActive
                        ? "rgba(74,139,0,0.08)"
                        : "transparent",
                      boxShadow: isActive ? "inset 0 0 0 1px rgba(74,139,0,0.15)" : "none",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-soft)";
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-primary)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-secondary)";
                      }
                    }}
                  >
                    {/* Indicador activo lateral */}
                    {isActive && (
                      <span style={{
                        position: "absolute", left: 0, top: "20%", bottom: "20%",
                        width: "3px", borderRadius: "0 3px 3px 0",
                        background: "var(--verde)",
                      }} />
                    )}
                    <span style={{
                      display: "flex", color: isActive ? "var(--verde)" : "var(--text-muted)",
                      transition: "color 0.15s",
                    }}>
                      {item.icon}
                    </span>
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* ── Usuario + Logout ── */}
      <div style={{
        borderTop: "1px solid var(--border)",
        padding: collapsed ? "0.75rem 0.5rem" : "0.75rem 1rem",
        display: "flex", flexDirection: "column", gap: "4px",
      }}>

        {/* Botón expandir (solo cuando colapsado) */}
        {collapsed && (
          <button
            onClick={toggleCollapsed}
            title="Expandir sidebar"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0.5rem", borderRadius: "8px",
              background: "var(--bg-soft)", border: "1px solid var(--border)",
              cursor: "pointer", color: "var(--text-muted)", transition: "all 0.15s",
              marginBottom: "4px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(74,139,0,0.08)"; e.currentTarget.style.color = "var(--verde)"; e.currentTarget.style.borderColor = "var(--verde)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-soft)"; e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.borderColor = "var(--border)"; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ width: "14px", height: "14px" }}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Perfil de usuario */}
        <Link
          href="/dashboard/perfil"
          style={{
            textDecoration: "none",
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : "0.6rem",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0.5rem" : "0.5rem 0.4rem",
            borderRadius: "10px",
            transition: "background 0.15s",
          }}
          title={collapsed ? (usuario?.nombre ?? "Perfil") : undefined}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-soft)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
        >
          <div style={{
            width: "30px", height: "30px", borderRadius: "50%",
            background: "var(--verde)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.68rem", fontWeight: 700,
            color: "#fff", flexShrink: 0,
          }}>
            {inicial}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {usuario?.nombre ?? "..."}
                </p>
                {(isAdmin || isSubadmin) && (
                  <span style={{
                    flexShrink: 0,
                    background: "rgba(74,139,0,0.08)", border: "1px solid rgba(74,139,0,0.3)",
                    borderRadius: "4px", padding: "0.1rem 0.4rem",
                    fontSize: "0.52rem", fontWeight: 700, color: "var(--verde)", textTransform: "uppercase", letterSpacing: "0.07em",
                  }}>
                    {isAdmin ? "Admin" : "Sub"}
                  </span>
                )}
              </div>
              <p style={{ fontSize: "0.6rem", color: "var(--text-muted)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {usuario?.email ?? ""}
              </p>
            </div>
          )}
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          title={collapsed ? "Cerrar sesión" : undefined}
          style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : "0.5rem",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0.5rem" : "0.45rem 0.55rem",
            borderRadius: "10px", fontSize: "0.75rem", fontWeight: 500,
            color: "var(--text-muted)", transition: "all 0.15s",
            background: "transparent", border: "none", cursor: "pointer", width: "100%",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "rgba(239,68,68,0.06)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
            style={{ width: "16px", height: "16px", flexShrink: 0 }}>
            <path d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {!collapsed && "Cerrar sesión"}
        </button>
      </div>
    </>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--bg-soft)" }}>
      <style>{`
        nav { display: none !important; }
        footer { display: none !important; }
        .flex.flex-col.min-h-screen { display: contents; }
        main.flex-1 { display: contents; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 4px; }
      `}</style>

      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside style={{
        width: `${sidebarW}px`,
        display: "flex", flexDirection: "column",
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        flexShrink: 0,
        position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 30,
        transition: "width 0.25s cubic-bezier(0.4,0,0.2,1)",
        overflow: "hidden",
      }}>
        {sidebarContent}
      </aside>

      {/* ===== MOBILE HEADER ===== */}
      <div className="lg:!hidden" style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 40,
        background: "var(--bg)", borderBottom: "1px solid var(--border)",
        padding: "0.7rem 1rem", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/inicio" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div style={{ width: "26px", height: "26px", borderRadius: "6px", background: "#111", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Image src="/images/logos/hannah.png" alt="H" width={16} height={16} style={{ objectFit: "contain" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.85rem", color: "var(--text-primary)" }}>Dashboard</span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)", padding: "4px" }}>
          <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      {/* ===== MOBILE DRAWER ===== */}
      {mobileOpen && (
        <>
          <div onClick={() => setMobileOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 38, background: "rgba(0,0,0,0.4)" }} />
          <aside style={{
            position: "fixed", top: 0, bottom: 0, left: 0, zIndex: 39,
            width: `${SIDEBAR_W}px`, background: "var(--bg)",
            borderRight: "1px solid var(--border)",
            display: "flex", flexDirection: "column",
          }}>
            {sidebarContent}
          </aside>
        </>
      )}

      {/* ===== MAIN CONTENT ===== */}
      <div style={{
        flex: 1, minHeight: "100vh",
        marginLeft: `${sidebarW}px`,
        transition: "margin-left 0.25s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <div style={{ padding: "1.75rem 2rem" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
