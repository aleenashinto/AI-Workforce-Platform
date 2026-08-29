"use client";

import {
  Search,
  Bell,
  Terminal,
  User,
  Settings,
  LogOut,
  HelpCircle,
  Menu,
  Loader2,
  Sun,
  Moon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useUserContext } from "@/contexts/UserContext";
import { useTheme } from "next-themes";
import Link from "next/link";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  border2: "var(--t-border2)",
  muted: "var(--t-muted)",
  muted2: "rgba(0,207,255,0.45)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  mono: "var(--t-font-mono)",
  display: "var(--t-font-display)",
  body: "var(--t-font-body)",
  warn: "var(--t-warn)",
  red: "var(--t-red)",
};

export function Header({
  setMobileMenuOpen,
}: {
  setMobileMenuOpen?: (open: boolean) => void;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const pathname = usePathname();
  const router = useRouter();

  const getPageTitle = () => {
    if (pathname === "/dashboard") return "DASHBOARD";

    // Customer Support pages
    if (pathname.includes("/customer-support/overview"))
      return "SUPPORT_OVERVIEW";
    if (pathname.includes("/customer-support/inbox")) return "SUPPORT_INBOX";
    if (pathname.includes("/customer-support/knowledge-gaps"))
      return "KNOWLEDGE_GAPS";
    if (pathname.includes("/customer-support/knowledge"))
      return "KNOWLEDGE_BASE";
    if (pathname.includes("/customer-support/conversations"))
      return "CONVERSATION_LOGS";
    if (pathname.includes("/customer-support/analytics"))
      return "SUPPORT_ANALYTICS";
    if (pathname.includes("/customer-support/widget")) return "WIDGET_CONFIG";

    // Sales Assistant pages
    if (pathname.includes("/sales-assistant/overview")) return "SALES_OVERVIEW";
    if (pathname.includes("/sales-assistant/icp")) return "ICP_CONFIGURATION";
    if (pathname.includes("/sales-assistant/lead-discovery"))
      return "LEAD_DISCOVERY";
    if (pathname.includes("/sales-assistant/leads")) return "LEADS_DATABASE";
    if (pathname.includes("/sales-assistant/research")) return "RESEARCH_LOGS";
    if (pathname.includes("/drafts")) return "OUTREACH_DRAFTS";
    if (pathname.includes("/sales-assistant/sequences")) return "SEQUENCES";
    if (pathname.includes("/sales-assistant/mailboxes")) return "MAILBOXES";
    if (pathname.includes("/sales-assistant/analytics"))
      return "SALES_ANALYTICS";

    // Platform
    if (pathname.includes("/platform/integrations")) return "INTEGRATIONS";
    if (pathname.includes("/platform/team")) return "TEAM_MANAGEMENT";
    if (pathname.includes("/platform/usage")) return "PLATFORM_USAGE";
    if (pathname.includes("/platform/billing")) return "BILLING";
    if (pathname.includes("/platform/settings")) return "SYSTEM_SETTINGS";

    return "MAIN_DASHBOARD";
  };

  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useUserContext();

  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setSearchFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const delayDebounceFn = setTimeout(() => {
      setIsSearching(true);
      const getApiUrl = () => {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
        return url.replace(/\/+$/, "");
      };

      fetch(`${getApiUrl()}/search?q=${encodeURIComponent(searchQuery)}`, {
        credentials: "include",
      })
        .then((res) => res.json())
        .then((data) => {
          setSearchResults(data.results || []);
        })
        .catch((err) => {
          console.error("Search error:", err);
          setSearchResults([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Use fullName as defined in UserContext
  const fullName = user?.fullName || "";
  const initials = fullName
    ? fullName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "U";

  // Format avatar URL properly
  const getAvatarUrl = () => {
    if (!user?.avatarUrl) return null;
    if (
      user.avatarUrl.startsWith("data:") ||
      user.avatarUrl.startsWith("http")
    ) {
      return user.avatarUrl;
    }
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";
    return `${apiUrl.replace(/\/+$/, "")}${user.avatarUrl}`;
  };

  const avatarUrl = getAvatarUrl();

  return (
    <header
      className="flex h-20 shrink-0 items-center justify-between px-4 md:px-8 bg-[rgba(10,22,40,0.6)] backdrop-blur-md z-10"
      style={{ borderBottom: `1px solid ${T.border}` }}
    >
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
        <h1
          style={{
            fontFamily: T.mono,
            fontSize: "1rem",
            letterSpacing: "0.1em",
            color: "var(--t-heading)",
            textTransform: "uppercase",
          }}
          className="truncate max-w-[150px] sm:max-w-none"
        >
          <span style={{ color: T.muted }} className="hidden sm:inline">
            ~/
          </span>
          {getPageTitle()}
          <span
            style={{
              display: "inline-block",
              width: 8,
              height: 16,
              background: T.g,
              marginLeft: 8,
              animation: "blink 1s step-end infinite",
            }}
          />
        </h1>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        {/* Search Bar */}
        <div
          className="hidden md:flex relative items-center"
          ref={searchContainerRef}
        >
          <Search
            size={16}
            color={searchFocused ? T.g : T.muted}
            style={{ position: "absolute", left: 12, transition: "color 0.2s" }}
          />
          <input
            type="text"
            placeholder="Search anything..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            style={{
              padding: "0.6rem 1rem 0.6rem 2.5rem",
              width: 300,
              background: "rgba(0,255,136,0.03)",
              border: `1px solid ${searchFocused ? T.g : T.border}`,
              color: T.text,
              fontFamily: T.mono,
              fontSize: "0.8rem",
              outline: "none",
              boxShadow: searchFocused ? T.glow : "none",
              transition: "all 0.2s",
            }}
          />

          {/* Search Dropdown */}
          {searchFocused && searchQuery.trim().length > 0 && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 0,
                right: 0,
                marginTop: "0.5rem",
                background: T.panel,
          borderRadius: "var(--t-radius)",
                border: `1px solid ${T.border}`,
                boxShadow: T.glow,
                zIndex: 100,
                maxHeight: "400px",
                overflowY: "auto",
              }}
            >
              {isSearching ? (
                <div
                  style={{
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "center",
                    color: T.g,
                  }}
                >
                  <Loader2 size={16} className="animate-spin" />
                </div>
              ) : searchResults.length > 0 ? (
                <div style={{ padding: "0.5rem" }}>
                  <div
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.6rem",
                      color: T.muted,
                      textTransform: "uppercase",
                      marginBottom: "0.5rem",
                      padding: "0 0.5rem",
                    }}
                  >
                    Results
                  </div>
                  {searchResults.map((result: any, i: number) => (
                    <Link
                      href={result.url}
                      key={`${result.type}-${result.id}-${i}`}
                      style={{ textDecoration: "none" }}
                      onClick={() => setSearchFocused(false)}
                    >
                      <div
                        style={{
                          padding: "0.6rem 0.5rem",
                          cursor: "pointer",
                          borderBottom: `1px solid ${T.border}`,
                          transition: "background 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "rgba(0,255,136,0.1)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        <div
                          style={{
                            fontFamily: T.body,
                            fontSize: "0.9rem",
                            color: "var(--t-heading)",
                          }}
                        >
                          {result.title}
                        </div>
                        <div
                          style={{
                            fontFamily: T.mono,
                            fontSize: "0.7rem",
                            color: T.muted,
                          }}
                        >
                          <span style={{ color: T.g }}>[{result.type}]</span>{" "}
                          {result.subtitle}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div
                  style={{
                    padding: "1rem",
                    fontFamily: T.mono,
                    fontSize: "0.8rem",
                    color: T.muted,
                    textAlign: "center",
                  }}
                >
                  No results found for "{searchQuery}"
                </div>
              )}
            </div>
          )}
        </div>

        {/* Global actions */}
        <div
          className="flex items-center gap-3 md:gap-5"
          style={{ color: T.muted }}
        >
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              transition: "color 0.2s",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.g)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
          >
            <Bell size={20} />
            <div
              style={{
                position: "absolute",
                top: -2,
                right: -2,
                width: 8,
                height: 8,
                background: T.red,
                borderRadius: "50%",
                boxShadow: `0 0 10px ${T.red}`,
              }}
            />
          </div>
          <HelpCircle
            size={20}
            style={{ cursor: "pointer", transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = T.g)}
            onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
          />

          {mounted && (
            <div
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              style={{ cursor: "pointer", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.g)}
              onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
            </div>
          )}

          <div
            style={{
              height: 24,
              width: 1,
              background: T.border,
              margin: "0 0.5rem",
            }}
          />

          <div style={{ position: "relative" }}>
            <div
              onClick={() => setMenuOpen(!menuOpen)}
              style={{
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.4rem",
                transition: "all 0.2s",
                color: menuOpen ? T.g : T.text,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = T.g)}
              onMouseLeave={(e) => {
                if (!menuOpen) e.currentTarget.style.color = T.text;
              }}
            >
              {avatarUrl ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: `1px solid ${T.border}`,
                    }}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                      (
                        e.currentTarget.nextElementSibling as HTMLElement
                      ).style.display = "inline";
                    }}
                  />
                  <span
                    style={{
                      display: "none",
                      fontFamily: T.mono,
                      fontSize: "0.85rem",
                    }}
                  >
                    {initials}
                  </span>
                  <span style={{ fontFamily: T.mono, fontSize: "0.6rem" }}>
                    ▼
                  </span>
                </div>
              ) : (
                <span style={{ fontFamily: T.mono, fontSize: "0.85rem" }}>
                  {initials} ▼
                </span>
              )}
            </div>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  right: 0,
                  marginTop: "0.5rem",
                  background: T.panel,
          borderRadius: "var(--t-radius)",
                  border: `1px solid ${T.border}`,
                  width: 200,
                  boxShadow: T.glow,
                  zIndex: 100,
                }}
              >
                <div
                  style={{
                    padding: "0.8rem",
                    borderBottom: `1px solid ${T.border}`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: T.body,
                      fontSize: "0.9rem",
                      color: "var(--t-heading)",
                    }}
                  >
                    {fullName || user?.email || "Unknown User"}
                  </div>
                  <div
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.7rem",
                      color: T.muted,
                    }}
                  >
                    {user?.email || ""}
                  </div>
                </div>
                <div style={{ padding: "0.5rem" }}>
                  <Link
                    href="/platform/profile"
                    style={{ textDecoration: "none" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.6rem",
                        cursor: "pointer",
                        fontFamily: T.mono,
                        fontSize: "0.75rem",
                        color: T.text,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(0,255,136,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <User size={14} /> Profile
                    </div>
                  </Link>
                  <Link
                    href="/platform/settings"
                    style={{ textDecoration: "none" }}
                    onClick={() => setMenuOpen(false)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.6rem",
                        cursor: "pointer",
                        fontFamily: T.mono,
                        fontSize: "0.75rem",
                        color: T.text,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(0,255,136,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      <Settings size={14} /> Settings
                    </div>
                  </Link>
                  <div
                    style={{
                      borderTop: `1px solid ${T.border}`,
                      margin: "0.5rem 0",
                    }}
                  />
                  <Link href="/" style={{ textDecoration: "none" }}>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.6rem",
                        cursor: "pointer",
                        fontFamily: T.mono,
                        fontSize: "0.75rem",
                        color: T.red,
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          "rgba(255,51,85,0.1)")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
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
