"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g: "var(--t-g)",
  g2: "var(--t-g2)",
  warn: "var(--t-warn)",
  red: "var(--t-red)",
  bg: "var(--t-bg)",
  bg2: "var(--t-bg2)",
  panel: "var(--t-panel)",
  border: "var(--t-border)",
  border2: "var(--t-border2)",
  muted: "var(--t-muted)",
  text: "var(--t-text)",
  glow: "var(--t-glow)",
  glow2: "var(--t-glow2)",
  mono: "'Share Tech Mono', monospace",
  display: "'Orbitron', sans-serif",
  body: "'Rajdhani', sans-serif",
};

/* ─────────────────────────────────────────────
   GLOBAL STYLES (injected once)
───────────────────────────────────────────── */
const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Rajdhani:wght@400;500;600;700&family=Orbitron:wght@400;600;700;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }

  body {
    font-family: ${T.body};
    background: ${T.bg};
    color: ${T.text};
    overflow-x: hidden;
    cursor: none;
  }

  /* Grid background */
  body::before {
    content: '';
    position: fixed; inset: 0; z-index: 0; pointer-events: none;
    background-image:
      linear-gradient(rgba(0,255,136,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0,255,136,0.04) 1px, transparent 1px);
    background-size: 60px 60px;
    animation: grid-shift 20s linear infinite;
  }
  @keyframes grid-shift { from { background-position: 0 0; } to { background-position: 60px 60px; } }

  /* Scanlines */
  body::after {
    content: '';
    position: fixed; inset: 0; z-index: 1; pointer-events: none;
    background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px);
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: ${T.bg2}; }
  ::-webkit-scrollbar-thumb { background: rgba(0,255,136,0.3); }

  @keyframes blink { 0%,100% { opacity:1; } 50% { opacity:0; } }
  @keyframes spin-pulse { 0%,100% { transform:scale(1); opacity:1; } 50% { transform:scale(0.5); opacity:0.4; } }
  @keyframes term-appear { to { opacity:1; } }
  @keyframes ring-expand {
    from { transform: translate(-50%,-50%) scale(0.8); opacity: 0.8; }
    to   { transform: translate(-50%,-50%) scale(1.4); opacity: 0; }
  }
  @keyframes fade-up { from { opacity:0; transform:translateY(22px); } to { opacity:1; transform:translateY(0); } }

  .reveal { opacity:0; transform:translateY(24px); transition: opacity 0.6s ease, transform 0.6s cubic-bezier(0.16,1,0.3,1); }
  .reveal.visible { opacity:1; transform:translateY(0); }

  .term-line { font-family:${T.mono}; font-size:0.75rem; line-height:1.8; color:rgba(200,255,232,0.7); opacity:0; animation:term-appear 0.01s ease forwards; }
  .term-line:nth-child(1)  { animation-delay:0.2s; }
  .term-line:nth-child(2)  { animation-delay:0.4s; }
  .term-line:nth-child(3)  { animation-delay:0.6s; }
  .term-line:nth-child(4)  { animation-delay:0.8s; }
  .term-line:nth-child(5)  { animation-delay:1.0s; }
  .term-line:nth-child(6)  { animation-delay:1.2s; }
  .term-line:nth-child(7)  { animation-delay:1.4s; }

  .cursor-ring {
    position:fixed; width:28px; height:28px;
    border:1.5px solid ${T.g}; border-radius:50%;
    pointer-events:none; z-index:9999;
    transform:translate(-50%,-50%);
    transition:width 0.15s, height 0.15s, border-color 0.15s;
    mix-blend-mode:screen;
  }
  .cursor-dot {
    position:fixed; width:5px; height:5px;
    background:${T.g}; border-radius:50%;
    pointer-events:none; z-index:9999;
    transform:translate(-50%,-50%);
    box-shadow:${T.glow};
  }

  .nav-link-custom::before { content:'// '; }
`;

/* ─────────────────────────────────────────────
   HOOKS
───────────────────────────────────────────── */
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const sibs = [
              ...(e.target.parentElement?.querySelectorAll(".reveal") || []),
            ];
            const idx = sibs.indexOf(e.target);
            setTimeout(
              () => e.target.classList.add("visible"),
              Math.max(0, idx) * 90,
            );
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.1 },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useCursor() {
  useEffect(() => {
    const ring = document.getElementById("cursor-ring");
    const dot = document.getElementById("cursor-dot");
    if (!ring || !dot) return;
    let mx = 0,
      my = 0,
      rx = 0,
      ry = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = mx + "px";
      dot.style.top = my + "px";
    };
    document.addEventListener("mousemove", onMove);
    let raf: number;
    const anim = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      ring.style.left = rx + "px";
      ring.style.top = ry + "px";
      raf = requestAnimationFrame(anim);
    };
    anim();
    const expand = () => {
      ring.style.width = "48px";
      ring.style.height = "48px";
      ring.style.borderColor = T.g2;
    };
    const shrink = () => {
      ring.style.width = "28px";
      ring.style.height = "28px";
      ring.style.borderColor = T.g;
    };
    const targets = document.querySelectorAll("button, a, [data-hover]");
    targets.forEach((el) => {
      el.addEventListener("mouseenter", expand);
      el.addEventListener("mouseleave", shrink);
    });
    return () => {
      document.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", expand);
        el.removeEventListener("mouseleave", shrink);
      });
    };
  }, []);
}

/* ─────────────────────────────────────────────
   SHARED STYLE HELPERS
───────────────────────────────────────────── */
const s = {
  secTag: {
    fontFamily: T.mono,
    fontSize: "0.68rem",
    letterSpacing: "0.15em",
    textTransform: "uppercase" as const,
    color: T.g,
    marginBottom: "0.8rem",
  },
  secH: {
    fontFamily: T.display,
    fontSize: "clamp(1.8rem,3vw,2.8rem)",
    fontWeight: 700,
    color: "#fff",
    lineHeight: 1.1,
    letterSpacing: "0.01em",
  },
  secSub: {
    fontSize: "0.95rem",
    color: "rgba(200,255,232,0.45)",
    lineHeight: 1.75,
    maxWidth: 500,
    marginTop: "0.8rem",
  },
};

const Corners = () => (
  <>
    {[
      ["tl", "1px 0 0 1px", "0", "0", "auto", "auto"],
      ["tr", "1px 1px 0 0", "0", "auto", "0", "auto"],
      ["bl", "0 0 1px 1px", "auto", "0", "auto", "0"],
      ["br", "0 1px 1px 0", "auto", "auto", "0", "0"],
    ].map(([k, bw, t, l, b, r]) => (
      <span
        key={k}
        style={{
          position: "absolute",
          width: 14,
          height: 14,
          borderColor: T.g,
          borderStyle: "solid",
          borderWidth: bw as string | number,
          opacity: 0.5,
          top: t === "auto" ? undefined : 8,
          left: l === "auto" ? undefined : 8,
          bottom: b === "auto" ? undefined : 8,
          right: r === "auto" ? undefined : 8,
        }}
      />
    ))}
  </>
);

const SectionHead = ({
  tag,
  h,
  sub,
  center,
}: {
  tag: string;
  h: React.ReactNode;
  sub?: string;
  center?: boolean;
}) => (
  <div className="reveal" style={center ? { textAlign: "center" } : {}}>
    <div style={s.secTag}>{tag}</div>
    <h2 style={s.secH}>{h}</h2>
    {sub && (
      <p
        style={{
          ...s.secSub,
          ...(center ? { marginInline: "auto", maxWidth: 620 } : {}),
        }}
      >
        {sub}
      </p>
    )}
  </div>
);

const ClipBtn = ({
  children,
  filled,
  style = {},
  onClick,
}: {
  children: React.ReactNode;
  filled?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      fontFamily: T.mono,
      fontSize: "0.8rem",
      letterSpacing: "0.1em",
      textTransform: "uppercase",
      cursor: "pointer",
      padding: "0.8rem 2rem",
      clipPath: "polygon(12px 0%,100% 0%,calc(100% - 12px) 100%,0% 100%)",
      border: filled ? "none" : `1px solid ${T.g2}`,
      background: filled ? T.g : "transparent",
      color: filled ? T.bg : T.g2,
      transition: "box-shadow 0.2s, transform 0.15s, background 0.2s",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      ...style,
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = "translateY(-2px)";
      e.currentTarget.style.boxShadow = filled ? T.glow : T.glow2;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = "";
      e.currentTarget.style.boxShadow = "";
    }}
  >
    {children}
  </button>
);

/* ─────────────────────────────────────────────
   NAVBAR
───────────────────────────────────────────── */
function Navbar({
  onLogin,
  
}: {
  onLogin: () => void;
  
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const links = [
    "support-agent",
    "sales-assistant",
    "how-it-works",
    "features",
    "pricing",
  ];
  return (
    <nav
      style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(4,8,16,0.85)",
        backdropFilter: "blur(12px)",
        borderBottom: `1px solid ${T.border}`,
        padding: "0.9rem 0",
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "flex",
          alignItems: "center",
          gap: "0.8rem",
        }}
      >
        <a
          href="#"
          style={{
            fontFamily: T.display,
            fontSize: "1.2rem",
            fontWeight: 700,
            color: T.text,
            letterSpacing: "0.05em",
            textDecoration: "none",
          }}
        >
          AI<span style={{ color: T.g, textShadow: T.glow }}>WORKFORCE</span>
        </a>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            marginLeft: "auto",
            marginRight: "0.8rem",
          }}
        >
          {links.map((l) => (
            <a
              key={l}
              href={`#${l}`}
              className="nav-link-custom"
              style={{
                fontFamily: T.mono,
                fontSize: "0.75rem",
                color: T.muted,
                letterSpacing: "0.08em",
                padding: "0.4rem 0.8rem",
                transition: "color 0.2s, text-shadow 0.2s",
                textDecoration: "none",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = T.g;
                e.currentTarget.style.textShadow = T.glow;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = T.muted;
                e.currentTarget.style.textShadow = "";
              }}
            >
              {l.replace(/-/g, " ").toUpperCase()}
            </a>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {mounted && (
              <div
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                style={{ cursor: "pointer", transition: "color 0.2s", color: T.muted }}
                onMouseEnter={(e) => (e.currentTarget.style.color = T.g)}
                onMouseLeave={(e) => (e.currentTarget.style.color = T.muted)}
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </div>
            )}
            
            <button
          onClick={onLogin}
          style={{
            fontFamily: T.mono,
            fontSize: "0.75rem",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: T.g2,
            background: "transparent",
            border: `1px solid ${T.border2}`,
            padding: "0.45rem 1.1rem",
            cursor: "pointer",
            transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = T.g2;
            e.currentTarget.style.background = "rgba(0,207,255,0.07)";
            e.currentTarget.style.boxShadow = T.glow2;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = T.border2;
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.boxShadow = "";
          }}
        >
          Login
          </button>
        </div>

      </div>
    </nav>
  );
}

/* ─────────────────────────────────────────────
   SECTIONS
───────────────────────────────────────────── */

function Hero({ onDeploy }: { onDeploy: () => void }) {
  return (
    <section
      id="hero"
      style={{ position: "relative", zIndex: 2, padding: "6rem 0 4rem" }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          alignItems: "center",
          gap: "4rem",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: "0.72rem",
              letterSpacing: "0.15em",
              color: T.g,
              marginBottom: "1rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: 8,
                height: 14,
                background: T.g,
                animation: "blink 1s step-end infinite",
                boxShadow: T.glow,
              }}
            />
            B2B GTM & SUPPORT // V2.0 LIVE
          </div>

          <h1
            style={{
              fontFamily: T.display,
              fontSize: "clamp(2.4rem,4.5vw,4.2rem)",
              fontWeight: 900,
              lineHeight: 1.05,
              color: "#fff",
            }}
          >
            Deploy AI Employees That <br />
            <span style={{ color: T.g, textShadow: T.glow }}>
              Never Hallucinate.
            </span>
          </h1>

          <p
            style={{
              fontSize: "1.05rem",
              color: "rgba(200,255,232,0.55)",
              lineHeight: 1.75,
              marginTop: "1.4rem",
              maxWidth: 500,
            }}
          >
            Turn your knowledge base into a 24/7 support agent and your CRM into
            a personalized outbound engine. Expert AI modules built for
            founders, revenue leaders, and support teams.
          </p>

          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginTop: "2.5rem",
              flexWrap: "wrap",
            }}
          >
            <ClipBtn filled onClick={onDeploy}>
              ▶ Deploy My AI Employees
            </ClipBtn>
            <ClipBtn
              onClick={() =>
                document.getElementById("how-it-works")?.scrollIntoView()
              }
            >
              ◈ How It Works
            </ClipBtn>
          </div>
        </div>

        <div className="reveal">
          <div
            style={{
              position: "relative",
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: `0 0 0 1px rgba(0,255,136,0.06), 0 40px 80px rgba(0,0,0,0.6), ${T.glow}`,
            }}
          >
            <Corners />
            <div
              style={{
                background: "rgba(0,255,136,0.06)",
                borderBottom: `1px solid ${T.border}`,
                padding: "0.65rem 1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <div style={{ display: "flex", gap: 5 }}>
                {["#ff5f57", "#ffbd2e", "#28c840"].map((c) => (
                  <span
                    key={c}
                    style={{
                      width: 9,
                      height: 9,
                      borderRadius: "50%",
                      background: c,
                      display: "inline-block",
                    }}
                  />
                ))}
              </div>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.68rem",
                  color: T.muted,
                  letterSpacing: "0.1em",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              >
                module_a@support ~ module_b@sales
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                height: "300px",
              }}
            >
              <div
                style={{
                  padding: "1rem",
                  borderRight: `1px solid ${T.border}`,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.6rem",
                    color: T.g,
                    marginBottom: "0.5rem",
                  }}
                >
                  {/* SUPPORT_AGENT */}
                </div>
                <div className="term-line">
                  <span style={{ color: "#fff" }}>User:</span> How do I
                  configure SSO?
                </div>
                <div className="term-line">
                  <span style={{ color: T.g }}>Agent:</span> You can configure
                  SAML SSO in the security settings panel.{" "}
                  <a href="#" style={{ color: T.g2 }}>
                    [1]
                  </a>{" "}
                  Note that Okta requires admin rights.{" "}
                  <a href="#" style={{ color: T.g2 }}>
                    [2]
                  </a>
                </div>
                <div className="term-line" style={{ marginTop: "1rem" }}>
                  <span style={{ color: T.muted, fontSize: "0.6rem" }}>
                    ↳ Citations Verified. Confidence: 99.8%
                  </span>
                </div>
              </div>
              <div style={{ padding: "1rem", overflow: "hidden" }}>
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.6rem",
                    color: T.g2,
                    marginBottom: "0.5rem",
                  }}
                >
                  {/* SALES_ASSISTANT */}
                </div>
                <div className="term-line">
                  <span style={{ color: "rgba(200,255,232,0.5)" }}>
                    Target:
                  </span>{" "}
                  Acme Corp
                </div>
                <div className="term-line">
                  <span style={{ color: "rgba(200,255,232,0.5)" }}>
                    Signal:
                  </span>{" "}
                  Raised Series B ($20M)
                </div>
                <div className="term-line">
                  <span style={{ color: "rgba(200,255,232,0.5)" }}>
                    Drafting:
                  </span>{" "}
                  Validating claims...
                </div>
                <div className="term-line">
                  <span style={{ color: T.g }}>Status:</span> Email ready. 0
                  spam words.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AISupportAgent() {
  const features = [
    [
      "Any Source, Any Format",
      "Ingests PDFs (even OCR), DOCX, URLs, Notion pages, and Zendesk articles natively.",
    ],
    [
      "Hybrid RAG Retrieval",
      "Insanely accurate retrieval using Vector Search + Keyword Matching + AI Reranking.",
    ],
    [
      "Grounded Citations",
      "Every answer is tethered to a specific source paragraph and linked for the user.",
    ],
    [
      "Smart Escalation",
      "Automatically hands off to a human agent when confidence dips below 60% or frustration is detected.",
    ],
  ];

  return (
    <section
      id="support-agent"
      style={{
        padding: "5rem 0",
        position: "relative",
        zIndex: 2,
        background: T.bg2,
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        <div className="reveal">
          <SectionHead
            tag="// MODULE A"
            h="AI Customer Support Agent"
            sub="The empathy and accuracy engine. Resolves repetitive tickets instantly while citing its sources, saving your human agents for complex issues."
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
              marginTop: "2rem",
            }}
          >
            {features.map(([title, desc], i) => (
              <div key={i} style={{ display: "flex", gap: "1rem" }}>
                <div style={{ color: T.g, marginTop: 2 }}>✓</div>
                <div>
                  <div
                    style={{
                      fontFamily: T.display,
                      fontSize: "1rem",
                      color: "#fff",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(200,255,232,0.45)",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div
          className="reveal"
          style={{
            background: T.panel,
            border: `1px solid ${T.border}`,
            padding: "2rem",
            borderRadius: 4,
            position: "relative",
          }}
        >
          <Corners />
          <div
            style={{
              borderBottom: `1px solid ${T.border}`,
              paddingBottom: "1rem",
              marginBottom: "1rem",
              fontFamily: T.mono,
              fontSize: "0.7rem",
              color: T.muted,
            }}
          >
            TICKET_RESOLUTION_DEMO.exe
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              padding: "1rem",
              borderRadius: 4,
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                color: "rgba(200,255,232,0.6)",
                marginBottom: "0.5rem",
              }}
            >
              Customer: Do you support custom SAML mapping?
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#fff",
                borderLeft: `2px solid ${T.g}`,
                paddingLeft: "0.8rem",
              }}
            >
              Yes. You can map custom IdP attributes to roles using the advanced
              SAML configuration panel.{" "}
              <span style={{ color: T.g, textDecoration: "underline" }}>
                [Source: Identity Docs v2]
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AISalesAssistant() {
  const features = [
    [
      "AI-Generated ICP",
      "Paste your website and best customers; the AI automatically builds a dense Ideal Customer Profile.",
    ],
    [
      "Signal-Based Research",
      "Autonomous web research finding trigger signals (Funding, Hiring, News) with 100% URL coverage.",
    ],
    [
      "Validated Drafting",
      "Generates 2 variants per lead. AI self-checks for spam words, length, and unsupported claims before approval.",
    ],
    [
      "Deliverability Engine",
      "Built-in mailbox warmup, SPF/DKIM checks, randomized pacing, and auto-pausing on replies.",
    ],
  ];

  return (
    <section
      id="sales-assistant"
      style={{ padding: "5rem 0", position: "relative", zIndex: 2 }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "4rem",
          alignItems: "center",
        }}
      >
        <div
          className="reveal"
          style={{
            background: T.panel,
            border: `1px solid ${T.border2}`,
            padding: "2rem",
            borderRadius: 4,
            position: "relative",
            order: -1,
          }}
        >
          <Corners />
          <div
            style={{
              borderBottom: `1px solid ${T.border2}`,
              paddingBottom: "1rem",
              marginBottom: "1rem",
              fontFamily: T.mono,
              fontSize: "0.7rem",
              color: "rgba(0,207,255,0.45)",
            }}
          >
            OUTBOUND_ENGINE_DEMO.exe
          </div>
          <div
            style={{
              background: "rgba(0,0,0,0.3)",
              padding: "1rem",
              borderRadius: 4,
              marginBottom: "1rem",
            }}
          >
            <div
              style={{
                fontSize: "0.8rem",
                color: "rgba(200,255,232,0.6)",
                marginBottom: "0.5rem",
              }}
            >
              Target: Acme Corp | Signal: Q3 Expansion
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "#fff",
                borderLeft: `2px solid ${T.g2}`,
                paddingLeft: "0.8rem",
              }}
            >
              Drafting Email...
              <br />
              <span style={{ color: T.g2 }}>Subject:</span> Scaling engineering
              post-Series B<br />
              <span style={{ color: T.muted }}>
                Body passes spam check. Length: 42 words. Claim verified via
                PRNewswire.
              </span>
            </div>
          </div>
        </div>

        <div className="reveal">
          <SectionHead
            tag="// MODULE B"
            h="AI Sales Assistant"
            sub="The precision and deliverability engine. Eliminates 70% of SDR research time by finding signals and drafting hyper-personalized, spam-checked outreach."
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.2rem",
              marginTop: "2rem",
            }}
          >
            {features.map(([title, desc], i) => (
              <div key={i} style={{ display: "flex", gap: "1rem" }}>
                <div style={{ color: T.g2, marginTop: 2 }}>✓</div>
                <div>
                  <div
                    style={{
                      fontFamily: T.display,
                      fontSize: "1rem",
                      color: "#fff",
                      marginBottom: "0.3rem",
                    }}
                  >
                    {title}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "rgba(200,255,232,0.45)",
                      lineHeight: 1.6,
                    }}
                  >
                    {desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section
      id="how-it-works"
      style={{
        padding: "5rem 0",
        background: T.bg2,
        borderTop: `1px solid ${T.border}`,
        borderBottom: `1px solid ${T.border}`,
        position: "relative",
        zIndex: 2,
      }}
    >
      <div
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 1.5rem",
          textAlign: "center",
        }}
      >
        <SectionHead
          center
          tag="// CORE PHILOSOPHY"
          h="How It Works"
          sub="Existing AI tools are black boxes that hallucinate facts, damage brand reputation, and get cold emails flagged as spam. Our engines are different."
        />

        <p
          style={{
            fontSize: "1rem",
            color: "rgba(200,255,232,0.6)",
            lineHeight: 1.8,
            marginTop: "2rem",
          }}
        >
          Introducing the <strong>Citation Vault</strong> for Support and the{" "}
          <strong>Source-Validated</strong> method for Sales. Every single claim
          made by our AI employees is mathematically tethered to a verifiable
          source paragraph or a real-time web URL. If there is no source, there
          is no signal. Dramatically reduce legal, compliance, and reputational
          risk.
        </p>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section
      id="features"
      style={{ padding: "5rem 0", position: "relative", zIndex: 2 }}
    >
      <div
        style={{
          maxWidth: 1000,
          margin: "0 auto",
          padding: "0 1.5rem",
          textAlign: "center",
        }}
      >
        <SectionHead
          center
          tag="// INFRASTRUCTURE"
          h="Features"
          sub="A complete deliverability and compliance guarantee built natively into the platform."
        />

        <div
          className="reveal"
          style={{
            marginTop: "3rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          {[
            "Warmup Engine",
            "→",
            "Pacing Algorithm",
            "→",
            "Domain Health Monitor",
            "→",
            "Primary Inbox",
          ].map((step, i) => (
            <span
              key={i}
              style={{
                fontFamily: T.mono,
                fontSize: step === "→" ? "1.5rem" : "0.8rem",
                color: step === "→" ? T.g2 : T.bg,
                background: step === "→" ? "transparent" : T.g,
                padding: step === "→" ? "0" : "0.8rem 1.2rem",
                borderRadius: step === "→" ? 0 : 2,
              }}
            >
              {step}
            </span>
          ))}
        </div>

        <div
          className="reveal"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2rem",
            marginTop: "4rem",
          }}
        >
          <div
            style={{
              border: `1px solid ${T.border}`,
              padding: "2rem",
              background: T.panel,
            }}
          >
            <h4
              style={{
                fontFamily: T.display,
                color: "#fff",
                marginBottom: "0.5rem",
              }}
            >
              Global Compliance
            </h4>
            <p style={{ fontSize: "0.85rem", color: T.muted }}>
              Fully ready for GDPR, CAN-SPAM, and CASL outbound regulations.
            </p>
          </div>
          <div
            style={{
              border: `1px solid ${T.border}`,
              padding: "2rem",
              background: T.panel,
            }}
          >
            <h4
              style={{
                fontFamily: T.display,
                color: "#fff",
                marginBottom: "0.5rem",
              }}
            >
              Universal Suppression
            </h4>
            <p style={{ fontSize: "0.85rem", color: T.muted }}>
              Auto-syncs with your CRM. We never cold-email your existing
              customers.
            </p>
          </div>
          <div
            style={{
              border: `1px solid ${T.border}`,
              padding: "2rem",
              background: T.panel,
            }}
          >
            <h4
              style={{
                fontFamily: T.display,
                color: "#fff",
                marginBottom: "0.5rem",
              }}
            >
              Deliverability Shields
            </h4>
            <p style={{ fontSize: "0.85rem", color: T.muted }}>
              Automated SPF, DKIM, and DMARC validations before a single email
              sends.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  {
    tier: "TIER-0",
    name: "Free",
    price: "0",
    period: "/ month",
    featured: false,
    features: [
      { t: "1 Seat", on: true },
      { t: "100 AI Support Messages / mo", on: true },
      { t: "25 Sales Leads / mo", on: true },
      { t: "Community Support", on: true },
      { t: "Custom Integrations", on: false },
    ],
    btn: "Start Free →",
    filled: false,
  },
  {
    tier: "TIER-1",
    name: "Starter",
    price: "299",
    period: "/ month",
    featured: true,
    features: [
      { t: "3 Seats", on: true },
      { t: "2,500 AI Support Messages / mo", on: true },
      { t: "500 Sales Leads / mo", on: true },
      { t: "Standard Support", on: true },
      { t: "Basic CRM Integrations", on: true },
    ],
    btn: "Deploy Starter",
    filled: true,
  },
  {
    tier: "TIER-2",
    name: "Growth",
    price: "899",
    period: "/ month",
    featured: false,
    features: [
      { t: "10 Seats", on: true },
      { t: "10,000 AI Support Messages / mo", on: true },
      { t: "2,500 Sales Leads / mo", on: true },
      { t: "Priority SLA Support", on: true },
      { t: "Advanced Custom Integrations", on: true },
    ],
    btn: "Contact Sales →",
    filled: false,
  },
];

function Pricing({ onDeploy }: { onDeploy: () => void }) {
  return (
    <section
      id="pricing"
      style={{
        padding: "5rem 0",
        background: T.bg2,
        borderTop: `1px solid ${T.border}`,
        position: "relative",
        zIndex: 2,
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.5rem" }}>
        <SectionHead
          center
          tag="// RESOURCE ALLOCATION"
          h="Transparent Pricing"
          sub="No credit card required for the first 100 messages and 25 leads."
        />
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3,1fr)",
            gap: "1.5rem",
            marginTop: "3rem",
          }}
        >
          {PLANS.map((p) => (
            <PriceCard key={p.name} plan={p} onClick={onDeploy} />
          ))}
        </div>
      </div>
    </section>
  );
}

function PriceCard({
  plan,
  onClick,
}: {
  plan: {
    tier: string;
    name: string;
    price: string;
    period: string;
    featured: boolean;
    features: { t: string; on: boolean }[];
    btn: string;
    filled: boolean;
  };
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <div
      className="reveal"
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: T.panel,
        padding: "2rem",
        position: "relative",
        overflow: "hidden",
        border: `1px solid ${plan.featured ? "rgba(0,255,136,0.5)" : T.border}`,
        boxShadow: plan.featured
          ? hov
            ? "0 0 60px rgba(0,255,136,0.2)"
            : "0 0 40px rgba(0,255,136,0.1), inset 0 0 40px rgba(0,255,136,0.03)"
          : "none",
        transform: hov ? "translateY(-6px)" : "",
        transition: "border-color 0.3s, transform 0.25s, box-shadow 0.25s",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 2,
          background: plan.featured
            ? `linear-gradient(90deg,${T.g},${T.g2})`
            : hov
              ? T.g
              : T.border,
          transition: "background 0.3s",
        }}
      />
      {plan.featured && (
        <span
          style={{
            position: "absolute",
            top: "1.2rem",
            right: "1.2rem",
            fontFamily: T.mono,
            fontSize: "0.6rem",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            background: "rgba(0,255,136,0.15)",
            color: T.g,
            border: `1px solid rgba(0,255,136,0.3)`,
            padding: "0.2rem 0.6rem",
          }}
        >
          ◈ MOST POPULAR
        </span>
      )}
      <div
        style={{
          fontFamily: T.mono,
          fontSize: "0.68rem",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: T.muted,
          marginBottom: "0.5rem",
        }}
      >
        {plan.tier}
      </div>
      <div
        style={{
          fontFamily: T.display,
          fontSize: "1.1rem",
          fontWeight: 700,
          color: "#fff",
          marginBottom: "1.2rem",
        }}
      >
        {plan.name}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.2rem",
          marginBottom: "0.3rem",
        }}
      >
        <span
          style={{
            fontFamily: T.mono,
            fontSize: "0.9rem",
            color: T.g,
            marginTop: "0.3rem",
          }}
        >
          $
        </span>
        <span
          style={{
            fontFamily: T.display,
            fontSize: "2.8rem",
            fontWeight: 900,
            color: T.g,
            textShadow: T.glow,
            lineHeight: 1,
          }}
        >
          {plan.price}
        </span>
      </div>
      <div
        style={{
          fontFamily: T.mono,
          fontSize: "0.68rem",
          color: "rgba(200,255,232,0.3)",
          marginTop: "0.8rem",
          marginBottom: "1.5rem",
          letterSpacing: "0.05em",
        }}
      >
        {plan.period}
      </div>
      <div
        style={{ height: 1, background: T.border, marginBottom: "1.5rem" }}
      />
      <ul style={{ listStyle: "none", marginBottom: "1.8rem" }}>
        {plan.features.map((f: { t: string; on: boolean }) => (
          <li
            key={f.t}
            style={{
              fontSize: "0.85rem",
              color: f.on ? "rgba(200,255,232,0.6)" : "rgba(200,255,232,0.2)",
              padding: "0.4rem 0",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              borderBottom: `1px solid rgba(0,255,136,0.05)`,
            }}
          >
            <span
              style={{
                fontFamily: T.mono,
                fontSize: "0.9rem",
                color: f.on ? T.g : "rgba(200,255,232,0.15)",
                flexShrink: 0,
              }}
            >
              ›
            </span>
            {f.t}
          </li>
        ))}
      </ul>
      <PriceBtn filled={plan.filled} onClick={onClick}>
        {plan.btn}
      </PriceBtn>
    </div>
  );
}

function PriceBtn({
  children,
  filled,
  onClick,
}: {
  children: React.ReactNode;
  filled?: boolean;
  onClick: () => void;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        fontFamily: T.mono,
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        padding: "0.75rem",
        cursor: "pointer",
        transition: "all 0.2s",
        ...(filled
          ? {
              color: hov ? "#fff" : T.bg,
              background: hov ? "#fff" : T.g,
              border: "none",
              clipPath: "polygon(8px 0%,100% 0%,calc(100% - 8px) 100%,0% 100%)",
              boxShadow: hov ? T.glow : "none",
            }
          : {
              color: T.g2,
              background: "transparent",
              border: `1px solid ${hov ? T.g2 : T.border2}`,
              boxShadow: hov ? T.glow2 : "none",
            }),
      }}
    >
      {children}
    </button>
  );
}

function CTA({ onDeploy }: { onDeploy: () => void }) {
  return (
    <section
      id="cta"
      style={{
        padding: "7rem 0",
        textAlign: "center",
        background: T.bg,
        borderTop: `1px solid ${T.border}`,
        position: "relative",
        overflow: "hidden",
        zIndex: 2,
      }}
    >
      {[700, 500].map((sz, i) => (
        <div
          key={sz}
          style={{
            position: "absolute",
            width: sz,
            height: sz,
            borderRadius: "50%",
            border: `1px solid rgba(0,255,136,${i ? 0.08 : 0.06})`,
            top: "50%",
            left: "50%",
            animation: `ring-expand 4s ${i ? "2s" : ""} linear infinite`,
            pointerEvents: "none",
          }}
        />
      ))}
      <div
        style={{
          position: "relative",
          zIndex: 2,
          maxWidth: 1200,
          margin: "0 auto",
          padding: "0 1.5rem",
        }}
      >
        <div className="reveal">
          <div style={s.secTag}>{/* INITIALIZE */}</div>
          <h2
            style={{
              ...s.secH,
              fontSize: "clamp(2rem,4vw,3.2rem)",
              textAlign: "center",
            }}
          >
            Deploy AI Employees That <br />
            <span style={{ color: T.g, textShadow: T.glow }}>
              Never Hallucinate.
            </span>
          </h2>
          <p
            style={{
              fontSize: "0.9rem",
              color: "rgba(200,255,232,0.35)",
              fontFamily: T.mono,
              letterSpacing: "0.05em",
              marginTop: "0.8rem",
              maxWidth: 440,
              marginInline: "auto",
            }}
          >
            Stop hallucinating. Start closing.
          </p>
          <button
            onClick={onDeploy}
            style={{
              fontFamily: T.mono,
              fontSize: "0.85rem",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: T.bg,
              background: T.g,
              border: "none",
              padding: "1rem 2.8rem",
              clipPath:
                "polygon(16px 0%,100% 0%,calc(100% - 16px) 100%,0% 100%)",
              cursor: "pointer",
              marginTop: "2.5rem",
              display: "inline-block",
              transition: "box-shadow 0.2s, transform 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = "0 0 40px rgba(0,255,136,0.5)";
              e.currentTarget.style.transform = "translateY(-3px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = "";
              e.currentTarget.style.transform = "";
            }}
          >
            ▶ Launch My Platform
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   HOME (ROOT)
───────────────────────────────────────────── */
export default function Home() {
  const router = useRouter();

  useReveal();
  useCursor();

  useEffect(() => {
    const id = "aipm-global-styles";
    if (!document.getElementById(id)) {
      const style = document.createElement("style");
      style.id = id;
      style.textContent = GLOBAL_CSS;
      document.head.appendChild(style);
    }
  }, []);

  const handleDeploy = () => {
    router.push("/login");
  };

  return (
    <>
      <div id="cursor-ring" className="cursor-ring" />
      <div id="cursor-dot" className="cursor-dot" />

      <Navbar
        onLogin={() => router.push("/login")}
        
      />

      <main>
        <Hero onDeploy={handleDeploy} />
        <AISupportAgent />
        <AISalesAssistant />
        <HowItWorks />
        <Features />
        <Pricing onDeploy={handleDeploy} />
        <CTA onDeploy={handleDeploy} />
      </main>

      <footer
        style={{
          background: T.bg2,
          borderTop: `1px solid ${T.border}`,
          padding: "2rem 0",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div
            style={{
              fontFamily: T.display,
              fontWeight: 700,
              fontSize: "0.95rem",
              color: T.text,
              letterSpacing: "0.1em",
              textShadow: T.glow,
            }}
          >
            AI<span style={{ color: T.g }}>WORKFORCE</span>
          </div>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: "0.65rem",
              color: "rgba(200,255,232,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            © 2026 AI WORKFORCE SYSTEMS // ALL RIGHTS RESERVED
          </div>
        </div>
      </footer>
    </>
  );
}

