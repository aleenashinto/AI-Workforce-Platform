"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import {
  ArrowLeft,
  Activity,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Send,
  Pause,
  Play,
  Trash2,
  Mail,
  Users,
  Repeat,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MailboxDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id } = use(params);

  const [mailbox, setMailbox] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [showTestModal, setShowTestModal] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testMsg, setTestMsg] = useState("Testing mailbox connection.");

  const fetchMailbox = useCallback(async () => {
    try {
      const response = (await apiClient.get(`/mailboxes/${id}`)) as {
        success: boolean;
        data: any;
      };
      if (response?.success) {
        setMailbox(response.data);
      }

      const actRes = (await apiClient.get(`/mailboxes/${id}/activity`)) as {
        success: boolean;
        data: any[];
      };
      if (actRes?.success) {
        setActivities(actRes.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchMailbox();
  }, [fetchMailbox]);

  const handleStatusChange = async (newStatus: string) => {
    try {
      await apiClient.patch(`/mailboxes/${id}`, { status: newStatus });
      fetchMailbox();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTest = async () => {
    try {
      await apiClient.post(`/mailboxes/${id}/test`, {
        to: testEmail,
        subject: "Test Email from AI Sales Assistant",
        message: testMsg,
      });
      setShowTestModal(false);
      fetchMailbox();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading)
    return (
      <div className="p-8 text-[color:var(--t-g)]/50 font-mono">Loading mailbox...</div>
    );
  if (!mailbox)
    return <div className="p-8 text-red-400 font-mono">Mailbox not found.</div>;

  return (
    <div className="h-full flex flex-col bg-[color:var(--t-bg)]">
      {/* HEADER */}
      <header className="h-16 border-b border-[color:var(--t-g)]/20 flex items-center justify-between px-6 bg-[color:var(--t-panel)] shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/sales-assistant/mailboxes"
            className="p-1.5 rounded hover:bg-[color:var(--t-g)]/10 text-gray-400 hover:text-[color:var(--t-g)] transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-bold text-white flex items-center gap-2">
              {mailbox.display_name || mailbox.email}
              <span
                className={`px-2 py-0.5 rounded text-[10px] uppercase border ${
                  mailbox.status === "connected" || mailbox.status === "healthy"
                    ? "bg-[color:var(--t-g)]/10 text-[color:var(--t-g)] border-[color:var(--t-g)]/30"
                    : mailbox.status === "paused"
                      ? "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                      : "bg-red-400/10 text-red-400 border-red-400/30"
                }`}
              >
                {mailbox.status}
              </span>
            </span>
            <span className="text-xs text-[color:var(--t-g)]/60 font-mono">
              {mailbox.email}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 font-mono text-sm">
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-2 px-4 py-1.5 rounded border border-gray-600 text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <Send size={14} /> TEST
          </button>

          {mailbox.status === "paused" ? (
            <button
              onClick={() => handleStatusChange("connected")}
              className="flex items-center gap-2 px-4 py-1.5 rounded border border-[color:var(--t-g)]/50 text-[color:var(--t-g)] hover:bg-[color:var(--t-g)]/10 transition-colors"
            >
              <Play size={14} /> RESUME
            </button>
          ) : (
            <button
              onClick={() => handleStatusChange("paused")}
              className="flex items-center gap-2 px-4 py-1.5 rounded border border-yellow-400/50 text-yellow-400 hover:bg-yellow-400/10 transition-colors"
            >
              <Pause size={14} /> PAUSE
            </button>
          )}

          <button className="flex items-center gap-2 px-4 py-1.5 rounded border border-red-500/50 text-red-400 hover:bg-red-500/10 transition-colors ml-2">
            <Repeat size={14} /> RECONNECT
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="flex border-b border-[color:var(--t-g)]/20 bg-[color:var(--t-bg2)] px-6 font-mono text-sm shrink-0">
        <button
          onClick={() => setActiveTab("overview")}
          className={`px-6 py-3 border-b-2 transition-colors ${activeTab === "overview" ? "border-[color:var(--t-g)] text-[color:var(--t-g)]" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          OVERVIEW
        </button>
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-6 py-3 border-b-2 transition-colors ${activeTab === "activity" ? "border-[color:var(--t-g)] text-[color:var(--t-g)]" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          ACTIVITY
        </button>
        <button
          onClick={() => setActiveTab("sequences")}
          className={`px-6 py-3 border-b-2 transition-colors flex items-center gap-2 ${activeTab === "sequences" ? "border-[color:var(--t-g)] text-[color:var(--t-g)]" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          SEQUENCES{" "}
          <span className="bg-[color:var(--t-g)]/20 text-[color:var(--t-g)] px-1.5 rounded text-xs">
            {mailbox.assigned_sequences?.length || 0}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-6 py-3 border-b-2 transition-colors ${activeTab === "settings" ? "border-[color:var(--t-g)] text-[color:var(--t-g)]" : "border-transparent text-gray-400 hover:text-white"}`}
        >
          SETTINGS
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-8">
        {activeTab === "overview" && (
          <div className="max-w-4xl font-mono">
            <h2 className="text-xl font-bold font-display text-white mb-6">
              Mailbox Health
            </h2>

            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/30 p-6 rounded-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-[color:var(--t-g)]/5">
                  <CheckCircle size={100} />
                </div>
                <div className="text-sm text-[color:var(--t-g)] mb-2 uppercase font-bold flex items-center gap-2">
                  <CheckCircle size={16} /> Operational
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {mailbox.health_score}%
                </div>
                <div className="text-xs text-gray-400">Health Score</div>
              </div>

              <div className="bg-[color:var(--t-panel)] border border-blue-400/30 p-6 rounded-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-blue-400/5">
                  <Send size={100} />
                </div>
                <div className="text-sm text-blue-400 mb-2 uppercase font-bold flex items-center gap-2">
                  <Send size={16} /> Daily Limit
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {mailbox.stats?.used_today || 0}{" "}
                  <span className="text-gray-600 text-lg">
                    / {mailbox.daily_cap}
                  </span>
                </div>
                <div className="text-xs text-gray-400">Emails sent today</div>
              </div>

              <div className="bg-[color:var(--t-panel)] border border-purple-400/30 p-6 rounded-lg relative overflow-hidden">
                <div className="absolute -right-4 -top-4 text-purple-400/5">
                  <Activity size={100} />
                </div>
                <div className="text-sm text-purple-400 mb-2 uppercase font-bold flex items-center gap-2">
                  <Activity size={16} /> Capacity
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {mailbox.stats?.remaining_today || mailbox.daily_cap}
                </div>
                <div className="text-xs text-gray-400">Remaining today</div>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-4">
              Configuration Summary
            </h3>
            <div className="bg-[color:var(--t-panel)] border border-gray-700 rounded-lg p-6 grid grid-cols-2 gap-y-6">
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Provider
                </div>
                <div className="text-sm text-white capitalize">
                  {mailbox.provider}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Timezone
                </div>
                <div className="text-sm text-white">
                  {mailbox.timezone || "UTC"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Working Days
                </div>
                <div className="text-sm text-white">
                  {(mailbox.working_days || []).join(", ")}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 uppercase mb-1">
                  Working Hours
                </div>
                <div className="text-sm text-white">
                  {mailbox.working_hours?.start || "09:00"} -{" "}
                  {mailbox.working_hours?.end || "17:00"}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "activity" && (
          <div className="font-mono">
            <h2 className="text-xl font-bold text-white mb-6">
              Activity Timeline
            </h2>
            <div className="bg-[color:var(--t-panel)] border border-gray-700 rounded-lg overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[color:var(--t-bg2)] border-b border-gray-700 text-xs text-gray-500 uppercase tracking-wider">
                    <th className="p-4 font-normal">Date / Time</th>
                    <th className="p-4 font-normal">Event</th>
                    <th className="p-4 font-normal">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {activities.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="p-8 text-center text-gray-500">
                        No recent activity.
                      </td>
                    </tr>
                  ) : (
                    activities.map((act) => (
                      <tr
                        key={act.id}
                        className="border-b border-gray-800 text-sm"
                      >
                        <td className="p-4 text-gray-400">
                          {new Date(act.created_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded text-xs uppercase border ${
                              act.event_type === "sent"
                                ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                                : act.event_type === "replied"
                                  ? "bg-[color:var(--t-g)]/10 text-[color:var(--t-g)] border-[color:var(--t-g)]/30"
                                  : act.event_type === "bounced"
                                    ? "bg-red-500/10 text-red-400 border-red-500/30"
                                    : "bg-gray-800 text-gray-400 border-gray-700"
                            }`}
                          >
                            {act.event_type}
                          </span>
                        </td>
                        <td className="p-4 text-gray-300">
                          {act.metadata?.test ? (
                            <span className="text-yellow-500 mr-2">[TEST]</span>
                          ) : null}
                          To: {act.metadata?.to || "Unknown"} -{" "}
                          {act.metadata?.subject}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "sequences" && (
          <div className="font-mono">
            <h2 className="text-xl font-bold text-white mb-6">
              Assigned Sequences
            </h2>
            <p className="text-gray-400 mb-6">
              This mailbox is used to send emails for the following sequences.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {mailbox.assigned_sequences?.length === 0 ? (
                <div className="p-8 border border-dashed border-gray-700 rounded-lg text-center text-gray-500">
                  No sequences assigned to this mailbox.
                </div>
              ) : (
                mailbox.assigned_sequences?.map((s: any) => (
                  <div
                    key={s.id}
                    className="bg-[color:var(--t-panel)] border border-gray-700 p-4 rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <div className="font-bold text-white mb-1">{s.name}</div>
                      <div className="text-xs text-gray-400">
                        {s.goal || "No goal set"}
                      </div>
                    </div>
                    <Link
                      href={`/sales-assistant/sequences/${s.id}`}
                      className="px-4 py-1.5 bg-gray-800 text-gray-300 hover:text-white rounded text-sm transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="font-mono max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-6">
              Mailbox Settings
            </h2>

            <div className="flex flex-col gap-6">
              <div className="bg-[color:var(--t-panel)] border border-gray-700 p-6 rounded-lg flex flex-col gap-4">
                <h3 className="text-[color:var(--t-g)] uppercase text-sm font-bold border-b border-gray-700 pb-2">
                  Identity
                </h3>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-2">
                    Display Name
                  </label>
                  <input
                    type="text"
                    defaultValue={mailbox.display_name}
                    className="w-full bg-[color:var(--t-bg)] border border-gray-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-2">
                    Reply-To Address
                  </label>
                  <input
                    type="text"
                    defaultValue={mailbox.reply_to || mailbox.email}
                    className="w-full bg-[color:var(--t-bg)] border border-gray-700 rounded p-2 text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-2">
                    Signature (HTML)
                  </label>
                  <textarea
                    rows={4}
                    defaultValue={mailbox.signature || ""}
                    className="w-full bg-[color:var(--t-bg)] border border-gray-700 rounded p-2 text-white"
                    placeholder="Best regards,\nYour Name"
                  />
                </div>
              </div>

              <div className="bg-[color:var(--t-panel)] border border-gray-700 p-6 rounded-lg flex flex-col gap-4">
                <h3 className="text-[color:var(--t-g)] uppercase text-sm font-bold border-b border-gray-700 pb-2">
                  Sending Limits
                </h3>
                <div>
                  <label className="block text-xs text-gray-400 uppercase mb-2">
                    Daily Sending Cap
                  </label>
                  <input
                    type="number"
                    defaultValue={mailbox.daily_cap}
                    className="w-full bg-[color:var(--t-bg)] border border-gray-700 rounded p-2 text-white"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Maximum number of emails this mailbox can send per day to
                    protect sender reputation.
                  </p>
                </div>
              </div>

              <button className="bg-[color:var(--t-g)] text-black px-6 py-2 rounded font-bold self-end hover:bg-[color:var(--t-g2)] transition-colors shadow-[0_0_15px_rgba(var(--t-g-rgb), )]">
                SAVE SETTINGS
              </button>
            </div>
          </div>
        )}
      </div>

      {showTestModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/30 rounded-lg w-full max-w-lg p-6 font-mono relative">
            <h2 className="text-xl font-bold text-white mb-2">
              Send Test Email
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Verify connection for {mailbox.email}
            </p>

            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">
                  To
                </label>
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  className="w-full bg-[color:var(--t-bg)] border border-gray-700 rounded p-2 text-white"
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-400 uppercase mb-1">
                  Message
                </label>
                <textarea
                  rows={3}
                  value={testMsg}
                  onChange={(e) => setTestMsg(e.target.value)}
                  className="w-full bg-[color:var(--t-bg)] border border-gray-700 rounded p-2 text-white"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowTestModal(false)}
                className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendTest}
                disabled={!testEmail}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-400 transition-colors disabled:opacity-50"
              >
                Send Test
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
