import { DashboardShell } from "@/components/layout/dashboard-shell";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  bg: "var(--t-bg)",
  text: "var(--t-text)",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{ minHeight: "100vh", background: T.bg, color: T.text }}
      className="flex overflow-hidden relative"
    >
      {/* Background Grid */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`,
          backgroundSize: "60px 60px",
        }}
      />

      {/* Main App Window wrapper */}
      <DashboardShell>{children}</DashboardShell>
    </div>
  );
}
