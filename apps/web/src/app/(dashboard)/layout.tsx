import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g:       "#00ff88",
  g2:      "#00cfff",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border:  "rgba(0,255,136,0.18)",
  text:    "#c8ffe8",
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, display: "flex", overflow: "hidden", position: "relative" }}>
      
      {/* Background Grid */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none",
        backgroundImage: `linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px)`,
        backgroundSize: "60px 60px",
      }} />

      {/* Main App Window wrapper */}
      <div style={{ display: "flex", width: "100%", height: "100vh", position: "relative", zIndex: 10 }}>
        
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content Area */}
        <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden", background: "rgba(0,0,0,0.3)" }}>
          <Header />
          <main style={{ flex: 1, overflowY: "auto", padding: "2rem", position: "relative" }}>
            {children}
          </main>
        </div>

      </div>
    </div>
  );
}
