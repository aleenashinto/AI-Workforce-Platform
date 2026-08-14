'use client';

import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { ShieldAlert, CheckCircle, Send, User, Bot, Sparkles, FileText, UserPlus, StopCircle, RefreshCw, XCircle } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { T } from "@/lib/theme";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function ConversationView() {
  const params = useParams();
  const id = params.id as string;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversation, setConversation] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversation();
  }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const loadConversation = async () => {
    try {
      const data = await fetchApi(`/agent/conversations/${id}`);
      setConversation(data);
      setMessages(data.messages || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleTakeOver = async () => {
    // Mock user id for assignment (since we don't have auth context easily available here)
    const agent_id = "00000000-0000-0000-0000-000000000000";
    await fetchApi(`/agent/conversations/${id}/assign`, {
      method: "POST",
      body: JSON.stringify({ agent_id })
    });
    loadConversation();
  };

  const handleUpdateStatus = async (status: string) => {
    await fetchApi(`/agent/conversations/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status })
    });
    loadConversation();
  };

  const handleSend = async () => {
    if (!replyText.trim()) return;
    
    if (isNotesMode) {
      // In a real app, internal notes might go to a different table or have role: 'note'
      const newMsg = { id: Date.now(), role: 'note', content: replyText, created_at: new Date().toISOString() };
      setMessages([...messages, newMsg]);
      setReplyText("");
      return;
    }

    try {
      const res = await fetchApi(`/agent/conversations/${id}/reply`, {
        method: "POST",
        body: JSON.stringify({ content: replyText })
      });
      if (res.success) {
        setMessages([...messages, res.message]);
        setReplyText("");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCopilot = async () => {
    setIsGenerating(true);
    try {
      const res = await fetchApi(`/agent/conversations/${id}/copilot`, { method: "POST" });
      if (res.success && res.suggestion) {
        setReplyText(res.suggestion);
        setIsNotesMode(false);
      }
    } catch (e) {
      console.error(e);
    }
    setIsGenerating(false);
  };

  if (loading) {
    return <div style={{ padding: "2rem", color: T.muted, fontFamily: T.mono }}>LOADING_CONVERSATION...</div>;
  }

  if (!conversation) {
    return <div style={{ padding: "2rem", color: T.red, fontFamily: T.mono }}>ERROR_CONVERSATION_NOT_FOUND</div>;
  }

  const isAssigned = !!conversation.assigned_to;
  const isClosed = conversation.status === 'resolved' || conversation.status === 'escalated';

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* 1. Header */}
      <div style={{ padding: "1.5rem", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: T.bg2 }}>
        <div>
          <h3 style={{ fontFamily: T.body, fontSize: "1.2rem", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            {conversation.external_id || 'Unknown Visitor'} 
            {conversation.ai_paused && <span style={{ fontFamily: T.mono, fontSize: "0.6rem", padding: "0.2rem 0.4rem", background: "rgba(255,51,85,0.1)", color: T.red, border: `1px solid ${T.red}` }}>AI PAUSED</span>}
          </h3>
          <div style={{ fontFamily: T.mono, fontSize: "0.75rem", color: T.muted, marginTop: "0.4rem", display: "flex", gap: "1rem" }}>
            <span>ID: {conversation.id.substring(0, 8)}</span>
            <span>CHANNEL: {conversation.channel}</span>
            <span>STATUS: {conversation.status.toUpperCase()}</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: "0.8rem" }}>
          {!isAssigned && !isClosed && (
            <button onClick={handleTakeOver} style={{
              background: "rgba(0,255,136,0.1)", border: `1px solid ${T.g}`, color: T.g,
              padding: "0.5rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem"
            }}><UserPlus size={14}/> TAKE OVER</button>
          )}
          {conversation.status !== 'resolved' && (
            <button onClick={() => handleUpdateStatus('resolved')} style={{
              background: "transparent", border: `1px solid ${T.muted}`, color: T.text,
              padding: "0.5rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem"
            }}><CheckCircle size={14}/> RESOLVE</button>
          )}
          {conversation.status !== 'escalated' && (
            <button onClick={() => handleUpdateStatus('escalated')} style={{
              background: "rgba(255,170,0,0.1)", border: `1px solid ${T.warn}`, color: T.warn,
              padding: "0.5rem 1rem", fontFamily: T.mono, fontSize: "0.75rem", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem"
            }}><ShieldAlert size={14}/> ESCALATE</button>
          )}
        </div>
      </div>

      {/* 2. Messages Area */}
      <div style={{ flex: 1, padding: "2rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        {messages.map((msg: any) => {
          const isCustomer = msg.role === 'user';
          const isNote = msg.role === 'note';
          const isAgent = msg.role === 'agent';
          
          return (
            <div key={msg.id} style={{ display: "flex", flexDirection: "column", alignItems: isCustomer ? "flex-start" : "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", flexDirection: isCustomer ? "row" : "row-reverse" }}>
                {isCustomer ? <User size={14} color={T.muted} /> : (isNote || isAgent) ? <User size={14} color={T.g2} /> : <Bot size={14} color={T.g} />}
                <span style={{ fontFamily: T.mono, fontSize: "0.7rem", color: T.muted }}>
                  {isCustomer ? 'Customer' : isNote ? 'Internal Note' : isAgent ? 'Agent' : 'AI'} • {new Date(msg.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div style={{
                maxWidth: "70%",
                padding: "1rem",
                background: isNote ? "rgba(255,200,0,0.1)" : isCustomer ? T.panel : "rgba(0,255,136,0.05)",
                border: `1px solid ${isNote ? T.warn : isCustomer ? T.border : T.g}`,
                color: isNote ? T.warn : "#fff",
                fontFamily: T.body,
                fontSize: "0.95rem",
                lineHeight: "1.5",
                borderRadius: 4
              }}>
                {msg.content}
                
                {/* Citations block for AI */}
                {msg.role === 'assistant' && msg.metadata?.citations?.length > 0 && (
                  <div style={{ marginTop: "1rem", paddingTop: "0.8rem", borderTop: `1px dashed rgba(0,255,136,0.2)` }}>
                    <div style={{ fontFamily: T.mono, fontSize: "0.65rem", color: T.g, marginBottom: "0.4rem" }}>CITATIONS:</div>
                    {msg.metadata.citations.map((cit: any, i: number) => (
                      <div key={i} style={{ display: "inline-flex", alignItems: "center", gap: "0.2rem", background: "rgba(0,0,0,0.3)", border: `1px solid ${T.border}`, padding: "0.2rem 0.5rem", fontSize: "0.65rem", fontFamily: T.mono, color: T.muted, marginRight: "0.5rem", borderRadius: 2 }}>
                        <FileText size={10} /> {cit.title || 'Doc ' + (i+1)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Input Area */}
      {!isClosed && (
        <div style={{ padding: "1.5rem", borderTop: `1px solid ${T.border}`, background: T.bg2 }}>
          {isAssigned ? (
            <div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "0.5rem" }}>
                <button onClick={() => setIsNotesMode(false)} style={{ fontFamily: T.mono, fontSize: "0.75rem", color: !isNotesMode ? T.g2 : T.muted, background: "none", border: "none", cursor: "pointer", borderBottom: !isNotesMode ? `1px solid ${T.g2}` : "1px solid transparent" }}>REPLY TO CUSTOMER</button>
                <button onClick={() => setIsNotesMode(true)} style={{ fontFamily: T.mono, fontSize: "0.75rem", color: isNotesMode ? T.warn : T.muted, background: "none", border: "none", cursor: "pointer", borderBottom: isNotesMode ? `1px solid ${T.warn}` : "1px solid transparent" }}>INTERNAL NOTE</button>
              </div>
              <div style={{ position: "relative" }}>
                <textarea 
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder={isNotesMode ? "Type a private note..." : "Type your reply..."}
                  style={{
                    width: "100%", height: 80, padding: "1rem", background: T.bg, border: `1px solid ${isNotesMode ? T.warn : T.border}`,
                    color: isNotesMode ? T.warn : T.text, fontFamily: T.body, fontSize: "0.95rem", outline: "none", resize: "none"
                  }}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                />
                {!isNotesMode && (
                  <button onClick={handleCopilot} disabled={isGenerating} style={{
                    position: "absolute", bottom: 10, right: 60,
                    background: "rgba(0,207,255,0.1)", border: `1px solid ${T.g2}`, color: T.g2,
                    padding: "0.4rem 0.8rem", fontFamily: T.mono, fontSize: "0.7rem", cursor: isGenerating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.3rem", opacity: isGenerating ? 0.5 : 1
                  }}>
                    {isGenerating ? <RefreshCw size={12} className="animate-spin" /> : <Sparkles size={12}/>} COPILOT
                  </button>
                )}
                <button onClick={handleSend} disabled={!replyText.trim()} style={{
                  position: "absolute", bottom: 10, right: 10,
                  background: !replyText.trim() ? "rgba(255,255,255,0.1)" : isNotesMode ? T.warn : T.g,
                  border: "none", color: !replyText.trim() ? T.muted : T.bg,
                  padding: "0.4rem 0.8rem", fontFamily: T.mono, fontSize: "0.7rem", cursor: !replyText.trim() ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: "0.3rem"
                }}>
                  <Send size={12}/> SEND
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: "1rem", color: T.muted, fontFamily: T.mono, fontSize: "0.8rem", display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
              <StopCircle size={16} /> AI IS HANDLING THIS CONVERSATION. TAKE OVER TO REPLY.
            </div>
          )}
        </div>
      )}
      
      {isClosed && (
        <div style={{ padding: "1.5rem", borderTop: `1px solid ${T.border}`, background: "rgba(0,0,0,0.5)", textAlign: "center", color: T.muted, fontFamily: T.mono, fontSize: "0.8rem" }}>
          <XCircle size={16} style={{ margin: "0 auto 0.5rem" }} />
          THIS CONVERSATION IS {conversation.status.toUpperCase()}
        </div>
      )}
    </div>
  );
}
