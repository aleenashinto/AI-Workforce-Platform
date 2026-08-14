"use client";

import { useState } from "react";
import { Search, User, Filter, AlertTriangle, Send, Paperclip } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function ChatSupportPage() {
  const [conversations] = useState([
    { id: '1', user: 'visitor_9f8d7', message: 'How do I reset my password?', time: '10:42 AM', status: 'escalated', unread: true },
    { id: '2', user: 'visitor_a1b2c', message: 'Pricing plans', time: '09:15 AM', status: 'active', unread: false },
    { id: '3', user: 'visitor_z9y8x', message: 'Thanks that helped!', time: 'Yesterday', status: 'resolved', unread: false },
  ]);

  const [activeConv, setActiveConv] = useState(conversations[0]);
  const [replyText, setReplyText] = useState("");

  const chatHistory = [
    { id: 1, role: 'user', content: "I can't log in to my account. How do I reset my password?", time: "10:40 AM" },
    { id: 2, role: 'assistant', content: "I can help with that! You can reset your password by going to the login page and clicking 'Forgot Password' [1]. Would you like me to send you the direct link?", time: "10:40 AM", confidence: 0.95 },
    { id: 3, role: 'user', content: "Yes, but my email is changed. I don't have access to the old one.", time: "10:41 AM" },
    { id: 4, role: 'system', content: "Escalated to human due to low confidence (0.4) for account recovery.", time: "10:42 AM", isSystem: true },
  ];

  return (
    <div className="flex h-[calc(100vh-8rem)] bg-[#1E1E2E] rounded-xl border border-[#3F3F5A] overflow-hidden shadow-2xl">
      {/* Sidebar: Conversation List */}
      <div className="w-80 border-r border-[#3F3F5A] flex flex-col bg-[#2A2A3C]">
        <div className="p-4 border-b border-[#3F3F5A] space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Inbox</h2>
            <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-9 bg-[#1E1E2E] border-[#3F3F5A] text-white"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map(conv => (
            <div 
              key={conv.id}
              onClick={() => setActiveConv(conv)}
              className={`p-4 border-b border-[#3F3F5A]/50 cursor-pointer transition-colors ${activeConv.id === conv.id ? 'bg-[#3F3F5A]/30 border-l-4 border-l-indigo-500' : 'hover:bg-[#3F3F5A]/10 border-l-4 border-l-transparent'}`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`font-medium ${conv.unread ? 'text-white' : 'text-gray-300'}`}>{conv.user}</span>
                <span className="text-xs text-gray-500">{conv.time}</span>
              </div>
              <p className={`text-sm truncate ${conv.unread ? 'text-gray-300 font-medium' : 'text-gray-500'}`}>{conv.message}</p>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant="outline" className={
                  conv.status === 'escalated' ? 'text-rose-400 border-rose-500/50 bg-rose-500/10 text-[10px]' :
                  conv.status === 'active' ? 'text-blue-400 border-blue-500/50 bg-blue-500/10 text-[10px]' :
                  'text-emerald-400 border-emerald-500/50 bg-emerald-500/10 text-[10px]'
                }>
                  {conv.status.toUpperCase()}
                </Badge>
                {conv.unread && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#1E1E2E]">
        <div className="h-16 border-b border-[#3F3F5A] flex items-center justify-between px-6 bg-[#2A2A3C]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-indigo-600/20 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h3 className="font-semibold text-white">{activeConv.user}</h3>
              <p className="text-xs text-gray-400 flex items-center gap-2">
                Viewing via Website Widget
                {activeConv.status === 'escalated' && <span className="text-rose-400 flex items-center"><AlertTriangle className="w-3 h-3 ml-2 mr-1" /> Escalated</span>}
              </p>
            </div>
          </div>
          <div>
            <Button variant="outline" className="border-[#3F3F5A] text-white hover:bg-[#3F3F5A]">
              Resolve
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {chatHistory.map(msg => (
            msg.isSystem ? (
              <div key={msg.id} className="flex justify-center my-4">
                <span className="text-xs font-medium text-rose-400 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                  {msg.content}
                </span>
              </div>
            ) : (
              <div key={msg.id} className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium text-gray-400">{msg.role === 'user' ? 'Visitor' : 'AI Agent'}</span>
                  <span className="text-[10px] text-gray-500">{msg.time}</span>
                  {msg.confidence && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${msg.confidence > 0.8 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {Math.round(msg.confidence * 100)}% Conf
                    </span>
                  )}
                </div>
                <div className={`p-3 rounded-xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-sm' 
                    : 'bg-[#2A2A3C] text-gray-200 border border-[#3F3F5A] rounded-tl-sm'
                }`}>
                  {msg.content}
                </div>
              </div>
            )
          ))}
        </div>

        <div className="p-4 bg-[#2A2A3C] border-t border-[#3F3F5A]">
          <div className="relative flex items-center">
            <Button variant="ghost" size="icon" className="absolute left-2 text-gray-400 hover:text-white">
              <Paperclip className="w-5 h-5" />
            </Button>
            <Input 
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Type your reply (Take over from AI)..." 
              className="w-full bg-[#1E1E2E] border-[#3F3F5A] text-white pl-12 pr-12 py-6 rounded-lg"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  setReplyText("");
                }
              }}
            />
            <Button 
              size="icon" 
              className="absolute right-2 bg-indigo-600 hover:bg-indigo-700 h-8 w-8 rounded-md"
              onClick={() => setReplyText("")}
              disabled={!replyText.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
