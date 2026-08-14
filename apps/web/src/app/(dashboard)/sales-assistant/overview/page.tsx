'use client';

import { 
  Users, CheckCircle, Star, Search, FileText, Mail, MessageCircle, Calendar, Target
} from "lucide-react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g:       "#00ff88",
  g2:      "#00cfff",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border2: "rgba(0,207,255,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  text:    "#c8ffe8",
  glow2:   "0 0 20px rgba(0,207,255,0.35),0 0 60px rgba(0,207,255,0.12)",
  mono:    "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body:    "'Rajdhani', sans-serif",
};

const Corners = () => (
  <>
    {[["tl","1px 0 0 1px","0","0","auto","auto"],
      ["tr","1px 1px 0 0","0","auto","0","auto"],
      ["bl","0 0 1px 1px","auto","0","auto","0"],
      ["br","0 1px 1px 0","auto","auto","0","0"]].map(([k, bw, t, l, b, r]) => (
      <span key={k} style={{
        position:"absolute", width:14, height:14,
        borderColor: T.g2, borderStyle:"solid", borderWidth: bw as number | string, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

const Card = ({ title, value, sub, icon: Icon }: { title: string, value: string | number, sub: string, icon: React.ElementType }) => {
  return (
    <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "1.5rem", position: "relative", boxShadow: `0 0 30px rgba(0,207,255,0.03)` }}>
      <Corners />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
        <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: "rgba(0,207,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{title}</div>
        <Icon size={16} color={T.g2} />
      </div>
      <div style={{ fontFamily: T.display, fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>{value}</div>
      <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.g2, letterSpacing: "0.05em" }}>{sub}</div>
    </div>
  );
};

export default function SalesOverviewPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
      
      <div style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Target color={T.g2} size={32} /> Sales Overview
        </h1>
        <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.05em" }}>
          AI Sales Assistant performance and pipeline.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(12, 1fr)", gap: "1.5rem" }}>
        
        {/* KPI Cards */}
        <div style={{ gridColumn: "span 12" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1rem" }}>
            <Card title="Total Leads" value="5,420" sub="+840 this week" icon={Users} />
            <Card title="Qualified Leads" value="1,240" sub="+120 this week" icon={CheckCircle} />
            <Card title="Average Score" value="84" sub="+4 this week" icon={Star} />
            <Card title="Research Done" value="1,150" sub="92% of qualified" icon={Search} />
            
            <Card title="Drafts Generated" value="1,100" sub="95% approval rate" icon={FileText} />
            <Card title="Emails Sent" value="980" sub="34% open rate" icon={Mail} />
            <Card title="Replies" value="342" sub="8.4% reply rate" icon={MessageCircle} />
            <Card title="Meetings Booked" value="48" sub="14% conversion" icon={Calendar} />
          </div>
        </div>

        {/* Main Pipeline Funnel */}
        <div style={{ gridColumn: "span 12", background: T.panel, border: `1px solid ${T.border2}`, padding: "2rem", position: "relative" }}>
          <Corners />
          <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: "rgba(0,207,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2.5rem" }}>Pipeline Funnel</div>
          
          <div style={{ display: "flex", alignItems: "stretch", height: 200, gap: "0.5rem", padding: "0 2rem" }}>
            {[
              { stage: "Discovered", val: 5420, pct: 100 },
              { stage: "Qualified", val: 1240, pct: 60 },
              { stage: "Researched", val: 1150, pct: 50 },
              { stage: "Contacted", val: 980, pct: 40 },
              { stage: "Replied", val: 342, pct: 20 },
              { stage: "Booked", val: 48, pct: 10 },
            ].map((s, i, arr) => (
              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{ fontFamily: T.body, fontSize: "1rem", color: "#fff", marginBottom: "0.5rem" }}>{s.stage}</div>
                <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.g2, marginBottom: "1rem" }}>{s.val}</div>
                
                {/* Funnel Block */}
                <div style={{ 
                  width: "100%", height: "100%", 
                  background: `rgba(0,207,255,${0.1 + (i*0.05)})`,
                  borderTop: `2px solid ${T.g2}`,
                  borderBottom: `2px solid rgba(0,207,255,0.2)`,
                  position: "relative",
                  clipPath: `polygon(
                    ${(100 - s.pct) / 2}% 0%,
                    ${100 - (100 - s.pct) / 2}% 0%,
                    ${100 - (100 - (arr[i+1]?.pct || 5)) / 2}% 100%,
                    ${(100 - (arr[i+1]?.pct || 5)) / 2}% 100%
                  )`
                }}>
                  {i < arr.length - 1 && (
                    <div style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", color: "rgba(0,207,255,0.3)", zIndex: 10 }}>
                      →
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
