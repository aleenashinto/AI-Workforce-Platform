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
    <div className="p-4 md:p-8 max-w-[1400px] mx-auto w-full">
      
      <div className="mb-8">
        <h1 className="font-display text-2xl md:text-4xl font-bold text-white mb-2 flex items-center gap-4">
          <Target color={T.g2} className="w-6 h-6 md:w-8 md:h-8" /> Sales Overview
        </h1>
        <p className="font-mono text-sm md:text-base text-[#00cfff] tracking-wide">
          AI Sales Assistant performance and pipeline.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* KPI Cards */}
        <div className="col-span-1 lg:col-span-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="col-span-1 lg:col-span-12 bg-[#0a1628] border border-[rgba(0,207,255,0.18)] p-4 md:p-8 relative w-full overflow-hidden">
          <Corners />
          <div className="font-mono text-xs md:text-sm text-[rgba(0,207,255,0.5)] tracking-widest uppercase mb-10">Pipeline Funnel</div>
          
          <div className="overflow-x-auto pb-4 w-full">
            <div className="flex items-stretch h-[200px] gap-2 md:gap-4 px-2 md:px-8 min-w-[600px]">
              {[
                { stage: "Discovered", val: 5420, pct: 100 },
                { stage: "Qualified", val: 1240, pct: 60 },
                { stage: "Researched", val: 1150, pct: 50 },
                { stage: "Contacted", val: 980, pct: 40 },
                { stage: "Replied", val: 342, pct: 20 },
                { stage: "Booked", val: 48, pct: 10 },
              ].map((s, i, arr) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="font-body text-sm md:text-base text-white mb-2">{s.stage}</div>
                  <div className="font-mono text-xs md:text-sm text-[#00cfff] mb-4">{s.val}</div>
                  
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
                      <div className="absolute -right-2 top-1/2 -translate-y-1/2 text-[rgba(0,207,255,0.3)] z-10 hidden md:block">
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

    </div>
  );
}
