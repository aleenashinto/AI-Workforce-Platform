"use client";

import { useState, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  Search,
  Filter,
  MessageSquare,
  Clock,
  User,
  Reply,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { fetchApi } from "@/lib/api";

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
  warn: "#ffaa00",
  red: "#ff3355",
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

export default function ConversationPage({
  params,
}: {
  params: { id: string };
}) {
  const [activeTab, setActiveTab] = useState("open");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversations, setConversations] = useState<{
    unassigned: any[];
    assigned: any[];
  }>({ unassigned: [], assigned: [] });
  const [loadingList, setLoadingList] = useState(true);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversation, setConversation] = useState<any>(null);
  const [loadingConv, setLoadingConv] = useState(true);

  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchApi("/agent/conversations")
      .then((data) => {
        setConversations(data || { unassigned: [], assigned: [] });
        setLoadingList(false);
      })
      .catch((err) => {
        console.error("Failed to fetch conversations", err);
        setLoadingList(false);
      });
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoadingConv(true);
    fetchApi(`/agent/conversations/${params.id}`)
      .then((data) => {
        setConversation(data);
        setLoadingConv(false);
      })
      .catch((err) => {
        console.error("Failed to fetch conversation", err);
        setLoadingConv(false);
      });
  }, [params.id]);

  const getFilteredList = () => {
    const list =
      activeTab === "open" ? conversations.unassigned : conversations.assigned;
    return list.filter(
      (c) =>
        c.status === activeTab ||
        (activeTab === "open" &&
          c.status !== "resolved" &&
          c.status !== "escalated"),
    );
  };

  const list = getFilteredList();

  const handleStatusUpdate = async (status: string) => {
    try {
      const data = await fetchApi(`/agent/conversations/${params.id}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      if (data && data.success) {
        setConversation({ ...conversation, status });
        // Refresh list
        const refreshed = await fetchApi("/agent/conversations");
        setConversations(refreshed);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      // If AI is not paused yet, maybe pause it? The API assigns.
      // But let's just send the reply.
      const data = await fetchApi(`/agent/conversations/${params.id}/reply`, {
        method: "POST",
        body: JSON.stringify({ content: replyText }),
      });
      if (data && data.success) {
        setConversation({
          ...conversation,
          messages: [...(conversation.messages || []), data.message],
        });
        setReplyText("");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      style={{
        height: "calc(100vh - 80px)",
        display: "flex",
        overflow: "hidden",
      }}
    >
      {/* 1. Conversations List (Left Column) */}
      <div
        style={{
          width: 320,
          borderRight: `1px solid ${T.border}`,
          background: T.bg2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Filters Header */}
        <div
          style={{ padding: "1.5rem", borderBottom: `1px solid ${T.border}` }}
        >
          <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
            {["open", "escalated", "resolved"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  textTransform: "uppercase",
                  color: activeTab === t ? T.g : T.muted,
                  borderBottom:
                    activeTab === t
                      ? `2px solid ${T.g}`
                      : "2px solid transparent",
                  paddingBottom: "0.3rem",
                  transition: "all 0.2s",
                }}
              >
                {t}
              </button>
            ))}
          </div>

          <div style={{ position: "relative" }}>
            <Search
              size={14}
              color={T.muted}
              style={{ position: "absolute", left: 10, top: 10 }}
            />
            <input
              type="text"
              placeholder="Search by name, tag, ID..."
              style={{
                width: "100%",
                background: T.panel,
                border: `1px solid ${T.border}`,
                color: T.text,
                fontFamily: T.mono,
                fontSize: "0.75rem",
                padding: "0.5rem 1rem 0.5rem 2rem",
                outline: "none",
              }}
            />
          </div>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {loadingList ? (
            <div
              style={{
                padding: "2rem",
                textAlign: "center",
                color: T.muted,
                fontFamily: T.mono,
                fontSize: "0.8rem",
              }}
            >
              LOADING_CONVERSATIONS...
            </div>
          ) : (
            list.map((c) => (
              <Link
                key={c.id}
                href={`/support/conversations/${c.id}`}
                style={{ textDecoration: "none" }}
              >
                <div
                  style={{
                    padding: "1.2rem",
                    borderBottom: `1px solid ${T.border}`,
                    cursor: "pointer",
                    transition: "background 0.2s",
                    background:
                      c.id === params.id
                        ? "rgba(0,255,136,0.05)"
                        : "transparent",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(0,255,136,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      c.id === params.id
                        ? "rgba(0,255,136,0.05)"
                        : "transparent")
                  }
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span
                      style={{
                        fontFamily: T.body,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#fff",
                      }}
                    >
                      {c.external_id || "User"}
                    </span>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.7rem",
                        color: T.muted,
                      }}
                    >
                      {new Date(c.updated_at).toLocaleTimeString()}
                    </span>
                  </div>
                  <div
                    style={{
                      fontFamily: T.body,
                      fontSize: "0.85rem",
                      color: T.muted,
                      marginBottom: "0.8rem",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {c.status.toUpperCase()}
                  </div>
                  <div style={{ display: "flex", gap: "0.5rem" }}>
                    <span
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.6rem",
                        padding: "0.2rem 0.4rem",
                        background: "rgba(0,255,136,0.1)",
                        border: `1px solid ${T.border}`,
                        color: T.g,
                      }}
                    >
                      {c.channel}
                    </span>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* 2. Conversation View (Middle Column) */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          background: T.bg,
        }}
      >
        {loadingConv || !conversation ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: T.muted,
              fontFamily: T.mono,
            }}
          >
            LOADING_DATA...
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              style={{
                padding: "1.5rem",
                borderBottom: `1px solid ${T.border}`,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "1rem" }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: "rgba(0,255,136,0.1)",
                    border: `1px solid ${T.border}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <User size={20} color={T.g} />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: T.body,
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      color: "#fff",
                    }}
                  >
                    {conversation.external_id || "User"}
                  </div>
                  <div
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      color: T.muted,
                    }}
                  >
                    {conversation.id.slice(0, 8)}... • {conversation.channel} •{" "}
                    {conversation.status}
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() => handleStatusUpdate("escalated")}
                  style={{
                    background: "rgba(255,170,0,0.1)",
                    border: `1px solid rgba(255,170,0,0.5)`,
                    color: T.warn,
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  Escalate
                </button>
                <button
                  onClick={() => handleStatusUpdate("resolved")}
                  style={{
                    background: "transparent",
                    border: `1px solid ${T.border}`,
                    color: T.g,
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    padding: "0.5rem 1rem",
                    cursor: "pointer",
                    textTransform: "uppercase",
                  }}
                >
                  Resolve
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              style={{
                flex: 1,
                padding: "2rem",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {conversation.messages?.map((msg: any) =>
                msg.role === "user" ? (
                  <div
                    key={msg.id}
                    style={{ display: "flex", gap: "1rem", maxWidth: "80%" }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: T.panel,
                        border: `1px solid ${T.border}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <User size={16} color={T.muted} />
                    </div>
                    <div>
                      <div
                        style={{
                          fontFamily: T.mono,
                          fontSize: "0.7rem",
                          color: T.muted,
                          marginBottom: "0.3rem",
                          textTransform: "uppercase",
                        }}
                      >
                        {conversation.external_id || "USER"} •{" "}
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                      <div
                        style={{
                          background: T.panel,
                          border: `1px solid ${T.border}`,
                          padding: "1rem",
                          fontFamily: T.body,
                          fontSize: "0.95rem",
                          color: T.text,
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    key={msg.id}
                    style={{
                      display: "flex",
                      gap: "1rem",
                      maxWidth: "80%",
                      alignSelf: "flex-end",
                      flexDirection: "row-reverse",
                    }}
                  >
                    <div
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: "50%",
                        background: "rgba(0,255,136,0.1)",
                        border: `1px solid ${T.g}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                        boxShadow: T.glow,
                      }}
                    >
                      <MessageSquare size={16} color={T.g} />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-end",
                      }}
                    >
                      <div
                        style={{
                          fontFamily: T.mono,
                          fontSize: "0.7rem",
                          color: T.g,
                          marginBottom: "0.3rem",
                        }}
                      >
                        AI AGENT •{" "}
                        {new Date(msg.created_at).toLocaleTimeString()}
                      </div>
                      <div
                        style={{
                          background: "rgba(0,255,136,0.05)",
                          border: `1px solid ${T.border}`,
                          padding: "1rem",
                          fontFamily: T.body,
                          fontSize: "0.95rem",
                          color: "#fff",
                          lineHeight: 1.5,
                        }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ),
              )}
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: "1.5rem",
                borderTop: `1px solid ${T.border}`,
                background: T.bg2,
              }}
            >
              <div style={{ position: "relative" }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply or internal note..."
                  style={{
                    width: "100%",
                    height: 100,
                    background: T.panel,
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    fontFamily: T.mono,
                    fontSize: "0.85rem",
                    padding: "1rem",
                    outline: "none",
                    resize: "none",
                  }}
                />
                <Corners />
                <div
                  style={{
                    position: "absolute",
                    bottom: 12,
                    right: 12,
                    display: "flex",
                    gap: "0.5rem",
                  }}
                >
                  <button
                    style={{
                      background: "transparent",
                      border: `1px dashed ${T.border}`,
                      color: T.muted,
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      padding: "0.4rem 0.8rem",
                      cursor: "pointer",
                    }}
                  >
                    Internal Note
                  </button>
                  <button
                    onClick={handleSendReply}
                    disabled={sending}
                    style={{
                      background: T.g,
                      border: "none",
                      color: T.bg,
                      fontFamily: T.mono,
                      fontSize: "0.75rem",
                      fontWeight: "bold",
                      padding: "0.4rem 1.2rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      boxShadow: T.glow,
                      opacity: sending ? 0.5 : 1,
                    }}
                  >
                    <Reply size={14} />{" "}
                    {sending ? "SENDING..." : "Send Reply (Takeover)"}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* 3. Customer Info (Right Column) */}
      <div
        style={{
          width: 280,
          borderLeft: `1px solid ${T.border}`,
          background: T.panel,
          padding: "1.5rem",
          overflowY: "auto",
        }}
      >
        <div
          style={{
            fontFamily: T.mono,
            fontSize: "0.75rem",
            color: T.g,
            letterSpacing: "0.15em",
            marginBottom: "1.5rem",
            textTransform: "uppercase",
          }}
        >
          {"// CONV PROFILE"}
        </div>

        {loadingConv ? null : (
          <>
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.muted,
                  marginBottom: "0.3rem",
                }}
              >
                ID
              </div>
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: "0.95rem",
                  color: "#fff",
                }}
              >
                {conversation?.id?.slice(0, 8)}
              </div>
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.7rem",
                  color: T.muted,
                  marginBottom: "0.3rem",
                }}
              >
                CHANNEL
              </div>
              <div
                style={{
                  fontFamily: T.body,
                  fontSize: "0.95rem",
                  color: "#fff",
                  textTransform: "capitalize",
                }}
              >
                {conversation?.channel}
              </div>
            </div>

            <div
              style={{
                borderTop: `1px solid ${T.border}`,
                paddingTop: "1.5rem",
              }}
            >
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.g,
                  letterSpacing: "0.15em",
                  marginBottom: "1rem",
                  textTransform: "uppercase",
                }}
              >
                {"// AI SUMMARY"}
              </div>
              <p
                style={{
                  fontFamily: T.body,
                  fontSize: "0.85rem",
                  color: T.text,
                  lineHeight: 1.5,
                }}
              >
                {conversation?.summary || "No summary available."}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
