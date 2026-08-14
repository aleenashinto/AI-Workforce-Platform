'use client';

import { 
  Target, Sparkles, Building, User, ShieldX, Briefcase
} from "lucide-react";
import Link from "next/link";
import React from "react";

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
        borderColor: T.g2, borderStyle:"solid", borderWidth: bw as number | string, opacity: 0.5,
        top:t==="auto"?undefined:8, left:l==="auto"?undefined:8,
        bottom:b==="auto"?undefined:8, right:r==="auto"?undefined:8,
      }}/>
    ))}
  </>
);

const Section = ({ title, icon: Icon, children }: { title: string, icon: React.ElementType, children: React.ReactNode }) => (
  <div style={{ background: T.panel, border: `1px solid ${T.border2}`, padding: "2rem", position: "relative", marginBottom: "1.5rem" }}>
    <Corners />
    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem", marginBottom: "1.5rem" }}>
      <Icon size={18} color={T.g2} />
      <div style={{ fontFamily: T.display, fontSize: "1.2rem", fontWeight: 700, color: "#fff" }}>{title}</div>
    </div>
    {children}
  </div>
);

const Input = ({ label, placeholder }: { label: string, placeholder?: string }) => (
  <div style={{ marginBottom: "1rem" }}>
    <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted2, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>{label}</label>
    <input type="text" placeholder={placeholder} style={{
      width: "100%", background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`,
      color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "0.8rem", outline: "none"
    }} />
  </div>
);

export default function CreateICPPage() {
  return (
    <div style={{ padding: "2rem", maxWidth: 1000, margin: "0 auto", display: "flex", gap: "2rem" }}>
      
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "1rem" }}>
            <Target color={T.g2} size={32} /> Create ICP
          </h1>
          <p style={{ fontFamily: T.mono, fontSize: "0.9rem", color: T.g2, letterSpacing: "0.05em" }}>
            <Link href="/sales/icp" style={{ color: T.muted2, textDecoration: "none" }}>ICP</Link> <span style={{ color: T.muted2 }}>/</span> Create
          </p>
        </div>

        <Section title="Company" icon={Building}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input label="Industries" placeholder="SaaS, FinTech, E-commerce..." />
            <Input label="Employee Range" placeholder="50-500" />
            <Input label="Geography" placeholder="North America, UK..." />
            <Input label="Technology Stack" placeholder="React, AWS, Salesforce..." />
            <div style={{ gridColumn: "span 2" }}>
              <Input label="Keywords" placeholder="B2B, Enterprise, Series B..." />
            </div>
          </div>
        </Section>

        <Section title="Persona" icon={User}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ gridColumn: "span 2" }}>
              <Input label="Job Titles" placeholder="CTO, VP of Engineering..." />
            </div>
            <Input label="Seniority" placeholder="Director, VP, C-Level" />
            <Input label="Departments" placeholder="Engineering, Product..." />
          </div>
        </Section>

        <Section title="Disqualifiers" icon={ShieldX}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <Input label="Competitors" placeholder="Company A, Company B..." />
            <Input label="Existing Customers" placeholder="example.com, acme.com..." />
            <Input label="Blocked Geography" placeholder="EMEA, APAC..." />
            <Input label="Employee Range" placeholder="1-10 (Too small)" />
          </div>
        </Section>

        <Section title="Value Proposition" icon={Briefcase}>
          <div style={{ marginBottom: "1rem" }}>
            <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.muted2, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Proof Points & Case Studies</label>
            <textarea placeholder="We helped Company X scale 300%..." style={{
              width: "100%", height: 100, background: "rgba(0,207,255,0.03)", border: `1px solid ${T.border2}`,
              color: T.text, fontFamily: T.mono, fontSize: "0.85rem", padding: "1rem", outline: "none", resize: "none"
            }} />
          </div>
        </Section>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
          <button style={{ 
            background: T.g2, border: "none", padding: "0.8rem 2rem", color: T.bg, 
            fontFamily: T.mono, fontSize: "0.8rem", fontWeight: "bold", textTransform: "uppercase",
            cursor: "pointer", boxShadow: T.glow2, clipPath: "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)"
          }}>
            SAVE ICP
          </button>
        </div>
      </div>

      {/* AI Assistant Sidebar */}
      <div style={{ width: 340 }}>
        <div style={{ background: "rgba(0,207,255,0.05)", border: `1px solid ${T.g2}`, padding: "2rem", position: "sticky", top: "100px", boxShadow: T.glow2 }}>
          <Corners />
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
            <Sparkles size={20} color={T.g2} />
            <div style={{ fontFamily: T.display, fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>AI Auto-Generate</div>
          </div>
          
          <p style={{ fontFamily: T.body, fontSize: "0.9rem", color: T.text, lineHeight: 1.5, marginBottom: "1.5rem" }}>
            Let AI build your ICP based on your website and best customers.
          </p>

          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.g2, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>Your Website</label>
            <input type="text" placeholder="https://..." style={{ width: "100%", background: T.panel, border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.8rem", padding: "0.6rem", outline: "none" }} />
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <label style={{ fontFamily:T.mono, fontSize:"0.65rem", letterSpacing:"0.12em", color:T.g2, marginBottom:"0.4rem", display:"block", textTransform:"uppercase" }}>3 Best Customer Domains</label>
            <textarea placeholder="customer1.com&#10;customer2.com&#10;customer3.com" style={{ width: "100%", height: 80, background: T.panel, border: `1px solid ${T.border2}`, color: T.text, fontFamily: T.mono, fontSize: "0.8rem", padding: "0.6rem", outline: "none", resize: "none" }} />
          </div>

          <button style={{ 
            width: "100%", background: "transparent", border: `1px solid ${T.g2}`, color: T.g2,
            fontFamily: T.mono, fontSize: "0.75rem", fontWeight: "bold", textTransform: "uppercase",
            padding: "0.8rem", cursor: "pointer", transition: "all 0.2s"
          }} onMouseEnter={e => e.currentTarget.style.background="rgba(0,207,255,0.1)"} onMouseLeave={e => e.currentTarget.style.background="transparent"}>
            GENERATE ICP WITH AI
          </button>
        </div>
      </div>

    </div>
  );
}
