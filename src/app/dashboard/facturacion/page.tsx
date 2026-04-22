"use client";

import { useState, useEffect } from "react";
import { getMisFacturas } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const ESTADO_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  pagada:    { bg: "rgba(74,139,0,0.1)",    color: "var(--verde)",  border: "rgba(74,139,0,0.2)" },
  pendiente: { bg: "rgba(234,179,8,0.1)",   color: "#b8860b",       border: "rgba(234,179,8,0.25)" },
  vencida:   { bg: "rgba(220,38,38,0.1)",   color: "#dc2626",       border: "rgba(220,38,38,0.2)" },
  cancelada: { bg: "rgba(107,114,128,0.1)", color: "#6b7280",       border: "rgba(107,114,128,0.2)" },
};

function fmt(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function moneda(n: number) {
  return "$" + Number(n).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function FacturacionPage() {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState("Todas");

  useEffect(() => {
    getMisFacturas()
      .then(setFacturas)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filters = ["Todas", "Pagada", "Pendiente", "Vencida"];
  const filtered = selectedFilter === "Todas"
    ? facturas
    : facturas.filter((f) => f.estado?.toLowerCase() === selectedFilter.toLowerCase());

  const totalFacturado = facturas.reduce((s, f) => s + Number(f.monto ?? 0), 0);
  const totalPagado    = facturas.filter((f) => f.estado === "pagada").reduce((s, f) => s + Number(f.monto ?? 0), 0);
  const totalPendiente = facturas.filter((f) => f.estado === "pendiente").reduce((s, f) => s + Number(f.monto ?? 0), 0);

  const summaryCards = [
    {
      label: "Total Facturado",
      value: loading ? "—" : moneda(totalFacturado),
      icon: "M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "var(--text-primary)", bg: "var(--bg)",
    },
    {
      label: "Pagado",
      value: loading ? "—" : moneda(totalPagado),
      icon: "M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "var(--verde)", bg: "rgba(74,139,0,0.06)",
    },
    {
      label: "Pendiente",
      value: loading ? "—" : moneda(totalPendiente),
      icon: "M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z",
      color: "#b8860b", bg: "rgba(234,179,8,0.06)",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: "'Google Sans', system-ui" }}>Facturacion</h1>
        <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>Revisa tus facturas, pagos y estado de cuenta</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {summaryCards.map((card) => (
          <div key={card.label} style={{ padding: "1.5rem", borderRadius: "16px", background: card.bg, border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{
              width: "48px", height: "48px", borderRadius: "12px",
              background: card.color === "var(--verde)" ? "rgba(74,139,0,0.12)" : card.color === "#b8860b" ? "rgba(234,179,8,0.12)" : "rgba(120,120,120,0.08)",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke={card.color} strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
                <path d={card.icon} strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif", marginBottom: "0.25rem" }}>{card.label}</p>
              <p style={{ fontSize: "1.5rem", fontWeight: 700, color: card.color, fontFamily: "'Google Sans', system-ui" }}>{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem", flexWrap: "wrap" }}>
        {filters.map((f) => (
          <button key={f} onClick={() => setSelectedFilter(f)} style={{
            padding: "0.5rem 1rem", borderRadius: "8px", border: "1px solid var(--border)",
            background: selectedFilter === f ? "var(--verde)" : "var(--bg)",
            color: selectedFilter === f ? "#fff" : "var(--text-secondary)",
            fontSize: "0.82rem", fontWeight: 500, cursor: "pointer",
            fontFamily: "'Outfit', sans-serif", transition: "all 0.2s",
          }}>
            {f}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      {loading ? (
        <LoadingSpinner text="Cargando facturas..." />
      ) : filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", borderRadius: "16px", border: "1px dashed var(--border)" }}>
          <p style={{ color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>No hay facturas en esta categoria.</p>
        </div>
      ) : (
        <div style={{ borderRadius: "16px", border: "1px solid var(--border)", background: "var(--bg)", overflow: "hidden" }}>
          {/* Table Header */}
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 110px 120px 110px", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)", gap: "0.75rem" }}>
            {["Factura #", "Concepto", "Monto", "Fecha", "Estado"].map((h) => (
              <span key={h} style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: "'Outfit', sans-serif" }}>{h}</span>
            ))}
          </div>

          {/* Table Rows */}
          {filtered.map((inv, idx) => {
            const sc = ESTADO_STYLE[inv.estado?.toLowerCase()] ?? ESTADO_STYLE.pendiente;
            return (
              <div key={inv.id} style={{
                display: "grid", gridTemplateColumns: "150px 1fr 110px 120px 110px",
                padding: "0.9rem 1.25rem", gap: "0.75rem", alignItems: "center",
                borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-light)" : "none",
              }}>
                <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui" }}>
                  {inv.numero ?? inv.id?.toString().slice(-6).toUpperCase()}
                </span>
                <span style={{ fontSize: "0.82rem", color: "var(--text-secondary)", fontFamily: "'Outfit', sans-serif" }}>
                  {inv.concepto}
                </span>
                <span style={{ fontSize: "0.88rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui" }}>
                  {moneda(inv.monto)}
                </span>
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
                  {fmt(inv.fechaEmision ?? inv.createdAt)}
                </span>
                <span style={{
                  display: "inline-flex", alignItems: "center", padding: "0.25rem 0.65rem",
                  borderRadius: "6px", fontSize: "0.72rem", fontWeight: 600,
                  background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`,
                  fontFamily: "'Outfit', sans-serif", width: "fit-content",
                }}>
                  {inv.estado}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
