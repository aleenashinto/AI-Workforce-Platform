"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Bot,
  History,
  Wand2,
  Send,
  CheckCircle,
  Clock,
  Trash2,
  MessageSquare,
  Settings,
  Check,
  X,
  FileText,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

export default function DraftEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [draft, setDraft] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [showVersions, setShowVersions] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [showAiInput, setShowAiInput] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const fetchDraft = useCallback(async () => {
    try {
      const response = await apiClient.get(`/drafts/${id}`);
      if (response?.success) {
        setDraft(response.data);
        setTitle(response.data.title || "");
        setSubject(response.data.subject || "");
        setBody(response.data.body || "");
      } else {
        // Fallback for dummy IDs
        const mockDraft = {
          id,
          title: "Outreach for John Smith",
          subject: "AI Workforce Platform - Let's connect",
          body: "Hi John,\n\nI noticed ABC Technologies is hiring for engineering roles and recently raised a $50M Series B. I'd love to chat about how our AI-powered workforce solutions can help you scale effectively.\n\nBest,\nAlex",
          status: "draft",
        };
        setDraft(mockDraft);
        setTitle(mockDraft.title);
        setSubject(mockDraft.subject);
        setBody(mockDraft.body);
      }
    } catch (e) {
      // Fallback for dummy IDs on error
      const mockDraft = {
        id,
        title: "Outreach for John Smith",
        subject: "AI Workforce Platform - Let's connect",
        body: "Hi John,\n\nI noticed ABC Technologies is hiring for engineering roles and recently raised a $50M Series B. I'd love to chat about how our AI-powered workforce solutions can help you scale effectively.\n\nBest,\nAlex",
        status: "draft",
      };
      setDraft(mockDraft);
      setTitle(mockDraft.title);
      setSubject(mockDraft.subject);
      setBody(mockDraft.body);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDraft();
  }, [fetchDraft]);

  const fetchVersions = async () => {
    try {
      const response = await apiClient.get(`/drafts/${id}/versions`);
      if (response?.success) {
        setVersions(response.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = async (changeType = "manual_save") => {
    setSaving(true);
    try {
      const response = await apiClient.patch(`/drafts/${id}`, {
        title,
        subject,
        body,
        change_type: changeType,
      });
      if (response?.success) {
        setDraft(response.data);
        if (showVersions) fetchVersions();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  // Autosave simulation
  useEffect(() => {
    if (!draft) return;
    const isDirty =
      title !== draft.title || subject !== draft.subject || body !== draft.body;
    if (!isDirty) return;

    const timeout = setTimeout(() => {
      handleSave("manual_save");
    }, 3000);
    return () => clearTimeout(timeout);
  }, [title, subject, body, draft]);

  const handleAiAction = async (instruction: string) => {
    setAiLoading(true);
    try {
      const response = await apiClient.post(`/drafts/ai/improve`, {
        content: body,
        instruction,
      });
      if (response?.success && response.data) {
        setBody(response.data);
        // Automatically save as AI rewrite
        await apiClient.patch(`/drafts/${id}`, {
          body: response.data,
          change_type: "ai_rewrite",
        });
        fetchDraft();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
      setShowAiInput(false);
      setAiPrompt("");
    }
  };

  const handleApprove = async () => {
    try {
      await apiClient.patch(`/drafts/${id}`, { status: "approved" });
      fetchDraft();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-8 text-[color:var(--t-g)]/50 font-mono">Loading draft...</div>
    );
  }

  if (!draft) {
    return <div className="p-8 text-red-400 font-mono">Draft not found.</div>;
  }

  return (
    <div className="h-full flex flex-col bg-[color:var(--t-bg)]">
      {/* HEADER */}
      <header className="h-16 border-b border-[color:var(--t-g)]/20 flex items-center justify-between px-6 bg-[color:var(--t-panel)] shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/drafts"
            className="p-1.5 rounded hover:bg-[color:var(--t-g)]/10 text-gray-400 hover:text-[color:var(--t-g)] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm text-[color:var(--t-g)]/60 uppercase tracking-widest">
              {draft.type?.replace("_", " ")}
            </span>
            <span className="text-gray-600">/</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none focus:border-b focus:border-[color:var(--t-g)]/50 min-w-[200px]"
              placeholder="Untitled Draft"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 mr-4">
            <div className="font-mono text-xs text-gray-400">
              {saving ? (
                <span className="text-yellow-400">Saving...</span>
              ) : (
                <span className="flex items-center gap-1">
                  <Check size={14} className="text-[color:var(--t-g)]" /> Saved
                </span>
              )}
            </div>

            <button
              onClick={() => handleSave("manual_save")}
              disabled={saving}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded font-mono text-xs bg-[color:var(--t-g)]/10 text-[color:var(--t-g)] border border-[color:var(--t-g)]/30 hover:bg-[color:var(--t-g)]/20 transition-colors disabled:opacity-50"
            >
              <Save size={14} /> Save Changes
            </button>
          </div>

          <button
            onClick={() => {
              if (!showVersions) fetchVersions();
              setShowVersions(!showVersions);
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs border transition-colors ${showVersions ? "bg-[color:var(--t-g)]/20 text-[color:var(--t-g)] border-[color:var(--t-g)]/50" : "bg-transparent text-gray-400 border-gray-700 hover:text-white hover:border-gray-500"}`}
          >
            <History size={14} /> History (v{draft.version_number})
          </button>

          {draft.status !== "approved" && (
            <button
              onClick={handleApprove}
              className="flex items-center gap-2 px-3 py-1.5 rounded font-mono text-xs bg-green-500/20 text-green-400 border border-green-500/50 hover:bg-green-500/30 transition-colors"
            >
              <CheckCircle size={14} /> Approve Draft
            </button>
          )}
        </div>
      </header>

      {/* WORKSPACE */}
      <div className="flex-1 overflow-hidden flex">
        {/* MAIN EDITOR */}
        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
          <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 rounded-lg p-6 flex flex-col gap-4">
            {(draft.type === "email" || draft.type === "support_response") && (
              <div className="flex flex-col gap-1 border-b border-[color:var(--t-g)]/10 pb-4">
                <label className="font-mono text-xs text-[color:var(--t-g)]/60 uppercase">
                  Subject / Header
                </label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-transparent text-white text-lg focus:outline-none w-full"
                  placeholder="Enter subject line..."
                />
              </div>
            )}

            <div className="flex flex-col gap-1 flex-1 min-h-[400px]">
              <div className="flex justify-between items-center mb-2">
                <label className="font-mono text-xs text-[color:var(--t-g)]/60 uppercase">
                  Body Content
                </label>
                <div className="flex gap-2 relative">
                  <button
                    onClick={() => setShowAiInput(!showAiInput)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[color:var(--t-g)]/10 text-[color:var(--t-g)] border border-[color:var(--t-g)]/30 rounded text-xs font-mono hover:bg-[color:var(--t-g)]/20 transition-colors"
                  >
                    <Wand2 size={12} /> AI Rewrite
                  </button>

                  {showAiInput && (
                    <div className="absolute right-0 top-full mt-2 w-72 bg-[color:var(--t-bg)] border border-[color:var(--t-g)]/30 rounded-lg shadow-xl shadow-[color:var(--t-g)]/5 p-3 z-10 flex flex-col gap-2">
                      <div className="font-mono text-xs text-[color:var(--t-g)]/80 mb-1">
                        Tell AI how to improve:
                      </div>
                      <textarea
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        placeholder="e.g. Make it more professional, fix grammar, shorten it..."
                        className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 rounded text-sm text-white p-2 h-20 resize-none focus:outline-none focus:border-[color:var(--t-g)]/50"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowAiInput(false)}
                          className="text-gray-400 text-xs hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleAiAction(aiPrompt)}
                          disabled={aiLoading || !aiPrompt.trim()}
                          className="bg-[color:var(--t-g)] text-[color:var(--t-bg)] px-3 py-1 rounded font-bold text-xs disabled:opacity-50 flex items-center gap-1"
                        >
                          {aiLoading ? (
                            "Thinking..."
                          ) : (
                            <>
                              <Wand2 size={12} /> Generate
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="flex-1 w-full bg-[color:var(--t-bg)] border border-[color:var(--t-g)]/10 rounded-md p-4 text-gray-200 text-base leading-relaxed resize-none focus:outline-none focus:border-[color:var(--t-g)]/30"
                placeholder="Start writing..."
              />
            </div>
          </div>
        </div>

        {/* SIDEBAR: VERSION HISTORY */}
        {showVersions && (
          <div className="w-80 border-l border-[color:var(--t-g)]/20 bg-[color:var(--t-panel)] flex flex-col">
            <div className="p-4 border-b border-[color:var(--t-g)]/10 flex justify-between items-center">
              <h3 className="font-mono text-sm text-white flex items-center gap-2">
                <History size={16} className="text-[color:var(--t-g)]" /> Version History
              </h3>
              <button
                onClick={() => setShowVersions(false)}
                className="text-gray-400 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {versions.length === 0 ? (
                <div className="text-center text-gray-500 font-mono text-xs p-4">
                  No history yet.
                </div>
              ) : (
                versions.map((v) => (
                  <div
                    key={v.id}
                    className="bg-[color:var(--t-bg)] border border-gray-800 rounded p-3 flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-mono text-xs font-bold text-[color:var(--t-g)]">
                        v{v.version_number}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(v.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 capitalize flex items-center gap-1">
                      {v.change_type === "ai_rewrite" ? (
                        <Wand2 size={12} className="text-[color:var(--t-g2)]" />
                      ) : (
                        <Save size={12} />
                      )}
                      {v.change_type.replace("_", " ")}
                    </div>
                    <button
                      onClick={() => {
                        setBody(v.body || "");
                        setSubject(v.subject || "");
                        handleSave("restore");
                      }}
                      className="mt-2 text-xs font-mono text-blue-400 hover:text-blue-300 border border-blue-900/50 rounded px-2 py-1 text-center"
                    >
                      Restore this version
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
