"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import Grainient from "@/components/grainient";
import { loginApi } from "@/libs/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { accessToken, usuario } = await loginApi(email, password);
      localStorage.setItem("hw_token", accessToken);
      localStorage.setItem("hw_usuario", JSON.stringify(usuario));
      // Cookie para el middleware de protección de rutas
      document.cookie = `hw_token=${accessToken}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax`;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message ?? "Credenciales incorrectas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      // Left panel
      tl.fromTo(".left-panel", { x: "-100%" }, { x: "0%", duration: 1.2 }, 0);
      tl.fromTo(".left-logo", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 1, ease: "back.out(1.5)" }, 0.8);
      tl.fromTo(".left-text", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 1.2);

      // Right side
      tl.fromTo(".right-title", { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.6 }, 0.7);
      tl.fromTo(".right-field", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 }, 0.9);
      tl.fromTo(".right-btn", { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5 }, 1.2);
      tl.fromTo(".right-extra", { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.1 }, 1.4);

    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} style={{ minHeight: "100vh", display: "flex", overflow: "hidden" }}>
      {/* Hide navbar on this page */}
      <style>{`nav { display: none !important; } footer { display: none !important; }`}</style>

      {/* Back button top-right */}
      <Link href="/inicio" style={{
        position: "fixed", top: "1.25rem", right: "1.25rem", zIndex: 50,
        display: "flex", alignItems: "center", gap: "0.4rem",
        padding: "0.5rem 1rem", borderRadius: "9999px",
        background: "var(--bg-soft)", border: "1px solid var(--border)",
        color: "var(--text-secondary)", fontSize: "0.8rem", fontWeight: 600,
        textDecoration: "none", transition: "all 0.3s",
      }}
        onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.color = "var(--verde)"; }}
        onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "var(--text-secondary)"; }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "14px", height: "14px" }}><path d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" strokeLinecap="round" strokeLinejoin="round" /></svg>
        Volver
      </Link>

      {/* ========== LEFT PANEL ========== */}
      <div className="left-panel hidden lg:!flex" style={{
        width: "50%", background: "#080808",
        position: "relative", overflow: "hidden", flexDirection: "column",
        justifyContent: "space-between", padding: "2.5rem 3rem",
      }}>
        {/* Grainient background */}
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <Grainient
            color1="#4bbf27"
            color2="#000000"
            color3="#4bbf27"
            timeSpeed={0.35}
            colorBalance={0.6}
            warpStrength={1}
            warpFrequency={5}
            warpSpeed={1}
            warpAmplitude={60}
            blendAngle={0}
            blendSoftness={0.1}
            rotationAmount={500}
            noiseScale={2}
            grainAmount={0.08}
            grainScale={2}
            grainAnimated={false}
            contrast={1.3}
            gamma={1}
            saturation={1.2}
            centerX={0}
            centerY={0}
            zoom={0.8}
          />
        </div>

        {/* Logo centered */}
        <div style={{ flex: 1, position: "relative", zIndex: 2, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="left-logo" style={{ opacity: 0 }}>
            <Link href="/inicio">
              <Image src="/images/logos/hannah.png" alt="HannahLab" width={260} height={260} style={{ objectFit: "contain" }} />
            </Link>
          </div>
        </div>

        {/* Text bottom */}
        <div style={{ position: "relative", zIndex: 2, textAlign: "center" }}>
          <h2 className="left-text" style={{ opacity: 0, fontSize: "1.35rem", fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: "0.4rem" }}>
            Tu panel de control, siempre disponible
          </h2>
          <p className="left-text" style={{ opacity: 0, fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>
            Gestiona proyectos, revisa avances y conecta con nuestro equipo en tiempo real.
          </p>
        </div>
      </div>

      {/* ========== RIGHT PANEL ========== */}
      <div style={{
        flex: 1, display: "flex", alignItems: "center", justifyContent: "center",
        padding: "2rem", background: "var(--bg)",
      }}>
        <div style={{ width: "100%", maxWidth: "380px" }}>

          {/* Mobile logo */}
          <div className="lg:!hidden" style={{ textAlign: "center", marginBottom: "2rem" }}>
            <Link href="/inicio" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <Image src="/images/logos/hannah.png" alt="HannahLab" width={24} height={24} style={{ objectFit: "contain" }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text-primary)" }}>
                Hannah<span style={{ color: "var(--verde)" }}>Lab</span>
              </span>
            </Link>
          </div>

          {/* Title */}
          <div className="right-title" style={{ opacity: 0, textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem" }}>
              Bienvenido
            </h1>
            <p style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              Inicia sesion en tu cuenta de cliente
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {/* Email */}
            <div className="right-field" style={{ opacity: 0 }}>
              <div style={{
                borderRadius: "12px", overflow: "hidden",
                border: `1.5px solid ${focusedField === "email" ? "var(--verde)" : "var(--border)"}`,
                transition: "all 0.3s",
                boxShadow: focusedField === "email" ? "0 0 0 3px rgba(74,139,0,0.08)" : "none",
                display: "flex", alignItems: "center", background: "var(--bg-soft)",
              }}>
                <div style={{ padding: "0 0 0 1rem", color: focusedField === "email" ? "var(--verde)" : "var(--text-muted)", transition: "color 0.3s", display: "flex" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>
                </div>
                <input
                  type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com" required
                  onFocus={() => setFocusedField("email")} onBlur={() => setFocusedField(null)}
                  style={{ flex: 1, padding: "0.85rem 1rem 0.85rem 0.65rem", background: "transparent", border: "none", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "'Outfit', system-ui" }}
                />
              </div>
            </div>

            {/* Password */}
            <div className="right-field" style={{ opacity: 0 }}>
              <div style={{
                borderRadius: "12px", overflow: "hidden",
                border: `1.5px solid ${focusedField === "password" ? "var(--verde)" : "var(--border)"}`,
                transition: "all 0.3s",
                boxShadow: focusedField === "password" ? "0 0 0 3px rgba(74,139,0,0.08)" : "none",
                display: "flex", alignItems: "center", background: "var(--bg-soft)",
              }}>
                <div style={{ padding: "0 0 0 1rem", color: focusedField === "password" ? "var(--verde)" : "var(--text-muted)", transition: "color 0.3s", display: "flex" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}><path d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
                </div>
                <input
                  type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="Contrasena" required
                  onFocus={() => setFocusedField("password")} onBlur={() => setFocusedField(null)}
                  style={{ flex: 1, padding: "0.85rem 0.5rem 0.85rem 0.65rem", background: "transparent", border: "none", fontSize: "0.9rem", color: "var(--text-primary)", outline: "none", boxSizing: "border-box", fontFamily: "'Outfit', system-ui" }}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ padding: "0 1rem", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex", transition: "color 0.3s" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {showPassword
                      ? <><path d="M3.98 8.223A10.477 10.477 0 001.934 12c1.292 4.338 5.31 7.5 10.066 7.5.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></>
                      : <><path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></>
                    }
                  </svg>
                </button>
              </div>
            </div>

            {/* Remember + forgot */}
            <div className="right-field" style={{ opacity: 0, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ display: "flex", alignItems: "center", gap: "0.4rem", cursor: "pointer" }}>
                <input type="checkbox" style={{ accentColor: "var(--verde)", width: "14px", height: "14px" }} />
                <span style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>Recordarme</span>
              </label>
              <button type="button" style={{ background: "none", border: "none", color: "var(--verde)", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer" }}>
                Olvidaste tu contrasena?
              </button>
            </div>

            {/* Error */}
            {error && (
              <div style={{ padding: "0.75rem 1rem", borderRadius: "8px", background: "#fff0f0", border: "1px solid #ffcccc", color: "#cc0000", fontSize: "0.85rem", fontWeight: 500, marginBottom: "0.5rem" }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button className="right-btn" type="submit" disabled={loading} style={{
              opacity: 0, width: "100%", padding: "0.9rem", borderRadius: "9px",
              backgroundColor: loading ? "#666" : "black", color: "#ffffff", fontSize: "0.95rem",
              fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", transition: "all 0.3s",
              display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem",
            }}
              onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "var(--verde-accent)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(74,139,0,0.3)"; }}}
              onMouseLeave={(e) => { if (!loading) { e.currentTarget.style.backgroundColor = "black"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}}
            >
              {loading ? "Verificando..." : "Iniciar sesion"}
              {!loading && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" /></svg>}
            </button>
          </form>

          {/* Divider */}
          <div className="right-extra" style={{ opacity: 0, display: "flex", alignItems: "center", gap: "1rem", margin: "1.25rem 0" }}>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: 500 }}>o contactanos</span>
            <div style={{ flex: 1, height: "1px", background: "var(--border)" }} />
          </div>

          {/* WhatsApp */}
          <a className="right-extra" href="https://wa.me/51925223153?text=Hola%2C%20necesito%20acceso%20a%20mi%20cuenta" target="_blank" rel="noopener noreferrer" style={{
            opacity: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "0.6rem",
            padding: "0.8rem", borderRadius: "12px", background: "var(--verde)",
            border: "1px solid var(--border)", textDecoration: "none",
            fontSize: "0.85rem", color: "white", fontWeight: 600, transition: "all 0.3s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#25D366"; e.currentTarget.style.color = "#25D366"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.color = "white"; }}
          >
            <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: "18px", height: "18px" }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
            Contactar por WhatsApp
          </a>

        </div>
      </div>
    </div>
  );
}
