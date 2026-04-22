"use client";

import { useState, useEffect } from "react";
import { getAdminFacturas } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente: { label: "Pendiente", color: "#f59e0b" },
  pagada: { label: "Pagada", color: "var(--verde)" },
  vencida: { label: "Vencida", color: "#ef4444" },
  cancelada: { label: "Cancelada", color: "#6b7280" },
};

export default function AdminFacturasPage() {
  const [facturas, setFacturas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminFacturas().then(setFacturas).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const totalPagado = facturas.filter(f => f.estado === "pagada").reduce((acc, f) => acc + Number(f.monto), 0);
  const totalPendiente = facturas.filter(f => f.estado === "pendiente").reduce((acc, f) => acc + Number(f.monto), 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Facturas</h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>{facturas.length} factura{facturas.length !== 1 ? "s" : ""}</p>
      </div>

      {/* Resumen */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "0.75rem" }}>
        {[
          { label: "Cobrado", value: totalPagado, color: "var(--verde)" },
          { label: "Pendiente", value: totalPendiente, color: "#f59e0b" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "1rem 1.25rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px" }}>
            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0 0 0.25rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{s.label}</p>
            <p style={{ fontSize: "1.2rem", fontWeight: 800, color: s.color, margin: 0 }}>
              ${s.value.toLocaleString("es-MX", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ))}
      </div>

      {loading ? <LoadingSpinner text="Cargando facturas..." /> : facturas.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "3rem 0" }}>No hay facturas.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {facturas.map((f) => {
            const estado = ESTADO_LABELS[f.estado] ?? { label: f.estado, color: "#888" };
            return (
              <div key={f.id} style={{ padding: "1rem 1.25rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>{f.numero}</p>
                  <p style={{ fontSize: "0.72rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>{f.concepto}</p>
                  {f.cliente && <p style={{ fontSize: "0.7rem", color: "var(--text-secondary)", margin: "0.1rem 0 0" }}>{f.cliente.nombre}</p>}
                </div>
                <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", flexShrink: 0 }}>
                  ${Number(f.monto).toLocaleString("es-MX", { minimumFractionDigits: 2 })} {f.moneda}
                </p>
                <span style={{ display: "inline-flex", padding: "0.2rem 0.6rem", borderRadius: "999px", fontSize: "0.65rem", fontWeight: 600, background: `${estado.color}18`, color: estado.color, border: `1px solid ${estado.color}`, flexShrink: 0 }}>
                  {estado.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
