"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";

gsap.registerPlugin(MotionPathPlugin);

const V = "#4a8b00";
const VL = "#6abf00";
const CARD = "#f8f9fa";
const BORDER = "#e2e5e9";
const LINE_BG = "#ebedf0";
const DARK = "#1a1a1a";

export const HeroIllustration = () => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const main = gsap.timeline({ defaults: { ease: "power3.out" } });

      // 0. Fade in the whole SVG
      main.fromTo(svgRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 1.1, ease: "power2.out" }, 0
      );

      // 1. Draw the main pipeline path
      main.fromTo(".pipeline-path",
        { strokeDashoffset: 1200 },
        { strokeDashoffset: 0, duration: 2, stagger: 0.3 }, 0.4
      );

      // 2. Cards appear
      main.fromTo(".card-el",
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.7, stagger: 0.1 }, 0.7
      );

      // 3. Icons inside cards
      main.fromTo(".card-icon",
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.45, stagger: 0.08, ease: "power2.out" }, 1.1
      );

      // 4. Labels
      main.fromTo(".label-el",
        { opacity: 0, y: 6 },
        { opacity: 1, y: 0, duration: 0.45, stagger: 0.06 }, 1.3
      );

      // 5. Center badge
      main.fromTo(".center-badge",
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 1.05
      );

      // 6. Animated flow dots along pipeline paths
      // Top flow path
      gsap.to(".flow-dot-1", {
        motionPath: { path: "#flow-top", align: "#flow-top", alignOrigin: [0.5, 0.5] },
        duration: 4, repeat: -1, ease: "none", delay: 2,
      });
      gsap.to(".flow-dot-2", {
        motionPath: { path: "#flow-top", align: "#flow-top", alignOrigin: [0.5, 0.5] },
        duration: 4, repeat: -1, ease: "none", delay: 3.2,
      });
      // Bottom flow path
      gsap.to(".flow-dot-3", {
        motionPath: { path: "#flow-bottom", align: "#flow-bottom", alignOrigin: [0.5, 0.5] },
        duration: 4.5, repeat: -1, ease: "none", delay: 2.5,
      });
      gsap.to(".flow-dot-4", {
        motionPath: { path: "#flow-bottom", align: "#flow-bottom", alignOrigin: [0.5, 0.5] },
        duration: 4.5, repeat: -1, ease: "none", delay: 4,
      });

      // 7. Pulse on center
      gsap.to(".pulse-ring", {
        scale: 1.6, opacity: 0, duration: 2, repeat: -1, ease: "power1.out", transformOrigin: "center center",
      });

      // 8. Small bar chart animation
      gsap.to(".bar-animate", {
        scaleY: 1, duration: 0.6, stagger: 0.12, ease: "power2.out", delay: 1.8,
        transformOrigin: "bottom center",
      });

      // 9. Checkmarks appear
      main.fromTo(".check-mark",
        { opacity: 0, scale: 0.7 },
        { opacity: 1, scale: 1, duration: 0.35, stagger: 0.12, ease: "power2.out" }, 1.8
      );

      // 10. Subtle continuous glow on processing
      gsap.to(".glow-proc", {
        opacity: 0.15, duration: 1.5, repeat: -1, yoyo: true, ease: "sine.inOut",
      });

    }, svgRef);

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 520 440"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "auto", opacity: 0 }}
    >
      {/* ============ FLOW PATHS ============ */}
      {/* Invisible guides for motionPath dots */}
      <path id="flow-top" d="M60 130 C130 130, 170 130, 210 155 C240 175, 255 185, 260 185 C265 185, 280 175, 310 155 C350 130, 390 130, 460 130" fill="none" stroke="none" />
      <path id="flow-bottom" d="M60 310 C130 310, 170 310, 210 285 C240 265, 255 235, 260 235 C265 235, 280 265, 310 285 C350 310, 390 310, 460 310" fill="none" stroke="none" />

      {/* Visible pipeline lines (same paths, animated with strokeDashoffset) */}
      <path className="pipeline-path" d="M60 130 C130 130, 170 130, 210 155 C240 175, 255 185, 260 185 C265 185, 280 175, 310 155 C350 130, 390 130, 460 130" fill="none" stroke={BORDER} strokeWidth="2" strokeDasharray="1200" strokeDashoffset="1200" />
      <path className="pipeline-path" d="M60 310 C130 310, 170 310, 210 285 C240 265, 255 235, 260 235 C265 235, 280 265, 310 285 C350 310, 390 310, 460 310" fill="none" stroke={BORDER} strokeWidth="2" strokeDasharray="1200" strokeDashoffset="1200" />

      {/* Vertical connectors (symmetric: 130 units from center each side) */}
      <path className="pipeline-path" d="M130 130 L130 310" stroke={BORDER} strokeWidth="1.5" strokeDasharray="1200" strokeDashoffset="1200" opacity="0.5" />
      <path className="pipeline-path" d="M390 130 L390 310" stroke={BORDER} strokeWidth="1.5" strokeDasharray="1200" strokeDashoffset="1200" opacity="0.5" />

      {/* ============ FLOW DOTS (animated) ============ */}
      <circle className="flow-dot-1" r="5" fill={V} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1s" repeatCount="indefinite" />
      </circle>
      <circle className="flow-dot-2" r="4" fill={VL} opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="1.2s" repeatCount="indefinite" />
      </circle>
      <circle className="flow-dot-3" r="5" fill={V} opacity="0.9">
        <animate attributeName="opacity" values="0.9;0.4;0.9" dur="1.1s" repeatCount="indefinite" />
      </circle>
      <circle className="flow-dot-4" r="4" fill={VL} opacity="0.7">
        <animate attributeName="opacity" values="0.7;0.3;0.7" dur="0.9s" repeatCount="indefinite" />
      </circle>

      {/* ============ LEFT COLUMN - INPUT SOURCES ============ */}
      {/* Card: Data Source */}
      <g className="card-el">
        <rect x="16" y="80" width="110" height="100" rx="14" fill={CARD} stroke={BORDER} strokeWidth="1.5" />
        <g className="card-icon">
          {/* Database icon */}
          <ellipse cx="71" cy="110" rx="18" ry="8" fill="none" stroke={V} strokeWidth="1.8" />
          <path d="M53 110 v16 c0 4.5 8 8 18 8s18-3.5 18-8v-16" fill="none" stroke={V} strokeWidth="1.8" />
          <ellipse cx="71" cy="118" rx="18" ry="8" fill="none" stroke={V} strokeWidth="0.8" opacity="0.3" />
          {/* Data rows */}
          <rect x="58" y="140" width="26" height="2.5" rx="1.25" fill={V} opacity="0.2" />
          <rect x="58" y="146" width="18" height="2.5" rx="1.25" fill={V} opacity="0.15" />
          <rect x="58" y="152" width="22" height="2.5" rx="1.25" fill={V} opacity="0.1" />
        </g>
      </g>
      <text className="label-el" x="71" y="200" textAnchor="middle" fill={DARK} fontSize="11" fontWeight="600" fontFamily="'Outfit', system-ui" opacity="0">Datos</text>

      {/* Card: API/Webhook */}
      <g className="card-el">
        <rect x="16" y="260" width="110" height="100" rx="14" fill={CARD} stroke={BORDER} strokeWidth="1.5" />
        <g className="card-icon">
          {/* Plug/connection icon - two plugs connecting */}
          {/* Left plug */}
          <rect x="44" y="284" width="22" height="14" rx="3" fill="none" stroke={V} strokeWidth="1.8" />
          <line x1="50" y1="284" x2="50" y2="278" stroke={V} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="60" y1="284" x2="60" y2="278" stroke={V} strokeWidth="1.8" strokeLinecap="round" />
          {/* Right plug */}
          <rect x="76" y="284" width="22" height="14" rx="3" fill="none" stroke={VL} strokeWidth="1.8" />
          <line x1="82" y1="284" x2="82" y2="278" stroke={VL} strokeWidth="1.8" strokeLinecap="round" />
          <line x1="92" y1="284" x2="92" y2="278" stroke={VL} strokeWidth="1.8" strokeLinecap="round" />
          {/* Connection line between plugs */}
          <line x1="66" y1="291" x2="76" y2="291" stroke={V} strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Arrows: data flowing */}
          <path d="M55 310 L55 318 L65 318" fill="none" stroke={V} strokeWidth="1.3" strokeLinecap="round" />
          <polygon points="64,315 68,318 64,321" fill={V} opacity="0.6" />
          <path d="M87 310 L87 330 L77 330" fill="none" stroke={VL} strokeWidth="1.3" strokeLinecap="round" />
          <polygon points="78,327 74,330 78,333" fill={VL} opacity="0.6" />
          {/* Small label */}
          <text x="71" y="350" textAnchor="middle" fill={V} fontSize="10" fontWeight="500" fontFamily="monospace" opacity="0.5">API</text>
        </g>
      </g>
      <text className="label-el" x="71" y="380" textAnchor="middle" fill={DARK} fontSize="11" fontWeight="600" fontFamily="'Outfit', system-ui" opacity="0">Integraciones</text>

      {/* ============ CENTER - PROCESSING HUB (centered at x=260) ============ */}
      <g className="center-badge">
        {/* Glow */}
        <circle className="glow-proc" cx="260" cy="210" r="55" fill={V} opacity="0.05" />
        {/* Pulse ring */}
        <circle className="pulse-ring" cx="260" cy="210" r="42" fill="none" stroke={V} strokeWidth="1" opacity="0.3" />
        {/* Outer ring */}
        <circle cx="260" cy="210" r="42" fill="#1a1a1a" stroke={V} strokeWidth="2.5" />
        {/* Logo */}
        <clipPath id="center-clip"><circle cx="260" cy="210" r="40" /></clipPath>
        <image href="/images/logos/hannah.png" x="230" y="180" width="60" height="60" clipPath="url(#center-clip)" preserveAspectRatio="xMidYMid meet" />
      </g>

      {/* Processing label */}
      <g className="label-el" opacity="0">
        <rect x="220" y="262" width="80" height="24" rx="12" fill={V} opacity="0.08" />
        <text x="260" y="278" textAnchor="middle" fill={V} fontSize="10" fontWeight="600" fontFamily="'Outfit', system-ui">Procesamiento</text>
      </g>

      {/* Small processing indicators around center */}
      <g className="card-icon">
        {/* Top indicator: AI sparkle */}
        <circle cx="260" cy="132" r="14" fill={CARD} stroke={BORDER} strokeWidth="1.2" />
        <path d="M260 125 l1.5 4.5 4.5 1.5-4.5 1.5-1.5 4.5-1.5-4.5-4.5-1.5 4.5-1.5z" fill={V} opacity="0.8" />
      </g>

      {/* ============ RIGHT COLUMN - OUTPUTS ============ */}
      {/* Card: Dashboard/Results */}
      <g className="card-el">
        <rect x="394" y="80" width="110" height="100" rx="14" fill={CARD} stroke={BORDER} strokeWidth="1.5" />
        <g className="card-icon">
          {/* Mini dashboard */}
          <rect x="412" y="98" width="74" height="48" rx="6" fill="none" stroke={BORDER} strokeWidth="1.2" />
          {/* Chart bars */}
          <rect className="bar-animate" x="422" y="128" width="8" height="10" rx="2" fill={VL} opacity="0.5" style={{ transformOrigin: "426px 138px", transform: "scaleY(0.3)" }} />
          <rect className="bar-animate" x="434" y="118" width="8" height="20" rx="2" fill={V} opacity="0.6" style={{ transformOrigin: "438px 138px", transform: "scaleY(0.3)" }} />
          <rect className="bar-animate" x="446" y="123" width="8" height="15" rx="2" fill={VL} opacity="0.5" style={{ transformOrigin: "450px 138px", transform: "scaleY(0.3)" }} />
          <rect className="bar-animate" x="458" y="108" width="8" height="30" rx="2" fill={V} opacity="0.7" style={{ transformOrigin: "462px 138px", transform: "scaleY(0.3)" }} />
          <rect className="bar-animate" x="470" y="115" width="8" height="23" rx="2" fill={VL} opacity="0.6" style={{ transformOrigin: "474px 138px", transform: "scaleY(0.3)" }} />
          {/* Trend line */}
          <polyline points="426,125 438,115 450,120 462,105 474,112" fill="none" stroke={V} strokeWidth="1.5" opacity="0.4" />
          {/* Mini labels */}
          <rect x="412" y="154" width="35" height="2.5" rx="1.25" fill={BORDER} />
          <rect x="412" y="160" width="25" height="2.5" rx="1.25" fill={BORDER} />
        </g>
        {/* Check mark */}
        <g className="check-mark" opacity="0">
          <circle cx="492" cy="92" r="9" fill={V} />
          <polyline points="487,92 490,95 497,88" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <text className="label-el" x="449" y="200" textAnchor="middle" fill={DARK} fontSize="11" fontWeight="600" fontFamily="'Outfit', system-ui" opacity="0">Reportes</text>

      {/* Card: Automation Output */}
      <g className="card-el">
        <rect x="394" y="260" width="110" height="100" rx="14" fill={CARD} stroke={BORDER} strokeWidth="1.5" />
        <g className="card-icon">
          {/* Notification / task list */}
          {/* Task 1 */}
          <rect x="412" y="280" width="74" height="18" rx="4" fill="none" stroke={BORDER} strokeWidth="1" />
          <rect x="418" y="286" width="6" height="6" rx="1.5" fill={V} opacity="0.7" />
          <rect x="428" y="287" width="32" height="2.5" rx="1.25" fill={LINE_BG} />
          <rect x="428" y="291" width="20" height="2" rx="1" fill={LINE_BG} />
          {/* Task 2 */}
          <rect x="412" y="302" width="74" height="18" rx="4" fill="none" stroke={BORDER} strokeWidth="1" />
          <rect x="418" y="308" width="6" height="6" rx="1.5" fill={VL} opacity="0.6" />
          <rect x="428" y="309" width="40" height="2.5" rx="1.25" fill={LINE_BG} />
          <rect x="428" y="313" width="28" height="2" rx="1" fill={LINE_BG} />
          {/* Task 3 */}
          <rect x="412" y="324" width="74" height="18" rx="4" fill="none" stroke={BORDER} strokeWidth="1" />
          <rect x="418" y="330" width="6" height="6" rx="1.5" fill={V} opacity="0.5" />
          <rect x="428" y="331" width="36" height="2.5" rx="1.25" fill={LINE_BG} />
          <rect x="428" y="335" width="24" height="2" rx="1" fill={LINE_BG} />
        </g>
        {/* Check marks on tasks */}
        <g className="check-mark" opacity="0">
          <circle cx="478" cy="289" r="6" fill={V} opacity="0.8" />
          <polyline points="474.5,289 477,291.5 481.5,286.5" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
        <g className="check-mark" opacity="0">
          <circle cx="478" cy="311" r="6" fill={V} opacity="0.8" />
          <polyline points="474.5,311 477,313.5 481.5,308.5" fill="none" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      </g>
      <text className="label-el" x="449" y="380" textAnchor="middle" fill={DARK} fontSize="11" fontWeight="600" fontFamily="'Outfit', system-ui" opacity="0">Automatizado</text>

      {/* ============ DECORATIVE ELEMENTS ============ */}
      {/* Small dots at path intersections (symmetric at 130 units from center) */}
      <circle className="card-icon" cx="130" cy="130" r="3.5" fill={V} opacity="0" />
      <circle className="card-icon" cx="130" cy="310" r="3.5" fill={V} opacity="0" />
      <circle className="card-icon" cx="390" cy="130" r="3.5" fill={V} opacity="0" />
      <circle className="card-icon" cx="390" cy="310" r="3.5" fill={V} opacity="0" />

      {/* Arrow hints on paths (symmetric at 60 units from center) */}
      <g className="label-el" opacity="0">
        <polygon points="195,126 205,130 195,134" fill={V} opacity="0.3" />
        <polygon points="195,306 205,310 195,314" fill={V} opacity="0.3" />
        <polygon points="315,126 325,130 315,134" fill={V} opacity="0.3" />
        <polygon points="315,306 325,310 315,314" fill={V} opacity="0.3" />
      </g>

      {/* Decorative icon above Input: data rows */}
      <g className="card-icon">
        <rect x="50" y="20" width="14" height="5" rx="2" fill={VL} opacity="0.5" />
        <rect x="50" y="28" width="22" height="5" rx="2" fill={V} opacity="0.6" />
        <rect x="50" y="36" width="18" height="5" rx="2" fill={VL} opacity="0.7" />
        <rect x="50" y="44" width="28" height="5" rx="2" fill={V} opacity="0.5" />
      </g>


      {/* Top label: Input */}
      <g className="label-el" opacity="0">
        <text x="71" y="65" textAnchor="middle" fill={V} fontSize="9" fontWeight="700" fontFamily="'Outfit', system-ui" letterSpacing="0.08em">INPUT</text>
      </g>
      {/* Top label: Output */}
      <g className="label-el" opacity="0">
        <text x="449" y="65" textAnchor="middle" fill={V} fontSize="9" fontWeight="700" fontFamily="'Outfit', system-ui" letterSpacing="0.08em">OUTPUT</text>
      </g>
    </svg>
  );
};
