"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const ServicesGrid = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Heading
      gsap.fromTo(".sv-heading", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });

      // Bento cards with 3D perspective
      gsap.fromTo(".bento-card", { opacity: 0, y: 50, rotateY: -5 }, {
        opacity: 1, y: 0, rotateY: 0, duration: 0.9, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".bento-grid", start: "top 80%" },
      });

      // Animated visuals inside cards
      gsap.fromTo(".card-visual", { opacity: 0, scale: 0.8 }, {
        opacity: 1, scale: 1, duration: 0.7, stagger: 0.1, ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".bento-grid", start: "top 80%" },
        delay: 0.4,
      });

      // Animated bars in the main card
      gsap.fromTo(".auto-bar", { scaleY: 0 }, {
        scaleY: 1, duration: 0.6, stagger: 0.08, ease: "power2.out",
        scrollTrigger: { trigger: ".bento-grid", start: "top 80%" },
        delay: 0.8,
      });

      // Animated progress circles
      gsap.fromTo(".progress-fill", { strokeDashoffset: 157 }, {
        strokeDashoffset: 40, duration: 1.5, ease: "power2.out",
        scrollTrigger: { trigger: ".bento-grid", start: "top 80%" },
        delay: 1,
      });

      // Code lines typing effect
      gsap.fromTo(".code-line", { width: 0 }, {
        width: "100%", duration: 0.5, stagger: 0.15, ease: "power1.out",
        scrollTrigger: { trigger: ".bento-grid", start: "top 80%" },
        delay: 0.6,
      });

    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="servicios" style={{
      backgroundColor: "var(--bg-soft)", padding: "3rem 1.5rem",
      minHeight: "100vh", display: "flex", alignItems: "center",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%" }}>
        {/* Heading */}
        <div className="sv-heading" style={{ textAlign: "center", marginBottom: "2rem", opacity: 0 }}>
          <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--verde)", marginBottom: "0.5rem", fontWeight: 600 }}>
            Lo que hacemos
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "var(--text-primary)", fontWeight: 700 }}>
            Servicios de <span className="gradient-text">alto impacto</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="bento-grid" style={{
          display: "grid",
          gridTemplateRows: "auto auto",
          gap: "0.75rem",
        }}>

          {/* ===== CARD 1: Automatizacion - LARGE (spans 2 cols) ===== */}
          <div className="bento-card" style={{
            gridColumn: "span 2", opacity: 0, borderRadius: "20px", padding: "1.75rem",
            background: "linear-gradient(135deg, #0a1a00 0%, #122200 50%, #0d1d00 100%)",
            border: "1px solid rgba(74,139,0,0.2)", position: "relative", overflow: "hidden",
            minHeight: "220px", display: "flex", flexDirection: "column", justifyContent: "space-between",
          }}>
            {/* Subtle grid pattern */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.05,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#6abf00" }} className="float-dot" />
                <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.5)", fontWeight: 600 }}>Servicio principal</span>
              </div>
              <h3 style={{ fontSize: "1.3rem", color: "#ffffff", fontWeight: 700, marginBottom: "0.4rem" }}>
                Automatizacion Inteligente
              </h3>
              <p style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.5, maxWidth: "280px" }}>
                Scripts, bots y flujos con Python, LangChain y LangGraph que eliminan lo repetitivo.
              </p>
            </div>

            {/* Visual: Animated bar chart */}
            <div className="card-visual" style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "flex-end", gap: "6px", height: "60px", marginTop: "0.75rem" }}>
              {[40, 65, 35, 80, 55, 70, 45, 90, 60, 75, 50, 85].map((h, i) => (
                <div key={i} className="auto-bar" style={{
                  width: "100%", height: `${h}%`, borderRadius: "3px 3px 0 0",
                  background: i % 2 === 0
                    ? "linear-gradient(to top, rgba(106,191,0,0.3), rgba(106,191,0,0.8))"
                    : "linear-gradient(to top, rgba(74,139,0,0.2), rgba(74,139,0,0.5))",
                  transformOrigin: "bottom",
                }} />
              ))}
            </div>

            {/* Tags */}
            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.75rem", position: "relative", zIndex: 1 }}>
              {["Python", "IA", "RPA"].map(t => (
                <span key={t} style={{ fontSize: "0.6rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "rgba(106,191,0,0.15)", color: "#6abf00", fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* ===== CARD 2: Desarrollo Web ===== */}
          <div className="bento-card" style={{
            gridColumn: "span 2", opacity: 0, borderRadius: "20px", padding: "1.75rem",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            position: "relative", overflow: "hidden", minHeight: "220px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.4rem" }}>
                Desarrollo Web & Software
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Apps modernas, APIs robustas y plataformas escalables.
              </p>
            </div>

            {/* Visual: Code editor mockup */}
            <div className="card-visual" style={{
              marginTop: "1rem", background: "#1a1a1a", borderRadius: "10px",
              padding: "0.75rem", fontFamily: "monospace", overflow: "hidden",
            }}>
              {/* Window dots */}
              <div style={{ display: "flex", gap: "5px", marginBottom: "0.6rem" }}>
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#ffbd2e" }} />
                <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#28c840" }} />
              </div>
              {/* Code lines */}
              {[
                { color: "#c792ea", w: "45%" },
                { color: "#82aaff", w: "70%" },
                { color: "#c3e88d", w: "55%" },
                { color: "#89ddff", w: "80%" },
                { color: "#f78c6c", w: "40%" },
              ].map((line, i) => (
                <div key={i} style={{ marginBottom: "4px", overflow: "hidden" }}>
                  <div className="code-line" style={{
                    height: "6px", borderRadius: "3px",
                    background: line.color, opacity: 0.6,
                    maxWidth: line.w, width: 0,
                  }} />
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.75rem" }}>
              {["Next.js", "React", "Node.js"].map(t => (
                <span key={t} style={{ fontSize: "0.6rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "rgba(74,139,0,0.06)", color: "var(--verde)", border: "1px solid rgba(74,139,0,0.1)", fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* ===== CARD 3: ERP Odoo ===== */}
          <div className="bento-card" style={{
            gridColumn: "span 2", opacity: 0, borderRadius: "20px", padding: "1.75rem",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            overflow: "hidden", minHeight: "180px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.4rem" }}>
                  Implementacion ERP
                </h3>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                  Partner Oficial de Odoo. Soluciones ERP para gestion empresarial completa.
                </p>
              </div>
              {/* Visual: Progress circle */}
              <div className="card-visual" style={{ flexShrink: 0, marginLeft: "1rem" }}>
                <svg width="70" height="70" viewBox="0 0 70 70">
                  <circle cx="35" cy="35" r="25" fill="none" stroke="var(--border)" strokeWidth="4" />
                  <circle className="progress-fill" cx="35" cy="35" r="25" fill="none" stroke="var(--verde)" strokeWidth="4"
                    strokeDasharray="157" strokeDashoffset="157" strokeLinecap="round"
                    transform="rotate(-90 35 35)"
                  />
                  <text x="35" y="38" textAnchor="middle" fill="var(--verde)" fontSize="14" fontWeight="700" fontFamily="'Google Sans', system-ui">75%</text>
                </svg>
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.75rem" }}>
              {["Odoo", "ERP", "Partner"].map(t => (
                <span key={t} style={{ fontSize: "0.6rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "rgba(74,139,0,0.06)", color: "var(--verde)", border: "1px solid rgba(74,139,0,0.1)", fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

          {/* ===== CARD 4: Consultoria ===== */}
          <div className="bento-card" style={{
            gridColumn: "span 2", opacity: 0, borderRadius: "20px", padding: "1.75rem",
            background: "var(--bg-card)", border: "1px solid var(--border)",
            overflow: "hidden", minHeight: "180px",
            display: "flex", flexDirection: "column", justifyContent: "space-between",
            transition: "all 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--verde)"; e.currentTarget.style.transform = "translateY(-3px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "translateY(0)"; }}
          >
            <div>
              <h3 style={{ fontSize: "1.1rem", color: "var(--text-primary)", fontWeight: 700, marginBottom: "0.4rem" }}>
                Consultoria Tecnica
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                Asesoria en arquitectura, cloud y optimizacion de infraestructura.
              </p>
            </div>

            {/* Visual: Network nodes */}
            <div className="card-visual" style={{ marginTop: "0.75rem" }}>
              <svg width="100%" height="50" viewBox="0 0 300 50">
                {/* Nodes */}
                {[30, 90, 150, 210, 270].map((x, i) => (
                  <g key={i}>
                    {i < 4 && <line x1={x + 12} y1="25" x2={x + 48} y2="25" stroke="var(--border)" strokeWidth="1.5" />}
                    <circle className="float-dot" cx={x} cy="25" r={i === 2 ? "10" : "7"} fill={i === 2 ? "var(--verde)" : "none"} stroke="var(--verde)" strokeWidth="1.5" opacity={i === 2 ? 1 : 0.4} />
                    {i === 2 && <path d="M146 25 l4-4 4 4 m-4-4 v8" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" />}
                  </g>
                ))}
              </svg>
            </div>

            <div style={{ display: "flex", gap: "0.35rem", marginTop: "0.5rem" }}>
              {["Cloud", "DevOps", "Estrategia"].map(t => (
                <span key={t} style={{ fontSize: "0.6rem", padding: "0.15rem 0.5rem", borderRadius: "9999px", background: "rgba(74,139,0,0.06)", color: "var(--verde)", border: "1px solid rgba(74,139,0,0.1)", fontWeight: 600 }}>{t}</span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
