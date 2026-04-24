"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const SUGERENCIAS = [
  "¿Cuál es el estado actual de mis proyectos?",
  "¿Qué tareas están pendientes esta semana?",
  "¿Cuándo es la próxima entrega?",
];

export default function HannahAIPage() {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <style>{`
        @keyframes ai-float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-7px); }
        }
        @keyframes ai-glow {
          0%, 100% { box-shadow: 0 0 28px rgba(74,222,128,0.2), 0 0 60px rgba(74,222,128,0.07); }
          50%       { box-shadow: 0 0 44px rgba(74,222,128,0.38), 0 0 90px rgba(74,222,128,0.13); }
        }
        @keyframes ai-ring {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        .ai-suggest:hover {
          border-color: rgba(74,222,128,0.45) !important;
          background: rgba(74,222,128,0.05) !important;
          color: var(--text-primary) !important;
        }
        .ai-input-box:focus-within {
          border-color: rgba(74,222,128,0.5) !important;
          box-shadow: 0 0 0 3px rgba(74,222,128,0.07) !important;
        }
      `}</style>

      {/* ── Contenido central ── */}
      <div style={{
        display: "flex", flexDirection: "column", alignItems: "center",
        justifyContent: "center", gap: "2.75rem",
        paddingBottom: "120px",
        minHeight: "calc(100vh - 200px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* Logo + título */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
          <div style={{ position: "relative", animation: "ai-float 3.5s ease-in-out infinite" }}>
            {/* Anillo giratorio */}
            <div style={{
              position: "absolute", inset: "-12px", borderRadius: "50%",
              border: "1.5px dashed rgba(74,222,128,0.22)",
              animation: "ai-ring 9s linear infinite",
            }} />
            {/* Orbe con logo real */}
            <div style={{
              width: "82px", height: "82px", borderRadius: "50%",
              background: "linear-gradient(145deg, #071a0a, #0d2e12, #0f3d18)",
              border: "1.5px solid rgba(74,222,128,0.28)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "ai-glow 3s ease-in-out infinite",
              overflow: "hidden",
            }}>
              <Image
                src="/images/logos/hannah.png"
                alt="Hannah AI"
                width={52}
                height={52}
                style={{ objectFit: "contain", filter: "brightness(1.1)" }}
              />
            </div>
          </div>

          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, fontFamily: "'Google Sans', system-ui", letterSpacing: "-0.02em" }}>
              Hannah{" "}
              <span style={{ background: "linear-gradient(90deg, #4ade80, #86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                AI
              </span>
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.3rem 0 0", fontFamily: "'Outfit', sans-serif" }}>
              ¿En qué te puedo ayudar hoy?
            </p>
          </div>
        </div>

        {/* Preguntas sugeridas — horizontal */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "0.75rem", width: "100%", maxWidth: "720px",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(14px)",
          transition: "opacity 0.5s 0.12s, transform 0.5s 0.12s",
        }}>
          {SUGERENCIAS.map((s, i) => (
            <button
              key={i}
              className="ai-suggest"
              onClick={() => { setInput(s); inputRef.current?.focus(); }}
              style={{
                textAlign: "left", padding: "0.85rem 1rem",
                borderRadius: "12px", border: "1px solid var(--border)",
                background: "var(--bg)", cursor: "pointer",
                fontSize: "0.79rem", color: "var(--text-secondary)",
                fontFamily: "'Outfit', sans-serif", lineHeight: 1.5,
                transition: "all 0.18s",
                display: "flex", flexDirection: "column", gap: "0.5rem",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "15px", height: "15px", color: "#4ade80", opacity: 0.9, flexShrink: 0 }}>
                <path d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input fijo abajo tipo ChatGPT ── */}
      <div style={{
        position: "fixed", bottom: 0, right: 0,
        left: "232px", /* ancho del sidebar */
        padding: "1rem 2rem 1.5rem",
        background: "linear-gradient(to top, var(--bg-soft) 80%, transparent)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.5s 0.22s, transform 0.5s 0.22s",
      }}>
        <div
          className="ai-input-box"
          style={{
            maxWidth: "720px", margin: "0 auto",
            border: "1px solid var(--border)", borderRadius: "16px",
            background: "var(--bg)", transition: "border-color 0.2s, box-shadow 0.2s",
            boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          }}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) e.preventDefault(); }}
            placeholder="Escribe tu pregunta a Hannah AI… (próximamente)"
            rows={3}
            style={{
              width: "100%", padding: "1rem 1.1rem 0.5rem",
              background: "transparent", border: "none", outline: "none",
              fontSize: "0.88rem", color: "var(--text-primary)",
              fontFamily: "'Outfit', sans-serif", resize: "none",
              boxSizing: "border-box", lineHeight: 1.6,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0.75rem 0.75rem 1.1rem" }}>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
              Enter para enviar · Shift+Enter nueva línea
            </span>
            <button
              disabled
              style={{
                padding: "0.5rem 1.2rem", borderRadius: "9px", border: "none",
                background: input.trim() ? "var(--verde)" : "var(--bg-soft)",
                color: input.trim() ? "#fff" : "var(--text-muted)",
                fontSize: "0.8rem", fontWeight: 600, cursor: "not-allowed",
                fontFamily: "'Outfit', sans-serif", transition: "all 0.18s",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Enviar
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
