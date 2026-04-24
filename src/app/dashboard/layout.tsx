"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { logoutApi, getUsuarioGuardado, type UsuarioSession } from "@/libs/api";
import { Toaster } from "sonner";

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
      { label: "Equipo",    href: "/dashboard/admin/equipo",    icon: <Icon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /> },
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
      { label: "Inicio",    href: "/dashboard",           icon: <Icon d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /> },
      { label: "Proyectos", href: "/dashboard/proyectos", icon: <Icon d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /> },
      { label: "Mi equipo", href: "/dashboard/equipo",    icon: <Icon d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /> },
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

const SIDEBAR_W = 232;
const SIDEBAR_W_COLLAPSED = 62;

// ── Paleta dark sidebar ───────────────────────────────────────────
const S = {
  bg:          "#111318",
  border:      "rgba(255,255,255,0.07)",
  textPrimary: "#f1f5f9",
  textMuted:   "#64748b",
  textSub:     "#94a3b8",
  activeGreen: "#7dda40",
  activeBg:    "rgba(125,218,64,0.1)",
  hoverBg:     "rgba(255,255,255,0.05)",
  cardBg:      "rgba(255,255,255,0.04)",
};

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
      {/* ── Logo ── */}
      <div style={{
        padding: collapsed ? "0" : "0 1rem",
        height: "64px", display: "flex", alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        borderBottom: `1px solid ${S.border}`, flexShrink: 0,
      }}>
        <Link href="/inicio" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.65rem" }}>
          <div style={{
            width: "34px", height: "34px", borderRadius: "10px",
            background: "rgba(255,255,255,0.08)", border: `1px solid ${S.border}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            overflow: "hidden", flexShrink: 0,
          }}>
            <Image src="/images/logos/hannah.png" alt="H" width={22} height={22} style={{ objectFit: "contain" }} />
          </div>
          {!collapsed && (
            <div>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: S.textPrimary, fontFamily: "'Google Sans', system-ui", whiteSpace: "nowrap", letterSpacing: "-0.01em" }}>
                Hannah<span style={{ color: S.activeGreen }}>Lab</span>
              </span>
              <p style={{ fontSize: "0.58rem", color: S.textMuted, margin: 0, letterSpacing: "0.04em", fontFamily: "'Outfit', sans-serif" }}>
                Portal de clientes
              </p>
            </div>
          )}
        </Link>
        {!collapsed && (
          <button
            onClick={toggleCollapsed}
            title="Colapsar"
            style={{
              background: "transparent", border: `1px solid ${S.border}`,
              borderRadius: "7px", cursor: "pointer", padding: "5px",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: S.textMuted, transition: "all 0.15s", flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = S.activeGreen; e.currentTarget.style.color = S.activeGreen; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMuted; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "13px", height: "13px" }}>
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* ── Navegación ── */}
      <div style={{ flex: 1, padding: collapsed ? "0.85rem 0.5rem" : "0.85rem 0.75rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.1rem" }}>
        {menuSections.map((section, si) => (
          <div key={section.label} style={{ marginBottom: "0.5rem" }}>
            {!collapsed && (
              <p style={{
                fontSize: "0.57rem", fontWeight: 700, color: S.textMuted,
                textTransform: "uppercase", letterSpacing: "0.12em",
                padding: "0 0.5rem", margin: `${si === 0 ? "0" : "0.75rem"} 0 0.3rem`,
                fontFamily: "'Outfit', sans-serif",
              }}>
                {section.label}
              </p>
            )}
            {collapsed && si > 0 && (
              <div style={{ height: "1px", background: S.border, margin: "0.5rem 0.25rem" }} />
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
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
                      gap: collapsed ? 0 : "0.7rem",
                      justifyContent: collapsed ? "center" : "flex-start",
                      padding: collapsed ? "0.62rem" : "0.52rem 0.7rem",
                      borderRadius: "9px",
                      textDecoration: "none",
                      fontSize: "0.82rem",
                      fontWeight: isActive ? 600 : 400,
                      fontFamily: "'Outfit', sans-serif",
                      transition: "all 0.12s",
                      color: isActive ? S.activeGreen : S.textSub,
                      background: isActive ? S.activeBg : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.background = S.hoverBg;
                        (e.currentTarget as HTMLAnchorElement).style.color = S.textPrimary;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                        (e.currentTarget as HTMLAnchorElement).style.color = S.textSub;
                      }
                    }}
                  >
                    <span style={{ display: "flex", color: "inherit", opacity: isActive ? 1 : 0.7, transition: "opacity 0.12s" }}>
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

      {/* ── Hannah AI ── */}
      <div style={{ padding: collapsed ? "0 0.5rem 0.5rem" : "0 0.75rem 0.5rem" }}>
        <Link
          href="/dashboard/hannah-ai"
          title={collapsed ? "Hannah AI" : undefined}
          className="hannah-ai-btn"
          style={{
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : "0.65rem",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0.62rem" : "0.6rem 0.85rem",
            borderRadius: "10px",
            textDecoration: "none",
            position: "relative", overflow: "hidden",
            border: "1px solid rgba(255,255,255,0.12)",
            transition: "opacity 0.15s, transform 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "0.88"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.opacity = "1"; }}
        >
          {/* Fondo aurora animado */}
          <span className="aurora-bg" aria-hidden="true" />
          {/* Icono */}
          <span style={{ position: "relative", display: "flex", alignItems: "center", flexShrink: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="1.6" style={{ width: "17px", height: "17px" }}>
              <defs>
                <linearGradient id="ai-icon-g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="100%" stopColor="#4ade80" />
                </linearGradient>
              </defs>
              <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" stroke="url(#ai-icon-g)" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456z" stroke="url(#ai-icon-g)" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {!collapsed && (
            <span style={{ position: "relative", fontSize: "0.82rem", fontWeight: 700, color: "#fff", fontFamily: "'Outfit', sans-serif", letterSpacing: "0.01em" }}>
              Hannah AI
            </span>
          )}
          {!collapsed && (
            <span style={{ position: "relative", marginLeft: "auto", fontSize: "0.52rem", fontWeight: 700, color: "rgba(255,255,255,0.7)", background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: "4px", padding: "0.08rem 0.4rem", letterSpacing: "0.06em" }}>
              BETA
            </span>
          )}
        </Link>
      </div>

      {/* ── Usuario ── */}
      <div style={{
        padding: collapsed ? "0.75rem 0.5rem" : "0.75rem",
        borderTop: `1px solid ${S.border}`,
        display: "flex", flexDirection: "column", gap: "6px",
      }}>
        {/* Expandir cuando colapsado */}
        {collapsed && (
          <button
            onClick={toggleCollapsed}
            title="Expandir"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0.5rem", borderRadius: "8px",
              background: "transparent", border: `1px solid ${S.border}`,
              cursor: "pointer", color: S.textMuted, transition: "all 0.15s", marginBottom: "4px",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = S.activeGreen; e.currentTarget.style.color = S.activeGreen; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = S.border; e.currentTarget.style.color = S.textMuted; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "13px", height: "13px" }}>
              <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}

        {/* Tarjeta de usuario */}
        <Link
          href="/dashboard/perfil"
          title={collapsed ? (usuario?.nombre ?? "Perfil") : undefined}
          style={{
            textDecoration: "none",
            display: "flex", alignItems: "center",
            gap: collapsed ? 0 : "0.65rem",
            justifyContent: collapsed ? "center" : "flex-start",
            padding: collapsed ? "0.5rem" : "0.6rem 0.65rem",
            borderRadius: "10px",
            background: S.cardBg,
            border: `1px solid ${S.border}`,
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.07)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = S.cardBg; }}
        >
          <div style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "var(--verde)", display: "flex", alignItems: "center",
            justifyContent: "center", fontSize: "0.7rem", fontWeight: 700,
            color: "#fff", flexShrink: 0,
          }}>
            {inicial}
          </div>
          {!collapsed && (
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                <p style={{ fontSize: "0.78rem", fontWeight: 600, color: S.textPrimary, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {usuario?.nombre ?? "..."}
                </p>
                {(isAdmin || isSubadmin) && (
                  <span style={{
                    flexShrink: 0,
                    background: "rgba(125,218,64,0.12)", border: "1px solid rgba(125,218,64,0.25)",
                    borderRadius: "4px", padding: "0.08rem 0.35rem",
                    fontSize: "0.5rem", fontWeight: 700, color: S.activeGreen,
                    textTransform: "uppercase", letterSpacing: "0.08em",
                  }}>
                    {isAdmin ? "Admin" : "Sub"}
                  </span>
                )}
              </div>
              <p style={{ fontSize: "0.6rem", color: S.textMuted, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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
            padding: collapsed ? "0.45rem" : "0.42rem 0.65rem",
            borderRadius: "8px", fontSize: "0.75rem", fontWeight: 500,
            fontFamily: "'Outfit', sans-serif",
            color: S.textMuted, transition: "all 0.15s",
            background: "transparent", border: "none", cursor: "pointer", width: "100%",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "#f87171"; e.currentTarget.style.background = "rgba(248,113,113,0.08)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = S.textMuted; e.currentTarget.style.background = "transparent"; }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"
            style={{ width: "15px", height: "15px", flexShrink: 0 }}>
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

        /* ── Aurora / lava lamp animation ── */
        @keyframes aurora-shift {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes aurora-blob1 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33%       { transform: translate(30%, -20%) scale(1.2); }
          66%       { transform: translate(-15%, 25%) scale(0.9); }
        }
        @keyframes aurora-blob2 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          33%       { transform: translate(-25%, 20%) scale(0.85); }
          66%       { transform: translate(20%, -15%) scale(1.15); }
        }
        @keyframes aurora-blob3 {
          0%, 100% { transform: translate(0%, 0%) scale(1); }
          50%       { transform: translate(15%, 30%) scale(1.1); }
        }
        .aurora-bg {
          position: absolute;
          inset: 0;
          border-radius: inherit;
          overflow: hidden;
          z-index: 0;
        }
        .aurora-bg::before,
        .aurora-bg::after,
        .hannah-ai-btn::before {
          content: '';
          position: absolute;
          border-radius: 50%;
          filter: blur(14px);
          opacity: 0.85;
        }
        .aurora-bg::before {
          width: 90px; height: 70px;
          background: radial-gradient(circle, #4ade80, #166534);
          top: -20px; left: -15px;
          animation: aurora-blob1 5s ease-in-out infinite;
        }
        .aurora-bg::after {
          width: 80px; height: 65px;
          background: radial-gradient(circle, #86efac, #14532d);
          bottom: -20px; right: -10px;
          animation: aurora-blob2 6s ease-in-out infinite;
        }
        .hannah-ai-btn::before {
          content: '';
          position: absolute;
          width: 70px; height: 55px;
          background: radial-gradient(circle, #22c55e, #052e16);
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
          filter: blur(16px);
          opacity: 0.5;
          animation: aurora-blob3 4s ease-in-out infinite;
          z-index: 0;
          border-radius: 50%;
        }
        .hannah-ai-btn {
          background: #050a05;
        }
      `}</style>

      {/* ===== SIDEBAR DESKTOP ===== */}
      <aside style={{
        width: `${sidebarW}px`,
        display: "flex", flexDirection: "column",
        background: S.bg,
        borderRight: `1px solid ${S.border}`,
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
        background: S.bg, borderBottom: `1px solid ${S.border}`,
        padding: "0 1rem", height: "56px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <Link href="/inicio" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(255,255,255,0.08)", border: `1px solid ${S.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <Image src="/images/logos/hannah.png" alt="H" width={19} height={19} style={{ objectFit: "contain" }} />
          </div>
          <span style={{ fontWeight: 700, fontSize: "0.92rem", color: S.textPrimary, fontFamily: "'Google Sans', system-ui" }}>
            Hannah<span style={{ color: S.activeGreen }}>Lab</span>
          </span>
        </Link>
        <button onClick={() => setMobileOpen(!mobileOpen)} style={{ background: "none", border: "none", cursor: "pointer", color: S.textSub, padding: "4px" }}>
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
            width: `${SIDEBAR_W}px`, background: S.bg,
            borderRight: `1px solid ${S.border}`,
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

      <Toaster position="top-right" richColors closeButton duration={4000} />
    </div>
  );
}
