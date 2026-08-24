"use client";

import { useState } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  Search,
  UserCheck,
  Clock,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
} from "lucide-react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function AgentInboxPage() {
  const [activeTab, setActiveTab] = useState<"queue" | "mine">("queue");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const queue = [
    {
      id: "1",
      visitor: "visitor_492",
      status: "escalated",
      waitTime: "4m",
      lastMessage: "I need to speak to a human about my refund.",
      priority: "high",
    },
    {
      id: "2",
      visitor: "visitor_991",
      status: "active",
      waitTime: "1m",
      lastMessage: "The AI didn't understand my question.",
      priority: "medium",
    },
  ];

  const myChats = [
    {
      id: "3",
      visitor: "visitor_112",
      status: "active",
      waitTime: "0m",
      lastMessage: "Thank you for explaining the pricing.",
      priority: "low",
    },
  ];

  const displayList = activeTab === "queue" ? queue : myChats;

  return (
    <div className="h-[calc(100vh-8rem)] flex overflow-hidden rounded-xl border border-[#3F3F5A] bg-[#1E1E2E]">
      {/* Left Sidebar - List */}
      <div className="w-80 border-r border-[#3F3F5A] flex flex-col bg-[#1E1E2E]">
        <div className="p-4 border-b border-[#3F3F5A]">
          <h2 className="text-xl font-bold text-white mb-4">Agent Inbox</h2>
          <div className="flex bg-[#2A2A3C] p-1 rounded-lg">
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "queue" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("queue")}
            >
              Unassigned Queue
            </button>
            <button
              className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${activeTab === "mine" ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"}`}
              onClick={() => setActiveTab("mine")}
            >
              My Chats
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {displayList.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className={`p-4 border-b border-[#3F3F5A] cursor-pointer transition-colors ${selectedChat === chat.id ? "bg-[#2A2A3C]" : "hover:bg-[#2A2A3C]/50"}`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-semibold text-gray-200">
                  {chat.visitor}
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" /> {chat.waitTime}
                </span>
              </div>
              <p className="text-sm text-gray-400 truncate">
                {chat.lastMessage}
              </p>
              <div className="mt-2 flex gap-2">
                {chat.priority === "high" && (
                  <Badge className="bg-rose-500/20 text-rose-400 border-none">
                    High Priority
                  </Badge>
                )}
                {chat.status === "escalated" && (
                  <Badge className="bg-amber-500/20 text-amber-400 border-none">
                    Escalated
                  </Badge>
                )}
              </div>
            </div>
          ))}
          {displayList.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2 opacity-20" />
              <p>No conversations found.</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col bg-[#1A1A24] relative">
        {selectedChat ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm z-10">
            <MessageSquare className="w-16 h-16 text-indigo-500 mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Unassigned Conversation
            </h3>
            <p className="text-gray-400 mb-6 max-w-md text-center">
              The AI copilot is currently paused or struggling. Claim this
              conversation to take over and assist the customer.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() =>
                  (window.location.href = `/agent/conversations/${selectedChat}`)
                }
              >
                <UserCheck className="w-5 h-5 mr-2" />
                Claim Conversation
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
            <p>Select a conversation from the queue.</p>
          </div>
        )}
      </div>
    </div>
  );
}
