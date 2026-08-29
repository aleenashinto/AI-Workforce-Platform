"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import {
  ArrowLeft,
  Save,
  Play,
  Pause,
  FileText,
  CheckCircle,
  Clock,
  Wand2,
  Settings,
  Users,
  ArrowDown,
  Mail,
  Bot,
  Phone,
  UserCircle,
  Plus,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SequenceEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [sequence, setSequence] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("builder");

  // Builder state
  const [steps, setSteps] = useState<any[]>([]);

  const fetchSequence = useCallback(async () => {
    try {
      const response = (await apiClient.get(`/sequences/${id}`)) as {
        success: boolean;
        data: any;
      };
      if (response?.success) {
        setSequence(response.data);
        setSteps(response.data.steps || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchSequence();
  }, [fetchSequence]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await apiClient.patch(`/sequences/${id}/status`, { status: newStatus });
      fetchSequence();
    } catch (e) {
      console.error(e);
    }
  };

  const getStepIcon = (type: string) => {
    switch (type) {
      case "email":
        return <Mail size={16} />;
      case "ai_email":
        return <Bot size={16} />;
      case "wait":
        return <Clock size={16} />;
      case "call_task":
        return <Phone size={16} />;
      default:
        return <FileText size={16} />;
    }
  };

  if (loading)
    return (
      <div className="p-8 text-[#00ff88]/50 font-mono">Loading sequence...</div>
    );
  if (!sequence)
    return (
      <div className="p-8 text-red-400 font-mono">Sequence not found.</div>
    );

  return (
    <div className="h-full flex flex-col bg-[color:var(--t-bg)]">
      {/* HEADER */}
      <header className="h-auto min-h-[4.5rem] border-b border-[#00ff88]/20 flex flex-wrap items-center justify-between px-6 py-3 bg-[color:var(--t-panel)] gap-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/sales-assistant/sequences"
            className="p-1.5 rounded hover:bg-[#00ff88]/10 text-[color:var(--t-text)] hover:text-[#00ff88] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold text-white flex items-center gap-2">
              {sequence.name}
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase border ${
                  sequence.status === "active"
                    ? "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30"
                    : sequence.status === "paused"
                      ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                      : "bg-gray-800 text-[color:var(--t-text)] border-gray-600"
                }`}
              >
                {sequence.status}
              </span>
            </span>
            <span className="text-xs text-[#00ff88]/60 font-mono">
              Created {new Date(sequence.created_at).toLocaleDateString()}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-sm flex-wrap">
          {sequence.status === "active" ? (
            <button
              onClick={() => handleStatusChange("paused")}
              className="flex items-center gap-2 px-4 py-1.5 rounded border border-yellow-400/50 text-yellow-400 bg-yellow-400/10 hover:bg-yellow-400/20 transition-colors"
            >
              <Pause size={14} /> PAUSE
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange("active")}
              className="flex items-center gap-2 px-4 py-1.5 rounded border border-[#00ff88]/50 text-[#00ff88] bg-[#00ff88]/10 hover:bg-[#00ff88]/20 transition-colors shadow-[0_0_10px_rgba(0,255,136,0.2)]"
            >
              <Play size={14} /> ACTIVATE
            </button>
          )}

          <button className="flex items-center gap-2 px-4 py-1.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/50 hover:bg-blue-500/30 transition-colors">
            <Users size={14} /> ENROLL LEADS
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="flex border-b border-[#00ff88]/20 bg-[color:var(--t-bg2)] px-6 font-mono text-sm shrink-0 overflow-x-auto">
        <button
          onClick={() => setActiveTab("builder")}
          className={`px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === "builder" ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-[color:var(--t-text)] hover:text-white"}`}
        >
          BUILDER
        </button>
        <button
          onClick={() => setActiveTab("enrollments")}
          className={`px-6 py-3 border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === "enrollments" ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-[color:var(--t-text)] hover:text-white"}`}
        >
          ENROLLMENTS{" "}
          <span className="bg-[#00ff88]/20 text-[#00ff88] px-1.5 rounded text-xs">
            {sequence.stats?.enrolled || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("analytics")}
          className={`px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === "analytics" ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-[color:var(--t-text)] hover:text-white"}`}
        >
          ANALYTICS
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${activeTab === "settings" ? "border-[#00ff88] text-[#00ff88]" : "border-transparent text-[color:var(--t-text)] hover:text-white"}`}
        >
          SETTINGS
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "builder" && (
          <div className="h-full flex flex-col md:flex-row overflow-y-auto">
            {/* Visual Flow */}
            <div className="flex-1 p-6 md:p-12 bg-gray-900/50 flex flex-col items-center">
              <div className="mb-6 flex flex-col items-center">
                <div className="bg-[color:var(--t-panel)] border border-[#00ff88]/30 px-6 py-2 rounded-full font-mono text-xs text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                  TRIGGER: LEADS ENROLLED
                </div>
                <div className="h-8 w-px bg-[#00ff88]/30 mt-2" />
              </div>

              {steps.map((step, index) => (
                <div
                  key={step.id || index}
                  className="flex flex-col items-center w-full max-w-md group"
                >
                  <ArrowDown size={16} className="text-[#00ff88]/50 mb-2" />

                  <div className="bg-[color:var(--t-panel)] border border-gray-700 hover:border-[#00ff88]/50 w-full rounded-lg p-4 flex gap-4 cursor-pointer transition-colors shadow-lg group-hover:shadow-[0_0_15px_rgba(0,255,136,0.1)]">
                    <div className="w-10 h-10 rounded bg-[color:var(--t-bg)] border border-gray-700 flex items-center justify-center shrink-0 text-[#00ff88]">
                      {getStepIcon(step.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                        <div className="font-bold text-sm text-white">
                          {step.name}
                        </div>
                        <div className="text-xs text-[color:var(--t-text)] font-mono">
                          Day {step.day_offset}
                        </div>
                      </div>
                      <div className="text-xs text-[color:var(--t-text)] capitalize flex items-center gap-1">
                        {step.type.replace("_", " ")}
                      </div>
                    </div>
                  </div>

                  {index < steps.length - 1 && (
                    <div className="h-8 w-px bg-gray-700 mt-2" />
                  )}
                </div>
              ))}

              <div className="mt-8">
                <button className="flex items-center gap-2 bg-[color:var(--t-bg)] border-2 border-dashed border-gray-700 hover:border-[#00ff88]/50 text-[color:var(--t-text)] hover:text-[#00ff88] px-8 py-3 rounded-lg font-mono text-sm transition-colors">
                  <Plus size={16} /> ADD STEP
                </button>
              </div>
            </div>

            {/* Properties Panel */}
            <div className="w-full md:w-80 lg:w-96 bg-[color:var(--t-panel)] border-t md:border-t-0 md:border-l border-[#00ff88]/20 p-6 flex flex-col">
              <h3 className="font-mono text-[#00ff88] text-sm uppercase mb-6 flex items-center gap-2">
                <Settings size={16} /> Builder Settings
              </h3>
              <div className="text-xs text-[color:var(--t-text)] font-mono leading-relaxed">
                Select a step on the left to edit its configuration,
                personalization variables, and AI prompts.
              </div>
            </div>
          </div>
        )}

        {activeTab === "enrollments" && (
          <div className="p-4 sm:p-8 h-full overflow-y-auto">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left border-collapse">
                <thead>
                  <tr className="bg-[color:var(--t-bg2)] border-b border-[#00ff88]/10 font-mono text-xs text-[#00ff88]/60 uppercase tracking-wider">
                    <th className="p-4 font-normal">Lead</th>
                    <th className="p-4 font-normal">Company</th>
                    <th className="p-4 font-normal">Status</th>
                    <th className="p-4 font-normal">Current Step</th>
                    <th className="p-4 font-normal">Enrolled At</th>
                  </tr>
                </thead>
                <tbody>
                  {sequence.enrollments?.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-8 text-center text-[#00ff88]/50 font-mono"
                      >
                        No enrollments yet.
                      </td>
                    </tr>
                  ) : (
                    sequence.enrollments?.map((e: any) => (
                      <tr
                        key={e.id}
                        className="border-b border-[#00ff88]/5 font-mono text-sm"
                      >
                        <td className="p-4 font-bold text-white">
                          {e.lead_name}
                        </td>
                        <td className="p-4 text-[color:var(--t-text)]">{e.lead_company}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs border ${
                              e.status === "active"
                                ? "bg-[#00ff88]/10 text-[#00ff88] border-[#00ff88]/30"
                                : e.status === "completed"
                                  ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                  : e.status === "replied"
                                    ? "bg-[#00cfff]/10 text-[#00cfff] border-[#00cfff]/30"
                                    : "bg-gray-800 text-[color:var(--t-text)] border-gray-600"
                            } uppercase`}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td className="p-4 text-[color:var(--t-text)]">
                          Step {e.current_step}
                        </td>
                        <td className="p-4 text-[color:var(--t-text)] text-xs">
                          {new Date(e.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="p-4 sm:p-8 overflow-y-auto">
            <h2 className="text-xl font-bold font-display text-white mb-6">
              Sequence Performance
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 font-mono mb-8">
              <div className="bg-[color:var(--t-panel)] border border-[#00ff88]/20 p-6 rounded-lg">
                <div className="text-4xl font-bold text-white mb-2">
                  {sequence.stats?.enrolled || 0}
                </div>
                <div className="text-sm text-[#00ff88]/60 uppercase">
                  Enrolled
                </div>
              </div>
              <div className="bg-[color:var(--t-panel)] border border-[#00cfff]/20 p-6 rounded-lg">
                <div className="text-4xl font-bold text-[#00cfff] mb-2">
                  {sequence.stats?.reply_rate || "0.0"}%
                </div>
                <div className="text-sm text-[#00cfff]/60 uppercase">
                  Reply Rate
                </div>
              </div>
              <div className="bg-[color:var(--t-panel)] border border-blue-400/20 p-6 rounded-lg">
                <div className="text-4xl font-bold text-blue-400 mb-2">
                  {sequence.stats?.replied || 0}
                </div>
                <div className="text-sm text-blue-400/60 uppercase">
                  Replies
                </div>
              </div>
              <div className="bg-[color:var(--t-panel)] border border-purple-400/20 p-6 rounded-lg">
                <div className="text-4xl font-bold text-purple-400 mb-2">
                  0.0%
                </div>
                <div className="text-sm text-purple-400/60 uppercase">
                  Meeting Rate
                </div>
              </div>
            </div>
            <div className="bg-[color:var(--t-panel)] border border-gray-800 p-8 rounded-lg text-center font-mono text-[color:var(--t-text)]">
              Detailed step performance funnel goes here.
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-8 max-w-2xl font-mono">
            <h2 className="text-xl font-bold text-white mb-6">
              Sequence Settings
            </h2>

            <div className="flex flex-col gap-6">
              <div>
                <label className="block text-xs text-[#00ff88]/60 uppercase mb-2">
                  Goal
                </label>
                <input
                  type="text"
                  value={sequence.goal || ""}
                  readOnly
                  className="w-full bg-[color:var(--t-panel)] border border-gray-700 rounded p-2 text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-[#00ff88]/60 uppercase mb-2">
                  Business Hours
                </label>
                <select className="w-full bg-[color:var(--t-panel)] border border-gray-700 rounded p-2 text-white">
                  <option>Mon-Fri, 9:00 AM - 5:00 PM</option>
                  <option>Mon-Sun, Any time</option>
                </select>
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-[#00ff88] w-4 h-4"
                  />
                  <span className="text-sm text-[color:var(--t-text)]">
                    Skip Weekends & Holidays
                  </span>
                </label>
              </div>
              <div>
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked
                    readOnly
                    className="accent-[#00ff88] w-4 h-4"
                  />
                  <span className="text-sm text-[color:var(--t-text)]">
                    Stop sequence when lead replies
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
