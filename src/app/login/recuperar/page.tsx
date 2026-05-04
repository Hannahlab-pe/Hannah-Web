"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { forgotPassword } from "@/libs/api";

export default function RecuperarPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [error, setError]     = useState("");
  const [focused, setFocused] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setEnviado(true);
    } catch {
      setError("No se pudo enviar el correo. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-soft)", padding: "1.5rem" }}>
      <style>{`nav { display: none !important; } footer { display: none !important; }`}</style>

      <div style={{ width: "100%", maxWidth: "400px" }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <Link href="/login" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
              <Image src="/images/logos/hannah.png" alt="HannahLab" width={24} height={24} style={{ objectFit: "contain" }} />
            </div>
            <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
              Hannah<span style={{ color: "var(--verde)" }}>Lab</span>
            </span>
          </Link>
        </div>

        <div style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: "16px", padding: "2rem" }}>
          {enviado ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(74,139,0,0.1)", border: "1px solid rgba(74,139,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--verde)" strokeWidth="2" style={{ width: "24px", height: "24px" }}>
                  <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.5rem" }}>
                Revisa tu correo
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 1.5rem", lineHeight: 1.6 }}>
                Si <strong>{email}</strong> está registrado, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <Link href="/login" style={{ display: "inline-block", padding: "0.6rem 1.5rem", borderRadius: "9px", background: "var(--verde)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                Volver al login
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.4rem" }}>
                Recuperar contraseña
              </h1>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1.5rem", lineHeight: 1.5 }}>
                Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div style={{
                  borderRadius: "12px", overflow: "hidden",
                  border: `1.5px solid ${focused ? "var(--verde)" : "var(--border)"}`,
                  boxShadow: focused ? "0 0 0 3px rgba(74,139,0,0.08)" : "none",
                  display: "flex", alignItems: "center", background: "var(--bg-soft)",
                  transition: "all 0.2s",
                }}>
                  <div style={{ padding: "0 0 0 1rem", color: focused ? "var(--verde)" : "var(--text-muted)", transition: "color 0.2s", display: "flex" }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}>
                      <path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <input
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@empresa.com" required
                    onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                    style={{ flex: 1, padding: "0.85rem 1rem 0.85rem 0.65rem", background: "transparent", border: "none", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none" }}
                  />
                </div>

                {error && (
                  <div style={{ padding: "0.7rem 1rem", borderRadius: "8px", background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", fontSize: "0.82rem" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "0.85rem", borderRadius: "9px",
                  background: loading ? "#666" : "black", color: "#fff",
                  fontSize: "0.9rem", fontWeight: 700, border: "none",
                  cursor: loading ? "not-allowed" : "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "var(--verde)"; }}
                  onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "black"; }}
                >
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                <Link href="/login" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  ← Volver al login
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
