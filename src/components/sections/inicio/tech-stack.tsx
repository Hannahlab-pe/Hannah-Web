"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const techRows = [
  [
    { name: "React", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg" },
    { name: "Next.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg" },
    { name: "TypeScript", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg" },
    { name: "Node.js", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg" },
    { name: "Python", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" },
    { name: "FastAPI", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/fastapi/fastapi-original.svg" },
    { name: "Django", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/django/django-plain.svg" },
    { name: "PostgreSQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg" },
    { name: "MongoDB", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg" },
    { name: "Redis", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/redis/redis-original.svg" },
  ],
  [
    { name: "Docker", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg" },
    { name: "Kubernetes", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kubernetes/kubernetes-plain.svg" },
    { name: "Vercel", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg" },
    { name: "Git", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg" },
    { name: "GitHub", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg" },
    { name: "Figma", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg" },
    { name: "VS Code", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vscode/vscode-original.svg" },
    { name: "Express", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg" },
    { name: "MySQL", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg" },
    { name: "Firebase", logo: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg" },
  ],
];

export const TechStack = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".tech-heading", { opacity: 0, y: 30 }, {
        opacity: 1, y: 0, duration: 0.8, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 75%" },
      });

      // Start marquee on scroll
      gsap.fromTo(".marquee-row", { opacity: 0 }, {
        opacity: 1, duration: 1, stagger: 0.2, ease: "power2.out",
        scrollTrigger: { trigger: ".marquee-wrap", start: "top 85%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} style={{
      backgroundColor: "var(--bg-soft)", padding: "3rem 0",
      minHeight: "100vh", display: "flex", alignItems: "center",
      overflow: "hidden",
    }}>
      <div style={{ width: "100%" }}>
        {/* Heading */}
        <div className="tech-heading" style={{ textAlign: "center", marginBottom: "3rem", opacity: 0, padding: "0 1.5rem" }}>
          <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--verde)", marginBottom: "0.5rem", fontWeight: 600 }}>
            Stack tecnologico
          </p>
          <h2 style={{ fontSize: "clamp(1.5rem, 4vw, 2.5rem)", color: "var(--text-primary)", marginBottom: "0.5rem", fontWeight: 700 }}>
            Tecnologias que <span className="gradient-text">dominamos</span>
          </h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", maxWidth: "500px", margin: "0 auto" }}>
            Nuestro equipo se actualiza constantemente con las ultimas tecnologias y tendencias
          </p>
        </div>

        {/* Marquee rows */}
        <div className="marquee-wrap" style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          {techRows.map((row, rowIdx) => (
            <div key={rowIdx} className="marquee-row" style={{ opacity: 0, overflow: "hidden", position: "relative" }}>
              {/* Fade edges */}
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to right, var(--bg-soft), transparent)", zIndex: 2, pointerEvents: "none" }} />
              <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "80px", background: "linear-gradient(to left, var(--bg-soft), transparent)", zIndex: 2, pointerEvents: "none" }} />

              <div style={{
                display: "flex", width: "max-content",
                animation: `marquee-${rowIdx % 2 === 0 ? "left" : "right"} ${35 + rowIdx * 5}s linear infinite`,
              }}>
                {/* Double for seamless loop */}
                {[...row, ...row].map((tech, i) => (
                  <div key={`${tech.name}-${i}`} style={{
                    flexShrink: 0, display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "1rem 1.75rem", margin: "0 0.5rem",
                    background: "var(--bg-card)", border: "1px solid var(--border)",
                    borderRadius: "12px", transition: "all 0.3s",
                    cursor: "default",
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--verde)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border)";
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={tech.logo}
                      alt={tech.name}
                      width={34}
                      height={34}
                      style={{ width: "34px", height: "34px", objectFit: "contain" }}
                    />
                    <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom message */}
        <p className="tech-heading" style={{ opacity: 0, textAlign: "center", marginTop: "2.5rem", padding: "0 1.5rem", fontSize: "0.85rem", color: "var(--text-muted)" }}>
          Siempre actualizandonos con las ultimas tecnologias para ofrecer{" "}
          <span style={{ color: "var(--verde)", fontWeight: 600 }}>soluciones de vanguardia</span>
        </p>

        {/* CSS Keyframes */}
        <style>{`
          @keyframes marquee-left {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          @keyframes marquee-right {
            0% { transform: translateX(-50%); }
            100% { transform: translateX(0); }
          }
        `}</style>
      </div>
    </section>
  );
};
