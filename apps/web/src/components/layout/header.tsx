'use client';

import { Search, Bell, Terminal, User, Settings, LogOut, HelpCircle, Menu } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useUserContext } from '@/contexts/UserContext';
import Link from "next/link";

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
  border2: "rgba(0,207,255,0.18)",
  muted:   "rgba(0,255,136,0.45)",
  muted2:  "rgba(0,207,255,0.45)",
  text:    "#c8ffe8",
  glow:    "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
  mono:    "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body:    "'Rajdhani', sans-serif",
  warn:    "#ffaa00",
  red:     "#ff3355",
};

export function Header({ setMobileMenuOpen }: { setMobileMenuOpen?: (open: boolean) => void }) {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname === '/dashboard') return 'DASHBOARD';
    
    // Customer Support pages
    if (pathname.includes('/customer-support/overview')) return 'SUPPORT_OVERVIEW';
    if (pathname.includes('/customer-support/inbox')) return 'SUPPORT_INBOX';
    if (pathname.includes('/customer-support/knowledge-gaps')) return 'KNOWLEDGE_GAPS';
    if (pathname.includes('/customer-support/knowledge')) return 'KNOWLEDGE_BASE';
    if (pathname.includes('/customer-support/conversations')) return 'CONVERSATION_LOGS';
    if (pathname.includes('/customer-support/analytics')) return 'SUPPORT_ANALYTICS';
    if (pathname.includes('/customer-support/widget')) return 'WIDGET_CONFIG';
    
    // Sales Assistant pages
    if (pathname.includes('/sales-assistant/overview')) return 'SALES_OVERVIEW';
    if (pathname.includes('/sales-assistant/icp')) return 'ICP_CONFIGURATION';
    if (pathname.includes('/sales-assistant/lead-discovery')) return 'LEAD_DISCOVERY';
    if (pathname.includes('/sales-assistant/leads')) return 'LEADS_DATABASE';
    if (pathname.includes('/sales-assistant/research')) return 'RESEARCH_LOGS';
    if (pathname.includes('/sales-assistant/drafts')) return 'OUTREACH_DRAFTS';
    if (pathname.includes('/sales-assistant/sequences')) return 'SEQUENCES';
    if (pathname.includes('/sales-assistant/mailboxes')) return 'MAILBOXES';
    if (pathname.includes('/sales-assistant/analytics')) return 'SALES_ANALYTICS';

    // Platform
    if (pathname.includes('/platform/integrations')) return 'INTEGRATIONS';
    if (pathname.includes('/platform/team')) return 'TEAM_MANAGEMENT';
    if (pathname.includes('/platform/usage')) return 'PLATFORM_USAGE';
    if (pathname.includes('/platform/billing')) return 'BILLING';
    if (pathname.includes('/platform/settings')) return 'SYSTEM_SETTINGS';
    
    return 'MAIN_DASHBOARD';
  };

  const [searchFocused, setSearchFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUserContext();
  
  return (
    <header className="flex h-20 shrink-0 items-center justify-between px-4 md:px-8 bg-[rgba(10,22,40,0.6)] backdrop-blur-md z-10" style={{ borderBottom: `1px solid ${T.border}` }}>
      
      <div className="flex items-center gap-2 md:gap-4">
        {setMobileMenuOpen && (
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden text-[#00ff88] hover:bg-[rgba(0,255,136,0.1)] p-2 rounded transition-colors"
          >
            <Menu size={24} />
          </button>
        )}
        <div className="hidden sm:flex">
          <Terminal size={20} color={T.g} />
        </div>
        <h1 style={{ fontFamily: T.mono, fontSize: "1rem", letterSpacing: "0.1em", color: "#fff", textTransform: "uppercase" }} className="truncate max-w-[150px] sm:max-w-none">
          <span style={{ color: T.muted }} className="hidden sm:inline">~/</span>{getPageTitle()}<span style={{ display: "inline-block", width: 8, height: 16, background: T.g, marginLeft: 8, animation: "blink 1s step-end infinite" }} />
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {/* Search Bar */}
        <div className="hidden md:flex relative items-center">
          <Search size={16} color={searchFocused ? T.g : T.muted} style={{ position: "absolute", left: 12, transition: "color 0.2s" }} />
          <input 
            type="text" 
            placeholder="Search anything..." 
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            style={{
              padding: "0.6rem 1rem 0.6rem 2.5rem", width: 300,
              background: "rgba(0,255,136,0.03)", border: `1px solid ${searchFocused ? T.g : T.border}`,
              color: T.text, fontFamily: T.mono, fontSize: "0.8rem", outline: "none",
              boxShadow: searchFocused ? T.glow : "none", transition: "all 0.2s"
            }}
          />
        </div>

        {/* Global actions */}
        <div className="flex items-center gap-3 md:gap-5" style={{ color: T.muted }}>
          <div style={{ position: "relative", cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=T.g} onMouseLeave={e=>e.currentTarget.style.color=T.muted}>
            <Bell size={20} />
            <div style={{ position: "absolute", top: -2, right: -2, width: 8, height: 8, background: T.red, borderRadius: "50%", boxShadow: `0 0 10px ${T.red}` }} />
          </div>
          <HelpCircle size={20} style={{ cursor: "pointer", transition: "color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=T.g} onMouseLeave={e=>e.currentTarget.style.color=T.muted} />
          
          <div style={{ height: 24, width: 1, background: T.border, margin: "0 0.5rem" }} />

          <div style={{ position: "relative" }}>
            <div onClick={() => setMenuOpen(!menuOpen)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.4rem", transition: "all 0.2s", color: menuOpen ? T.g : T.text }} onMouseEnter={e=>e.currentTarget.style.color=T.g} onMouseLeave={e=>{if(!menuOpen) e.currentTarget.style.color=T.text}}>
              <span style={{ fontFamily: T.mono, fontSize: "0.85rem" }}>
                {(user as any)?.name ? (user as any).name.split(' ').map((n: string)=>n[0]).join('').substring(0,2).toUpperCase() : 'U'} ▼
              </span>
            </div>
            
            {menuOpen && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: "0.5rem", background: T.panel, border: `1px solid ${T.border}`, width: 200, boxShadow: T.glow, zIndex: 100 }}>
                <div style={{ padding: "0.8rem", borderBottom: `1px solid ${T.border}` }}>
                  <div style={{ fontFamily: T.body, fontSize: "0.9rem", color: "#fff" }}>{(user as any)?.name || "Loading..."}</div>
                  <div style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted }}>{(user as any)?.email || ""}</div>
                </div>
                <div style={{ padding: "0.5rem" }}>
                  <Link href="/platform/profile" style={{ textDecoration: 'none' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem", cursor: "pointer", fontFamily: T.mono, fontSize: "0.75rem", color: T.text, transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,136,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <User size={14} /> Profile
                    </div>
                  </Link>
                  <Link href="/platform/settings" style={{ textDecoration: 'none' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem", cursor: "pointer", fontFamily: T.mono, fontSize: "0.75rem", color: T.text, transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(0,255,136,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <Settings size={14} /> Settings
                    </div>
                  </Link>
                  <div style={{ borderTop: `1px solid ${T.border}`, margin: "0.5rem 0" }} />
                  <Link href="/" style={{ textDecoration: 'none' }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem", cursor: "pointer", fontFamily: T.mono, fontSize: "0.75rem", color: T.red, transition: "background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="rgba(255,51,85,0.1)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <LogOut size={14} /> Log out
                    </div>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
    </header>
  );
}
