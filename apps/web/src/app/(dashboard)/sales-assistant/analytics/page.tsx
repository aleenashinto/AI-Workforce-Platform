'use client';

import { 
  BarChart2, TrendingUp, Users, Target, Mail, MousePointerClick, MessageSquare, Calendar
} from "lucide-react";

const T = {
  g:       "#00ff88",
  g2:      "#00cfff",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border:  "rgba(0,255,136,0.18)",
  border2: "rgba(0,207,255,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  muted2:  "rgba(0,207,255,0.45)",
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        borderColor: T.g2, borderStyle:"solid", borderWidth: bw as any, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const StatCard = ({ title, value, icon: Icon, trend }: any) => (
  <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "1.5rem", position: "relative" }}>
    <Corners />
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
      <div style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.muted2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</div>
      <Icon size={16} color={T.g2} />
    </div>
    <div style={{ fontFamily: T.display, fontSize: "2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem" }}>{value}</div>
    <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: T.mono, fontSize: "0.75rem", color: T.g }}>
      <TrendingUp size={12} /> {trend}
    </div>
  </div>
);

export default function AnalyticsPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: 1400, margin: "0 auto" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2.5rem" }}>
        <div>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <BarChart2 color={T.g2} size={32} /> Sales Analytics
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.05em" }}>
            Performance metrics across your AI sales pipeline.
          </p>
        </div>
        <select style={{ background: T.panel, border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.8rem", padding: "0.8rem 1rem", outline: "none", cursor: "pointer" }}>
          <option>Last 30 Days</option>
          <option>Last 7 Days</option>
          <option>This Quarter</option>
        </select>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "1.5rem", marginBottom: "2rem" }}>
        <StatCard title="Leads Discovered" value="4,250" icon={Users} trend="+12% from last period" />
        <StatCard title="Qualified Leads" value="1,840" icon={Target} trend="+5% from last period" />
        <StatCard title="Emails Sent" value="3,600" icon={Mail} trend="+22% from last period" />
        <StatCard title="Meetings Booked" value="42" icon={Calendar} trend="+18% from last period" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
        
        {/* Pipeline Funnel */}
        <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "2rem", position: "relative" }}>
          <Corners />
          <div style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2rem" }}>Conversion Funnel</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {[
              { label: "Discovered", count: 4250, pct: 100, color: "rgba(0,207,255,0.2)" },
              { label: "Qualified", count: 1840, pct: 43, color: "rgba(0,207,255,0.4)" },
              { label: "Contacted", count: 1200, pct: 28, color: "rgba(0,207,255,0.6)" },
              { label: "Replied", count: 144, pct: 3.4, color: "rgba(0,207,255,0.8)" },
              { label: "Meetings Booked", count: 42, pct: 1.0, color: T.g2 }
            ].map((stage, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{ width: 140, fontFamily: T.mono, fontSize: "0.85rem", color: T.muted2, textAlign: "right" }}>{stage.label}</div>
                <div style={{ flex: 1, height: 40, display: "flex", alignItems: "center" }}>
                  <div style={{ width: `${stage.pct}%`, height: "100%", background: stage.color, border: `1px solid ${T.border2}`, display: "flex", alignItems: "center", paddingLeft: "1rem", fontFamily: T.body, fontSize: "1rem", color: "#fff", fontWeight: 600, transition: "width 1s ease-out" }}>
                    {stage.count.toLocaleString()}
                  </div>
                </div>
                <div style={{ width: 50, fontFamily: T.mono, fontSize: "0.85rem", color: T.text }}>{stage.pct}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Email Performance */}
        <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "2rem", position: "relative" }}>
          <Corners />
          <div style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: "2rem" }}>Email Performance</div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
            
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.85rem", color: T.text }}><Mail size={14} color={T.muted2} /> Open Rate</span>
                <span style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", fontWeight: 600 }}>48%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(0,207,255,0.1)", borderRadius: 3 }}>
                <div style={{ width: "48%", height: "100%", background: T.g2, borderRadius: 3, boxShadow: T.glow2 }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.85rem", color: T.text }}><MousePointerClick size={14} color={T.muted2} /> Click Rate</span>
                <span style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", fontWeight: 600 }}>12%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(0,207,255,0.1)", borderRadius: 3 }}>
                <div style={{ width: "12%", height: "100%", background: T.g2, borderRadius: 3, boxShadow: T.glow2 }} />
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontFamily: T.mono, fontSize: "0.85rem", color: T.text }}><MessageSquare size={14} color={T.muted2} /> Reply Rate</span>
                <span style={{ fontFamily: T.display, fontSize: "1.2rem", color: "#fff", fontWeight: 600 }}>8.5%</span>
              </div>
              <div style={{ width: "100%", height: 6, background: "rgba(0,207,255,0.1)", borderRadius: 3 }}>
                <div style={{ width: "8.5%", height: "100%", background: T.g2, borderRadius: 3, boxShadow: T.glow2 }} />
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
