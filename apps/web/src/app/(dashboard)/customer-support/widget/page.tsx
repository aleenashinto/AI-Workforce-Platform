"use client";

import {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Monitor,
  MessageSquare,
  Plus,
  Save,
} from "lucide-react";
import { API_BASE } from "@/lib/api";
import { useState, useEffect } from "react";

/* ─────────────────────────────────────────────
   DESIGN TOKENS
───────────────────────────────────────────── */
const T = {
  g: "#00ff88",
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          borderColor: T.g,
          borderStyle: "solid",
          borderWidth: bw as any,
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

export default function WidgetConfigPage() {
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  // Hardcode orgId for local testing matching the rest of the dashboard
  const currentOrgId = "00000000-0000-0000-0000-000000000001";

  useEffect(() => {
    fetch(`${API_BASE}/agent/widget-config`, {
      headers: { "x-org-id": currentOrgId },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.config) {
          if (data.config.brandColor) setBrandColor(data.config.brandColor);
          if (data.config.position) setPosition(data.config.position);
          if (data.config.launcherIcon)
            setLauncherIcon(data.config.launcherIcon);
          if (data.config.greeting) setGreeting(data.config.greeting);
          if (data.config.suggestedQuestions)
            setSuggestedQuestions(data.config.suggestedQuestions);
          if (data.config.primaryLanguage)
            setPrimaryLanguage(data.config.primaryLanguage);
          if (data.config.escalationBehavior)
            setEscalationBehavior(data.config.escalationBehavior);
        }
      })
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("Saving...");
    try {
      const res = await fetch(`${API_BASE}/agent/widget-config`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": currentOrgId,
        },
        body: JSON.stringify({
          brandColor,
          position,
          launcherIcon,
          greeting,
          suggestedQuestions,
          primaryLanguage,
          escalationBehavior,
        }),
      });
      if (res.ok) {
        setSaveStatus("Saved!");
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        setSaveStatus("Error saving");
      }
    } catch (e) {
      setSaveStatus("Error saving");
    } finally {
      setIsSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState("appearance");

  // Widget Configuration State
  const [brandColor, setBrandColor] = useState("#00ff88");
  const [position, setPosition] = useState("Bottom Right");
  const [launcherIcon, setLauncherIcon] = useState("Chat Bubble");
  const [greeting, setGreeting] = useState(
    "Hi there! How can I help you today?",
  );
  const [suggestedQuestions, setSuggestedQuestions] = useState(
    "Where is my order?\nHow do I get a refund?",
  );
  const [primaryLanguage, setPrimaryLanguage] = useState("English");
  const [escalationBehavior, setEscalationBehavior] = useState(
    "Transfer to Human Agent (Live)",
  );
  const [testMessages, setTestMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([{ role: "assistant", content: greeting }]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Sync greeting changes to the first message if it hasn't been modified heavily
  useEffect(() => {
    if (testMessages.length === 1 && testMessages[0].role === "assistant") {
      setTestMessages([{ role: "assistant", content: greeting }]);
    }
  }, [greeting]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isTyping) return;

    const newMsg = inputValue;
    setInputValue("");
    setTestMessages((prev) => [...prev, { role: "user", content: newMsg }]);
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      const mockResponse =
        "This is a test response from your AI Agent. In a real environment, this would search your Knowledge Base and provide a cited answer.";
      const words = mockResponse.split(" ");
      let currentIdx = 0;

      setTestMessages((prev) => [...prev, { role: "assistant", content: "" }]);

      const streamInterval = setInterval(() => {
        if (currentIdx < words.length) {
          setTestMessages((prev) => {
            const newArr = [...prev];
            const lastMsg = newArr[newArr.length - 1];
            lastMsg.content =
              lastMsg.content +
              (currentIdx === 0 ? "" : " ") +
              words[currentIdx];
            return newArr;
          });
          currentIdx++;
        } else {
          clearInterval(streamInterval);
          setIsTyping(false);
        }
      }, 50); // 50ms per word
    }, 500);
  };

  return (
    <div
      style={{
        padding: "2rem",
        maxWidth: 1400,
        margin: "0 auto",
        display: "flex",
        gap: "2rem",
      }}
    >
      {/* Settings Form */}
      <div style={{ flex: 1 }}>
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontFamily: T.display,
              fontSize: "2.2rem",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "0.5rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <Monitor color={T.g} size={32} /> Widget Config
          </h1>
          <p
            style={{
              fontFamily: T.mono,
              fontSize: "0.9rem",
              color: T.g,
              letterSpacing: "0.05em",
            }}
          >
            Customize the chat widget appearance and behavior.
          </p>
        </div>

        <div
          style={{
            background: T.panel,
            border: `1px solid ${T.border}`,
            padding: "2rem",
            position: "relative",
          }}
        >
          <Corners />

          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem",
              borderBottom: `1px solid ${T.border}`,
            }}
          >
            {["appearance", "greeting", "behavior"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  textTransform: "uppercase",
                  color: activeTab === t ? T.g : T.muted,
                  borderBottom:
                    activeTab === t
                      ? `2px solid ${T.g}`
                      : "2px solid transparent",
                  paddingBottom: "0.5rem",
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          {activeTab === "appearance" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: T.muted,
                    marginBottom: "0.4rem",
                    display: "block",
                    textTransform: "uppercase",
                  }}
                >
                  Brand Color
                </label>
                <div
                  style={{ display: "flex", gap: "1rem", alignItems: "center" }}
                >
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    style={{
                      width: 40,
                      height: 40,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  />
                  <input
                    type="text"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    style={{
                      flex: 1,
                      background: "rgba(0,255,136,0.03)",
                      border: `1px solid ${T.border}`,
                      color: T.text,
                      fontFamily: T.mono,
                      fontSize: "0.82rem",
                      padding: "0.7rem 1rem",
                      outline: "none",
                    }}
                  />
                </div>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      color: T.muted,
                      marginBottom: "0.4rem",
                      display: "block",
                      textTransform: "uppercase",
                    }}
                  >
                    Position
                  </label>
                  <select
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(0,255,136,0.03)",
                      border: `1px solid ${T.border}`,
                      color: T.text,
                      fontFamily: T.mono,
                      fontSize: "0.82rem",
                      padding: "0.7rem 1rem",
                      outline: "none",
                      appearance: "none",
                    }}
                  >
                    <option>Bottom Right</option>
                    <option>Bottom Left</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.65rem",
                      letterSpacing: "0.12em",
                      color: T.muted,
                      marginBottom: "0.4rem",
                      display: "block",
                      textTransform: "uppercase",
                    }}
                  >
                    Launcher Icon
                  </label>
                  <select
                    value={launcherIcon}
                    onChange={(e) => setLauncherIcon(e.target.value)}
                    style={{
                      width: "100%",
                      background: "rgba(0,255,136,0.03)",
                      border: `1px solid ${T.border}`,
                      color: T.text,
                      fontFamily: T.mono,
                      fontSize: "0.82rem",
                      padding: "0.7rem 1rem",
                      outline: "none",
                      appearance: "none",
                    }}
                  >
                    <option>Chat Bubble</option>
                    <option>Support Robot</option>
                    <option>Question Mark</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === "greeting" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: T.muted,
                    marginBottom: "0.4rem",
                    display: "block",
                    textTransform: "uppercase",
                  }}
                >
                  Initial Greeting
                </label>
                <textarea
                  value={greeting}
                  onChange={(e) => setGreeting(e.target.value)}
                  style={{
                    width: "100%",
                    height: 80,
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.82rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                    resize: "none",
                  }}
                />
              </div>
              <div>
                <label
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: T.muted,
                    marginBottom: "0.4rem",
                    display: "block",
                    textTransform: "uppercase",
                  }}
                >
                  Suggested Questions (One per line)
                </label>
                <textarea
                  value={suggestedQuestions}
                  onChange={(e) => setSuggestedQuestions(e.target.value)}
                  style={{
                    width: "100%",
                    height: 120,
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.82rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                    resize: "none",
                  }}
                />
              </div>
            </div>
          )}

          {activeTab === "behavior" && (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: T.muted,
                    marginBottom: "0.4rem",
                    display: "block",
                    textTransform: "uppercase",
                  }}
                >
                  Primary Language
                </label>
                <select
                  value={primaryLanguage}
                  onChange={(e) => setPrimaryLanguage(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.82rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                    appearance: "none",
                  }}
                >
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                  <option>German</option>
                  <option>Auto-detect</option>
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    letterSpacing: "0.12em",
                    color: T.muted,
                    marginBottom: "0.4rem",
                    display: "block",
                    textTransform: "uppercase",
                  }}
                >
                  Escalation Behavior
                </label>
                <select
                  value={escalationBehavior}
                  onChange={(e) => setEscalationBehavior(e.target.value)}
                  style={{
                    width: "100%",
                    background: "rgba(0,255,136,0.03)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.82rem",
                    padding: "0.7rem 1rem",
                    outline: "none",
                    appearance: "none",
                  }}
                >
                  <option>Transfer to Human Agent (Live)</option>
                  <option>Create Support Ticket (Email)</option>
                  <option>Apologize and End Chat</option>
                </select>
              </div>
            </div>
          )}

          <div
            style={{
              marginTop: "2.5rem",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              onClick={handleSave}
              disabled={isSaving}
              style={{
                background: T.g,
                border: "none",
                color: T.bg,
                fontFamily: T.mono,
                fontSize: "0.8rem",
                fontWeight: 700,
                textTransform: "uppercase",
                padding: "0.8rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                cursor: "pointer",
                boxShadow: T.glow,
                clipPath:
                  "polygon(10px 0%,100% 0%,calc(100% - 10px) 100%,0% 100%)",
              }}
            >
              <Save size={16} /> {isSaving ? "Saving..." : "Save Changes"}{" "}
              {saveStatus === "Saved!" && "✓"}
            </button>
          </div>
        </div>
      </div>

      {/* Live Preview */}
      <div style={{ width: 380, display: "flex", flexDirection: "column" }}>
        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.8rem",
            color: T.muted,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "1.5rem",
          }}
        >
          {"// Live Preview"}
        </div>

        <div
          style={{
            flex: 1,
            background: T.bg2,
            border: `1px solid ${T.border}`,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "1.5rem",
          }}
        >
          {/* Widget Mockup */}
          <div
            style={{
              background: T.panel,
              border: `1px solid ${T.border}`,
              borderRadius: 12,
              overflow: "hidden",
              boxShadow: `0 10px 40px ${brandColor}22`,
              display: "flex",
              flexDirection: "column",
              height: 400,
              alignSelf: position === "Bottom Left" ? "flex-start" : "flex-end",
              width: "100%",
            }}
          >
            {/* Header */}
            <div
              style={{
                background: brandColor,
                padding: "1rem",
                color: T.bg,
                display: "flex",
                alignItems: "center",
                gap: "0.8rem",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MessageSquare size={16} color={brandColor} />
              </div>
              <div>
                <div
                  style={{
                    fontFamily: T.display,
                    fontSize: "1rem",
                    fontWeight: 700,
                  }}
                >
                  Support Agent
                </div>
                <div
                  style={{
                    fontFamily: T.body,
                    fontSize: "0.75rem",
                    opacity: 0.8,
                  }}
                >
                  Usually replies instantly
                </div>
              </div>
            </div>

            {/* Chat area */}
            <div
              style={{
                flex: 1,
                background: T.bg2,
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                overflowY: "auto",
              }}
            >
              {testMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    background: msg.role === "assistant" ? T.panel : brandColor,
                    border:
                      msg.role === "assistant"
                        ? `1px solid ${T.border}`
                        : "none",
                    padding: "0.8rem",
                    borderRadius:
                      msg.role === "assistant"
                        ? "0 12px 12px 12px"
                        : "12px 0 12px 12px",
                    fontFamily: T.body,
                    fontSize: "0.9rem",
                    color: msg.role === "assistant" ? "#fff" : T.bg,
                    alignSelf:
                      msg.role === "assistant" ? "flex-start" : "flex-end",
                    maxWidth: "85%",
                  }}
                >
                  {msg.content}
                </div>
              ))}
              {isTyping && (
                <div
                  style={{
                    background: T.panel,
                    border: `1px solid ${T.border}`,
                    padding: "0.8rem",
                    borderRadius: "0 12px 12px 12px",
                    alignSelf: "flex-start",
                  }}
                >
                  <span
                    style={{
                      color: T.g,
                      fontFamily: T.mono,
                      fontSize: "1rem",
                      animation: "pulse 1.5s infinite",
                    }}
                  >
                    ...
                  </span>
                </div>
              )}

              {testMessages.length === 1 && !isTyping && (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                    marginTop: "auto",
                  }}
                >
                  {suggestedQuestions
                    .split("\n")
                    .filter((q) => q.trim())
                    .map((q, i) => (
                      <button
                        key={i}
                        onClick={() => setInputValue(q)}
                        style={{
                          background: "transparent",
                          border: `1px solid ${T.border}`,
                          padding: "0.6rem",
                          borderRadius: 20,
                          color: T.g,
                          fontFamily: T.mono,
                          fontSize: "0.7rem",
                          textAlign: "left",
                          cursor: "pointer",
                        }}
                      >
                        {q}
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* Input area */}
            <form
              onSubmit={handleSendMessage}
              style={{
                background: T.panel,
                borderTop: `1px solid ${T.border}`,
                padding: "0.8rem",
              }}
            >
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type a message..."
                style={{
                  width: "100%",
                  background: T.bg2,
                  border: `1px solid ${T.border}`,
                  borderRadius: 20,
                  padding: "0.6rem 1rem",
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.text,
                  outline: "none",
                }}
              />
            </form>
          </div>

          {/* Launcher */}
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: T.g,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              alignSelf: "flex-end",
              marginTop: "1.5rem",
              boxShadow: T.glow,
              cursor: "pointer",
            }}
          >
            <MessageSquare size={24} color={T.bg} />
          </div>
        </div>
      </div>
    </div>
  );
}
