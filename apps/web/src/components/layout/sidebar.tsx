"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Inbox,
  Database,
  MessageSquare,
  LineChart,
  Settings,
  Bot,
  Search,
  Users,
  Activity,
  FileText,
  Send,
  Mail,
  Briefcase,
  Puzzle,
  PieChart,
  LogOut,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  User,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useUserContext } from "@/contexts/UserContext";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g: "#00ff88",
  g2: "#00cfff",
  bg: "#040810",
  bg2: "#070e1a",
  panel: "#0a1628",
  border: "rgba(0,255,136,0.18)",
  muted: "rgba(0,255,136,0.45)",
  text: "#c8ffe8",
  glow: "0 0 20px rgba(0,255,136,0.35),0 0 60px rgba(0,255,136,0.12)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
};

const navigation = [
  {
    title: "CUSTOMER SUPPORT",
    key: "customer-support",
    items: [
      {
        label: "Overview",
        path: "/customer-support/overview",
        icon: LayoutDashboard,
      },
      { label: "Inbox", path: "/customer-support/inbox", icon: Inbox },
      {
        label: "Conversations",
        path: "/customer-support/conversations",
        icon: MessageSquare,
      },
      {
        label: "Knowledge",
        path: "/customer-support/knowledge",
        icon: Database,
      },
      {
        label: "Knowledge Gaps",
        path: "/customer-support/knowledge-gaps",
        icon: AlertTriangle,
      },
      {
        label: "Analytics",
        path: "/customer-support/analytics",
        icon: LineChart,
      },
      { label: "AI Agent", path: "/customer-support/widget", icon: Bot },
    ],
  },
  {
    title: "SALES ASSISTANT",
    key: "sales-assistant",
    items: [
      {
        label: "Overview",
        path: "/sales-assistant/overview",
        icon: LayoutDashboard,
      },
      { label: "ICP", path: "/sales-assistant/icp", icon: TargetIcon },
      {
        label: "Lead Discovery",
        path: "/sales-assistant/lead-discovery",
        icon: Search,
      },
      { label: "Leads", path: "/sales-assistant/leads", icon: Users },
      { label: "Sequences", path: "/sales-assistant/sequences", icon: Send },
      { label: "Mailboxes", path: "/sales-assistant/mailboxes", icon: Mail },
      {
        label: "Analytics",
        path: "/sales-assistant/analytics",
        icon: PieChart,
      },
    ],
  },
  {
    title: "DRAFTS",
    key: "drafts",
    items: [{ label: "Drafts Workspace", path: "/drafts", icon: FileText }],
  },
  {
    title: "RESEARCH",
    key: "research",
    items: [
      { label: "Research Workspace", path: "/research", icon: Search },
      { label: "Research History", path: "/research/history", icon: FileText },
    ],
  },
  {
    title: "PLATFORM",
    key: "platform",
    items: [
      { label: "Integrations", path: "/platform/integrations", icon: Puzzle },
      { label: "Team", path: "/platform/team", icon: Users },
      { label: "Usage", path: "/platform/usage", icon: Activity },
      { label: "Billing", path: "/platform/billing", icon: Briefcase },
    ],
  },
];

function TargetIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

export function Sidebar({
  mobileMenuOpen,
  setMobileMenuOpen,
}: {
  mobileMenuOpen?: boolean;
  setMobileMenuOpen?: (open: boolean) => void;
}) {
  const pathname = usePathname();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {},
  );
  const { user, hasRole } = useUserContext();

  useEffect(() => {
    // Automatically expand groups that contain the active path
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setExpandedGroups((prev) => {
      const autoExpand = { ...prev };
      let changed = false;
      navigation.forEach((group) => {
        const isActiveGroup = group.items.some((item) =>
          pathname.startsWith(item.path),
        );
        if (isActiveGroup && !autoExpand[group.key]) {
          autoExpand[group.key] = true;
          changed = true;
        }
      });
      return changed ? autoExpand : prev;
    });
  }, [pathname]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(path + "/");
  };

  return (
    <aside
      className={`
        fixed inset-y-0 left-0 z-50 w-[260px] flex-shrink-0 flex flex-col h-full 
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}
      style={{ background: T.panel, borderRight: `1px solid ${T.border}` }}
    >
      {/* Logo */}
      <div
        style={{
          height: 80,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 1.5rem",
          borderBottom: `1px solid ${T.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
          <div
            style={{
              width: 32,
              height: 32,
              background: "rgba(0,255,136,0.1)",
              border: `1px solid ${T.g}`,
              borderRadius: 4,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: T.glow,
            }}
          >
            <Bot size={18} color={T.g} />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: T.display,
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "0.05em",
              }}
            >
              AI<span style={{ color: T.g }}>WORKFORCE</span>
            </span>
            <span
              style={{
                fontFamily: T.mono,
                fontSize: "0.6rem",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: T.g,
              }}
            >
              Enterprise Hub
            </span>
          </div>
        </div>
      </div>

      {/* Nav Menu */}
      <nav
        style={{
          flex: 1,
          padding: "1rem 0",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {navigation
          .filter((group) => {
            if (
              group.key === "customer-support" &&
              !hasRole("owner", "admin", "support_lead", "support_agent")
            )
              return false;
            if (
              group.key === "sales-assistant" &&
              !hasRole("owner", "admin", "sales_lead", "sales_rep")
            )
              return false;
            if (group.key === "platform" && !hasRole("owner", "admin"))
              return false;
            return true;
          })
          .map((group) => {
            const isExpanded = expandedGroups[group.key] || false;
            return (
              <div key={group.key} style={{ marginBottom: "0.8rem" }}>
                <div
                  onClick={() => toggleGroup(group.key)}
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    letterSpacing: "0.1em",
                    color: isExpanded ? T.text : T.muted,
                    padding: "0.5rem 1.5rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    cursor: "pointer",
                    textTransform: "uppercase",
                    transition: "color 0.2s",
                  }}
                >
                  {group.title}
                  {isExpanded ? (
                    <ChevronDown size={14} />
                  ) : (
                    <ChevronRight size={14} />
                  )}
                </div>

                <div
                  style={{
                    overflow: "hidden",
                    transition: "max-height 0.3s ease-in-out",
                    maxHeight: isExpanded ? "1000px" : "0px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.1rem",
                    padding: isExpanded ? "0.2rem 0" : "0",
                  }}
                >
                  {group.items.map(({ path, label, icon: Icon }) => (
                    <NavItem
                      key={path}
                      href={path}
                      label={label}
                      icon={Icon}
                      active={isActive(path)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
      </nav>

      {/* User Profile / Logout */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          background: "rgba(0,255,136,0.02)",
        }}
      >
        <div style={{ padding: "1.5rem" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem",
              background: "rgba(0,255,136,0.05)",
              border: `1px solid ${T.border}`,
              borderRadius: "4px",
            }}
          >
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 2,
                background: T.g,
                color: T.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: T.mono,
                fontWeight: "bold",
                fontSize: "0.8rem",
              }}
            >
              {user?.fullName
                ? user.fullName
                    .split(" ")
                    .map((n: string) => n[0])
                    .join("")
                    .substring(0, 2)
                    .toUpperCase()
                : "U"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: "0.9rem",
                  color: "#fff",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {user?.fullName || "Unknown User"}
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.muted,
                  textTransform: "uppercase",
                }}
              >
                {user
                  ? user.roles && user.roles.length > 0
                    ? user.roles[0].replace("_", " ").toUpperCase()
                    : "VIEWER"
                  : "LOADING..."}
              </div>
            </div>
          </div>

          <Link
            href="/"
            style={{
              textDecoration: "none",
              display: "block",
              marginTop: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
                cursor: "pointer",
                color: "#ff3355",
                transition: "opacity 0.2s",
              }}
            >
              <LogOut size={16} />
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                Log out
              </span>
            </div>
          </Link>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      href={href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.8rem",
        padding: "0.6rem 1.5rem",
        textDecoration: "none",
        fontFamily: T.mono,
        fontSize: "0.78rem",
        letterSpacing: "0.05em",
        background: active
          ? "rgba(0,255,136,0.1)"
          : hov
            ? "rgba(255,255,255,0.03)"
            : "transparent",
        color: active ? T.g : hov ? "#fff" : T.muted,
        borderLeft: active ? `3px solid ${T.g}` : `3px solid transparent`,
        boxShadow: active ? `inset 20px 0 20px -20px ${T.g}` : "none",
        transition: "all 0.2s",
      }}
    >
      <Icon size={16} />
      <span style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        {active && (
          <span
            style={{
              display: "inline-block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: T.g,
            }}
          />
        )}
        {label}
      </span>
    </Link>
  );
}
