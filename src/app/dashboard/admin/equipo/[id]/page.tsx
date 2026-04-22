"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import { getCliente, getAdminProyectos } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";
import PageHeader from "@/components/shared/page-header";

const ESTADO_LABELS: Record<string, { label: string; color: string }> = {
  pendiente:   { label: "Pendiente",   color: "#f59e0b" },
  en_progreso: { label: "En progreso", color: "var(--verde)" },
  completado:  { label: "Completado",  color: "#3b82f6" },
  pausado:     { label: "Pausado",     color: "#6b7280" },
};

function fmt(fecha?: string) {
  if (!fecha) return "—";
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function Avatar({ nombre }: { nombre: string }) {
  const colors = ["#4A8B00", "#0ea5e9", "#8b5cf6", "#f59e0b", "#ec4899", "#06b6d4"];
  const color = colors[nombre.charCodeAt(0) % colors.length];
  return (
    <div style={{
      width: "56px", height: "56px", borderRadius: "50%", background: color,
      display: "flex", alignItems: "center", justifyContent: "center",
      fontSize: "1.3rem", fontWeight: 700, color: "#fff", flexShrink: 0,
    }}>
      {nombre.charAt(0).toUpperCase()}
    </div>
  );
}

export default function MiembroDetallePage() {
  const { id } = useParams<{ id: string }>();

  const [miembro, setMiembro] = useState<any>(null);
  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cargar = useCallback(async () => {
    try {
      const [m, allProyectos] = await Promise.all([
        getCliente(id),
        getAdminProyectos(),
      ]);
      setMiembro(m);
      // Filtra proyectos donde este miembro es encargado
      const suyos = allProyectos.filter((p: any) =>
        p.encargados?.some((e: any) => e.id === id)
      );
      setProyectos(suyos);
    } catch (e: any) {
      setError(e.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (loading) return <LoadingSpinner text="Cargando miembro..." />;
  if (error) return <div style={{ padding: "2rem", color: "#ef4444", fontSize: "0.85rem" }}>{error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
      <PageHeader
        title={miembro?.nombre ?? "Miembro"}
        subtitle={miembro?.email}
        backHref="/dashboard/admin/equipo"
        backLabel="Volver al Equipo"
      />

      {/* Ficha del miembro */}
      <div style={{
        background: "var(--bg)", border: "1px solid var(--border)",
        borderRadius: "16px", padding: "1.5rem",
        display: "flex", flexDirection: "column", gap: "1.25rem",
      }}>
        {/* Cabecera: avatar + nombre + badges */}
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <Avatar nombre={miembro?.nombre ?? "?"} />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
              <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
                {miembro?.nombre}
              </h2>
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "4px",
                background: "rgba(139,92,246,0.1)", color: "#8b5cf6",
                border: "1px solid rgba(139,92,246,0.25)", textTransform: "uppercase", letterSpacing: "0.06em",
              }}>
                Subadmin
              </span>
              <span style={{
                fontSize: "0.6rem", fontWeight: 700, padding: "0.2rem 0.55rem", borderRadius: "999px",
                background: miembro?.activo ? "rgba(74,139,0,0.1)" : "rgba(239,68,68,0.08)",
                color: miembro?.activo ? "var(--verde)" : "#ef4444",
                border: `1px solid ${miembro?.activo ? "var(--verde)" : "#ef4444"}`,
              }}>
                {miembro?.activo ? "Activo" : "Inactivo"}
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: "0.3rem 0 0" }}>
              {miembro?.email}
            </p>
          </div>
        </div>

        {/* Grid de datos */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
          gap: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)",
        }}>
          {[
            { label: "Teléfono",        value: miembro?.telefono ?? "—" },
            { label: "Empresa",         value: miembro?.empresa ?? "—" },
            { label: "Miembro desde",   value: fmt(miembro?.creadoEn) },
            { label: "Proyectos activos", value: proyectos.filter((p) => p.estado === "en_progreso").length.toString() },
            { label: "Proyectos totales", value: proyectos.length.toString() },
          ].map(({ label, value }) => (
            <div key={label}>
              <p style={{ fontSize: "0.6rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 0.2rem" }}>
                {label}
              </p>
              <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Proyectos asignados */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "1rem" }}>
          <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
            Proyectos asignados
          </h3>
          <span style={{
            fontSize: "0.65rem", fontWeight: 700, padding: "0.15rem 0.55rem",
            borderRadius: "999px", background: "var(--bg-soft)", border: "1px solid var(--border)",
            color: "var(--text-muted)",
          }}>
            {proyectos.length}
          </span>
        </div>

        {proyectos.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", border: "1px dashed var(--border)", borderRadius: "14px" }}>
            <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", margin: 0 }}>
              Este miembro no tiene proyectos asignados aún.
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem" }}>
            {proyectos.map((p) => {
              const estado = ESTADO_LABELS[p.estado] ?? { label: p.estado, color: "#6b7280" };
              return (
                <div key={p.id} style={{
                  background: "var(--bg)", border: "1px solid var(--border)",
                  borderRadius: "12px", padding: "1rem 1.25rem",
                  display: "flex", alignItems: "center", gap: "1rem",
                }}>
                  {/* Barra de color estado */}
                  <div style={{ width: "3px", alignSelf: "stretch", borderRadius: "4px", background: estado.color, flexShrink: 0 }} />

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.nombre}
                    </p>
                    {p.cliente?.nombre && (
                      <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>
                        Cliente: {p.cliente.nombre}
                        {p.cliente.empresa ? ` · ${p.cliente.empresa}` : ""}
                      </p>
                    )}
                  </div>

                  {/* Progreso */}
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
                    <div style={{ width: "80px", height: "5px", borderRadius: "999px", background: "var(--bg-soft)" }}>
                      <div style={{ width: `${p.progreso ?? 0}%`, height: "100%", borderRadius: "999px", background: "var(--verde)" }} />
                    </div>
                    <span style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--verde)", width: "2.5rem", textAlign: "right" }}>
                      {p.progreso ?? 0}%
                    </span>
                  </div>

                  {/* Estado */}
                  <span style={{
                    flexShrink: 0, fontSize: "0.62rem", fontWeight: 700,
                    padding: "0.2rem 0.6rem", borderRadius: "999px",
                    background: `${estado.color}18`, color: estado.color,
                    border: `1px solid ${estado.color}`,
                  }}>
                    {estado.label}
                  </span>

                  {/* Fecha */}
                  {p.fechaEntrega && (
                    <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", flexShrink: 0 }}>
                      {fmt(p.fechaEntrega)}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
