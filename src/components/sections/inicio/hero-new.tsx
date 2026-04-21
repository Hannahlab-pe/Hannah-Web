"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { HeroIllustration } from "./hero-illustration";
import { ClientsCarousel } from "./clients-carousel";

export const HeroNew = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.fromTo(badgeRef.current, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7 }, 0.2);
      tl.fromTo(".hero-title-line", { y: "105%", opacity: 0 }, { y: "0%", opacity: 1, duration: 1, stagger: 0.12 }, 0.4);
      tl.fromTo(subtitleRef.current, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, 1.0);
      tl.fromTo(".hero-cta", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 1.3);
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={containerRef}
      id="inicio"
      style={{ backgroundColor: "var(--bg)", minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center" }}
    >
      {/* Main content */}
      <div
        style={{ maxWidth: "1280px", margin: "0 auto", padding: "5rem 1.5rem 1.5rem", width: "100%", display: "grid", gridTemplateColumns: "1fr", gap: "2rem", alignItems: "center", flex: "1" }}
        className="lg:!grid-cols-2"
      >
        {/* LEFT */}
        <div>
          <span
            ref={badgeRef}
            className="badge-verde"
            style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}
          >
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "var(--verde)" }} className="animate-pulse" />
            Automatizacion &middot; IA &middot; Desarrollo
          </span>

          <h1
            ref={titleRef}
            style={{ fontSize: "clamp(2rem, 4vw, 3.25rem)", fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em", marginBottom: "1rem" }}
          >
            <span style={{ display: "block", overflow: "hidden", paddingBottom: "4px" }}>
              <span className="hero-title-line" style={{ display: "block", color: "var(--text-primary)" }}>
                Soluciones que
              </span>
            </span>
            <span style={{ display: "block", overflow: "hidden", paddingBottom: "6px" }}>
              <span className="hero-title-line" style={{ display: "block" }}>
                <span className="gradient-text">automatizan</span>{" "}
                <span style={{ color: "var(--text-primary)" }}>tu negocio.</span>
              </span>
            </span>
          </h1>

          <p
            ref={subtitleRef}
            style={{ opacity: 0, fontSize: "1rem", lineHeight: 1.7, color: "var(--text-secondary)", maxWidth: "480px", marginBottom: "1.5rem" }}
          >
            Creamos herramientas inteligentes que optimizan procesos,
            reducen costos y escalan tu empresa al siguiente nivel.
          </p>

          <div ref={ctaRef} style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
            <button className="hero-cta btn-primary" style={{ opacity: 0, fontSize: "0.9rem", padding: "0.75rem 1.75rem" }} onClick={() => scrollToSection("contacto")}>
              Empezar ahora
            </button>
            <button className="hero-cta btn-secondary" style={{ opacity: 0, fontSize: "0.9rem", padding: "0.75rem 1.75rem" }} onClick={() => scrollToSection("servicios")}>
              Ver servicios
            </button>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hero-illustration-col" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ width: "100%", maxWidth: "500px" }}>
            <HeroIllustration />
          </div>
        </div>
      </div>

      {/* Clients carousel at the bottom of the hero */}
      <div style={{ paddingBottom: "1.5rem" }}>
        <ClientsCarousel />
      </div>
    </section>
  );
};
