"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

export const Partnership = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".partner-el", { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });

      gsap.fromTo(".partner-logo", { opacity: 0, scale: 0.8 }, {
        opacity: 1, scale: 1, duration: 0.7, stagger: 0.2, ease: "back.out(1.5)",
        scrollTrigger: { trigger: ".partner-logos", start: "top 80%" },
        delay: 0.3,
      });

      gsap.fromTo(".partner-check", { opacity: 0, x: -15 }, {
        opacity: 1, x: 0, duration: 0.5, stagger: 0.12, ease: "power3.out",
        scrollTrigger: { trigger: ".partner-checks", start: "top 85%" },
        delay: 0.5,
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="partnership" style={{
      background: "linear-gradient(135deg, #0a1a00 0%, #122200 50%, #0d1d00 100%)",
      minHeight: "100vh", display: "flex", alignItems: "center", padding: "3rem 1.5rem",
      position: "relative", overflow: "hidden",
    }}>
      {/* Grid pattern */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.06,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)",
        backgroundSize: "40px 40px", pointerEvents: "none",
      }} />

      {/* Glow accent */}
      <div style={{
        position: "absolute", top: "20%", right: "10%", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(106,191,0,0.08) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", position: "relative", zIndex: 1 }}>

        {/* Logos grandes centrados arriba */}
        <div className="partner-logos partner-el" style={{ opacity: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: "2.5rem", marginBottom: "3rem" }}>
          <div className="partner-logo" style={{ opacity: 0 }}>
            <Image src="/images/logos/hannah.png" alt="Hannah Lab" width={180} height={180} style={{ objectFit: "contain" }} />
          </div>
          <div className="partner-logo" style={{ opacity: 0 }}>
            <span style={{ fontSize: "2.5rem", color: "rgba(255,255,255,0.2)", fontWeight: 200 }}>x</span>
          </div>
          <div className="partner-logo" style={{ opacity: 0 }}>
            <Image src="/images/logos/odoo.png" alt="Odoo" width={180} height={180} style={{ objectFit: "contain" }} />
          </div>
        </div>

        {/* Badge */}
        <div className="partner-el" style={{ opacity: 0, textAlign: "center", marginBottom: "1rem" }}>
          <span style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            padding: "0.3rem 1rem", borderRadius: "9999px", fontSize: "0.65rem",
            background: "rgba(106,191,0,0.12)", border: "1px solid rgba(106,191,0,0.2)",
            color: "#6abf00", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "12px", height: "12px" }}>
              <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Partner Oficial
          </span>
        </div>

        {/* Title centered */}
        <h2 className="partner-el" style={{
          opacity: 0, textAlign: "center", fontSize: "clamp(1.75rem, 4vw, 3rem)",
          color: "#ffffff", fontWeight: 700, marginBottom: "1rem",
        }}>
          Especializacion en <span style={{ color: "#6abf00" }}>Soluciones ERP</span>
        </h2>

        {/* Subtitle centered */}
        <p className="partner-el" style={{
          opacity: 0, textAlign: "center", fontSize: "1rem", color: "rgba(255,255,255,0.55)",
          maxWidth: "600px", margin: "0 auto 2.5rem", lineHeight: 1.7,
        }}>
          Implementamos y personalizamos soluciones ERP que transforman la gestion
          empresarial, combinando desarrollo de software con la potencia de Odoo.
        </p>

        {/* Benefits row */}
        <div className="partner-checks" style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: "1.5rem" }}>
          {[
            "Implementacion completa",
            "Migracion de datos",
            "Integraciones a medida",
            "Soporte 24/7",
          ].map((item) => (
            <div key={item} className="partner-check" style={{
              opacity: 0, display: "flex", alignItems: "center", gap: "0.5rem",
              padding: "0.6rem 1.25rem", borderRadius: "12px",
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#6abf00" strokeWidth="2.5" style={{ width: "14px", height: "14px", flexShrink: 0 }}>
                <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>{item}</span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
