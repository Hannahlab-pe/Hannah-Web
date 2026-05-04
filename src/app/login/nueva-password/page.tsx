"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { resetPassword } from "@/libs/api";

function NuevaPasswordForm() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get("token") ?? "";

  const [password, setPassword]   = useState("");
  const [confirm, setConfirm]     = useState("");
  const [showPw, setShowPw]       = useState(false);
  const [loading, setLoading]     = useState(false);
  const [exito, setExito]         = useState(false);
  const [error, setError]         = useState("");
  const [focused, setFocused]     = useState<string | null>(null);

  useEffect(() => {
    if (!token) setError("El enlace no es válido. Solicita uno nuevo.");
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Las contraseñas no coinciden."); return; }
    if (password.length < 6)  { setError("La contraseña debe tener al menos 6 caracteres."); return; }
    setError("");
    setLoading(true);
    try {
      await resetPassword(token, password);
      setExito(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (e: any) {
      setError(e.message ?? "El enlace es inválido o ha expirado.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg-soft)", padding: "1.5rem" }}>
      <style>{`nav { display: none !important; } footer { display: none !important; }`}</style>

      <div style={{ width: "100%", maxWidth: "400px" }}>
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
          {exito ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(74,139,0,0.1)", border: "1px solid rgba(74,139,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem" }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--verde)" strokeWidth="2.5" style={{ width: "24px", height: "24px" }}>
                  <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.5rem" }}>
                ¡Contraseña actualizada!
              </h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", margin: "0 0 1.5rem" }}>
                Redirigiendo al login en unos segundos...
              </p>
              <Link href="/login" style={{ display: "inline-block", padding: "0.6rem 1.5rem", borderRadius: "9px", background: "var(--verde)", color: "#fff", fontWeight: 600, fontSize: "0.85rem", textDecoration: "none" }}>
                Ir al login ahora
              </Link>
            </div>
          ) : (
            <>
              <h1 style={{ fontSize: "1.3rem", fontWeight: 700, color: "var(--text-primary)", margin: "0 0 0.4rem" }}>
                Nueva contraseña
              </h1>
              <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "0 0 1.5rem" }}>
                Elige una contraseña segura para tu cuenta.
              </p>

              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {/* Nueva contraseña */}
                {(["password", "confirm"] as const).map((field) => (
                  <div key={field} style={{
                    borderRadius: "12px", overflow: "hidden",
                    border: `1.5px solid ${focused === field ? "var(--verde)" : "var(--border)"}`,
                    boxShadow: focused === field ? "0 0 0 3px rgba(74,139,0,0.08)" : "none",
                    display: "flex", alignItems: "center", background: "var(--bg-soft)",
                    transition: "all 0.2s",
                  }}>
                    <div style={{ padding: "0 0 0 1rem", color: focused === field ? "var(--verde)" : "var(--text-muted)", transition: "color 0.2s", display: "flex" }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}>
                        <path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <input
                      type={showPw ? "text" : "password"}
                      value={field === "password" ? password : confirm}
                      onChange={(e) => field === "password" ? setPassword(e.target.value) : setConfirm(e.target.value)}
                      placeholder={field === "password" ? "Nueva contraseña" : "Confirmar contraseña"}
                      required
                      onFocus={() => setFocused(field)}
                      onBlur={() => setFocused(null)}
                      style={{ flex: 1, padding: "0.85rem 0.5rem 0.85rem 0.65rem", background: "transparent", border: "none", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none" }}
                    />
                    {field === "password" && (
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        style={{ padding: "0 1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", transition: "color 0.2s" }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          {showPw
                            ? <path d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                            : <><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                          }
                        </svg>
                      </button>
                    )}
                  </div>
                ))}

                {error && (
                  <div style={{ padding: "0.7rem 1rem", borderRadius: "8px", background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", fontSize: "0.82rem" }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading || !token} style={{
                  width: "100%", padding: "0.85rem", borderRadius: "9px",
                  background: loading || !token ? "#666" : "black", color: "#fff",
                  fontSize: "0.9rem", fontWeight: 700, border: "none",
                  cursor: loading || !token ? "not-allowed" : "pointer", transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { if (!loading && token) (e.currentTarget as HTMLButtonElement).style.background = "var(--verde)"; }}
                  onMouseLeave={(e) => { if (!loading && token) (e.currentTarget as HTMLButtonElement).style.background = "black"; }}
                >
                  {loading ? "Guardando..." : "Guardar nueva contraseña"}
                </button>
              </form>

              <div style={{ textAlign: "center", marginTop: "1.25rem" }}>
                <Link href="/login/recuperar" style={{ fontSize: "0.8rem", color: "var(--text-muted)", textDecoration: "none" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  ← Solicitar nuevo enlace
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function NuevaPasswordPage() {
  return (
    <Suspense>
      <NuevaPasswordForm />
    </Suspense>
  );
}
