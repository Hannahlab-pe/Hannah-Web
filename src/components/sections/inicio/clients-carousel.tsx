"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";

gsap.registerPlugin(ScrollTrigger);

const clients = [
  { name: "Bosch", logo: "/images/logos/bosch.webp", height: "28px" },
  { name: "Entel", logo: "/images/logos/entel.webp", height: "28px" },
  { name: "Betondecken", logo: "/images/logos/betondecken.webp", height: "75px" },
  { name: "Weber", logo: "/images/logos/weber.webp", height: "55px" },
  { name: "Natura", logo: "/images/logos/natura.webp", height: "75px" },
  { name: "Volcán", logo: "/images/logos/volcan.webp", height: "75px" },
  { name: "Odoo", logo: "/images/logos/odoo.png", height: "28px" },
  { name: "Aditivos", logo: "/images/logos/aditivos.webp", height: "28px" },
];

export const ClientsCarousel = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".clients-label", { opacity: 0 }, {
        opacity: 1, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 90%" },
      });
      gsap.fromTo(".clients-track", { opacity: 0 }, {
        opacity: 1, duration: 1, ease: "power2.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 90%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  // Duplicate for seamless loop
  const doubled = [...clients, ...clients];

  return (
    <section ref={sectionRef} style={{ backgroundColor: "var(--bg)", padding: "0 0 2.5rem" }}>
      <p className="clients-label" style={{
        opacity: 0, textAlign: "left", fontSize: "0.85rem",
        color: "var(--text-muted)", marginBottom: "1.25rem", fontWeight: 500,
        fontFamily: "'Outfit', system-ui, sans-serif",
        maxWidth: "1280px", margin: "0 auto 1.25rem", padding: "0 1.5rem",
      }}>
        Empresas que confian en nosotros
      </p>

      {/* Infinite carousel */}
      <div style={{ position: "relative", overflow: "hidden" }}>
        {/* Fade edges */}
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "100px", background: "linear-gradient(to right, var(--bg), transparent)", zIndex: 2, pointerEvents: "none" }} />
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "100px", background: "linear-gradient(to left, var(--bg), transparent)", zIndex: 2, pointerEvents: "none" }} />

        <div className="clients-track animate-marquee" style={{ opacity: 0, display: "flex", width: "max-content" }}>
          {doubled.map((client, i) => (
            <div
              key={`${client.name}-${i}`}
              style={{ flexShrink: 0, padding: "0 2.5rem", display: "flex", alignItems: "center" }}
            >
              <Image
                src={client.logo}
                alt={client.name}
                width={120}
                height={48}
                style={{
                  height: client.height, width: "auto", objectFit: "contain",
                  opacity: 0.6, filter: "grayscale(100%)",
                  transition: "all 0.4s ease",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
