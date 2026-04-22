import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  backHref?: string;
  backLabel?: string;
}

const PlusIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
    style={{ width: "14px", height: "14px", flexShrink: 0 }}>
    <path d="M12 4.5v15m7.5-7.5h-15" strokeLinecap="round" />
  </svg>
);

export default function PageHeader({
  title,
  subtitle,
  action,
  backHref,
  backLabel = "Volver",
}: PageHeaderProps) {
  return (
    <div style={{
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "space-between",
      gap: "1rem",
      flexWrap: "wrap",
      paddingBottom: "1.25rem",
      borderBottom: "1px solid var(--border)",
    }}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.6rem" }}>
        {backHref && (
          <Link
            href={backHref}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "30px", height: "30px", borderRadius: "8px", marginTop: "3px",
              background: "var(--bg-soft)", border: "1px solid var(--border)",
              color: "var(--text-muted)", textDecoration: "none", transition: "all 0.15s",
              flexShrink: 0,
            }}
            title={backLabel}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--verde)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--verde)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLAnchorElement).style.color = "var(--text-muted)"; }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              style={{ width: "13px", height: "13px" }}>
              <path d="M15 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        )}
        <div>
          <h1 style={{
            fontSize: "1.35rem", fontWeight: 800,
            color: "var(--text-primary)", margin: 0, lineHeight: 1.2,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontSize: "0.78rem", color: "var(--text-muted)",
              margin: "0.25rem 0 0",
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          style={{
            display: "flex", alignItems: "center", gap: "0.45rem",
            padding: "0.55rem 1.1rem", borderRadius: "10px",
            fontSize: "0.8rem", fontWeight: 600,
            background: "var(--verde)", border: "none",
            color: "#fff", cursor: "pointer",
            transition: "opacity 0.15s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.88"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; }}
        >
          {action.icon ?? <PlusIcon />}
          {action.label}
        </button>
      )}
    </div>
  );
}
