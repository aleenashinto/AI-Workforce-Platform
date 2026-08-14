'use client';

import { 
  Settings, User, Building, Bot, Palette, Bell, Shield, Key, FileText
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const T = {
  g:       "#00ff88",
  bg:      "#040810",
  bg2:     "#070e1a",
  panel:   "#0a1628",
  border:  "rgba(0,255,136,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  text:    "#c8ffe8",
  glow:    "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
  mono:    "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body:    "'Rajdhani', sans-serif",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  const navGroups = [
    {
      title: "ACCOUNT",
      items: [
        { label: "Notifications", path: "/platform/settings/notifications", icon: Bell },
        { label: "Security", path: "/platform/settings/security", icon: Shield },
      ]
    },
    {
      title: "ORGANIZATION",
      items: [
        { label: "Organization", path: "/platform/settings/organization", icon: Building },
        { label: "Brand", path: "/platform/settings/brand", icon: Palette },
      ]
    },
    {
      title: "AI",
      items: [
        { label: "AI Settings", path: "/platform/settings/ai", icon: Bot },
      ]
    },
    {
      title: "DEVELOPER",
      items: [
        { label: "API Keys", path: "/platform/settings/api-keys", icon: Key },
        { label: "Audit Logs", path: "/platform/settings/audit-logs", icon: FileText },
      ]
    }
  ];

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: "3rem" }}>
      
      {/* Settings Navigation Sidebar */}
      <div style={{ width: 220, flexShrink: 0, position: "sticky", top: "2rem", alignSelf: "flex-start", height: "fit-content" }}>
        <h1 style={{ fontFamily: T.display, fontSize: "2.2rem", fontWeight: 700, color: "#fff", marginBottom: "2rem", display: "flex", alignItems: "center", gap: "1rem" }}>
          <Settings color={T.g} size={32} /> Settings
        </h1>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx}>
              <div style={{ fontFamily: T.mono, fontSize: "0.65rem", letterSpacing: "0.1em", color: T.muted, marginBottom: "0.8rem", textTransform: "uppercase" }}>
                {group.title}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                {group.items.map((nav, i) => {
                  const active = pathname === nav.path;
                  return (
                    <Link key={i} href={nav.path} style={{ textDecoration: 'none' }}>
                      <div style={{ 
                        display: "flex", alignItems: "center", gap: "0.8rem", 
                        padding: "0.6rem 1rem", 
                        background: active ? "rgba(0,255,136,0.1)" : "transparent", 
                        borderLeft: active ? `2px solid ${T.g}` : "2px solid transparent", 
                        cursor: "pointer", 
                        color: active ? T.g : T.text, 
                        fontFamily: T.mono, fontSize: "0.85rem",
                        transition: "all 0.2s"
                      }}>
                        <nav.icon size={16} /> {nav.label}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Settings Content */}
      <div style={{ flex: 1, paddingBottom: "4rem" }}>
        {children}
      </div>

    </div>
  );
}
