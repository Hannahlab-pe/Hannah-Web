"use client";

import { useState, useEffect } from "react";
import { getAdminDocumentos } from "@/libs/api";

const CATEGORIA_COLOR: Record<string, string> = {
  contrato: "#6366f1",
  propuesta: "#f59e0b",
  factura: "var(--verde)",
  manual: "#3b82f6",
  otro: "#6b7280",
};

function formatBytes(bytes?: number) {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
}

export default function AdminDocumentosPage() {
  const [documentos, setDocumentos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getAdminDocumentos().then(setDocumentos).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filtrados = documentos.filter((d) =>
    d.nombre.toLowerCase().includes(search.toLowerCase()) ||
    (d.cliente?.nombre ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", maxWidth: "900px" }}>
      <div>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>Documentos</h1>
        <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", margin: "0.2rem 0 0" }}>{documentos.length} documento{documentos.length !== 1 ? "s" : ""}</p>
      </div>

      <div style={{ position: "relative" }}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "15px", height: "15px", position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }}>
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" strokeLinecap="round" />
        </svg>
        <input type="text" placeholder="Buscar documentos..." value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: "100%", padding: "0.5rem 0.75rem 0.5rem 2.25rem", borderRadius: "10px", fontSize: "0.8rem", border: "1px solid var(--border)", background: "var(--bg)", color: "var(--text-primary)", outline: "none", boxSizing: "border-box" }} />
      </div>

      {loading ? <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>Cargando...</p> : filtrados.length === 0 ? (
        <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", padding: "3rem 0" }}>No hay documentos.</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {filtrados.map((d) => {
            const color = CATEGORIA_COLOR[d.categoria] ?? "#888";
            return (
              <div key={d.id} style={{ padding: "1rem 1.25rem", background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: `${color}18`, border: `1px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" style={{ width: "18px", height: "18px" }}><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--text-primary)", margin: 0 }}>{d.nombre}</p>
                  <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.1rem 0 0" }}>
                    {d.categoria}{d.tamanio ? ` · ${formatBytes(d.tamanio)}` : ""}
                    {d.cliente ? ` · ${d.cliente.nombre}` : ""}
                  </p>
                </div>
                {d.url && (
                  <a href={d.url} target="_blank" rel="noopener noreferrer" style={{ padding: "0.3rem 0.75rem", borderRadius: "8px", fontSize: "0.72rem", fontWeight: 600, background: "rgba(74,139,0,0.08)", border: "1px solid var(--verde)", color: "var(--verde)", textDecoration: "none", flexShrink: 0 }}>
                    Ver
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
