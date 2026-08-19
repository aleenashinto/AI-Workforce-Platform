"use client";

import { useState, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Send, User, Bot, Clock, AlertTriangle, FileText, Check, X, ShieldAlert, CheckCircle2, CheckSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ConversationDetailsPage({ params }: { params: { id: string } }) {
  const getToken = async () => 'mock-token';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [messages, setMessages] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [conversation, setConversation] = useState<any>(null);
  
  const [inputValue, setInputValue] = useState("");
  const [isCopilotActive, setIsCopilotActive] = useState(false);
  const [copilotSuggestion, setCopilotSuggestion] = useState("");
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [hasClaimed, setHasClaimed] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchConversation = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/conversations/${params.id}`, { credentials: "include",
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) {
        setConversation(json.data);
        setMessages(json.data.messages || []);
        if (json.data.status === 'claimed' || json.data.status === 'resolved') {
          setHasClaimed(true);
        }
      } else {
        // Fallback for dev if API not ready
        setMessages([
          { id: '1', role: 'user', content: 'Hi, I received my order but it is damaged. What should I do?', time: '10:00 AM' },
          { id: '2', role: 'assistant', content: 'I\'m sorry to hear that your order arrived damaged. According to our policy, you can request a replacement or a full refund within 30 days of receipt.', time: '10:01 AM', confidence: 0.95 },
          { id: 'system-1', role: 'system', content: 'User sentiment is highly negative. Escalating to human agent.', time: '10:02 AM' },
          { id: '3', role: 'user', content: 'I want a refund. Can you process it now?', time: '10:05 AM' },
        ]);
        setConversation({ status: 'escalated', visitor_id: 'visitor_492' });
      }
    } catch (e) {
      console.error(e);
      // Fallback for dev if API not ready
      setMessages([
        { id: '1', role: 'user', content: 'Hi, I received my order but it is damaged. What should I do?', time: '10:00 AM' },
        { id: '2', role: 'assistant', content: 'I\'m sorry to hear that your order arrived damaged. According to our policy, you can request a replacement or a full refund within 30 days of receipt.', time: '10:01 AM', confidence: 0.95 },
        { id: 'system-1', role: 'system', content: 'User sentiment is highly negative. Escalating to human agent.', time: '10:02 AM' },
        { id: '3', role: 'user', content: 'I want a refund. Can you process it now?', time: '10:05 AM' },
      ]);
      setConversation({ status: 'escalated', visitor_id: 'visitor_492' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchConversation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleApplySuggestion = () => {
    setInputValue(copilotSuggestion);
    setIsCopilotActive(false);
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const currentInput = inputValue;
    setInputValue("");
    setIsCopilotActive(false);
    
    // Optimistic UI update
    const newMsg = { id: Date.now().toString(), role: 'agent', content: currentInput, time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
    setMessages([...messages, newMsg]);
    
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/conversations/${params.id}/reply`, { credentials: "include",
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: currentInput })
      });
      fetchConversation();
    } catch (e) {
      console.error(e);
    }
  };

  const handleClaim = () => {
    setHasClaimed(true);
  };

  const handleResolve = async () => {
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/conversations/${params.id}`, { credentials: "include",
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' })
      });
      setConversation({ ...conversation, status: 'resolved' });
    } catch (e) {
      console.error(e);
    }
  };

  const requestCopilot = async () => {
    try {
      setCopilotSuggestion("Generating suggestion...");
      setIsCopilotActive(true);
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/agent/conversations/${params.id}/copilot`, { credentials: "include",
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success && json.suggestion) {
        setCopilotSuggestion(json.suggestion);
      } else {
        setCopilotSuggestion("I can certainly help you with that. To process the refund, I will need your order number. Could you please provide it?");
      }
    } catch (e) {
      console.error(e);
      setCopilotSuggestion("I can certainly help you with that. To process the refund, I will need your order number. Could you please provide it?");
    }
  };

  if (loading) return <div className="h-[calc(100vh-8rem)] flex items-center justify-center text-gray-400">Loading conversation...</div>;

  return (
    <div className="h-[calc(100vh-8rem)] flex rounded-xl border border-[#3F3F5A] bg-[#1A1A24] overflow-hidden shadow-2xl">
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col relative">
        <div className="h-16 border-b border-[#3F3F5A] flex items-center justify-between px-6 bg-[#1E1E2E]">
          <div className="flex items-center gap-3">
            <h2 className="font-semibold text-white">Conversation #{params.id.substring(0, 8)}</h2>
            {conversation?.status === 'resolved' ? (
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/50 bg-emerald-500/10">Resolved</Badge>
            ) : (
              <Badge variant="outline" className="text-amber-400 border-amber-500/50 bg-amber-500/10">Escalated</Badge>
            )}
          </div>
          <div className="flex items-center gap-3">
            {!hasClaimed && (
              <Button onClick={handleClaim} className="bg-gradient-to-r from-[#D122E3] to-[#00F2FE] hover:opacity-90 h-8 text-sm text-white border-0">
                Claim & Pause AI
              </Button>
            )}
            {hasClaimed && conversation?.status !== 'resolved' && (
              <>
                <div className="flex items-center gap-2 text-emerald-400 text-sm mr-2">
                  <CheckCircle2 className="w-4 h-4" /> You are handling this
                </div>
                <Button onClick={handleResolve} variant="outline" className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 h-8 text-sm">
                  <CheckSquare className="w-4 h-4 mr-2" /> Mark Resolved
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
          {messages.map((msg: any) => (
            msg.role === 'system' ? (
              <div key={msg.id} className="flex justify-center my-4">
                <div className="bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs py-2 px-4 rounded-full flex items-center gap-2 shadow-sm">
                  <AlertTriangle className="w-3 h-3" />
                  {msg.content}
                </div>
              </div>
            ) : (
              <div key={msg.id} className={`flex gap-4 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg ${
                  msg.role === 'user' ? 'bg-[#2A2A3C] border border-[#3F3F5A] text-gray-300' : 
                  msg.role === 'assistant' ? 'bg-gradient-to-br from-[#D122E3] to-[#00F2FE] text-white' : 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : 
                   msg.role === 'assistant' ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>
                <div className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-xs font-medium text-gray-400 capitalize">{msg.role}</span>
                    <span className="text-xs text-gray-500">{msg.time || 'Just now'}</span>
                    {msg.role === 'assistant' && msg.confidence && (
                      <span className="text-[10px] text-[#00F2FE] bg-[#00F2FE]/10 px-1.5 rounded-sm border border-[#00F2FE]/20">
                        {Math.round(msg.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  <div className={`p-3.5 rounded-2xl shadow-sm ${
                    msg.role === 'user' ? 'bg-[#2A2A3C] text-gray-200 border border-[#3F3F5A] rounded-tr-none' : 
                    msg.role === 'assistant' ? 'bg-[#1E1E2E] text-gray-200 border border-[#3F3F5A] rounded-tl-none' :
                    'bg-emerald-900/20 text-gray-200 border border-emerald-800/50 rounded-tl-none'
                  }`}>
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              </div>
            )
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#1E1E2E] border-t border-[#3F3F5A] relative">
          
          {/* Copilot Suggestion Overlay */}
          {hasClaimed && isCopilotActive && (
            <div className="absolute bottom-full left-0 right-0 p-4 mb-2 animate-in slide-in-from-bottom-2">
              <div className="bg-[#1E1E2E] border border-[#D122E3]/50 rounded-xl p-4 shadow-[0_0_30px_rgba(209,34,227,0.15)] flex gap-4">
                <div className="mt-1"><Bot className="w-5 h-5 text-[#D122E3]" /></div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#D122E3] to-[#00F2FE] uppercase tracking-wider mb-2">AI Copilot Suggestion</div>
                  {copilotSuggestion === "Generating suggestion..." ? (
                    <div className="text-sm text-gray-400 flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#D122E3] border-t-transparent rounded-full animate-spin"></div>
                      Generating...
                    </div>
                  ) : (
                    // eslint-disable-next-line react/no-unescaped-entities
                    <p className="text-sm text-gray-200 italic bg-[#1A1A24] p-3 rounded-lg border border-[#3F3F5A]">"{copilotSuggestion}"</p>
                  )}
                </div>
                <div className="flex flex-col gap-2 shrink-0">
                  <Button size="sm" onClick={handleApplySuggestion} disabled={copilotSuggestion === "Generating suggestion..."} className="bg-gradient-to-r from-[#D122E3] to-[#00F2FE] hover:opacity-90 h-8 text-xs px-4 text-white border-0">Apply</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsCopilotActive(false)} className="text-gray-400 hover:text-white h-8 text-xs px-4">Dismiss</Button>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setIsToolModalOpen(true)} className="shrink-0 bg-[#2A2A3C] border-[#3F3F5A] text-gray-400 hover:text-white" disabled={!hasClaimed}>
              <ShieldAlert className="w-4 h-4" />
            </Button>
            <Input 
              placeholder={hasClaimed ? "Type your reply..." : "Claim conversation to reply"} 
              className="bg-[#2A2A3C] border-[#3F3F5A] text-white focus-visible:ring-[#D122E3] shadow-inner"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={!hasClaimed || conversation?.status === 'resolved'}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <Button onClick={handleSend} disabled={!hasClaimed || !inputValue.trim() || conversation?.status === 'resolved'} className="bg-[#2A2A3C] border border-[#3F3F5A] text-white hover:bg-[#3F3F5A] shrink-0">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tool Execution Modal */}
        {isToolModalOpen && (
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center gap-3 text-amber-400 mb-4">
                <AlertTriangle className="w-6 h-6" />
                <h3 className="text-lg font-bold">Tool Execution Required</h3>
              </div>
              <p className="text-gray-300 text-sm mb-6">
                The AI attempted to execute the <code className="bg-black/50 px-1.5 py-0.5 rounded text-amber-300 border border-amber-500/30">process_refund</code> tool, which requires agent confirmation.
              </p>
              
              <div className="bg-[#1A1A24] rounded-lg p-4 font-mono text-xs text-[#00F2FE] mb-6 border border-[#3F3F5A] overflow-x-auto shadow-inner">
                <pre>
{`{
  "order_id": "ORD-9921",
  "amount": "full",
  "reason": "damaged_in_transit"
}`}
                </pre>
              </div>

              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setIsToolModalOpen(false)} className="border-[#3F3F5A] text-gray-300 hover:text-white hover:bg-[#2A2A3C]">
                  <X className="w-4 h-4 mr-2" /> Reject
                </Button>
                <Button onClick={() => setIsToolModalOpen(false)} className="bg-emerald-600 hover:bg-emerald-700 text-white border-0 shadow-lg shadow-emerald-600/20">
                  <Check className="w-4 h-4 mr-2" /> Approve & Execute
                </Button>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Right Sidebar - Customer Info */}
      <div className="w-80 border-l border-[#3F3F5A] bg-[#1E1E2E] p-6 flex flex-col overflow-y-auto relative">
        <h3 className="font-semibold text-white mb-6 uppercase text-xs tracking-wider text-gray-400 flex items-center gap-2">
          Customer Profile
        </h3>
        
        <div className="flex flex-col items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#2A2A3C] to-[#1E1E2E] border-2 border-[#3F3F5A] flex items-center justify-center text-2xl font-bold text-gray-300 mb-4 shadow-lg">
            {conversation?.visitor_id ? conversation.visitor_id.substring(8, 10).toUpperCase() : 'V_'}
          </div>
          <div className="text-center">
            <h4 className="font-medium text-white text-lg">{conversation?.visitor_id || 'visitor_492'}</h4>
            <p className="text-sm text-emerald-400 flex items-center justify-center gap-1 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Online now
            </p>
          </div>
        </div>

        <div className="space-y-5 text-sm bg-[#1A1A24] p-4 rounded-xl border border-[#3F3F5A]">
          <div>
            <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Email</p>
            <p className="text-gray-200">Unknown</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Wait Time</p>
            <p className="text-gray-200 flex items-center"><Clock className="w-3.5 h-3.5 mr-1.5 text-amber-400" /> 4 mins</p>
          </div>
          <div>
            <p className="text-gray-500 text-xs mb-1 uppercase tracking-wider">Plan</p>
            <Badge variant="outline" className="border-[#3F3F5A] text-gray-300 mt-1 bg-[#2A2A3C]">Free Tier</Badge>
          </div>
        </div>

        <hr className="border-[#3F3F5A] my-6" />

        <h3 className="font-semibold text-white mb-4 uppercase text-xs tracking-wider text-gray-400">Recent Activity</h3>
        <div className="space-y-4">
          <div className="flex gap-3 items-start relative before:absolute before:left-[7px] before:top-5 before:bottom-[-20px] before:w-[2px] before:bg-[#3F3F5A]">
            <div className="w-4 h-4 rounded-full bg-[#1E1E2E] border-2 border-[#D122E3] shrink-0 mt-0.5 z-10"></div>
            <div>
              <p className="text-sm text-gray-200">Viewed Return Policy</p>
              <p className="text-xs text-gray-500 mt-0.5">10 mins ago</p>
            </div>
          </div>
          <div className="flex gap-3 items-start relative">
            <div className="w-4 h-4 rounded-full bg-[#1E1E2E] border-2 border-[#3F3F5A] shrink-0 mt-0.5 z-10"></div>
            <div>
              <p className="text-sm text-gray-200">Visited Pricing Page</p>
              <p className="text-xs text-gray-500 mt-0.5">15 mins ago</p>
            </div>
          </div>
        </div>

        {hasClaimed && conversation?.status !== 'resolved' && (
          <div className="mt-auto pt-6">
            <Button onClick={requestCopilot} className="w-full bg-gradient-to-r from-[#2A2A3C] to-[#2A2A3C] hover:from-[#D122E3]/20 hover:to-[#00F2FE]/20 border border-[#3F3F5A] hover:border-[#D122E3]/50 text-white shadow-lg transition-all">
              <Bot className="w-4 h-4 mr-2 text-[#D122E3]" /> Ask Copilot for Help
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
