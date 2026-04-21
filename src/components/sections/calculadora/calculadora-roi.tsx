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

  const updateProcess = (pid: number, field: keyof Process, value: string) =>
    setProcesses((prev) =>
      prev.map((p) => (p.id === pid ? { ...p, [field]: value } : p))
    );

  const updateRole = (
    pid: number,
    rid: number,
    field: keyof Role,
    value: string
  ) =>
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
      <div style={{ fontFamily: "'Outfit', system-ui, sans-serif", background: "#fff", color: "#111827" }}>

        {/* ─── Hero ───────────────────────────────────────────────────── */}
        <section style={{ background: "#111827", borderBottom: "3px solid #4a8b00" }}>
          <div style={{ maxWidth: 1200, margin: "0 auto", padding: "120px 40px 64px" }} className="calc-hero-inner">
            <p style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#6abf00", marginBottom: 14 }}>
              CALCULADORA ROI · AUTOMATIZACIÓN
            </p>
            <h1
              id="calc-hero-title"
              style={{ fontSize: "clamp(28px,4.5vw,52px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: -1, color: "#fff", marginBottom: 18, maxWidth: 860 }}
            >
              ¿Cuánto le cuesta a tu empresa el trabajo manual?
            </h1>
            <p style={{ fontSize: 17, color: "#9ca3af", maxWidth: 680, lineHeight: 1.6, marginBottom: 28 }}>
              Descubre el costo real de tus procesos manuales y visualiza el ahorro que obtendrías como partner de Hannah Lab.
            </p>
            <button
              onClick={openTutorial}
              style={{
                fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase",
                background: "transparent", color: "#fff", border: "1px solid #374151", padding: "9px 16px", borderRadius: 4, cursor: "pointer",
                display: "inline-flex", alignItems: "center", gap: 8, transition: "border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#4a8b00"; (e.currentTarget as HTMLButtonElement).style.color = "#6abf00"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#374151"; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; }}
            >
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#4a8b00", display: "inline-block" }} />
              ¿Cómo usar?
            </button>
          </div>
        </section>

        {/* ─── Main Grid ──────────────────────────────────────────────── */}
        <main style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 40px 80px", boxSizing: "border-box" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 32, alignItems: "start" }} className="calc-grid">

            {/* ─── LEFT: Inputs ─────────────────────────────────────── */}
            <section>
              <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 20 }}>
                Agregar Proceso Manual
              </p>

              {processes.map((proc, pIdx) => (
                <div
                  key={proc.id}
                  style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 24, marginBottom: 20, background: "#fff", transition: "border-color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = "#4a8b00")}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = "#e5e7eb")}
                >
                  {/* Process header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                    <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>
                      Proceso {pIdx + 1}
                    </span>
                    {processes.length > 1 && (
                      <button
                        onClick={() => removeProcess(proc.id)}
                        title="Eliminar proceso"
                        style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 20, cursor: "pointer", padding: "2px 6px", borderRadius: 4, lineHeight: 1 }}
                        onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
                        onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                      >×</button>
                    )}
                  </div>

                  {/* Process name */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#374151", marginBottom: 6 }}>
                      Nombre del proceso
                    </label>
                    <input
                      id={pIdx === 0 ? "first-nombre-input" : undefined}
                      type="text"
                      value={proc.nombre}
                      onChange={e => updateProcess(proc.id, "nombre", e.target.value)}
                      placeholder="Ej. Generación de informes mensuales"
                      style={inputStyle}
                      onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                      onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                    />
                  </div>

                  {/* Roles */}
                  {proc.roles.map((role, rIdx) => (
                    <div
                      key={role.id}
                      id={pIdx === 0 && rIdx === 0 ? "first-role-card" : undefined}
                      style={{ background: "#f8f9fa", borderRadius: 6, padding: 18, marginBottom: 10 }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                        <span style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>
                          Rol {rIdx + 1}
                        </span>
                        {proc.roles.length > 1 && (
                          <button
                            onClick={() => removeRole(proc.id, role.id)}
                            title="Eliminar rol"
                            style={{ background: "none", border: "none", color: "#9ca3af", fontSize: 18, cursor: "pointer", padding: "2px 6px", lineHeight: 1, borderRadius: 4 }}
                            onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
                            onMouseLeave={e => (e.currentTarget.style.color = "#9ca3af")}
                          >×</button>
                        )}
                      </div>

                      <div style={{ marginBottom: 14 }}>
                        <label style={labelStyle}>Tipo de empleado</label>
                        <input
                          type="text"
                          value={role.tipo}
                          onChange={e => updateRole(proc.id, role.id, "tipo", e.target.value)}
                          placeholder="Ej. Jefe de área, Asistente, Auxiliar"
                          style={inputStyle}
                          onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                          onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                        />
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }} className="role-inputs-grid">
                        <div>
                          <label style={labelStyle}>Cantidad</label>
                          <input
                            type="number" min="0" step="1"
                            value={role.cantidad}
                            onChange={e => updateRole(proc.id, role.id, "cantidad", e.target.value)}
                            placeholder="1"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Sueldo mensual (S/)</label>
                          <input
                            type="number" min="0" step="100"
                            value={role.sueldo}
                            onChange={e => updateRole(proc.id, role.id, "sueldo", e.target.value)}
                            placeholder="3500"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                          />
                        </div>
                        <div>
                          <label style={labelStyle}>Horas trabajadas al mes</label>
                          <input
                            type="number" min="0" step="1"
                            value={role.horasMes}
                            onChange={e => updateRole(proc.id, role.id, "horasMes", e.target.value)}
                            placeholder="160"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                          />
                          <small style={{ color: "#9ca3af", fontSize: 10, fontFamily: "monospace" }}>160 = 40HH · 192 = 48HH</small>
                        </div>
                        <div>
                          <label style={labelStyle}>Horas por proyecto</label>
                          <input
                            type="number" min="0" step="1"
                            value={role.horas}
                            onChange={e => updateRole(proc.id, role.id, "horas", e.target.value)}
                            placeholder="20"
                            style={inputStyle}
                            onFocus={e => (e.target.style.borderColor = "#4a8b00")}
                            onBlur={e => (e.target.style.borderColor = "#e5e7eb")}
                          />
                          <small style={{ color: "#9ca3af", fontSize: 10, fontFamily: "monospace" }}>dedicadas a este proceso</small>
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => addRole(proc.id)}
                    style={ghostBtnStyle}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#4a8b00"; (e.currentTarget as HTMLButtonElement).style.color = "#4a8b00"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                  >
                    + Agregar otro empleado / rol
                  </button>
                </div>
              ))}

              <button
                onClick={addProcess}
                style={{ ...ghostBtnStyle, borderStyle: "solid", borderColor: "#e5e7eb" }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#4a8b00"; (e.currentTarget as HTMLButtonElement).style.color = "#4a8b00"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#e5e7eb"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
              >
                + Agregar otro proceso
              </button>
            </section>

            {/* ─── RIGHT: Results ───────────────────────────────────── */}
            <aside style={{ position: "sticky", top: 24 }}>
              <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 20 }}>
                Resultados en tiempo real
              </p>

              {/* Summary cards */}
              <div
                id="summary-grid"
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}
                className="summary-cards"
              >
                <StatCard label="Costo mensual oculto" value={fmtSoles(totalMonthly)} sub="por mes" />
                <StatCard label="Costo anual perdido" value={fmtSoles(totalYearly)} sub="al año" />
                <StatCard label="Equivalente en sueldos" value={salariesEq > 0 ? fmtNum(salariesEq, 1) : "--"} sub="sueldos mensuales" />
                <StatCard label="Con automatización ahorras" value={fmtSoles(annualSavings)} sub="est. al año · 70% eficiencia" highlight />
                <StatCard label="% jornada en tareas manuales" value={dedicacion > 0 ? fmtNum(dedicacion, 1) + "%" : "--%"} sub="del tiempo productivo" />
              </div>

              {/* Breakdown table */}
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden", marginBottom: 20 }}>
                <div style={{ padding: "14px 20px", borderBottom: "1px solid #e5e7eb", fontFamily: "monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af" }}>
                  Desglose por proceso
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ background: "#f8f9fa" }}>
                        {["Proceso", "Empl.", "Hrs/proy.", "% Ded.", "Mensual", "Anual"].map(h => (
                          <th key={h} style={{ textAlign: "left", padding: "10px 14px", fontFamily: "monospace", fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: "#9ca3af", borderBottom: "1px solid #e5e7eb", fontWeight: 700, whiteSpace: "nowrap" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {breakdownRows.length > 0 ? (
                        breakdownRows.map((p, idx) => (
                          <tr key={p.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                            <td style={{ padding: "12px 14px", color: "#374151" }}>{p.nombre || `Proceso ${idx + 1}`}</td>
                            <td style={{ padding: "12px 14px", color: "#374151" }}>{fmtNum(processEmployees(p), 0)}</td>
                            <td style={{ padding: "12px 14px", color: "#374151" }}>{fmtNum(processHours(p), 0)}</td>
                            <td style={{ padding: "12px 14px", color: "#374151" }}>{procesoDedicacion(p)}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 700, color: "#111827", textAlign: "right" }}>{fmtSoles(processCost(p))}</td>
                            <td style={{ padding: "12px 14px", fontFamily: "monospace", fontWeight: 700, color: "#111827", textAlign: "right" }}>{fmtSoles(processCost(p) * 12)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#9ca3af", fontSize: 13 }}>
                            Agrega un proceso para ver el desglose
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Insight */}
              <div style={{ background: "#f8f9fa", borderLeft: "4px solid #4a8b00", padding: "20px 24px", borderRadius: "0 8px 8px 0", marginBottom: 20 }}>
                <p style={{ fontFamily: "monospace", fontSize: 10, letterSpacing: "1.5px", textTransform: "uppercase", color: "#9ca3af", marginBottom: 8 }}>
                  Insight
                </p>
                <p
                  style={{ fontSize: 14, lineHeight: 1.7, color: "#4b5563" }}
                  dangerouslySetInnerHTML={{ __html: insightText }}
                />
              </div>
            </aside>
          </div>
        </main>

        {/* ─── CTA ──────────────────────────────────────────────────────── */}
        <section style={{ background: "#111827", padding: "80px 40px" }} className="calc-cta-section">
          <div style={{ maxWidth: 1200, margin: "0 auto", display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: 40, alignItems: "center" }} className="cta-grid">
            <div>
              <p style={{ fontFamily: "monospace", fontSize: 11, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4a8b00", marginBottom: 14 }}>
                Siguiente paso
              </p>
              <h2 style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 700, lineHeight: 1.1, letterSpacing: -0.5, color: "#fff", marginBottom: 14 }}>
                ¿Listo para redirigir ese dinero?
              </h2>
              <p style={{ fontSize: 16, color: "#9ca3af", lineHeight: 1.6, maxWidth: 480 }}>
                En Hannah Lab convertimos ese costo invisible en una implementación que se paga sola.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 14 }}>
              <a
                id="cta-whatsapp"
                href="https://wa.me/51925223153?text=Hola,%20quiero%20saber%20cómo%20reducir%20mis%20costos%20operativos%20con%20automatización"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: "monospace", fontSize: 13, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase",
                  background: "#4a8b00", color: "#fff", padding: "16px 28px", borderRadius: 6, textDecoration: "none",
                  display: "inline-flex", alignItems: "center", gap: 8, transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "#3f7008")}
                onMouseLeave={e => (e.currentTarget.style.background = "#4a8b00")}
              >
                Hablar con un especialista →
              </a>
              <p style={{ fontFamily: "monospace", fontSize: 11, color: "#6b7280", letterSpacing: 0.5 }}>
                Respuesta en menos de 24h · WhatsApp directo
              </p>
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
            {/* Step label */}
            <div style={{ fontFamily: "monospace", fontSize: 10, fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase", color: "#4a8b00", marginBottom: 10, display: "flex", justifyContent: "space-between" }}>
              <span>Tutorial</span>
              <span style={{ color: "#6b7280" }}>{tutStep + 1} / {TUTORIAL_STEPS.length}</span>
            </div>

            {/* Progress */}
            <div style={{ display: "flex", gap: 4, marginBottom: 14 }}>
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{ flex: 1, height: 3, borderRadius: 2, background: i <= tutStep ? "#4a8b00" : "#1f2937", opacity: i < tutStep ? 0.5 : 1, transition: "background 0.25s" }}
                />
              ))}
            </div>

            {/* Content */}
            <p style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.3, marginBottom: 8 }}>
              {TUTORIAL_STEPS[tutStep].title}
            </p>
            <div
              style={{ fontSize: 13, lineHeight: 1.55, color: "#9ca3af", marginBottom: 18 }}
              dangerouslySetInnerHTML={{ __html: TUTORIAL_STEPS[tutStep].body }}
            />

            {/* Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <button
                onClick={closeTutorial}
                style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", background: "none", border: "none", color: "#6b7280", cursor: "pointer", padding: "6px 0" }}
              >
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

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 900px) {
          .calc-grid { grid-template-columns: 1fr !important; }
          .cta-grid { grid-template-columns: 1fr !important; }
          aside { position: static !important; }
        }
        @media (max-width: 768px) {
          .calc-hero-inner { padding: 88px 24px 40px !important; }
          .calc-cta-section { padding: 52px 24px !important; }
        }
        @media (max-width: 600px) {
          main { padding: 24px 16px 60px !important; }
          .calc-hero-inner { padding: 80px 16px 32px !important; }
          .calc-cta-section { padding: 40px 16px !important; }
          .cta-grid > div:last-child { align-items: flex-start !important; }
          .role-inputs-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 400px) {
          .summary-cards { grid-template-columns: 1fr !important; }
        }
        /* Remove number spinners */
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
      background: highlight ? "#4a8b00" : "#111827",
      color: highlight ? "#fff" : "#fff",
      borderRadius: 8,
      padding: "18px 16px",
      position: "relative",
      overflow: "hidden",
      borderLeft: `3px solid ${highlight ? "#6abf00" : "#4a8b00"}`,
    }}
  >
    <p style={{ fontFamily: "monospace", fontSize: 9, letterSpacing: "1.5px", textTransform: "uppercase", opacity: 0.7, marginBottom: 8 }}>
      {label}
    </p>
    <p style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, lineHeight: 1.2, wordBreak: "break-word" }}>
      {value}
    </p>
    <p style={{ fontSize: 11, opacity: 0.65, marginTop: 5 }}>{sub}</p>
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
