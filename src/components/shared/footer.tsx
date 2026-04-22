"use client";

import Image from "next/image";

export const Footer = () => {
  return (
    <footer style={{ backgroundColor: "#0a0a0a", color: "#ffffff" }}>
      {/* Top section: contact + nav */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "2.5rem 1.5rem 0" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "1.5rem", paddingBottom: "2rem" }}>
          <div>
            <p style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.4)", marginBottom: "0.25rem" }}>Contáctanos en:</p>
            <a href="mailto:operaciones@hannahlab.com" style={{ color: "#ffffff", fontWeight: 700, fontSize: "1rem", textDecoration: "none", transition: "color 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "#ffffff"; }}
            >
              operaciones@hannahlab.com ↗
            </a>
          </div>
          <nav style={{ display: "flex", flexWrap: "wrap", gap: "2rem" }}>
            {["Servicios", "Nosotros", "Contacto"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  const id = item === "Servicios" ? "servicios" : item === "Nosotros" ? "nosotros" : "contacto";
                  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  color: "rgba(255,255,255,0.6)", fontSize: "0.9rem", fontWeight: 500,
                  background: "none", border: "none", cursor: "pointer", transition: "color 0.3s", padding: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
              >
                {item}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Center: Large logo */}
      <div style={{
        maxWidth: "1280px", margin: "0 auto", padding: "0 1.5rem",
        display: "flex", justifyContent: "center", alignItems: "center",
        height: "200px", overflow: "visible",
      }}>
        <Image src="/images/logos/hannah.png" alt="HannahLab" width={320} height={320} className="footer-logo" style={{ objectFit: "contain", marginTop: "-3rem" }} />
      </div>

      {/* Bottom bar */}
      <div>
        <div style={{
          maxWidth: "1280px", margin: "0 auto", padding: "1.25rem 1.5rem",
          display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "1rem",
        }}>
          {/* Left: copyright + info */}
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "0.5rem", fontSize: "0.8rem", color: "rgba(255,255,255,0.35)" }}>
            <span>&copy; 2025 Hannah Lab S.A.C.</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <span>Lima, Perú 🇵🇪</span>
            <span style={{ opacity: 0.4 }}>·</span>
            <a href="tel:+51925223153" style={{ color: "rgba(255,255,255,0.35)", textDecoration: "none", transition: "color 0.3s" }}
              onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.35)"; }}
            >+51 925 223 153</a>
          </div>

          {/* Right: social links */}
          <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", fontSize: "0.85rem" }}>
            {[
              { label: "LinkedIn", href: "https://linkedin.com" },
              { label: "Instagram", href: "https://instagram.com" },
              { label: "TikTok", href: "https://tiktok.com" },
            ].map((social) => (
              <a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.3s", fontWeight: 500 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = "#ffffff"; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.5)"; }}
              >
                {social.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};
