"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCliente, getProyectosPorCliente } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";
import PageHeader from "@/components/shared/page-header";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente:   { label: "Pendiente",   color: "#f59e0b" },
  en_progreso: { label: "En progreso", color: "var(--verde)" },
  completado:  { label: "Completado",  color: "#3b82f6" },
  pausado:     { label: "Pausado",     color: "#6b7280" },
};

function fmt(fecha?: string) {
  if (!fecha) return null;
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [cliente, setCliente] = useState<any>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const [cli, projs] = await Promise.all([
        getCliente(id),
        getProyectosPorCliente(id),
      ]);
      setCliente(cli);
      setProyectos(projs);
    } catch (e: any) {
      setError(e.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return <LoadingSpinner text="Cargando cliente..." />;
  if (error) return (
    <div style={{ padding: "2rem", color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>
  );

  const inicial = cliente?.nombre?.charAt(0).toUpperCase() ?? "?";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <PageHeader
        title={cliente?.nombre ?? "Cliente"}
        subtitle={cliente?.empresa ? `${cliente.empresa} · ${cliente.email}` : cliente?.email}
        backHref="/dashboard/admin/clientes"
        backLabel="Volver a Clientes"
      />

      {/* Info card */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr",
        gap: "1.25rem",
        padding: "1.25rem 1.5rem",
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: "14px", alignItems: "center",
      }}>
        {/* Avatar */}
        <div style={{
          width: "52px", height: "52px", borderRadius: "50%",
          background: "var(--verde)", display: "flex", alignItems: "center",
          justifyContent: "center", fontSize: "1.2rem", fontWeight: 700, color: "#fff",
          flexShrink: 0,
        }}>
          {inicial}
        </div>

        {/* Datos */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem 2.5rem" }}>
          {[
            { label: "Nombre",  value: cliente?.nombre },
            { label: "Email",   value: cliente?.email },
            { label: "Empresa", value: cliente?.empresa ?? "—" },
            { label: "Teléfono", value: cliente?.telefono ?? "—" },
            { label: "Estado",  value: cliente?.activo ? "Activo" : "Inactivo", color: cliente?.activo ? "var(--verde)" : "#ef4444" },
            { label: "Desde",   value: cliente?.creadoEn ? fmt(cliente.creadoEn) : "—" },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.15rem" }}>{label}</p>
              <p style={{ fontSize: "0.82rem", fontWeight: 600, color: color ?? "var(--text-primary)", margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Proyectos */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
          <h2 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Proyectos asignados
          </h2>
          <span style={{
            fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.55rem",
            borderRadius: "999px", background: "var(--bg-soft)", border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}>
            {proyectos.length}
          </span>
        </div>

        {proyectos.length === 0 ? (
          <div style={{
            padding: "3rem", textAlign: "center",
            border: "1px dashed var(--border)", borderRadius: "14px",
          }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Este cliente aún no tiene proyectos asignados.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {proyectos.map((p) => {
              const estado = ESTADO_LABELS[p.estado] ?? { label: p.estado, color: "#6b7280" };
              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/dashboard/admin/proyectos/${p.id}`)}
                  style={{
                    background: "var(--bg)", border: "1px solid var(--border)",
                    borderRadius: "14px", padding: "1.25rem",
                    cursor: "pointer", display: "flex", flexDirection: "column", gap: "0.85rem",
                    transition: "box-shadow 0.2s, border-color 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 18px rgba(0,0,0,0.08)";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--verde)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
                    (e.currentTarget as HTMLDivElement).style.borderColor = "var(--border)";
                  }}
                >
                  {/* Título + estado */}
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                    <p style={{ fontWeight: 700, fontSize: "0.9rem", color: "var(--text-primary)", margin: 0, lineHeight: 1.3 }}>
                      {p.nombre}
                    </p>
                    <span style={{
                      flexShrink: 0, fontSize: "0.6rem", fontWeight: 700,
                      padding: "0.2rem 0.55rem", borderRadius: "999px",
                      background: `${estado.color}18`, color: estado.color, border: `1px solid ${estado.color}`,
                    }}>
                      {estado.label}
                    </span>
                  </div>

                  {p.descripcion && (
                    <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.45, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>
                      {p.descripcion}
                    </p>
                  )}

                  {/* Barra de progreso */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div style={{ flex: 1, height: "5px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                      <div style={{ width: `${p.progreso ?? 0}%`, height: "100%", borderRadius: "999px", background: "var(--verde)", transition: "width 0.4s" }} />
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--verde)", width: "2.5rem", textAlign: "right" }}>
                      {p.progreso ?? 0}%
                    </span>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.4rem" }}>
                    {p.fechaEntrega ? (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)" }}>
                        Entrega: <strong>{fmt(p.fechaEntrega)}</strong>
                      </span>
                    ) : <span />}
                    <span style={{
                      fontSize: "0.65rem", color: "var(--verde)", fontWeight: 600,
                      display: "flex", alignItems: "center", gap: "0.3rem",
                    }}>
                      Ver kanban →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
