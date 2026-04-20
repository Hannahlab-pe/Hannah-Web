"use client";

import { useState } from "react";

const invoices = [
  { id: "FAC-2026-001", concept: "Desarrollo Web Corporativa - Fase 1", amount: 4500, date: "2026-03-15", status: "Pagada" },
  { id: "FAC-2026-002", concept: "Implementacion ERP Odoo - Mes 1", amount: 3200, date: "2026-03-20", status: "Pagada" },
  { id: "FAC-2026-003", concept: "Bot Automatizacion - Setup", amount: 2800, date: "2026-03-25", status: "Pagada" },
  { id: "FAC-2026-004", concept: "Soporte Tecnico Mensual - Marzo", amount: 1500, date: "2026-03-31", status: "Pagada" },
  { id: "FAC-2026-005", concept: "Implementacion ERP Odoo - Mes 2", amount: 3200, date: "2026-04-05", status: "Pagada" },
  { id: "FAC-2026-006", concept: "Diseno UI/UX - Dashboard Analytics", amount: 2200, date: "2026-04-08", status: "Pendiente" },
  { id: "FAC-2026-007", concept: "Migracion de Datos - Fase 2", amount: 1800, date: "2026-04-10", status: "Pendiente" },
  { id: "FAC-2026-008", concept: "Soporte Tecnico Mensual - Febrero", amount: 1500, date: "2026-02-28", status: "Vencida" },
  { id: "FAC-2026-009", concept: "Integracion API WhatsApp Business", amount: 2300, date: "2026-04-12", status: "Pendiente" },
  { id: "FAC-2026-010", concept: "Capacitacion Equipo - Odoo", amount: 1500, date: "2026-04-15", status: "Pagada" },
];

const statusColors: Record<string, { bg: string; color: string; border: string }> = {
  Pagada: { bg: "rgba(74,139,0,0.1)", color: "var(--verde)", border: "rgba(74,139,0,0.2)" },
  Pendiente: { bg: "rgba(234,179,8,0.1)", color: "#b8860b", border: "rgba(234,179,8,0.25)" },
  Vencida: { bg: "rgba(220,38,38,0.1)", color: "#dc2626", border: "rgba(220,38,38,0.2)" },
};

export default function FacturacionPage() {
  const [selectedFilter, setSelectedFilter] = useState("Todas");

  const filters = ["Todas", "Pagada", "Pendiente", "Vencida"];
  const filtered = selectedFilter === "Todas" ? invoices : invoices.filter(i => i.status === selectedFilter);

  const summaryCards = [
    { label: "Total Facturado", value: "$24,500", icon: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "var(--text-primary)", bg: "var(--bg)" },
    { label: "Pagado", value: "$19,200", icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "var(--verde)", bg: "rgba(74,139,0,0.06)" },
    { label: "Pendiente", value: "$5,300", icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z", color: "#b8860b", bg: "rgba(234,179,8,0.06)" },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: "'Google Sans', system-ui" }}>
          Facturacion
        </h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
          Revisa tus facturas, pagos y estado de cuenta
        </p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {summaryCards.map((card) => (
          <div key={card.label} style={{
            padding: "1.5rem", borderRadius: "16px",
            background: card.bg, border: "1px solid var(--border)",
            display: "flex", alignItems: "center", gap: "1rem",
          }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: card.color === "var(--verde)" ? "rgba(74,139,0,0.12)" : card.color === "#b8860b" ? "rgba(234,179,8,0.12)" : "rgba(120,120,120,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
                <path d={card.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", marginBottom: "0.25rem" }}>
                {card.label}
              </p>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: card.color, fontFamily: "'Google Sans', system-ui" }}>
                {card.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setSelectedFilter(f)}
            style={{
              padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--border)",
              background: selectedFilter === f ? "var(--verde)" : "var(--bg)",
              color: selectedFilter === f ? "#fff" : "var(--text-secondary)",
              fontSize: "0.82rem", fontWeight: 500, cursor: "pointer",
              fontFamily: "'Outfit', sans-serif", transition: "all 0.2s",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div style={{
        borderRadius: "16px", border: "1px solid var(--border)",
        background: "var(--bg)", overflow: "hidden",
      }}>
        {/* Table Header */}
        <div style={{
          display: "grid", gridTemplateColumns: "130px 1fr 110px 110px 110px 50px",
          padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border)",
          background: "var(--bg-soft)", gap: "0.75rem",
        }}>
          {["Factura #", "Concepto", "Monto", "Fecha", "Estado", ""].map((h) => (
            <span key={h} style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Outfit', sans-serif" }}>
              {h}
            </span>
          ))}
        </div>

        {/* Table Rows */}
        {filtered.map((inv, idx) => {
          const sc = statusColors[inv.status];
          return (
            <div key={inv.id} style={{
              display: "grid", gridTemplateColumns: "130px 1fr 110px 110px 110px 50px",
              padding: "0.9rem 1.25rem", borderBottom: idx < filtered.length - 1 ? "1px solid var(--border)" : "none",
              alignItems: "center", gap: "0.75rem", transition: "background 0.15s",
            }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-soft)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}>
                {inv.id}
              </span>
              <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {inv.concept}
              </span>
              <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Outfit', sans-serif" }}>
                ${inv.amount.toLocaleString()}
              </span>
              <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
                {inv.date}
              </span>
              <span style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                padding: "0.3rem 0.7rem", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 600,
                background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                fontFamily: "'Outfit', sans-serif", width: "fit-content",
              }}>
                {inv.status}
              </span>
              <button
                style={{
                  width: "32px", height: "32px", borderRadius: "8px", border: "1px solid var(--border)",
                  background: "var(--bg)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "var(--text-muted)", transition: "all 0.15s",
                }}
                title="Descargar factura"
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.color = "var(--verde)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-muted)"; }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "16px", height: "16px" }}>
                  <path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div style={{ padding: "2rem", textAlign: "center", color: "var(--text-muted)", fontSize: "0.85rem", fontFamily: "'Outfit', sans-serif" }}>
            No hay facturas con este estado.
          </div>
        )}
      </div>

      {/* Payment Method Section */}
      <div style={{
        marginTop: "2rem", padding: "1.5rem", borderRadius: "16px",
        background: "var(--bg)", border: "1px solid var(--border)",
      }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem", fontFamily: "'Google Sans', system-ui" }}>
          Metodo de Pago
        </h3>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
          {/* Bank Transfer */}
          <div style={{
            flex: "1 1 280px", padding: "1.25rem", borderRadius: "12px",
            background: "var(--bg-soft)", border: "1px solid var(--border)",
            display: "flex", alignItems: "flex-start", gap: "1rem",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "rgba(74,139,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--verde)" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}>
                <path d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3 4.5h.008v.008H18v-.008zm0 3h.008v.008H18v-.008zm0 3h.008v.008H18v-.008z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "0.35rem" }}>
                Transferencia Bancaria
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
                Banco: BCP<br />
                Cuenta: 191-2547896-0-42<br />
                CCI: 002-191-254789604255
              </p>
            </div>
          </div>

          {/* Card on file */}
          <div style={{
            flex: "1 1 280px", padding: "1.25rem", borderRadius: "12px",
            background: "var(--bg-soft)", border: "1px solid var(--border)",
            display: "flex", alignItems: "flex-start", gap: "1rem",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "rgba(74,139,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--verde)" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}>
                <path d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "0.35rem" }}>
                Tarjeta Registrada
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
                Visa terminada en **** 4521<br />
                Vence: 08/2028<br />
                Carlos Rodriguez
              </p>
            </div>
          </div>

          {/* Yape/Plin */}
          <div style={{
            flex: "1 1 280px", padding: "1.25rem", borderRadius: "12px",
            background: "var(--bg-soft)", border: "1px solid var(--border)",
            display: "flex", alignItems: "flex-start", gap: "1rem",
          }}>
            <div style={{
              width: "40px", height: "40px", borderRadius: "10px",
              background: "rgba(74,139,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="var(--verde)" strokeWidth="1.5" style={{ width: "20px", height: "20px" }}>
                <path d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.88rem", fontWeight: 600, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", marginBottom: "0.35rem" }}>
                Yape / Plin
              </p>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", lineHeight: 1.5 }}>
                Numero: +51 912 345 678<br />
                Nombre: Hannah Lab S.A.C.<br />
                Limite: S/ 2,000 por operacion
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
