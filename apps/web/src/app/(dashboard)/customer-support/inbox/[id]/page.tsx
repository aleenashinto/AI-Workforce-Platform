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
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Center Panel - Conversation */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', borderRight: `1px solid ${T.border}` }}>
        {/* Header */}
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${T.border}`, background: T.bg2 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontFamily: T.body, fontSize: '1.2rem', fontWeight: 600, color: '#fff', margin: '0 0 0.5rem 0' }}>
                {conversation.end_user?.name || conversation.end_user?.email || 'Anonymous User'}
              </h3>
              <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                <span style={{ fontFamily: T.mono, fontSize: '0.7rem', padding: '0.2rem 0.5rem', background: conversation.status === 'active' ? 'rgba(0,255,136,0.1)' : 'rgba(255,255,255,0.05)', color: conversation.status === 'active' ? T.g : T.text, borderRadius: '4px', border: `1px solid ${conversation.status === 'active' ? T.border : 'transparent'}` }}>
                  ● {conversation.status.toUpperCase()}
                </span>
                <span style={{ fontFamily: T.mono, fontSize: '0.75rem', color: T.muted }}>
                  {conversation.channel.toUpperCase()}
                </span>
                {conversation.ai_paused ? (
                  <span style={{ fontFamily: T.mono, fontSize: '0.75rem', color: T.red }}>Assigned: Human</span>
                ) : (
                  <span style={{ fontFamily: T.mono, fontSize: '0.75rem', color: T.muted }}>Assigned: AI Support Agent</span>
                )}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {!isClosed && (
                <>
                  {!isAssigned ? (
                    <button onClick={handleTakeOver} style={{ padding: '0.5rem 1rem', background: 'transparent', border: `1px solid ${T.border}`, color: T.text, cursor: 'pointer', fontFamily: T.mono, fontSize: '0.75rem' }}>
                      Assign to me
                    </button>
                  ) : (
                    <button onClick={() => handleUpdateStatus('escalated')} style={{ padding: '0.5rem 1rem', background: 'transparent', border: `1px solid ${T.border}`, color: '#ffa500', cursor: 'pointer', fontFamily: T.mono, fontSize: '0.75rem' }}>
                      Escalate
                    </button>
                  )}
                  <button onClick={() => handleUpdateStatus('resolved')} style={{ padding: '0.5rem 1rem', background: T.g, border: 'none', color: '#000', cursor: 'pointer', fontFamily: T.mono, fontSize: '0.75rem', fontWeight: 'bold' }}>
                    Resolve
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((m: any, i: number) => {
            const isAI = m.role === 'agent' || m.role === 'assistant';
            const isSystem = m.role === 'system';
            const isUser = m.role === 'user';
            
            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-start' : 'flex-end' }}>
                <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted, marginBottom: '0.3rem', textTransform: 'uppercase' }}>
                  {isUser ? (conversation.end_user?.name || 'CUSTOMER') : (isAI ? 'AI SUPPORT AGENT' : m.role)} • {new Date(m.created_at).toLocaleTimeString()}
                </div>
                <div style={{
                  background: isUser ? T.panel : (isAI ? 'rgba(0,255,136,0.1)' : 'rgba(0,207,255,0.1)'),
                  border: `1px solid ${isUser ? T.border : (isAI ? 'rgba(0,255,136,0.3)' : 'rgba(0,207,255,0.3)')}`,
                  padding: '1rem',
                  maxWidth: '80%',
                  color: T.text,
                  fontFamily: T.body,
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  borderRadius: isUser ? '0 8px 8px 8px' : '8px 0 8px 8px'
                }}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply Box */}
        {!isClosed && (
          <div style={{ padding: '1.5rem', borderTop: `1px solid ${T.border}`, background: T.bg }}>
            {isGenerating && (
              <div style={{ padding: '1rem', background: 'rgba(0,255,136,0.05)', border: `1px solid ${T.border}`, marginBottom: '1rem', fontFamily: T.mono, fontSize: '0.8rem', color: T.g }}>
                ✨ AI is generating a response...
              </div>
            )}
            
            <textarea
              placeholder="Type your response..."
              value={replyText}
              onChange={e => setReplyText(e.target.value)}
              style={{
                width: '100%',
                minHeight: '100px',
                background: T.panel,
                border: `1px solid ${T.border}`,
                color: T.text,
                fontFamily: T.body,
                fontSize: '0.9rem',
                padding: '1rem',
                outline: 'none',
                resize: 'vertical',
                marginBottom: '1rem'
              }}
            />
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <button onClick={handleCopilot} disabled={isGenerating} style={{
                  background: 'transparent',
                  border: 'none',
                  color: T.g,
                  cursor: isGenerating ? 'wait' : 'pointer',
                  fontFamily: T.mono,
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  opacity: isGenerating ? 0.5 : 1
                }}>
                  ✨ Generate AI Response
                </button>
              </div>
              
              <button onClick={handleSend} disabled={!replyText.trim()} style={{
                background: T.text,
                color: T.bg,
                border: 'none',
                padding: '0.6rem 1.5rem',
                fontFamily: T.mono,
                fontSize: '0.8rem',
                fontWeight: 'bold',
                cursor: replyText.trim() ? 'pointer' : 'not-allowed',
                opacity: replyText.trim() ? 1 : 0.5
              }}>
                Send Response
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Right Panel - Customer Info */}
      <div style={{ width: 300, background: T.bg2, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.muted, marginBottom: '0.5rem', textTransform: 'uppercase' }}>Customer</div>
          <div style={{ fontFamily: T.body, fontSize: '1.1rem', color: '#fff', fontWeight: 600, marginBottom: '0.3rem' }}>
            {conversation.end_user?.name || 'Anonymous User'}
          </div>
          <div style={{ fontFamily: T.mono, fontSize: '0.8rem', color: T.muted }}>
            {conversation.end_user?.email || 'No email provided'}
          </div>
          {conversation.end_user?.external_id && (
            <div style={{ fontFamily: T.mono, fontSize: '0.8rem', color: T.muted, marginTop: '0.3rem' }}>
              {conversation.end_user.external_id}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.muted, marginBottom: '0.8rem', textTransform: 'uppercase' }}>Customer Information</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
            <div>
              <div style={{ fontFamily: T.mono, fontSize: '0.65rem', color: T.muted }}>Customer since</div>
              <div style={{ fontFamily: T.body, fontSize: '0.85rem', color: T.text }}>
                {conversation.end_user?.created_at ? new Date(conversation.end_user.created_at).toLocaleDateString() : 'N/A'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: '1.5rem', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ fontFamily: T.mono, fontSize: '0.7rem', color: T.muted, marginBottom: '0.8rem', textTransform: 'uppercase' }}>Tags</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {conversation.tags && conversation.tags.length > 0 ? conversation.tags.map((tag: string, i: number) => (
              <span key={i} style={{ fontFamily: T.mono, fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: T.panel, border: `1px solid ${T.border}`, color: T.text, borderRadius: '4px' }}>
                {tag}
              </span>
            )) : (
              <span style={{ fontFamily: T.mono, fontSize: '0.75rem', color: T.muted }}>No tags</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
