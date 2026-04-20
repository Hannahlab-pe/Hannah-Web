"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { id: "inicio", label: "Inicio" },
  { id: "servicios", label: "Servicios" },
  { id: "nosotros", label: "Nosotros" },
  { id: "contacto", label: "Contacto" },
];

export const NavBar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [activeSection, setActiveSection] = useState("inicio");
  const [onDarkSection, setOnDarkSection] = useState(false);

  const scrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) { el.scrollIntoView({ behavior: "smooth", block: "start" }); setActiveSection(sectionId); }
  };

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => { entries.forEach((entry) => { if (entry.isIntersecting) setActiveSection(entry.target.id); }); },
      { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" }
    );
    navLinks.forEach(({ id }) => { const el = document.getElementById(id); if (el) observer.observe(el); });
    return () => observer.disconnect();
  }, []);

  // Detect when navbar is over a dark section
  useEffect(() => {
    const darkEl = document.getElementById("partnership");
    if (!darkEl) return;
    const obs = new IntersectionObserver(
      ([entry]) => setOnDarkSection(entry.isIntersecting),
      { threshold: 0.1, rootMargin: "0px 0px -85% 0px" }
    );
    obs.observe(darkEl);
    return () => obs.disconnect();
  }, []);

  const textColor = onDarkSection ? "#ffffff" : "#000000";
  const hoverColor = onDarkSection ? "#d6f576" : "var(--verde)";
  const navBg = onDarkSection ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.35)";
  const navBorder = onDarkSection ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.3)";

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) { setIsClosing(true); setTimeout(() => { setIsMobileMenuOpen(false); setIsClosing(false); }, 300); }
    else { setIsMobileMenuOpen(true); setIsClosing(false); }
  };

  const closeMobileMenu = () => {
    if (isMobileMenuOpen) { setIsClosing(true); setTimeout(() => { setIsMobileMenuOpen(false); setIsClosing(false); }, 300); }
  };

  return (
    <>
      {/* Floating navbar */}
      <nav style={{
        position: "fixed", top: "1.25rem", left: "50%", transform: "translateX(-50%)",
        zIndex: 50, transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.25rem",
          backgroundColor: navBg, borderRadius: "9999px",
          padding: "0.5rem 0.5rem 0.5rem 0.75rem",
          border: `1px solid ${navBorder}`,
          backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
          boxShadow: isScrolled ? "0 8px 32px rgba(0,0,0,0.08)" : "0 4px 16px rgba(0,0,0,0.04)",
          transition: "box-shadow 0.4s",
        }}>
          {/* Logo */}
          <Link
            href="/inicio"
            style={{
              width: "36px", height: "36px", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", cursor: "pointer", flexShrink: 0, transition: "transform 0.2s",
              padding: 0, background: "#1a1a1a", overflow: "hidden",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; }}
          >
            <Image src="/images/logos/hannah.png" alt="HannahLab" width={24} height={24} style={{ objectFit: "contain" }} />
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex" style={{ alignItems: "center", gap: "0.125rem", marginLeft: "0.5rem" }}>
            {navLinks.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollToSection(id)}
                style={{
                  padding: "0.5rem 1rem", borderRadius: "9999px", fontSize: "0.85rem", fontWeight: 500,
                  border: "none", cursor: "pointer", transition: "all 0.25s",
                  color: activeSection === id ? hoverColor : textColor,
                  background: activeSection === id ? (onDarkSection ? "rgba(255,255,255,0.08)" : "rgba(74,139,0,0.08)") : "transparent",
                }}
                onMouseEnter={(e) => { if (activeSection !== id) e.currentTarget.style.color = hoverColor; }}
                onMouseLeave={(e) => { if (activeSection !== id) e.currentTarget.style.color = textColor; }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Calculadora link */}
          <Link
            className="hidden md:block"
            href="/calculadora"
            style={{
              marginLeft: "0.25rem", padding: "0.5rem 1rem", borderRadius: "9999px",
              backgroundColor: "transparent", color: textColor, fontSize: "0.85rem",
              fontWeight: 500, border: `1px solid ${onDarkSection ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"}`,
              cursor: "pointer", transition: "all 0.25s", whiteSpace: "nowrap", textDecoration: "none",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = hoverColor; e.currentTarget.style.borderColor = hoverColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = textColor; e.currentTarget.style.borderColor = onDarkSection ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.15)"; }}
          >
            Calculadora ROI
          </Link>

          {/* CTA */}
          <Link
            className="hidden md:block"
            href="/login"
            style={{
              marginLeft: "0.5rem", padding: "0.5rem 1.25rem", borderRadius: "9999px",
              backgroundColor: "var(--verde)", color: "#ffffff", fontSize: "0.85rem",
              fontWeight: 600, border: "none", cursor: "pointer", transition: "all 0.25s",
              whiteSpace: "nowrap", textDecoration: "none",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "var(--verde-accent)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "var(--verde)"; }}
          >
            Soy cliente
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden"
            style={{ color: textColor, padding: "8px", background: "none", border: "none", cursor: "pointer", marginLeft: "0.25rem" }}
          >
            <svg style={{ width: "18px", height: "18px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {(isMobileMenuOpen || isClosing) && (
        <>
          <div
            className={isClosing ? "animate-fade-out" : "animate-fade-in"}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", backdropFilter: "blur(4px)", zIndex: 40 }}
            onClick={toggleMobileMenu}
          />
          <div
            className={isClosing ? "animate-slide-up" : "animate-slide-down"}
            style={{
              position: "fixed", top: 0, left: 0, right: 0,
              background: "#f0f0f0", zIndex: 55,
              borderRadius: "0 0 1.5rem 1.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "1.25rem 1.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "32px", height: "32px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", background: "#1a1a1a" }}>
                  <Image src="/images/logos/hannah.png" alt="HannahLab" width={22} height={22} style={{ objectFit: "contain" }} />
                </div>
                <span style={{ color: "var(--text-primary)", fontWeight: 600, fontSize: "1rem" }}>HannahLab</span>
              </div>
              <button onClick={toggleMobileMenu} style={{ color: "var(--text-secondary)", padding: "8px", background: "none", border: "none", cursor: "pointer" }}>
                <svg style={{ width: "20px", height: "20px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", padding: "0 1.5rem 1.5rem", gap: "2px" }}>
              {navLinks.map(({ id, label }, i) => (
                <button
                  key={id}
                  onClick={() => { scrollToSection(id); closeMobileMenu(); }}
                  className={isClosing ? "animate-fade-out-down" : "animate-fade-in-up"}
                  style={{
                    animationDelay: isClosing ? `${i * 0.05}s` : `${0.1 + i * 0.08}s`,
                    textAlign: "left", padding: "0.875rem 1rem", borderRadius: "12px", fontSize: "1rem", fontWeight: 500,
                    border: "none", cursor: "pointer", transition: "all 0.3s",
                    color: activeSection === id ? "var(--verde)" : "var(--text-secondary)",
                    background: activeSection === id ? "rgba(74,139,0,0.08)" : "transparent",
                  }}
                >
                  {label}
                </button>
              ))}
              <Link
                className={isClosing ? "animate-fade-out-down" : "animate-fade-in-up"}
                href="/calculadora"
                style={{
                  animationDelay: isClosing ? "0.15s" : "0.42s",
                  marginTop: "0.5rem", padding: "0.875rem", borderRadius: "9999px",
                  backgroundColor: "transparent", color: "var(--verde)", fontSize: "0.95rem",
                  fontWeight: 600, border: "1px solid var(--verde)", cursor: "pointer", textAlign: "center", width: "100%",
                  textDecoration: "none", display: "block", boxSizing: "border-box",
                }}
                onClick={() => { closeMobileMenu(); }}
              >
                Calculadora ROI
              </Link>
              <Link
                className={isClosing ? "animate-fade-out-down" : "animate-fade-in-up"}
                href="/login"
                style={{
                  animationDelay: isClosing ? "0.2s" : "0.5s",
                  marginTop: "0.5rem", padding: "0.875rem", borderRadius: "9999px",
                  backgroundColor: "var(--verde)", color: "#ffffff", fontSize: "0.95rem",
                  fontWeight: 600, border: "none", cursor: "pointer", textAlign: "center", width: "100%",
                  textDecoration: "none", display: "block",
                }}
                onClick={() => { closeMobileMenu(); }}
              >
                Soy cliente
              </Link>
            </div>
          </div>
        </>
      )}
    </>
  );
};
