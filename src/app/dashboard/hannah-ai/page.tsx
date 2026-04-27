"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";

const AI_URL = process.env.NEXT_PUBLIC_AI_API_URL ?? "http://localhost:8000";

const SUGERENCIAS = [
  "¿Cuál es el estado actual de mis proyectos?",
  "¿Qué tickets tengo abiertos?",
  "¿Cuándo es mi próxima reunión?",
];

type Mensaje = {
  role: "user" | "assistant";
  content: string;
  loading?: boolean;
};

type ToolEvent = { tool: string; done: boolean };

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hw_token");
}

// ── Burbuja de mensaje ────────────────────────────────────────────
function Burbuja({ msg, toolEvent }: { msg: Mensaje; toolEvent?: ToolEvent | null }) {
  const isUser = msg.role === "user";

  const TOOL_LABELS: Record<string, string> = {
    consultar_proyectos: "proyectos",
    consultar_tickets: "tickets",
    consultar_reuniones: "reuniones",
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: isUser ? "row-reverse" : "row",
      alignItems: "flex-start",
      gap: "0.65rem",
      maxWidth: "100%",
    }}>
      {/* Avatar */}
      {!isUser && (
        <div style={{
          width: "30px", height: "30px", borderRadius: "50%", flexShrink: 0,
          background: "linear-gradient(145deg, #071a0a, #0d2e12)",
          border: "1px solid rgba(74,222,128,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          marginTop: "2px",
        }}>
          <Image src="/images/logos/hannah.png" alt="AI" width={18} height={18} style={{ objectFit: "contain" }} />
        </div>
      )}

      <div style={{ maxWidth: "75%", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {/* Tool indicator */}
        {!isUser && toolEvent && !toolEvent.done && (
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "0.4rem",
            padding: "0.3rem 0.7rem", borderRadius: "8px",
            background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.18)",
            fontSize: "0.7rem", color: "#4ade80", fontFamily: "'Outfit', sans-serif",
          }}>
            <span style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</span>
            Consultando {TOOL_LABELS[toolEvent.tool] ?? toolEvent.tool}…
          </div>
        )}

        {/* Burbuja */}
        <div style={{
          padding: isUser ? "0.65rem 1rem" : "0.75rem 1rem",
          borderRadius: isUser ? "16px 4px 16px 16px" : "4px 16px 16px 16px",
          background: isUser ? "var(--verde)" : "var(--bg)",
          border: isUser ? "none" : "1px solid var(--border)",
          color: isUser ? "#fff" : "var(--text-primary)",
          fontSize: "0.85rem",
          fontFamily: "'Outfit', sans-serif",
          lineHeight: 1.65,
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}>
          {msg.loading ? (
            <span style={{ display: "inline-flex", gap: "3px", alignItems: "center" }}>
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: "5px", height: "5px", borderRadius: "50%",
                  background: "#4ade80", display: "inline-block",
                  animation: `bounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                }} />
              ))}
            </span>
          ) : (
            <MdContent content={msg.content} isUser={isUser} />
          )}
        </div>
      </div>
    </div>
  );
}

// Renderer mínimo de markdown (negrita, código inline)
function MdContent({ content, isUser }: { content: string; isUser: boolean }) {
  const parts = content.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return <strong key={i}>{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={i} style={{
              background: isUser ? "rgba(255,255,255,0.15)" : "var(--bg-soft)",
              padding: "0.1rem 0.35rem", borderRadius: "4px", fontSize: "0.82rem",
            }}>{part.slice(1, -1)}</code>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Página principal ──────────────────────────────────────────────
export default function HannahAIPage() {
  const [visible, setVisible] = useState(false);
  const [input, setInput] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(false);
  const [toolEvent, setToolEvent] = useState<ToolEvent | null>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const isFirstMessage = mensajes.length === 0;

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensajes, toolEvent]);

  async function enviarMensaje(texto: string) {
    if (!texto.trim() || cargando) return;
    const token = getToken();
    if (!token) return;

    const userMsg: Mensaje = { role: "user", content: texto.trim() };
    const loadingMsg: Mensaje = { role: "assistant", content: "", loading: true };

    setMensajes(prev => [...prev, userMsg, loadingMsg]);
    setInput("");
    setCargando(true);
    setToolEvent(null);

    try {
      const res = await fetch(`${AI_URL}/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ message: texto.trim() }),
      });

      if (!res.ok) throw new Error(`Error ${res.status}`);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";

      // Reemplaza el loading msg con el real
      setMensajes(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "" },
      ]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value, { stream: true });
        const lines = text.split("\n");

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const event = JSON.parse(line.slice(6));

            if (event.type === "token") {
              aiContent += event.content;
              setMensajes(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: aiContent },
              ]);
            } else if (event.type === "tool_start") {
              setToolEvent({ tool: event.tool, done: false });
            } else if (event.type === "tool_end") {
              setToolEvent(prev => prev ? { ...prev, done: true } : null);
              setTimeout(() => setToolEvent(null), 800);
            } else if (event.type === "done") {
              setToolEvent(null);
            } else if (event.type === "error") {
              setMensajes(prev => [
                ...prev.slice(0, -1),
                { role: "assistant", content: "Lo siento, ocurrió un error. Intenta de nuevo." },
              ]);
            }
          } catch { /* skip malformed SSE line */ }
        }
      }
    } catch {
      setMensajes(prev => [
        ...prev.slice(0, -1),
        { role: "assistant", content: "No pude conectarme. Verifica tu conexión e intenta de nuevo." },
      ]);
    } finally {
      setCargando(false);
      setToolEvent(null);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje(input);
    }
  }

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
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%           { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes spin {
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

      {/* ── Área de mensajes ── */}
      <div style={{
        paddingBottom: "140px",
        minHeight: "calc(100vh - 200px)",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: "opacity 0.5s cubic-bezier(0.16,1,0.3,1), transform 0.5s cubic-bezier(0.16,1,0.3,1)",
      }}>

        {/* Estado inicial — sin mensajes */}
        {isFirstMessage && (
          <div style={{
            display: "flex", flexDirection: "column", alignItems: "center",
            justifyContent: "center", gap: "2.75rem",
            minHeight: "calc(100vh - 300px)",
          }}>
            {/* Logo */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
              <div style={{ position: "relative", animation: "ai-float 3.5s ease-in-out infinite" }}>
                <div style={{
                  position: "absolute", inset: "-12px", borderRadius: "50%",
                  border: "1.5px dashed rgba(74,222,128,0.22)",
                  animation: "ai-ring 9s linear infinite",
                }} />
                <div style={{
                  width: "82px", height: "82px", borderRadius: "50%",
                  background: "linear-gradient(145deg, #071a0a, #0d2e12, #0f3d18)",
                  border: "1.5px solid rgba(74,222,128,0.28)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  animation: "ai-glow 3s ease-in-out infinite", overflow: "hidden",
                }}>
                  <Image src="/images/logos/hannah.png" alt="Hannah AI" width={52} height={52} style={{ objectFit: "contain", filter: "brightness(1.1)" }} />
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: "var(--text-primary)", margin: 0, fontFamily: "'Google Sans', system-ui", letterSpacing: "-0.02em" }}>
                  Hannah{" "}
                  <span style={{ background: "linear-gradient(90deg, #4ade80, #86efac)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>AI</span>
                </h1>
                <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0.3rem 0 0", fontFamily: "'Outfit', sans-serif" }}>
                  ¿En qué te puedo ayudar hoy?
                </p>
              </div>
            </div>

            {/* Sugerencias */}
            <div style={{
              display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
              gap: "0.75rem", width: "100%", maxWidth: "720px",
            }}>
              {SUGERENCIAS.map((s, i) => (
                <button
                  key={i}
                  className="ai-suggest"
                  onClick={() => enviarMensaje(s)}
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
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "15px", height: "15px", color: "#4ade80" }}>
                    <path d="M8.625 9.75a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mensajes */}
        {!isFirstMessage && (
          <div style={{
            maxWidth: "720px", margin: "0 auto",
            display: "flex", flexDirection: "column", gap: "1.25rem",
            padding: "1.5rem 0",
          }}>
            {mensajes.map((msg, i) => (
              <Burbuja
                key={i}
                msg={msg}
                toolEvent={i === mensajes.length - 1 && msg.role === "assistant" ? toolEvent : null}
              />
            ))}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* ── Input fijo abajo ── */}
      <div style={{
        position: "fixed", bottom: 0, right: 0,
        left: "232px",
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
            onKeyDown={handleKeyDown}
            placeholder="Escribe tu pregunta a Hannah AI…"
            rows={3}
            disabled={cargando}
            style={{
              width: "100%", padding: "1rem 1.1rem 0.5rem",
              background: "transparent", border: "none", outline: "none",
              fontSize: "0.88rem", color: "var(--text-primary)",
              fontFamily: "'Outfit', sans-serif", resize: "none",
              boxSizing: "border-box", lineHeight: 1.6,
              opacity: cargando ? 0.6 : 1,
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0.4rem 0.75rem 0.75rem 1.1rem" }}>
            <span style={{ fontSize: "0.65rem", color: "var(--text-muted)", fontFamily: "'Outfit', sans-serif" }}>
              Enter para enviar · Shift+Enter nueva línea
            </span>
            <button
              onClick={() => enviarMensaje(input)}
              disabled={!input.trim() || cargando}
              style={{
                padding: "0.5rem 1.2rem", borderRadius: "9px", border: "none",
                background: input.trim() && !cargando ? "var(--verde)" : "var(--bg-soft)",
                color: input.trim() && !cargando ? "#fff" : "var(--text-muted)",
                fontSize: "0.8rem", fontWeight: 600,
                cursor: !input.trim() || cargando ? "not-allowed" : "pointer",
                fontFamily: "'Outfit', sans-serif", transition: "all 0.18s",
                display: "flex", alignItems: "center", gap: "0.4rem",
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}>
                <path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {cargando ? "..." : "Enviar"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
