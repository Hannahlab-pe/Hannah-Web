"use client";

import { useState, useEffect, useRef } from "react";
import { sendForm, ContactFormData } from "@/actions/send-form";
import { LoaderCircle } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const services = [
  {
    id: "automatizacion",
    title: "Automatizacion",
    desc: "Scripts, bots y flujos con IA",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}><path d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47 2.47a2.25 2.25 0 0 1-1.591.659H9.061a2.25 2.25 0 0 1-1.591-.659L5 14.5m14 0l-3.39-3.39" /></svg>,
  },
  {
    id: "desarrollo",
    title: "Desarrollo Web",
    desc: "Apps, APIs y plataformas",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}><path d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" /></svg>,
  },
  {
    id: "erp",
    title: "ERP Odoo",
    desc: "Implementacion y soporte",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}><path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375" /></svg>,
  },
  {
    id: "consultoria",
    title: "Consultoria",
    desc: "Asesoria y arquitectura",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}><path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" /></svg>,
  },
  {
    id: "otro",
    title: "Otro",
    desc: "Cuentanos tu idea",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "24px", height: "24px" }}><path d="M12 4.5v15m7.5-7.5h-15" /></svg>,
  },
];

export default function Contacto() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState<ContactFormData>({
    nombre: "", email: "", mensaje: "", telefono: "", empresa: "", servicio: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(".contact-el", { opacity: 0, y: 40 }, {
        opacity: 1, y: 0, duration: 0.8, stagger: 0.1, ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 70%" },
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const animateStep = (direction: "next" | "back") => {
    if (!formRef.current) return;
    const tl = gsap.timeline();
    tl.to(formRef.current, {
      opacity: 0, x: direction === "next" ? -30 : 30, duration: 0.25, ease: "power2.in",
    });
    tl.set(formRef.current, { x: direction === "next" ? 30 : -30 });
    tl.to(formRef.current, { opacity: 1, x: 0, duration: 0.35, ease: "power3.out" });
  };

  const validateStep = (): boolean => {
    const e: Record<string, string> = {};
    if (step === 0 && !formData.servicio) e.servicio = "Selecciona un servicio";
    if (step === 1) {
      if (!formData.nombre || formData.nombre.length < 3) e.nombre = "Nombre requerido (min 3 caracteres)";
      if (!formData.email || !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) e.email = "Email valido requerido";
    }
    if (step === 2) {
      if (!formData.mensaje || formData.mensaje.length < 10) e.mensaje = "Mensaje requerido (min 10 caracteres)";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const nextStep = () => {
    if (!validateStep()) return;
    animateStep("next");
    setTimeout(() => setStep(s => s + 1), 250);
  };

  const backStep = () => {
    animateStep("back");
    setTimeout(() => setStep(s => s - 1), 250);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    setIsSubmitting(true);
    await sendForm(formData);
    setIsSubmitting(false);
    setSubmitted(true);
  };

  const update = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "0.9rem 1rem", fontSize: "0.95rem",
    background: "var(--bg-soft)", border: "1.5px solid var(--border)",
    borderRadius: "12px", color: "var(--text-primary)", outline: "none",
    transition: "border-color 0.3s, box-shadow 0.3s",
    fontFamily: "'Outfit', system-ui",
  };

  const totalSteps = 3;

  return (
    <section ref={sectionRef} id="contacto" style={{
      backgroundColor: "var(--bg)", minHeight: "100vh",
      display: "flex", alignItems: "center", padding: "3rem 1.5rem",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr", gap: "3rem", alignItems: "center" }} className="lg:!grid-cols-2">

        {/* LEFT: Title + contact info */}
        <div>
          <div className="contact-el" style={{ opacity: 0, marginBottom: "2rem" }}>
            <p style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.15em", color: "var(--verde)", marginBottom: "0.5rem", fontWeight: 600 }}>
              Contacto
            </p>
            <h2 style={{ fontSize: "clamp(1.75rem, 4vw, 2.75rem)", color: "var(--text-primary)", lineHeight: 1.1, fontWeight: 700, marginBottom: "0.75rem" }}>
              Hablemos de tu{" "}<span className="gradient-text">proyecto</span>
            </h2>
            <p style={{ fontSize: "0.95rem", color: "var(--text-secondary)", lineHeight: 1.6 }}>
              Estamos emocionados de escucharte y empezar algo especial juntos.
            </p>
          </div>

          <div className="contact-el" style={{ opacity: 0, display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {[
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}><path d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" /></svg>, label: "operaciones@hannahlab.com", href: "mailto:operaciones@hannahlab.com" },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}><path d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" /></svg>, label: "+51 984 323 201", href: "tel:+51984323201" },
              { icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ width: "18px", height: "18px" }}><path d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" /><path d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" /></svg>, label: "Lima, Peru", href: undefined },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "10px", background: "rgba(74,139,0,0.08)", border: "1px solid rgba(74,139,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--verde)", flexShrink: 0 }}>
                  {item.icon}
                </div>
                {item.href ? (
                  <a href={item.href} style={{ fontSize: "0.9rem", color: "var(--text-primary)", textDecoration: "none", fontWeight: 500, transition: "color 0.3s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = "var(--verde)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-primary)"; }}
                  >{item.label}</a>
                ) : (
                  <span style={{ fontSize: "0.9rem", color: "var(--text-primary)", fontWeight: 500 }}>{item.label}</span>
                )}
              </div>
            ))}
          </div>

          <a href="https://wa.me/51984323201?text=Hola%2C%20me%20interesa%20conocer%20m%C3%A1s%20sobre%20Hannah%20Lab" target="_blank" rel="noopener noreferrer" className="contact-el" style={{ opacity: 0, display: "inline-flex", alignItems: "center", gap: "0.6rem", padding: "0.7rem 1.5rem", borderRadius: "12px", background: "#25D366", textDecoration: "none", transition: "all 0.3s", fontSize: "0.85rem", color: "#fff", fontWeight: 600 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1fb855"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#25D366"; }}
          >
            <svg viewBox="0 0 24 24" fill="white" style={{ width: "18px", height: "18px" }}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" /></svg>
            Escribenos por WhatsApp
          </a>
        </div>

        {/* RIGHT: Form card */}
        <div className="contact-el" style={{
          opacity: 0, borderRadius: "24px", padding: "2rem",
          background: "var(--bg-card)", border: "1px solid var(--border)",
          boxShadow: "0 8px 40px rgba(0,0,0,0.04)",
        }}>

          {submitted ? (
            /* ===== SUCCESS STATE ===== */
            <div style={{ textAlign: "center", padding: "2rem 0" }}>
              <div style={{
                width: "64px", height: "64px", borderRadius: "50%", background: "rgba(74,139,0,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1.5rem",
              }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--verde)" strokeWidth="2" style={{ width: "32px", height: "32px" }}>
                  <path d="M4.5 12.75l6 6 9-13.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h3 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.5rem" }}>
                Mensaje enviado
              </h3>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                Nos pondremos en contacto contigo pronto.
              </p>
              <button
                onClick={() => { setSubmitted(false); setStep(0); setFormData({ nombre: "", email: "", mensaje: "", telefono: "", empresa: "", servicio: "" }); }}
                style={{
                  padding: "0.75rem 2rem", borderRadius: "12px", background: "var(--bg-soft)",
                  border: "1px solid var(--border)", color: "var(--text-primary)", fontSize: "0.9rem",
                  fontWeight: 600, cursor: "pointer", transition: "all 0.3s",
                }}
              >
                Enviar otro mensaje
              </button>
            </div>
          ) : (
            <>
              {/* Progress bar */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "2rem" }}>
                {Array.from({ length: totalSteps }).map((_, i) => (
                  <div key={i} style={{
                    flex: 1, height: "4px", borderRadius: "2px",
                    background: i <= step ? "var(--verde)" : "var(--border)",
                    transition: "background 0.4s",
                  }} />
                ))}
              </div>

              {/* Step indicator */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 500 }}>
                  Paso {step + 1} de {totalSteps}
                </p>
                <p style={{ fontSize: "0.8rem", color: "var(--text-secondary)", fontWeight: 600 }}>
                  {step === 0 ? "Servicio" : step === 1 ? "Tus datos" : "Tu proyecto"}
                </p>
              </div>

              {/* Step content */}
              <div ref={formRef}>

                {/* ===== STEP 0: Service selection ===== */}
                {step === 0 && (
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                      Que servicio te interesa?
                    </h3>
                    <div className="form-services-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
                      {services.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => update("servicio", s.id)}
                          style={{
                            padding: "1rem", borderRadius: "14px", textAlign: "left",
                            background: formData.servicio === s.id ? "rgba(74,139,0,0.06)" : "var(--bg-soft)",
                            border: `1.5px solid ${formData.servicio === s.id ? "var(--verde)" : "var(--border)"}`,
                            cursor: "pointer", transition: "all 0.25s",
                            display: "flex", alignItems: "flex-start", gap: "0.75rem",
                          }}
                        >
                          <div style={{
                            width: "36px", height: "36px", borderRadius: "10px", flexShrink: 0,
                            background: formData.servicio === s.id ? "rgba(74,139,0,0.12)" : "var(--bg-card)",
                            border: `1px solid ${formData.servicio === s.id ? "var(--verde)" : "var(--border)"}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "var(--verde)", transition: "all 0.25s",
                          }}>
                            {s.icon}
                          </div>
                          <div>
                            <p style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{s.title}</p>
                            <p style={{ fontSize: "0.7rem", color: "var(--text-muted)", margin: 0, marginTop: "2px" }}>{s.desc}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    {errors.servicio && <p style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: "0.5rem" }}>{errors.servicio}</p>}
                  </div>
                )}

                {/* ===== STEP 1: Personal info ===== */}
                {step === 1 && (
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                      Cuentanos sobre ti
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                      <div>
                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" }}>Nombre completo *</label>
                        <input type="text" placeholder="Tu nombre completo" style={{ ...inputStyle, borderColor: errors.nombre ? "#ef4444" : "var(--border)" }} value={formData.nombre} onChange={(e) => update("nombre", e.target.value)} />
                        {errors.nombre && <p style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.nombre}</p>}
                      </div>
                      <div>
                        <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" }}>Correo electronico *</label>
                        <input type="email" placeholder="tu@email.com" style={{ ...inputStyle, borderColor: errors.email ? "#ef4444" : "var(--border)" }} value={formData.email} onChange={(e) => update("email", e.target.value)} />
                        {errors.email && <p style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.email}</p>}
                      </div>
                      <div className="form-row-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
                        <div>
                          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" }}>Telefono (opcional)</label>
                          <input type="tel" placeholder="984 323 201" style={inputStyle} value={formData.telefono} onChange={(e) => update("telefono", e.target.value)} />
                        </div>
                        <div>
                          <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" }}>Empresa (opcional)</label>
                          <input type="text" placeholder="Tu empresa" style={inputStyle} value={formData.empresa} onChange={(e) => update("empresa", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ===== STEP 2: Project details ===== */}
                {step === 2 && (
                  <div>
                    <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "1rem" }}>
                      Cuentanos sobre tu proyecto
                    </h3>
                    <div>
                      <label style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "0.4rem", display: "block" }}>Mensaje *</label>
                      <textarea
                        rows={5}
                        placeholder="Describenos tu proyecto, que problema quieres resolver, que resultado esperas..."
                        style={{ ...inputStyle, resize: "none", borderColor: errors.mensaje ? "#ef4444" : "var(--border)" }}
                        value={formData.mensaje}
                        onChange={(e) => update("mensaje", e.target.value)}
                      />
                      {errors.mensaje && <p style={{ fontSize: "0.7rem", color: "#ef4444", marginTop: "0.25rem" }}>{errors.mensaje}</p>}
                    </div>

                    {/* Summary */}
                    <div style={{ marginTop: "1.25rem", padding: "1rem", borderRadius: "12px", background: "var(--bg-soft)", border: "1px solid var(--border)" }}>
                      <p style={{ fontSize: "0.7rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Resumen</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", fontSize: "0.8rem" }}>
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Servicio: </span>
                          <span style={{ color: "var(--verde)", fontWeight: 600 }}>{services.find(s => s.id === formData.servicio)?.title}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Nombre: </span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formData.nombre}</span>
                        </div>
                        <div>
                          <span style={{ color: "var(--text-muted)" }}>Email: </span>
                          <span style={{ color: "var(--text-primary)", fontWeight: 600 }}>{formData.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation buttons */}
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2rem", gap: "0.75rem" }}>
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={backStep}
                    style={{
                      padding: "0.8rem 1.5rem", borderRadius: "12px", background: "var(--bg-soft)",
                      border: "1px solid var(--border)", color: "var(--text-secondary)", fontSize: "0.9rem",
                      fontWeight: 600, cursor: "pointer", transition: "all 0.3s",
                    }}
                  >
                    Atras
                  </button>
                ) : <div />}

                {step < totalSteps - 1 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    style={{
                      padding: "0.8rem 2rem", borderRadius: "12px", background: "var(--verde)",
                      border: "none", color: "#fff", fontSize: "0.9rem", fontWeight: 700,
                      cursor: "pointer", transition: "all 0.3s",
                      display: "flex", alignItems: "center", gap: "0.5rem",
                    }}
                  >
                    Siguiente
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: "16px", height: "16px" }}><path d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    style={{
                      padding: "0.8rem 2rem", borderRadius: "12px", background: "var(--verde)",
                      border: "none", color: "#fff", fontSize: "0.9rem", fontWeight: 700,
                      cursor: "pointer", transition: "all 0.3s",
                      display: "flex", alignItems: "center", gap: "0.5rem",
                      opacity: isSubmitting ? 0.7 : 1,
                    }}
                  >
                    {isSubmitting && <LoaderCircle className="animate-spin" style={{ width: "16px", height: "16px" }} />}
                    {isSubmitting ? "Enviando..." : "Enviar mensaje"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>

      </div>
    </section>
  );
}
