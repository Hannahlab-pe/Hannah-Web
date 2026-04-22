"use client";

import { useState, useEffect } from "react";
import { getMisDocumentos } from "@/libs/api";
import LoadingSpinner from "@/components/shared/loading-spinner";

const headingFont = "'Google Sans', system-ui";
const bodyFont = "'Outfit', sans-serif";

type Category = "Todos" | "Contratos" | "Entregables" | "Reportes" | string;

const DOC_ICONS: Record<string, { stroke: string; fill?: string }> = {
  pdf:    { stroke: "#E53E3E" },
  doc:    { stroke: "#3182CE" },
  docx:   { stroke: "#3182CE" },
  xls:    { stroke: "#38A169" },
  xlsx:   { stroke: "#38A169" },
  fig:    { stroke: "#9F7AEA" },
  img:    { stroke: "#9F7AEA" },
  png:    { stroke: "#9F7AEA" },
  jpg:    { stroke: "#9F7AEA" },
  zip:    { stroke: "#DD6B20" },
  sql:    { stroke: "#718096" },
  default:{ stroke: "#3182CE" },
};

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  contratos:    { bg: "rgba(49,130,206,0.1)",  color: "#3182CE" },
  entregables:  { bg: "rgba(74,139,0,0.1)",    color: "var(--verde)" },
  reportes:     { bg: "rgba(221,107,32,0.1)",  color: "#DD6B20" },
  default:      { bg: "rgba(113,128,150,0.1)", color: "#718096" },
};

function getExt(nombre: string) {
  return nombre.split(".").pop()?.toLowerCase() ?? "default";
}

function FileIcon({ ext }: { ext: string }) {
  const ic = DOC_ICONS[ext] ?? DOC_ICONS.default;
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={ic.stroke} strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function fmt(fecha: string) {
  return new Date(fecha).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric" });
}

function catLabel(c?: string) {
  if (!c) return "";
  return c.charAt(0).toUpperCase() + c.slice(1).toLowerCase();
}

export default function DocumentosPage() {
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Category>("Todos");

  useEffect(() => {
    getMisDocumentos()
      .then(setDocs)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Collect unique categories
  const categories: Category[] = ["Todos", ...Array.from(new Set(docs.map((d) => catLabel(d.categoria)).filter(Boolean)))];

  const filtered = activeTab === "Todos"
    ? docs
    : docs.filter((d) => catLabel(d.categoria) === activeTab);

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: headingFont }}>Documentos</h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: bodyFont }}>Archivos compartidos y entregables del proyecto</p>
        </div>
      </div>

      {/* Category Tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {categories.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "0.45rem 1rem", borderRadius: "999px",
            border: activeTab === tab ? "1.5px solid var(--verde)" : "1px solid var(--border)",
            background: activeTab === tab ? "rgba(74,139,0,0.08)" : "var(--bg)",
            color: activeTab === tab ? "var(--verde)" : "var(--text-secondary)",
            fontSize: "0.82rem", fontWeight: 600, cursor: "pointer",
            fontFamily: bodyFont, transition: "all 0.2s",
          }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSpinner text="Cargando documentos..." />
      ) : filtered.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", borderRadius: "16px", border: "1px dashed var(--border)" }}>
          <p style={{ color: "var(--text-muted)", fontFamily: bodyFont }}>No hay documentos en esta categoria.</p>
        </div>
      ) : (
        <div style={{ borderRadius: "16px", border: "1px solid var(--border)", background: "var(--bg)", overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 120px 120px 100px 80px", padding: "0.85rem 1.25rem", borderBottom: "1px solid var(--border)", background: "var(--bg-soft)", gap: "0.75rem", alignItems: "center" }}>
            {["", "Nombre", "Categoria", "Fecha", "Tamano", ""].map((h, i) => (
              <span key={i} style={{ fontSize: "0.72rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", fontFamily: bodyFont }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.map((doc, idx) => {
            const ext = getExt(doc.nombre);
            const cc = CATEGORY_COLORS[doc.categoria?.toLowerCase()] ?? CATEGORY_COLORS.default;
            return (
              <div key={doc.id} style={{
                display: "grid", gridTemplateColumns: "44px 1fr 120px 120px 100px 80px",
                padding: "0.9rem 1.25rem", gap: "0.75rem", alignItems: "center",
                borderBottom: idx < filtered.length - 1 ? "1px solid var(--border-light)" : "none",
              }}>
                {/* Icon */}
                <div style={{
                  width: "36px", height: "36px", borderRadius: "8px",
                  background: `rgba(0,0,0,0.04)`, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <FileIcon ext={ext} />
                </div>

                {/* Name */}
                <div>
                  <p style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text-primary)", margin: 0, fontFamily: headingFont }}>{doc.nombre}</p>
                  {doc.tipo && (
                    <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: "0.1rem 0 0", fontFamily: bodyFont }}>{doc.tipo.toUpperCase()}</p>
                  )}
                </div>

                {/* Category */}
                <span style={{ display: "inline-flex", padding: "0.2rem 0.6rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: 600, background: cc.bg, color: cc.color, fontFamily: bodyFont, width: "fit-content" }}>
                  {catLabel(doc.categoria) || "—"}
                </span>

                {/* Date */}
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
                  {fmt(doc.creadoEn ?? doc.createdAt)}
                </span>

                {/* Size */}
                <span style={{ fontSize: "0.78rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
                  {doc.tamano ?? "—"}
                </span>

                {/* Link */}
                {doc.url ? (
                  <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{
                    fontSize: "0.75rem", fontWeight: 600, color: "var(--verde)",
                    textDecoration: "none", fontFamily: bodyFont,
                  }}>
                    Ver →
                  </a>
                ) : <span />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
