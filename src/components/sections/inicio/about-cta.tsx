"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export const AboutCTA = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".about-el", { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });

      // Counter animation for numbers
      const counters = document.querySelectorAll(".counter-value");
      counters.forEach((el) => {
        const target = parseInt(el.getAttribute("data-target") || "0");
        if (target > 0) {
          gsap.fromTo(el, { innerText: 0 }, {
            innerText: target, duration: 2, ease: "power2.out",
            snap: { innerText: 1 },
            scrollTrigger: { trigger: el, start: "top 85%" },
          });
        }
      });

      // Timeline draw
      gsap.fromTo(".timeline-line", { scaleY: 0 }, {
        scaleY: 1, duration: 1.2, ease: "power2.inOut",
        scrollTrigger: { trigger: ".timeline-wrap", start: "top 80%" },
      });

      gsap.fromTo(".timeline-dot", { scale: 0 }, {
        scale: 1, duration: 0.4, stagger: 0.2, ease: "back.out(3)",
        scrollTrigger: { trigger: ".timeline-wrap", start: "top 80%" },
        delay: 0.5,
      });

      gsap.fromTo(".timeline-item", { opacity: 0, x: -20 }, {
        opacity: 1, x: 0, duration: 0.6, stagger: 0.15, ease: "power3.out",
        scrollTrigger: { trigger: ".timeline-wrap", start: "top 80%" },
        delay: 0.6,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section ref={sectionRef} id="nosotros" style={{
      backgroundColor: "var(--bg)", minHeight: "100vh",
      display: "flex", alignItems: "center", padding: "3rem 1.5rem",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%" }}>

        {/* Top: headline + stats row */}
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2.5rem", gap: "2rem" }}>
          <div style={{ maxWidth: "500px" }}>
            <p className="about-el" style={{ opacity: 0, fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--verde)", marginBottom: "0.5rem", fontWeight: 600 }}>
              Sobre nosotros
            </p>
            <h2 className="about-el" style={{ opacity: 0, fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "var(--text-primary)", lineHeight: 1.1, fontWeight: 700 }}>
              Innovacion tecnologica que <span className="gradient-text">transforma</span> ideas en realidades digitales
            </h2>
          </div>

          {/* Stats row */}
          <div className="about-el" style={{ opacity: 0, display: "flex", gap: "2.5rem" }}>
            {[
              { value: "", suffix: "+AI", label: "Soluciones inteligentes", noCounter: true },
              { value: "", suffix: "24/7", label: "Soporte Tecnico", noCounter: true },
              { value: "", suffix: "∞", label: "Posibilidades", noCounter: true },
            ].map((s) => (
              <div key={s.label} style={{ textAlign: "center" }}>
                <div style={{ fontSize: "2rem", fontWeight: 800, color: "var(--text-primary)", fontFamily: "'Google Sans', system-ui", lineHeight: 1 }}>
                  {s.suffix}
                </div>
                <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", marginTop: "0.25rem", fontWeight: 500 }}>{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main content: 2 columns */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }} className="lg:!grid-cols-2">

          {/* Left: Dark card with company info */}
          <div className="about-el" style={{
            opacity: 0, borderRadius: "20px", padding: "2rem",
            background: "linear-gradient(135deg, #0a1a00 0%, #122200 50%, #0d1d00 100%)",
            border: "1px solid rgba(74,139,0,0.15)", position: "relative", overflow: "hidden",
          }}>
            {/* Grid pattern */}
            <div style={{
              position: "absolute", inset: 0, opacity: 0.04,
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }} />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.25rem" }}>
                <div style={{ width: "28px", height: "28px", borderRadius: "8px", background: "rgba(106,191,0,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="#6abf00" strokeWidth="1.5" style={{ width: "16px", height: "16px" }}>
                    <path d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                </div>
                <span style={{ fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.4)", fontWeight: 600 }}>Quienes somos</span>
              </div>

              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.7)", lineHeight: 1.6, marginBottom: "1rem" }}>
                Hannah Lab es una empresa especializada en <span style={{ color: "#6abf00" }}>desarrollo de software
                y automatizaciones inteligentes</span> de alta calidad.
              </p>
              <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: "1.5rem" }}>
                Nos dedicamos a crear soluciones tecnologicas innovadoras que optimizan procesos,
                mejoran la eficiencia y potencian el crecimiento de nuestros clientes a traves de
                herramientas modernas y metodologias actuales.
              </p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                <button
                  onClick={() => scrollToSection("contacto")}
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "8px", fontSize: "0.8rem",
                    background: "#6abf00", color: "#fff", fontWeight: 700, border: "none",
                    cursor: "pointer", transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "#7dd600"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "#6abf00"; }}
                >
                  Hablemos de tu proyecto
                </button>
                <button
                  onClick={() => scrollToSection("servicios")}
                  style={{
                    padding: "0.6rem 1.5rem", borderRadius: "8px", fontSize: "0.8rem",
                    background: "transparent", color: "rgba(255,255,255,0.6)", fontWeight: 600,
                    border: "1px solid rgba(255,255,255,0.15)", cursor: "pointer", transition: "all 0.3s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.3)"; e.currentTarget.style.color = "#fff"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
                >
                  Ver servicios
                </button>
              </div>
            </div>
          </div>

          {/* Right: Timeline / Process */}
          <div className="about-el" style={{
            opacity: 0, borderRadius: "20px", padding: "2rem",
            background: "var(--bg-card)", border: "1px solid var(--border)",
          }}>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1.5rem" }}>
              Nuestro proceso
            </h3>

            <div className="timeline-wrap" style={{ position: "relative", paddingLeft: "2rem" }}>
              {/* Vertical line */}
              <div className="timeline-line" style={{
                position: "absolute", left: "7px", top: "8px", bottom: "8px", width: "2px",
                background: "linear-gradient(to bottom, var(--verde), rgba(74,139,0,0.1))",
                transformOrigin: "top",
              }} />

              {[
                { title: "Diagnostico", desc: "Analizamos tus procesos actuales y detectamos oportunidades de mejora." },
                { title: "Automatizacion", desc: "Creamos automatizaciones inteligentes que ahorran tiempo y reducen errores." },
                { title: "Desarrollo", desc: "Construimos soluciones digitales completas y a medida con tecnologias modernas." },
                { title: "Soporte 24/7", desc: "Desplegamos y brindamos soporte tecnico continuo para tu tranquilidad." },
              ].map((step, i) => (
                <div key={step.title} className="timeline-item" style={{ opacity: 0, marginBottom: i < 3 ? "1.25rem" : 0, position: "relative" }}>
                  {/* Dot */}
                  <div className="timeline-dot" style={{
                    position: "absolute", left: "-2rem", top: "4px",
                    width: "16px", height: "16px", borderRadius: "50%",
                    background: i === 0 ? "var(--verde)" : "var(--bg-card)",
                    border: `2px solid var(--verde)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {i === 0 && <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#fff" }} />}
                  </div>

                  <div>
                    <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.15rem" }}>
                      {step.title}
                    </h4>
                    <p style={{ fontSize: "0.75rem", color: "var(--text-secondary)", lineHeight: 1.5 }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom: Quote banner */}
        <div className="about-el" style={{ opacity: 0, marginTop: "1.5rem" }}>
          <div style={{
            borderRadius: "16px", padding: "1.75rem 2rem", textAlign: "center",
            background: "var(--bg-soft)", border: "1px solid var(--border)",
            display: "flex", alignItems: "center", justifyContent: "center", gap: "2rem", flexWrap: "wrap",
          }}>
            <h3 className="gradient-text" style={{ fontSize: "clamp(1rem, 2.5vw, 1.35rem)", fontWeight: 700, flex: 1, minWidth: "280px" }}>
              &ldquo;En Hannah Lab creemos en el poder de la tecnologia para simplificar lo complejo. Desarrollamos soluciones que anticipan las necesidades futuras.&rdquo;
            </h3>
            <button className="btn-primary" style={{ fontSize: "0.85rem", flexShrink: 0 }} onClick={() => scrollToSection("contacto")}>
              Comienza ahora
            </button>
          </div>
        </div>

      </div>
    </section>
  );
};
