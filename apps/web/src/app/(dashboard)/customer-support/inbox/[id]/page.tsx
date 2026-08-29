"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ShieldAlert,
  CheckCircle,
  Send,
  User,
  Bot,
  Sparkles,
  AlertTriangle,
  XCircle,
  ChevronDown,
  Plus,
  X,
  ArrowLeft,
  MoreVertical,
  RefreshCw,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { T } from "@/lib/theme";
import Link from "next/link";

export default function ConversationView() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [previousConvs, setPreviousConvs] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [replyText, setReplyText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const [showAssign, setShowAssign] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [showEscalate, setShowEscalate] = useState(false);
  const [showResolve, setShowResolve] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
    loadAgents();
    const interval = setInterval(loadConversation, 3000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadAgents = async () => {
    try {
      const data = await fetchApi("/agent/agents");
      if (data.success) {
        setAgents(data.agents);
      }
    } catch (e) {}
  };

  const loadConversation = async () => {
    try {
      const data = await fetchApi(`/agent/conversations/${id}`);
      setConversation(data);
      setMessages(data.messages || []);

      // Load previous conversations
      if (data.end_user?.id) {
        // Fetch all conversations to filter. In production, an endpoint should do this.
        const all = await fetchApi(`/agent/conversations?search=`);
        const customerConvs = (all.all || []).filter(
          (c: any) => c.visitor_id === data.end_user.id && c.id !== id,
        );
        setPreviousConvs(customerConvs);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (status: string) => {
    await fetchApi(`/agent/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
    setShowStatus(false);
    setShowResolve(false);
    setShowEscalate(false);
    loadConversation();
  };

  const handleAssign = async (agentId: string | null) => {
    if (!agentId) {
      // Unassign
      await fetchApi(`/agent/conversations/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ assigned_to: null, ai_paused: false }),
      });
    } else {
      await fetchApi(`/agent/conversations/${id}/assign`, {
        method: "POST",
        body: JSON.stringify({ agent_id: agentId }),
      });
    }
    setShowAssign(false);
    loadConversation();
  };

  const handleSend = async () => {
    if (!replyText.trim() || isSending) return;
    setIsSending(true);
    try {
      const res = await fetchApi(`/agent/conversations/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ content: replyText }),
      });
      if (res.success) {
        setMessages([...messages, res.message]);
        setReplyText("");
      }
    } catch (e) {
      console.error(e);
    }
    setIsSending(false);
  };

  const handleCopilot = async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const res = await fetchApi(`/agent/conversations/${id}/copilot`, {
        method: "POST",
      });
      if (res.success && res.suggestion) {
        setReplyText(res.suggestion);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  const handleAddTag = async (tag: string) => {
    const newTags = [...(conversation.tags || []), tag];
    await fetchApi(`/agent/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ tags: newTags }),
    });
    loadConversation();
  };

  const handleRemoveTag = async (tag: string) => {
    const newTags = (conversation.tags || []).filter((t: string) => t !== tag);
    await fetchApi(`/agent/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ tags: newTags }),
    });
    loadConversation();
  };

  if (loading && !conversation) {
    return (
      <div style={{ padding: "2rem", color: T.muted, fontFamily: T.mono }}>
        LOADING_CONVERSATION...
      </div>
    );
  }

  if (!conversation) {
    return (
      <div style={{ padding: "2rem", color: T.red, fontFamily: T.mono }}>
        <p>Conversation not found.</p>
        <Link
          href="/customer-support/inbox"
          style={{
            color: T.g,
            textDecoration: "underline",
            marginTop: "1rem",
            display: "inline-block",
          }}
        >
          Back to Inbox
        </Link>
      </div>
    );
  }

  const isAssigned = !!conversation.assigned_to;
  const assignedAgent = agents.find((a) => a.id === conversation.assigned_to);

  return (
    <div
      style={{
        display: "flex",
        height: "calc(100vh - 80px)",
        overflow: "hidden",
      }}
    >
      {/* LEFT PANEL - Customer Context (Mobile hidden, Tablet/Desktop visible) */}
      <div
        className="hidden md:flex"
        style={{
          width: 260,
          minWidth: 260,
          borderRight: `1px solid ${T.border}`,
          background: T.bg2,
          flexDirection: "column",
        }}
      >
        <div style={{ padding: "1rem", borderBottom: `1px solid ${T.border}` }}>
          <Link
            href="/customer-support/inbox"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              color: T.muted,
              textDecoration: "none",
              fontFamily: T.mono,
              fontSize: "0.8rem",
              transition: "color 0.2s",
            }}
          >
            <ArrowLeft size={14} /> Back to Inbox
          </Link>
        </div>

        <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                background: "rgba(0,255,136,0.1)",
                border: `1px solid ${T.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: T.text,
                fontSize: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              <User size={32} />
            </div>
            <h3
              style={{
                fontFamily: T.body,
                fontSize: "1.2rem",
                fontWeight: 600,
                color: "var(--t-heading)",
                margin: "0 0 0.5rem 0",
              }}
            >
              {conversation.end_user?.name || "Anonymous User"}
            </h3>
            <div
              style={{ fontFamily: T.mono, fontSize: "0.8rem", color: T.muted }}
            >
              {conversation.end_user?.email || "No email"}
            </div>
            {conversation.end_user?.metadata?.phone && (
              <div
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.8rem",
                  color: T.muted,
                  marginTop: "0.2rem",
                }}
              >
                {conversation.end_user.metadata.phone}
              </div>
            )}
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.75rem",
                color: T.g,
                marginTop: "0.5rem",
              }}
            >
              ID: {conversation.end_user?.external_id || "Unknown"}
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.7rem",
                color: T.muted,
                marginBottom: "0.8rem",
                textTransform: "uppercase",
              }}
            >
              Stats
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.5rem",
              }}
            >
              <div
                style={{
                  background: T.panel,
          borderRadius: "var(--t-radius)",
                  padding: "0.8rem",
                  borderRadius: "4px",
                  border: `1px solid var(--t-white-05)`,
                }}
              >
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    color: T.muted,
                  }}
                >
                  Customer since
                </div>
                <div
                  style={{
                    fontFamily: T.body,
                    fontSize: "0.9rem",
                    color: T.text,
                  }}
                >
                  {conversation.end_user?.created_at
                    ? new Date(
                        conversation.end_user.created_at,
                      ).toLocaleDateString(undefined, {
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </div>
              </div>
              <div
                style={{
                  background: T.panel,
          borderRadius: "var(--t-radius)",
                  padding: "0.8rem",
                  borderRadius: "4px",
                  border: `1px solid var(--t-white-05)`,
                }}
              >
                <div
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.65rem",
                    color: T.muted,
                  }}
                >
                  Total Convs
                </div>
                <div
                  style={{
                    fontFamily: T.body,
                    fontSize: "0.9rem",
                    color: T.text,
                  }}
                >
                  {previousConvs.length + 1}
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.7rem",
                color: T.muted,
                marginBottom: "0.8rem",
                textTransform: "uppercase",
              }}
            >
              Tags
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {conversation.tags && conversation.tags.length > 0 ? (
                conversation.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.3rem",
                      fontFamily: T.mono,
                      fontSize: "0.7rem",
                      padding: "0.2rem 0.5rem",
                      background: "var(--t-white-05)",
                      border: `1px solid var(--t-white-10)`,
                      color: T.text,
                      borderRadius: "4px",
                    }}
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: "none",
                        border: "none",
                        color: T.muted,
                        cursor: "pointer",
                        padding: 0,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <X size={12} />
                    </button>
                  </span>
                ))
              ) : (
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: T.muted,
                  }}
                >
                  No tags
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CENTER PANEL - Conversation */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "1.2rem 2rem",
            borderBottom: `1px solid ${T.border}`,
            background: T.bg2,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.75rem",
                color: T.muted,
                marginBottom: "0.3rem",
              }}
            >
              CONVERSATION #{conversation.id.split("-")[0].toUpperCase()}
            </div>
            <div
              style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}
            >
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setShowStatus(!showStatus)}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    fontFamily: T.mono,
                    fontSize: "0.7rem",
                    padding: "0.3rem 0.6rem",
                    background:
                      conversation.status === "active"
                        ? "rgba(0,255,136,0.1)"
                        : conversation.status === "escalated"
                          ? "rgba(255,170,0,0.1)"
                          : "var(--t-white-05)",
                    color:
                      conversation.status === "active"
                        ? T.g
                        : conversation.status === "escalated"
                          ? "#ffaa00"
                          : T.text,
                    borderRadius: "4px",
                    border: `1px solid ${conversation.status === "active" ? T.border : conversation.status === "escalated" ? "rgba(255,170,0,0.3)" : "transparent"}`,
                    cursor: "pointer",
                  }}
                >
                  ● {conversation.status.toUpperCase()}{" "}
                  <ChevronDown size={12} />
                </button>
                {showStatus && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: 0,
                      marginTop: "0.5rem",
                      background: T.panel,
          borderRadius: "var(--t-radius)",
                      border: `1px solid ${T.border}`,
                      borderRadius: "4px",
                      zIndex: 10,
                      minWidth: "150px",
                      overflow: "hidden",
                    }}
                  >
                    {["active", "escalated", "resolved"].map((s) => (
                      <button
                        key={s}
                        onClick={() => handleUpdateStatus(s)}
                        style={{
                          display: "block",
                          width: "100%",
                          textAlign: "left",
                          padding: "0.8rem 1rem",
                          background: "transparent",
                          border: "none",
                          color: "var(--t-heading)",
                          fontFamily: T.mono,
                          fontSize: "0.8rem",
                          cursor: "pointer",
                          borderBottom: `1px solid var(--t-white-05)`,
                        }}
                      >
                        {s.toUpperCase()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                }}
              >
                {conversation.channel.toUpperCase()}
              </span>

              {conversation.ai_paused && (
                <span
                  style={{
                    fontFamily: T.mono,
                    fontSize: "0.75rem",
                    color: "#ffaa00",
                  }}
                >
                  AI PAUSED
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.8rem", alignItems: "center" }}>
            <div style={{ position: "relative" }}>
              <button
                onClick={() => setShowAssign(!showAssign)}
                style={{
                  padding: "0.5rem 1rem",
                  background: T.panel,
          borderRadius: "var(--t-radius)",
                  border: `1px solid ${T.border}`,
                  color: T.text,
                  cursor: "pointer",
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  borderRadius: "4px",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <User size={14} />
                {isAssigned ? assignedAgent?.name || "Assigned" : "Unassigned"}
              </button>
              {showAssign && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    marginTop: "0.5rem",
                    background: T.panel,
          borderRadius: "var(--t-radius)",
                    border: `1px solid ${T.border}`,
                    borderRadius: "4px",
                    zIndex: 10,
                    minWidth: "200px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      padding: "0.5rem 1rem",
                      borderBottom: `1px solid var(--t-white-10)`,
                      fontFamily: T.mono,
                      fontSize: "0.7rem",
                      color: T.muted,
                    }}
                  >
                    ASSIGN CONVERSATION
                  </div>
                  <button
                    onClick={() => handleAssign(null)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "0.8rem 1rem",
                      background: "transparent",
                      border: "none",
                      color: "var(--t-heading)",
                      fontFamily: T.mono,
                      fontSize: "0.8rem",
                      cursor: "pointer",
                      borderBottom: `1px solid var(--t-white-05)`,
                    }}
                  >
                    ○ AI Support Agent (Unassigned)
                  </button>
                  {agents.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => handleAssign(a.id)}
                      style={{
                        display: "block",
                        width: "100%",
                        textAlign: "left",
                        padding: "0.8rem 1rem",
                        background: "transparent",
                        border: "none",
                        color: "var(--t-heading)",
                        fontFamily: T.mono,
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        borderBottom: `1px solid var(--t-white-05)`,
                      }}
                    >
                      ○ {a.name || a.email}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowEscalate(true)}
              style={{
                padding: "0.5rem",
                background: "transparent",
                border: `1px solid rgba(255,170,0,0.3)`,
                color: "#ffaa00",
                cursor: "pointer",
                borderRadius: "4px",
              }}
              title="Escalate"
            >
              <AlertTriangle size={16} />
            </button>
            <button
              onClick={() => setShowResolve(true)}
              style={{
                padding: "0.5rem",
                background: "transparent",
                border: `1px solid ${T.border}`,
                color: T.g,
                cursor: "pointer",
                borderRadius: "4px",
              }}
              title="Resolve"
            >
              <CheckCircle size={16} />
            </button>
          </div>
        </div>

        {/* Timeline */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "2rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            background: T.bg,
          }}
        >
          {messages.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                color: T.muted,
                fontFamily: T.mono,
                marginTop: "2rem",
              }}
            >
              No messages in this conversation.
            </div>
          ) : (
            messages.map((m: any, i: number) => {
              const isAI = m.role === "assistant";
              const isAgent = m.role === "agent";
              const isSystem = m.role === "system";
              const isUser = m.role === "user";

              if (isSystem) {
                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      margin: "1rem 0",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.7rem",
                        color: T.muted,
                        background: T.panel,
          borderRadius: "var(--t-radius)",
                        padding: "0.4rem 1rem",
                        borderRadius: "20px",
                        border: `1px solid var(--t-white-05)`,
                      }}
                    >
                      {m.content} •{" "}
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-start" : "flex-end",
                  }}
                >
                  <div
                    style={{
                      fontFamily: T.mono,
                      fontSize: "0.7rem",
                      color: isAI ? T.g : T.muted,
                      marginBottom: "0.4rem",
                      textTransform: "uppercase",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.3rem",
                    }}
                  >
                    {isAI && <Bot size={12} />}
                    {isUser
                      ? conversation.end_user?.name || "CUSTOMER"
                      : isAI
                        ? "AI SUPPORT AGENT"
                        : isAgent
                          ? "HUMAN AGENT"
                          : m.role}
                    <span style={{ color: T.muted }}>
                      •{" "}
                      {new Date(m.created_at).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <div
                    style={{
                      background: isUser
                        ? T.panel
                        : isAI
                          ? "rgba(0,255,136,0.05)"
                          : "rgba(0,207,255,0.05)",
                      border: `1px solid ${isUser ? "var(--t-white-10)" : isAI ? "rgba(0,255,136,0.2)" : "rgba(0,207,255,0.2)"}`,
                      padding: "1rem 1.2rem",
                      maxWidth: "75%",
                      color: "var(--t-heading)",
                      fontFamily: T.body,
                      fontSize: "0.95rem",
                      lineHeight: 1.5,
                      borderRadius: isUser
                        ? "0 12px 12px 12px"
                        : "12px 0 12px 12px",
                      boxShadow: isAI
                        ? "0 4px 20px rgba(0,255,136,0.05)"
                        : "none",
                    }}
                  >
                    {m.content}
                  </div>
                  {m.metadata?.confidence && (
                    <div
                      style={{
                        fontFamily: T.mono,
                        fontSize: "0.65rem",
                        color: T.g,
                        marginTop: "0.4rem",
                        opacity: 0.8,
                      }}
                    >
                      AI Confidence: {Math.round(m.metadata.confidence * 100)}%
                    </div>
                  )}
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        {conversation.status !== "resolved" && (
          <div
            style={{
              padding: "1.5rem 2rem",
              borderTop: `1px solid ${T.border}`,
              background: T.bg2,
            }}
          >
            <div
              style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                {isGenerating && (
                  <div
                    style={{
                      position: "absolute",
                      top: "-40px",
                      left: 0,
                      right: 0,
                      padding: "0.6rem 1rem",
                      background: "rgba(0,255,136,0.1)",
                      border: `1px solid ${T.border}`,
                      borderRadius: "4px",
                      fontFamily: T.mono,
                      fontSize: "0.8rem",
                      color: T.g,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      zIndex: 5,
                    }}
                  >
                    <RefreshCw size={14} className="animate-spin" /> ✨
                    Generating AI response...
                  </div>
                )}
                <textarea
                  placeholder="Type your response..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: "80px",
                    maxHeight: "200px",
                    background: T.panel,
          borderRadius: "var(--t-radius)",
                    border: `1px solid ${replyText ? T.g : "var(--t-white-10)"}`,
                    color: T.text,
                    fontFamily: T.body,
                    fontSize: "0.95rem",
                    padding: "1rem",
                    outline: "none",
                    resize: "vertical",
                    borderRadius: "8px",
                    transition: "border-color 0.2s",
                    lineHeight: 1.5,
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <button
                  onClick={handleCopilot}
                  disabled={isGenerating}
                  style={{
                    background: "rgba(0,255,136,0.1)",
                    border: `1px solid ${T.border}`,
                    color: T.g,
                    padding: "0.8rem",
                    borderRadius: "8px",
                    cursor: isGenerating ? "wait" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    opacity: isGenerating ? 0.5 : 1,
                  }}
                  title="Generate AI Response"
                >
                  <Sparkles size={18} />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!replyText.trim() || isSending}
                  style={{
                    background: T.text,
                    color: T.bg,
                    border: "none",
                    padding: "0.8rem",
                    borderRadius: "8px",
                    cursor:
                      replyText.trim() && !isSending
                        ? "pointer"
                        : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s",
                    opacity: replyText.trim() && !isSending ? 1 : 0.5,
                  }}
                  title="Send Message"
                >
                  {isSending ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
            </div>
            <div
              style={{
                fontFamily: T.mono,
                fontSize: "0.65rem",
                color: T.muted,
                marginTop: "0.8rem",
              }}
            >
              Press Enter to send, Shift+Enter for new line. Preview and edit AI
              responses before sending.
            </div>
          </div>
        )}

        {/* Overlays for Escalate / Resolve */}
        {showEscalate && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(4,8,16,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <div
              style={{
                background: T.bg2,
                border: `1px solid rgba(255,170,0,0.5)`,
                padding: "2rem",
                borderRadius: "8px",
                width: "400px",
                maxWidth: "90%",
              }}
            >
              <h3
                style={{
                  color: "#ffaa00",
                  fontFamily: T.body,
                  fontSize: "1.2rem",
                  marginTop: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <AlertTriangle size={20} /> ESCALATE CONVERSATION?
              </h3>
              <p
                style={{
                  color: T.text,
                  fontFamily: T.body,
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                }}
              >
                This conversation will be moved to the human support queue and
                AI will be paused.
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button
                  onClick={() => setShowEscalate(false)}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    background: "transparent",
                    border: `1px solid var(--t-white-10)`,
                    color: "var(--t-heading)",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus("escalated")}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    background: "#ffaa00",
                    border: "none",
                    color: "#000",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Escalate
                </button>
              </div>
            </div>
          </div>
        )}

        {showResolve && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(4,8,16,0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 50,
            }}
          >
            <div
              style={{
                background: T.bg2,
                border: `1px solid ${T.border}`,
                padding: "2rem",
                borderRadius: "8px",
                width: "400px",
                maxWidth: "90%",
              }}
            >
              <h3
                style={{
                  color: T.g,
                  fontFamily: T.body,
                  fontSize: "1.2rem",
                  marginTop: 0,
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <CheckCircle size={20} /> RESOLVE CONVERSATION?
              </h3>
              <p
                style={{
                  color: T.text,
                  fontFamily: T.body,
                  fontSize: "0.9rem",
                  lineHeight: 1.5,
                }}
              >
                This conversation will be marked as resolved. The user will not
                be able to send more messages without starting a new
                conversation.
              </p>
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button
                  onClick={() => setShowResolve(false)}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    background: "transparent",
                    border: `1px solid var(--t-white-10)`,
                    color: "var(--t-heading)",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleUpdateStatus("resolved")}
                  style={{
                    flex: 1,
                    padding: "0.8rem",
                    background: T.g,
                    border: "none",
                    color: "#000",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  Resolve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT PANEL - Actions & History */}
      <div
        className="hidden lg:flex"
        style={{
          width: 280,
          minWidth: 280,
          borderLeft: `1px solid ${T.border}`,
          background: T.bg2,
          flexDirection: "column",
        }}
      >
        <div
          style={{ padding: "1.5rem", borderBottom: `1px solid ${T.border}` }}
        >
          <div
            style={{
              fontFamily: T.mono,
              fontSize: "0.7rem",
              color: T.muted,
              marginBottom: "0.8rem",
              textTransform: "uppercase",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Manage Tags</span>
            <Plus
              size={14}
              style={{ cursor: "pointer", color: T.g }}
              onClick={() => {
                const t = prompt("Enter new tag:");
                if (t) handleAddTag(t);
              }}
            />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {conversation.tags && conversation.tags.length > 0 ? (
              conversation.tags.map((tag: string, i: number) => (
                <span
                  key={i}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: T.mono,
                    fontSize: "0.7rem",
                    padding: "0.2rem 0.5rem",
                    background: T.panel,
          borderRadius: "var(--t-radius)",
                    border: `1px solid ${T.border}`,
                    color: T.text,
                    borderRadius: "4px",
                  }}
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    style={{
                      background: "none",
                      border: "none",
                      color: T.muted,
                      cursor: "pointer",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <X size={12} />
                  </button>
                </span>
              ))
            ) : (
              <span
                style={{
                  fontFamily: T.mono,
                  fontSize: "0.75rem",
                  color: T.muted,
                }}
              >
                No tags
              </span>
            )}
          </div>
        </div>

        <div style={{ padding: "1.5rem", flex: 1, overflowY: "auto" }}>
          <div
            style={{
              fontFamily: T.mono,
              fontSize: "0.7rem",
              color: T.muted,
              marginBottom: "1rem",
              textTransform: "uppercase",
            }}
          >
            Previous Conversations
          </div>
          {previousConvs.length === 0 ? (
            <div
              style={{
                fontFamily: T.body,
                fontSize: "0.85rem",
                color: T.muted,
              }}
            >
              No previous conversations.
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.8rem",
              }}
            >
              {previousConvs.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/customer-support/inbox/${c.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: T.panel,
          borderRadius: "var(--t-radius)",
                      border: `1px solid var(--t-white-05)`,
                      padding: "1rem",
                      borderRadius: "6px",
                      transition: "border-color 0.2s",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.4rem",
                      }}
                    >
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: "0.7rem",
                          color: "var(--t-heading)",
                        }}
                      >
                        #{(c.id || "").split("-")[0].toUpperCase()}
                      </span>
                      <span
                        style={{
                          fontFamily: T.mono,
                          fontSize: "0.65rem",
                          color: c.status === "active" ? T.g : T.muted,
                        }}
                      >
                        {c.status.toUpperCase()}
                      </span>
                    </div>
                    <div
                      style={{
                        fontFamily: T.body,
                        fontSize: "0.8rem",
                        color: T.text,
                        opacity: 0.8,
                      }}
                    >
                      {new Date(c.created_at).toLocaleDateString(undefined, {
                        month: "short",
                        day: "numeric",
                      })}{" "}
                      • {c.channel}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
