"use client";

import { useState } from "react";

const headingFont = "'Google Sans', system-ui";
const bodyFont = "'Outfit', sans-serif";

type Category = "Todos" | "Contratos" | "Entregables" | "Reportes";

interface Document {
  name: string;
  size: string;
  date: string;
  uploadedBy: string;
  category: Category;
  type: "pdf" | "doc" | "xls" | "img" | "fig" | "zip" | "sql";
}

const documents: Document[] = [
  { name: "Contrato_HannahLab_2025.pdf", size: "2.4 MB", date: "12 Mar 2025", uploadedBy: "Ana Torres", category: "Contratos", type: "pdf" },
  { name: "Propuesta_ERP_Betondecken.pdf", size: "5.1 MB", date: "08 Mar 2025", uploadedBy: "Carlos Ramirez", category: "Entregables", type: "pdf" },
  { name: "Reporte_Mensual_Marzo.xlsx", size: "1.8 MB", date: "01 Abr 2025", uploadedBy: "Maria Lopez", category: "Reportes", type: "xls" },
  { name: "Mockups_Web_v2.fig", size: "12.3 MB", date: "15 Mar 2025", uploadedBy: "Diego Herrera", category: "Entregables", type: "fig" },
  { name: "Manual_Usuario_Bot.pdf", size: "3.7 MB", date: "20 Feb 2025", uploadedBy: "Ana Torres", category: "Entregables", type: "pdf" },
  { name: "Factura_001_2025.pdf", size: "420 KB", date: "05 Ene 2025", uploadedBy: "Maria Lopez", category: "Contratos", type: "pdf" },
  { name: "Arquitectura_Sistema.pdf", size: "8.9 MB", date: "28 Feb 2025", uploadedBy: "Carlos Ramirez", category: "Entregables", type: "pdf" },
  { name: "Sprint_Review_15.docx", size: "1.2 MB", date: "22 Mar 2025", uploadedBy: "Diego Herrera", category: "Reportes", type: "doc" },
  { name: "Assets_Logo_Hannah.zip", size: "24.6 MB", date: "10 Ene 2025", uploadedBy: "Ana Torres", category: "Entregables", type: "zip" },
  { name: "Backup_DB_Abril.sql", size: "156 MB", date: "02 Abr 2025", uploadedBy: "Carlos Ramirez", category: "Reportes", type: "sql" },
];

function getFileIcon(type: Document["type"]) {
  switch (type) {
    case "pdf":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#E53E3E" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
          <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m.75 12l3 3m0 0l3-3m-3 3v-6m-1.5-9H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "doc":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#3182CE" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
          <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "xls":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#38A169" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
          <path d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0112 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M10.875 12h-1.5m1.5 0c.621 0 1.125.504 1.125 1.125M12 12h7.5m-7.5 0c0 .621.504 1.125 1.125 1.125M21.375 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25-3.75c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "fig":
    case "img":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#9F7AEA" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
          <path d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "zip":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#DD6B20" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
          <path d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "sql":
      return (
        <svg viewBox="0 0 24 24" fill="none" stroke="#718096" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}>
          <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75m16.5 3.75v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

function getFileIconBg(type: Document["type"]) {
  switch (type) {
    case "pdf": return "rgba(229,62,62,0.08)";
    case "doc": return "rgba(49,130,206,0.08)";
    case "xls": return "rgba(56,161,105,0.08)";
    case "fig": case "img": return "rgba(159,122,234,0.08)";
    case "zip": return "rgba(221,107,32,0.08)";
    case "sql": return "rgba(113,128,150,0.08)";
  }
}

function getCategoryColor(category: Category) {
  switch (category) {
    case "Contratos": return { bg: "rgba(49,130,206,0.1)", color: "#3182CE" };
    case "Entregables": return { bg: "rgba(74,139,0,0.1)", color: "var(--verde)" };
    case "Reportes": return { bg: "rgba(221,107,32,0.1)", color: "#DD6B20" };
    default: return { bg: "rgba(113,128,150,0.1)", color: "#718096" };
  }
}

export default function DocumentosPage() {
  const [activeTab, setActiveTab] = useState<Category>("Todos");

  const filteredDocs = activeTab === "Todos"
    ? documents
    : documents.filter((d) => d.category === activeTab);

  const tabs: Category[] = ["Todos", "Contratos", "Entregables", "Reportes"];

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", fontFamily: headingFont }}>
            Documentos
          </h1>
          <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", fontFamily: bodyFont }}>
            Archivos compartidos y entregables del proyecto
          </p>
        </div>
        <button
          style={{
            display: "inline-flex", alignItems: "center", gap: "0.5rem",
            padding: "0.6rem 1.25rem", borderRadius: "10px", border: "none",
            background: "var(--verde)", color: "#fff", fontSize: "0.875rem",
            fontWeight: 600, fontFamily: bodyFont, cursor: "pointer",
          }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "16px", height: "16px" }}>
            <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Subir archivo
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: "0.45rem 1rem", borderRadius: "8px", border: "1px solid",
              borderColor: activeTab === tab ? "var(--verde)" : "var(--border)",
              background: activeTab === tab ? "rgba(74,139,0,0.1)" : "var(--bg)",
              color: activeTab === tab ? "var(--verde)" : "var(--text-secondary)",
              fontSize: "0.8rem", fontWeight: 600, fontFamily: bodyFont, cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Documents list */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {/* Table header */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 100px 110px 130px 110px",
          padding: "0.6rem 1rem", fontSize: "0.75rem", fontWeight: 600,
          color: "var(--text-muted)", fontFamily: bodyFont, textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}>
          <span>Archivo</span>
          <span>Tamano</span>
          <span>Fecha</span>
          <span>Subido por</span>
          <span>Categoria</span>
        </div>

        {filteredDocs.map((doc, i) => {
          const catStyle = getCategoryColor(doc.category);
          return (
            <div
              key={i}
              style={{
                display: "grid", gridTemplateColumns: "1fr 100px 110px 130px 110px",
                alignItems: "center", padding: "0.85rem 1rem", borderRadius: "12px",
                background: "var(--bg)", border: "1px solid var(--border)",
                transition: "border-color 0.15s ease", cursor: "pointer",
              }}
            >
              {/* File name with icon */}
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", minWidth: 0 }}>
                <div style={{
                  width: "40px", height: "40px", borderRadius: "10px",
                  background: getFileIconBg(doc.type), display: "flex",
                  alignItems: "center", justifyContent: "center", flexShrink: 0,
                }}>
                  {getFileIcon(doc.type)}
                </div>
                <span style={{
                  fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)",
                  fontFamily: bodyFont, overflow: "hidden", textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}>
                  {doc.name}
                </span>
              </div>

              {/* Size */}
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
                {doc.size}
              </span>

              {/* Date */}
              <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
                {doc.date}
              </span>

              {/* Uploaded by */}
              <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontFamily: bodyFont }}>
                {doc.uploadedBy}
              </span>

              {/* Category tag */}
              <span style={{
                display: "inline-block", padding: "0.2rem 0.6rem", borderRadius: "6px",
                fontSize: "0.7rem", fontWeight: 600, fontFamily: bodyFont,
                background: catStyle.bg, color: catStyle.color, textAlign: "center",
                width: "fit-content",
              }}>
                {doc.category}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary footer */}
      <div style={{
        marginTop: "1.5rem", padding: "0.75rem 1rem", borderRadius: "10px",
        background: "var(--bg-soft)", display: "flex", justifyContent: "space-between",
        alignItems: "center", flexWrap: "wrap", gap: "0.5rem",
      }}>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
          {filteredDocs.length} documento{filteredDocs.length !== 1 ? "s" : ""}
        </span>
        <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", fontFamily: bodyFont }}>
          Almacenamiento usado: 216.4 MB
        </span>
      </div>
    </div>
  );
}
