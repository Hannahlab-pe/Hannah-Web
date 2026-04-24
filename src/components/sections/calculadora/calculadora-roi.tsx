"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────────────────
interface Role {
  id: number;
  tipo: string;
  cantidad: string;
  sueldo: string;
  horas: string;
  horasMes: string;
}

interface Process {
  id: number;
  nombre: string;
  roles: Role[];
}

// ─── Helpers ────────────────────────────────────────────────────────────────
let _pid = 0;
let _rid = 0;

const newRole = (): Role => ({
  id: ++_rid,
  tipo: "",
  cantidad: "",
  sueldo: "",
  horas: "",
  horasMes: "",
});

const newProcess = (): Process => ({
  id: ++_pid,
  nombre: "",
  roles: [newRole()],
});

const fmtSoles = (n: number) => {
  if (!isFinite(n) || n < 0) return "S/ --";
  return (
    "S/ " +
    n.toLocaleString("es-PE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );
};

const fmtNum = (n: number, digits = 0) => {
  if (!isFinite(n) || n < 0) return "--";
  return n.toLocaleString("es-PE", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
};

const roleCost = (role: Role): number => {
  const sueldo = parseFloat(role.sueldo) || 0;
  const horas = parseFloat(role.horas) || 0;
  const cantidad = parseFloat(role.cantidad) || 0;
  const horasMes = parseFloat(role.horasMes) || 160;
  if (sueldo <= 0 || horasMes <= 0) return 0;
  return (sueldo / horasMes) * horas * cantidad;
};

const processCost = (proc: Process) =>
  proc.roles.reduce((s, r) => s + roleCost(r), 0);

const processHours = (proc: Process) =>
  proc.roles.reduce(
    (s, r) => s + (parseFloat(r.horas) || 0) * (parseFloat(r.cantidad) || 0),
    0
  );

const processEmployees = (proc: Process) =>
  proc.roles.reduce((s, r) => s + (parseFloat(r.cantidad) || 0), 0);

const procesoDedicacion = (proc: Process): string => {
  let totalTarea = 0,
    totalJornada = 0;
  proc.roles.forEach((r) => {
    const horas = parseFloat(r.horas) || 0;
    const cant = parseFloat(r.cantidad) || 0;
    const jornada = parseFloat(r.horasMes) || 160;
    if (horas > 0 && cant > 0) {
      totalTarea += horas * cant;
      totalJornada += jornada * cant;
    }
  });
  if (totalJornada <= 0) return "--";
  return fmtNum((totalTarea / totalJornada) * 100, 1) + "%";
};

// ─── Tutorial Steps ─────────────────────────────────────────────────────────
type Placement = "top" | "bottom" | "left" | "right";
const TUTORIAL_STEPS: { title: string; body: string; targetId: string; placement: Placement }[] = [
  {
    title: "👋 Bienvenido a la Calculadora ROI",
    body: "Descubre en <strong>3 pasos</strong> cuánto dinero pierde tu empresa en tareas manuales — y cuánto ahorrarías automatizándolas. Toma menos de 2 minutos.<br><br>Los resultados se actualizan <strong>en vivo</strong> mientras completas el formulario.",
    targetId: "calc-hero-title",
    placement: "bottom" as const,
  },
  {
    title: "Paso 1 · Nombra el proceso",
    body: "Escribe el nombre de la <strong>tarea manual o repetitiva</strong> que quieres medir.<br><br>Ejemplos:<ul><li>Generar reportes mensuales para gerencia</li><li>Ingresar datos de ventas al sistema</li><li>Conciliar cuentas bancarias</li><li>Responder cotizaciones por correo</li></ul>",
    targetId: "first-nombre-input",
    placement: "bottom" as const,
  },
  {
    title: "Paso 2 · Agrega a las personas",
    body: "Indica quiénes ejecutan este proceso:<ul><li><strong>Tipo & cantidad:</strong> rol y cuántos participan.</li><li><strong>Sueldo mensual (S/):</strong> sueldo bruto promedio.</li><li><strong>Horas trabajadas:</strong> jornada mensual (160 = 40HH · 192 = 48HH).</li><li><strong>Horas por proyecto:</strong> horas que dedican <em>solo</em> a este proceso.</li></ul>",
    targetId: "first-role-card",
    placement: "bottom" as const,
  },
  {
    title: "Paso 3 · Mira el impacto",
    body: "Cada tarjeta responde una pregunta:<ul><li><strong>Costo mensual oculto</strong> — planilla invisible cada mes.</li><li><strong>Costo anual perdido</strong> — el tamaño real del problema.</li><li><strong>Equivalente en sueldos</strong> — a cuántos sueldos equivale.</li><li><strong>Con automatización ahorras</strong> — estimado al 70% de eficiencia.</li><li><strong>% jornada manual</strong> — qué porcentaje del tiempo se consume.</li></ul>",
    targetId: "summary-grid",
    placement: "left" as const,
  },
  {
    title: "Paso 4 · Habla con un especialista",
    body: "Cuando veas el impacto real, <strong>este botón te conecta por WhatsApp</strong> con un especialista de Hannah Lab. Convertimos ese ahorro en una propuesta concreta.",
    targetId: "cta-whatsapp",
    placement: "top" as const,
  },
];

// ─── Component ──────────────────────────────────────────────────────────────
export const CalculadoraROI = () => {
  const [processes, setProcesses] = useState<Process[]>(() => [newProcess()]);
  const [tutStep, setTutStep] = useState(0);
  const [tutOpen, setTutOpen] = useState(false);
  const [spotlightRect, setSpotlightRect] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const rafRef = useRef<number | null>(null);

  // ── Derived calculations ─────────────────────────────────────────────────
  const totalMonthly = processes.reduce((s, p) => s + processCost(p), 0);
  const totalYearly = totalMonthly * 12;
  const annualSavings = totalYearly * 0.7;

  const avgSalary = (() => {
    let cost = 0,
      emps = 0;
    processes.forEach((p) =>
      p.roles.forEach((r) => {
        const s = parseFloat(r.sueldo) || 0;
        const c = parseFloat(r.cantidad) || 0;
        if (s > 0 && c > 0) {
          cost += s * c;
          emps += c;
        }
      })
    );
    return emps > 0 ? cost / emps : 0;
  })();

  const salariesEq = avgSalary > 0 ? totalMonthly / avgSalary : 0;

  const dedicacion = (() => {
    let totalT = 0,
      totalJ = 0;
    processes.forEach((p) =>
      p.roles.forEach((r) => {
        const h = parseFloat(r.horas) || 0;
        const c = parseFloat(r.cantidad) || 0;
        const j = parseFloat(r.horasMes) || 160;
        if (h > 0 && c > 0) {
          totalT += h * c;
          totalJ += j * c;
        }
      })
    );
    return totalJ > 0 ? (totalT / totalJ) * 100 : 0;
  })();

  const totalHours = processes.reduce((s, p) => s + processHours(p), 0);

  // ── Process mutations ────────────────────────────────────────────────────
  const addProcess = () =>
    setProcesses((prev) => [...prev, newProcess()]);

  const removeProcess = (pid: number) =>
    setProcesses((prev) => {
      const next = prev.filter((p) => p.id !== pid);
      return next.length > 0 ? next : [newProcess()];
    });

  const addRole = (pid: number) =>
    setProcesses((prev) =>
      prev.map((p) =>
        p.id === pid ? { ...p, roles: [...p.roles, newRole()] } : p
      )
    );

  const removeRole = (pid: number, rid: number) =>
    setProcesses((prev) =>
      prev.map((p) => {
        if (p.id !== pid) return p;
        const roles = p.roles.filter((r) => r.id !== rid);
        return { ...p, roles: roles.length > 0 ? roles : [newRole()] };
      })
    );

  const updateProcess = (pid: number, field: keyof Process, value: string) => {
    if (field === "nombre" && value.length > 80) return;
    setProcesses((prev) =>
      prev.map((p) => (p.id === pid ? { ...p, [field]: value } : p))
    );
  };

  const updateRole = (
    pid: number,
    rid: number,
    field: keyof Role,
    value: string
  ) => {
    if (field === "tipo" && value.length > 50) return;
    if (field === "cantidad" && value.length > 6) return;
    if (field === "sueldo" && value.length > 8) return;
    if (field === "horasMes" && value.length > 4) return;
    if (field === "horas" && value.length > 4) return;

    setProcesses((prev) =>
      prev.map((p) =>
        p.id !== pid
          ? p
          : {
              ...p,
              roles: p.roles.map((r) =>
                r.id === rid ? { ...r, [field]: value } : r
              ),
            }
      )
    );
  };

  // ── Tutorial positioning ──────────────────────────────────────────────────
  const positionTutorial = useCallback((stepIdx: number) => {
    const step = TUTORIAL_STEPS[stepIdx];
    const el = document.getElementById(step.targetId);
    if (!el) return;
    // getBoundingClientRect() devuelve coordenadas relativas al viewport
    const rect = el.getBoundingClientRect();
    const pad = 8;
    // Spotlight usa position:fixed → mismas coordenadas de viewport, sin scrollY
    setSpotlightRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    });

    const tipW = 340;
    const tipH = 280;
    const gap = 16;
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let top = 0, left = 0;
    const p = step.placement;

    if (p === "bottom") {
      top = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tipW / 2;
    } else if (p === "top") {
      top = rect.top - gap - tipH;
      left = rect.left + rect.width / 2 - tipW / 2;
    } else if (p === "right") {
      top = rect.top + rect.height / 2 - tipH / 2;
      left = rect.right + gap;
    } else {
      // left
      top = rect.top + rect.height / 2 - tipH / 2;
      left = rect.left - gap - tipW;
    }

    // Mantener dentro del viewport
    left = Math.max(16, Math.min(left, vw - tipW - 16));
    top = Math.max(16, Math.min(top, vh - tipH - 16));
    setTooltipPos({ top, left });
  }, []);

  const openTutorial = () => {
    setTutStep(0);
    setTutOpen(true);
    requestAnimationFrame(() => positionTutorial(0));
  };

  const closeTutorial = () => setTutOpen(false);

  const nextTutStep = () => {
    if (tutStep < TUTORIAL_STEPS.length - 1) {
      const next = tutStep + 1;
      setTutStep(next);
      requestAnimationFrame(() => positionTutorial(next));
    } else {
      closeTutorial();
    }
  };

  const prevTutStep = () => {
    if (tutStep > 0) {
      const prev = tutStep - 1;
      setTutStep(prev);
      requestAnimationFrame(() => positionTutorial(prev));
    }
  };

  useEffect(() => {
    if (!tutOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeTutorial();
      else if (e.key === "ArrowRight" || e.key === "Enter") nextTutStep();
      else if (e.key === "ArrowLeft") prevTutStep();
    };
    const handleScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => positionTutorial(tutStep));
    };
    window.addEventListener("keydown", handleKey);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("keydown", handleKey);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [tutOpen, tutStep, positionTutorial]);

  // Auto-open on first load
  useEffect(() => {
    const t = setTimeout(openTutorial, 700);
    return () => clearTimeout(t);
  }, []);

  // ── Insight text ─────────────────────────────────────────────────────────
  const insightText =
    totalMonthly > 0 && totalHours > 0
      ? `Tu equipo invierte <strong>${fmtNum(totalHours, 0)} horas al mes</strong> — el <strong>${fmtNum(dedicacion, 1)}%</strong> de su jornada — en procesos manuales. Eso representa <strong>${fmtSoles(totalMonthly)} al mes</strong> en planilla invisible. En un año son <strong>${fmtSoles(totalYearly)}</strong> que podrías redirigir a crecimiento.`
      : "Completa los datos de tus procesos manuales y te mostramos, en tiempo real, cuánto dinero está perdiendo tu empresa sin que aparezca en ninguna factura.";

  const breakdownRows = processes.filter(
    (p) => processCost(p) > 0 || p.nombre
  );

  return (
    <>
      {/* ─── Page ─────────────────────────────────────────────────────── */}
      <div className="calc-page">

        {/* ─── Hero ─────────────────────────────────────────────────── */}
        <section className="c-hero">
          <div className="c-wrap">
            <span className="badge-verde" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: "1.25rem" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--verde-accent)", display: "inline-block" }} />
              Calculadora ROI · Automatización
            </span>
            <h1 id="calc-hero-title" className="c-hero-h1">
              ¿Cuánto le cuesta a tu empresa el trabajo manual?
            </h1>
            <p className="c-hero-sub">
              Descubre el costo real de tus procesos manuales y visualiza el ahorro que obtendrías como partner de Hannah Lab.
            </p>
            <button className="c-how-btn" onClick={openTutorial}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4a8b00", display: "inline-block" }} />
              ¿Cómo usar?
            </button>
          </div>
        </section>

        {/* ─── Main content ─────────────────────────────────────────── */}
        <div className="c-wrap c-body">
          <div className="c-grid">

            {/* LEFT: Inputs */}
            <section className="c-form-col">
              <p className="c-label">Agregar Proceso Manual</p>

              {processes.map((proc, pIdx) => (
                <div
                  key={proc.id}
                  className="c-process-card"
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "var(--verde)")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "var(--border)")}
                >
                  <div className="c-card-hdr">
                    <span className="c-label" style={{ marginBottom: 0 }}>Proceso {pIdx + 1}</span>
                    {processes.length > 1 && (
                      <button
                        className="c-del-btn"
                        onClick={() => removeProcess(proc.id)}
                        title="Eliminar proceso"
                        onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                      >×</button>
                    )}
                  </div>

                  <div className="c-field">
                    <label style={labelStyle}>Nombre del proceso</label>
                    <input
                      id={pIdx === 0 ? "first-nombre-input" : undefined}
                      type="text"
                      maxLength={80}
                      value={proc.nombre}
                      onChange={e => updateProcess(proc.id, "nombre", e.target.value)}
                      placeholder="Ej. Generación de informes mensuales"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                      onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                    />
                  </div>

                  {proc.roles.map((role, rIdx) => (
                    <div
                      key={role.id}
                      id={pIdx === 0 && rIdx === 0 ? "first-role-card" : undefined}
                      className="c-role-card"
                    >
                      <div className="c-card-hdr">
                        <span className="c-label" style={{ marginBottom: 0 }}>Rol {rIdx + 1}</span>
                        {proc.roles.length > 1 && (
                          <button
                            className="c-del-btn"
                            onClick={() => removeRole(proc.id, role.id)}
                            title="Eliminar rol"
                            onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                          >×</button>
                        )}
                      </div>
                      <div className="c-field">
                        <label style={labelStyle}>Tipo de empleado</label>
                        <input
                          type="text"
                          maxLength={50}
                          value={role.tipo}
                          onChange={e => updateRole(proc.id, role.id, "tipo", e.target.value)}
                          placeholder="Ej. Jefe de área, Asistente, Auxiliar"
                          style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                          onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                        />
                      </div>
                      <div className="c-role-grid">
                        <div className="c-field">
                          <label style={labelStyle}>Cantidad</label>
                          <input
                            type="number" min="0" max="999999" step="1"
                            value={role.cantidad}
                            onChange={e => updateRole(proc.id, role.id, "cantidad", e.target.value)}
                            placeholder="1"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                          />
                        </div>
                        <div className="c-field">
                          <label style={labelStyle}>Sueldo mensual (S/)</label>
                          <input
                            type="number" min="0" max="99999999" step="100"
                            value={role.sueldo}
                            onChange={e => updateRole(proc.id, role.id, "sueldo", e.target.value)}
                            placeholder="3500"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                          />
                        </div>
                        <div className="c-field">
                          <label style={labelStyle}>Horas trabajadas al mes</label>
                          <input
                            type="number" min="0" max="9999" step="1"
                            value={role.horasMes}
                            onChange={e => updateRole(proc.id, role.id, "horasMes", e.target.value)}
                            placeholder="160"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                          />
                          <small className="c-hint">160 = 40HH · 192 = 48HH</small>
                        </div>
                        <div className="c-field">
                          <label style={labelStyle}>Horas por proyecto</label>
                          <input
                            type="number" min="0" max="9999" step="1"
                            value={role.horas}
                            onChange={e => updateRole(proc.id, role.id, "horas", e.target.value)}
                            placeholder="20"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                          />
                          <small className="c-hint">dedicadas a este proceso</small>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    className="c-ghost-btn"
                    onClick={() => addRole(proc.id)}
                  >
                    + Agregar otro empleado / rol
                  </button>
                </div>
              ))}

              <button className="c-ghost-btn c-ghost-btn--solid" onClick={addProcess}>
                + Agregar otro proceso
              </button>
            </section>

            {/* RIGHT: Results */}
            <aside className="c-results-col">
              <p className="c-label">Resultados en tiempo real</p>

              <div id="summary-grid" className="c-stat-grid">
                <StatCard label="Costo mensual oculto" value={fmtSoles(totalMonthly)} sub="por mes" />
                <StatCard label="Costo anual perdido" value={fmtSoles(totalYearly)} sub="al año" />
                <StatCard label="Equivalente en sueldos" value={salariesEq > 0 ? fmtNum(salariesEq, 1) : "--"} sub="sueldos mensuales" />
                <StatCard label="Con automatización ahorras" value={fmtSoles(annualSavings)} sub="est. al año · 70% eficiencia" highlight />
                <StatCard label="% jornada en tareas manuales" value={dedicacion > 0 ? fmtNum(dedicacion, 1) + "%" : "--%"} sub="del tiempo productivo" />
              </div>

              <div className="c-breakdown">
                <div className="c-breakdown-hdr">Desglose por proceso</div>
                <div style={{ overflowX: "auto" }}>
                  <table className="c-table">
                    <thead>
                      <tr>
                        {["Proceso", "Empl.", "Hrs/proy.", "% Ded.", "Mensual", "Anual"].map(h => (
                          <th key={h}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {breakdownRows.length > 0 ? (
                        breakdownRows.map((p, idx) => (
                          <tr key={p.id}>
                            <td>{p.nombre || `Proceso ${idx + 1}`}</td>
                            <td>{fmtNum(processEmployees(p), 0)}</td>
                            <td>{fmtNum(processHours(p), 0)}</td>
                            <td>{procesoDedicacion(p)}</td>
                            <td className="td-r">{fmtSoles(processCost(p))}</td>
                            <td className="td-r">{fmtSoles(processCost(p) * 12)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="td-empty">Agrega un proceso para ver el desglose</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="c-insight">
                <p className="c-label" style={{ marginBottom: 8 }}>Insight</p>
                <p className="c-insight-text" dangerouslySetInnerHTML={{ __html: insightText }} />
              </div>
            </aside>
          </div>
        </div>

        {/* ─── CTA ──────────────────────────────────────────────────── */}
        <section className="c-cta">
          <div className="c-wrap c-cta-inner">
            <div className="c-cta-text">
              <p className="c-label" style={{ color: "#6abf00", marginBottom: 14 }}>Siguiente paso</p>
              <h2 className="c-cta-h2">¿Listo para redirigir ese dinero?</h2>
              <p className="c-cta-body">En Hannah Lab convertimos ese costo invisible en una implementación que se paga sola.</p>
            </div>
            <div className="c-cta-actions">
              <a
                id="cta-whatsapp"
                href="https://wa.me/51925223153?text=Hola,%20quiero%20saber%20cómo%20reducir%20mis%20costos%20operativos%20con%20automatización"
                target="_blank"
                rel="noopener noreferrer"
                className="c-cta-btn"
              >
                Hablar con un especialista →
              </a>
              <p className="c-cta-note">Respuesta en menos de 24h · WhatsApp directo</p>
            </div>
          </div>
        </section>
      </div>

      {/* ─── Tutorial Overlay ─────────────────────────────────────────────── */}
      {tutOpen && (
        <div style={{ position: "fixed", inset: 0, zIndex: 1000, pointerEvents: "auto" }}>
          {/* Mask */}
          <div
            onClick={closeTutorial}
            style={{ position: "fixed", inset: 0, background: "rgba(10,10,10,0.75)" }}
          />

          {/* Spotlight */}
          <div
            style={{
              position: "fixed",
              top: spotlightRect.top,
              left: spotlightRect.left,
              width: spotlightRect.width,
              height: spotlightRect.height,
              border: "2px solid #4a8b00",
              borderRadius: 8,
              boxShadow: "0 0 0 4px rgba(74,139,0,0.2), 0 0 0 9999px rgba(10,10,10,0.75)",
              pointerEvents: "none",
              transition: "top 0.35s cubic-bezier(0.22,0.61,0.36,1), left 0.35s, width 0.35s, height 0.35s",
            }}
          />

          {/* Tooltip */}
          <div
            style={{
              position: "fixed",
              top: tooltipPos.top,
              left: tooltipPos.left,
              width: 340,
              maxWidth: "calc(100vw - 32px)",
              background: "#111827",
              color: "#fff",
              border: "1px solid #1f2937",
              borderRadius: 8,
              padding: "22px 24px",
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              zIndex: 1001,
              borderLeft: "3px solid #4a8b00",
              transition: "top 0.35s cubic-bezier(0.22,0.61,0.36,1), left 0.35s",
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4a8b00", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <span>Tutorial</span>
              <span style={{ color: "#6b7280" }}>{tutStep + 1} / {TUTORIAL_STEPS.length}</span>
            </div>
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {TUTORIAL_STEPS.map((_, i) => (
                <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= tutStep ? "#4a8b00" : "#1f2937", opacity: i < tutStep ? 0.5 : 1, transition: "background 0.25s" }} />
              ))}
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
              {TUTORIAL_STEPS[tutStep].title}
            </p>
            <div
              style={{ fontSize: 13, lineHeight: 1.55, color: "#9ca3af", marginBottom: 18 }}
              dangerouslySetInnerHTML={{ __html: TUTORIAL_STEPS[tutStep].body }}
            />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button onClick={closeTutorial} style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: "6px 0" }}>
                Saltar
              </button>
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={prevTutStep}
                  disabled={tutStep === 0}
                  style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "9px 14px", borderRadius: 4, cursor: tutStep === 0 ? "not-allowed" : "pointer", background: "transparent", color: "#fff", border: "1px solid #374151", opacity: tutStep === 0 ? 0.3 : 1 }}
                >
                  ← Atrás
                </button>
                <button
                  onClick={nextTutStep}
                  style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "9px 14px", borderRadius: 4, cursor: "pointer", background: "#4a8b00", color: "#fff", border: "none" }}
                >
                  {tutStep === TUTORIAL_STEPS.length - 1 ? "¡Empezar!" : "Siguiente →"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Styles ───────────────────────────────────────────────────────── */}
      <style>{`
        /* Page shell */
        .calc-page { font-family: 'Outfit', system-ui, sans-serif; background: var(--bg); color: var(--text-primary); width: 100%; overflow-x: hidden; }

        /* Centered container — fluid padding, no overflow */
        .c-wrap { max-width: 1280px; margin: 0 auto; padding-left: clamp(1rem, 5vw, 3rem); padding-right: clamp(1rem, 5vw, 3rem); box-sizing: border-box; }
        .c-body { padding-top: 2.5rem; padding-bottom: 5rem; }

        /* ── Hero ── */
        .c-hero { background: #0d1117; border-bottom: 3px solid var(--verde); }
        .c-hero .c-wrap { padding-top: clamp(5rem, 10vw, 7rem); padding-bottom: clamp(2.5rem, 5vw, 4rem); }
        .c-hero-h1 { font-size: clamp(1.75rem, 4.5vw, 3.25rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #fff; margin: 0 0 1.125rem; max-width: 820px; }
        .c-hero-sub { font-size: clamp(0.9375rem, 2vw, 1.0625rem); color: #9ca3af; max-width: 600px; line-height: 1.65; margin: 0 0 1.75rem; }
        .c-how-btn { font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; background: transparent; color: #fff; border: 1px solid #374151; padding: 9px 16px; border-radius: 4px; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; transition: border-color 0.15s, color 0.15s; }
        .c-how-btn:hover { border-color: var(--verde); color: #6abf00; }

        /* ── Two-column layout ── */
        .c-grid { display: grid; grid-template-columns: 1.1fr 1fr; gap: 2rem; align-items: start; }
        .c-grid > * { min-width: 0; }

        /* ── Shared typography ── */
        .c-label { font-family: monospace; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); display: block; margin-bottom: 1.25rem; }
        .c-hint { display: block; font-family: monospace; font-size: 10px; color: var(--text-muted); margin-top: 4px; }
        .c-field { margin-bottom: 14px; }

        /* ── Process & role cards ── */
        .c-process-card { border: 1px solid var(--border); border-radius: 10px; padding: 1.5rem; margin-bottom: 1.25rem; background: #fff; transition: border-color 0.2s, box-shadow 0.2s; }
        .c-process-card:hover { box-shadow: 0 4px 20px rgba(0,0,0,0.06); }
        .c-role-card { background: var(--bg-soft); border-radius: 8px; padding: 1.125rem; margin-bottom: 10px; }
        .c-card-hdr { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .c-del-btn { background: none; border: none; color: #9ca3af; font-size: 20px; cursor: pointer; padding: 2px 6px; border-radius: 4px; line-height: 1; transition: color 0.15s; }

        /* ── Role inputs 2-col grid ── */
        .c-role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

        /* ── Ghost buttons ── */
        .c-ghost-btn { width: 100%; padding: 12px; font-family: monospace; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; background: transparent; color: #6b7280; border: 1px dashed var(--border); border-radius: 6px; cursor: pointer; transition: border-color 0.15s, color 0.15s; display: block; margin-top: 4px; }
        .c-ghost-btn:hover { border-color: var(--verde); color: var(--verde); }
        .c-ghost-btn--solid { border-style: solid; }

        /* ── Results sidebar ── */
        .c-results-col { position: sticky; top: 24px; }
        .c-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.25rem; min-width: 0; }
        .c-stat-grid > * { min-width: 0; box-sizing: border-box; }

        /* ── Breakdown table ── */
        .c-breakdown { border: 1px solid var(--border); border-radius: 8px; overflow: hidden; margin-bottom: 1.25rem; }
        .c-breakdown-hdr { padding: 14px 20px; border-bottom: 1px solid var(--border); font-family: monospace; font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--text-muted); }
        .c-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .c-table thead tr { background: var(--bg-soft); }
        .c-table th { text-align: left; padding: 10px 14px; font-family: monospace; font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: var(--text-muted); border-bottom: 1px solid var(--border); font-weight: 700; white-space: nowrap; }
        .c-table td { padding: 12px 14px; color: var(--text-secondary); border-bottom: 1px solid var(--border-light); }
        .c-table td.td-r { font-family: monospace; font-weight: 700; color: var(--text-primary); text-align: right; }
        .c-table td.td-empty { padding: 24px; text-align: center; color: var(--text-muted); font-size: 13px; }

        /* ── Insight ── */
        .c-insight { background: var(--bg-soft); border-left: 4px solid var(--verde); padding: 20px 24px; border-radius: 0 8px 8px 0; }
        .c-insight-text { font-size: 14px; line-height: 1.7; color: var(--text-secondary); }
        .c-insight-text strong { color: var(--text-primary); }

        /* ── CTA ── */
        .c-cta { background: #0d1117; }
        .c-cta .c-wrap { padding-top: clamp(3rem, 6vw, 5rem); padding-bottom: clamp(3rem, 6vw, 5rem); }
        .c-cta-inner { display: grid; grid-template-columns: 1.3fr 1fr; gap: 2.5rem; align-items: center; }
        .c-cta-h2 { font-size: clamp(1.625rem, 3.5vw, 2.5rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; color: #fff; margin: 0 0 0.875rem; }
        .c-cta-body { font-size: 1rem; color: #9ca3af; line-height: 1.6; max-width: 480px; margin: 0; }
        .c-cta-actions { display: flex; flex-direction: column; align-items: flex-start; gap: 14px; }
        .c-cta-btn { font-family: monospace; font-size: 13px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; background: var(--verde); color: #fff; padding: 16px 28px; border-radius: 6px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; transition: background 0.15s, transform 0.15s; }
        .c-cta-btn:hover { background: var(--verde-accent); transform: translateY(-2px); }
        .c-cta-note { font-family: monospace; font-size: 11px; color: #6b7280; letter-spacing: 0.5px; margin: 0; }

        /* ── Responsive ── */
        @media (max-width: 960px) {
          .c-grid { grid-template-columns: 1fr; }
          .c-cta-inner { grid-template-columns: 1fr; }
          .c-results-col { position: static; }
        }
        @media (max-width: 520px) {
          .c-role-grid { grid-template-columns: 1fr; }
          .c-stat-grid { grid-template-columns: 1fr; }
          .c-cta-btn { width: 100%; justify-content: center; }
        }

        /* ── Misc ── */
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        .tutorial-body ul { list-style: none; padding: 0; margin: 8px 0 0; }
        .tutorial-body li { position: relative; padding: 5px 0 5px 14px; font-size: 12px; line-height: 1.5; border-top: 1px solid #1f2937; color: #9ca3af; }
        .tutorial-body li:first-child { border-top: none; }
        .tutorial-body li::before { content: ''; position: absolute; left: 0; top: 12px; width: 5px; height: 5px; background: #4a8b00; border-radius: 50%; }
        .tutorial-body strong { color: #fff; }
      `}</style>
    </>
  );
};

// ─── Sub-components ──────────────────────────────────────────────────────────
const StatCard = ({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub: string;
  highlight?: boolean;
}) => (
  <div
    style={{
      background: highlight ? "var(--verde)" : "#fff",
      color: highlight ? "#fff" : "var(--text-primary)",
      borderRadius: 8,
      padding: "18px 16px",
      position: "relative",
      overflow: "hidden",
      border: `1px solid ${highlight ? "var(--verde)" : "var(--border)"}`,
      borderLeft: `3px solid ${highlight ? "#6abf00" : "var(--verde)"}`,
      minWidth: 0,
      boxSizing: "border-box",
    }}
  >
    <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", marginBottom: 8, color: highlight ? "rgba(255,255,255,0.75)" : "#6b7280" }}>
      {label}
    </p>
    <p style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, lineHeight: 1.2, wordBreak: "break-all", color: highlight ? "#fff" : "#111827" }}>
      {value}
    </p>
    <p style={{ fontSize: 11, marginTop: 5, color: highlight ? "rgba(255,255,255,0.75)" : "#374151" }}>{sub}</p>
  </div>
);

// ─── Shared styles ───────────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 13px",
  fontFamily: "'Outfit', system-ui, sans-serif",
  fontSize: 14,
  color: "#111827",
  background: "#fff",
  border: "1px solid #e5e7eb",
  borderRadius: 6,
  outline: "none",
  boxSizing: "border-box",
  transition: "border-color 0.15s",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 500,
  color: "#4b5563",
  marginBottom: 5,
};

const ghostBtnStyle: React.CSSProperties = {
  width: "100%",
  padding: "12px",
  fontFamily: "monospace",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: "0.5px",
  textTransform: "uppercase",
  background: "transparent",
  color: "#6b7280",
  border: "1px dashed #e5e7eb",
  borderRadius: 6,
  cursor: "pointer",
  transition: "border-color 0.15s, color 0.15s",
  display: "block",
};
