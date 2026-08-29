"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Mail,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Pause,
  Link as LinkIcon,
  Settings,
  MoreHorizontal,
  RefreshCw,
  XCircle,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Mailbox {
  id: string;
  email: string;
  display_name: string | null;
  provider: string;
  status: string;
  daily_cap: string | number;
  health_score: string | number;
  stats?: {
    sequences: number;
    used_today: number;
    reply_rate: string;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getStatusIcon(status: string) {
  switch (status) {
    case "connected":
    case "healthy":
    case "warmup":
      return <CheckCircle size={14} className="text-[#00ff88]" />;
    case "paused":
      return <Pause size={14} className="text-yellow-400" />;
    case "error":
    case "disconnected":
      return <AlertTriangle size={14} className="text-red-400" />;
    default:
      return <Mail size={14} className="text-gray-500" />;
  }
}

function getStatusColor(status: string) {
  if (status === "connected" || status === "healthy" || status === "warmup")
    return "text-[#00ff88]";
  if (status === "error" || status === "disconnected") return "text-red-400";
  if (status === "paused") return "text-yellow-400";
  return "text-gray-400";
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function MailboxesPage() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  // ── Filter state ─────────────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState("");
  const [providerFilter, setProviderFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showConnectModal, setShowConnectModal] = useState(false);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchMailboxes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = (await apiClient.get("/mailboxes")) as {
        success: boolean;
        data: Mailbox[];
        error?: string;
      };
      if (response?.success) {
        setMailboxes(response.data ?? []);
      } else {
        setError(response?.error ?? "Failed to load mailboxes");
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to load mailboxes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMailboxes();
  }, [fetchMailboxes]);

  // ── Stats derived from data ───────────────────────────────────────────────
  const stats = {
    total: mailboxes.length,
    connected: mailboxes.filter(
      (m) =>
        m.status === "connected" ||
        m.status === "healthy" ||
        m.status === "warmup",
    ).length,
    attention: mailboxes.filter(
      (m) => m.status === "error" || m.status === "disconnected",
    ).length,
    paused: mailboxes.filter((m) => m.status === "paused").length,
  };

  // ── Filtered list (search + provider + status all wired) ─────────────────
  const filteredMailboxes = mailboxes.filter((m) => {
    const search = searchTerm.toLowerCase();
    const matchesSearch =
      !search ||
      m.email.toLowerCase().includes(search) ||
      (m.display_name ?? "").toLowerCase().includes(search);

    const matchesProvider =
      providerFilter === "all" ||
      m.provider?.toLowerCase() === providerFilter.toLowerCase();

    const matchesStatus =
      statusFilter === "all" ||
      (() => {
        if (statusFilter === "connected")
          return (
            m.status === "connected" ||
            m.status === "healthy" ||
            m.status === "warmup"
          );
        if (statusFilter === "paused") return m.status === "paused";
        if (statusFilter === "error")
          return m.status === "error" || m.status === "disconnected";
        return m.status === statusFilter;
      })();

    return matchesSearch && matchesProvider && matchesStatus;
  });

  // ── Connect handler ───────────────────────────────────────────────────────
  const handleConnect = async (provider: string) => {
    setConnecting(true);
    setConnectError(null);
    try {
      const res = (await apiClient.post("/mailboxes/connect", {
        provider,
        email: `demo.${Date.now()}@${provider === "google" ? "gmail.com" : "outlook.com"}`,
        display_name: "Demo User",
      })) as { success: boolean; data: Mailbox; error?: string };

      if (res?.success) {
        setShowConnectModal(false);
        fetchMailboxes();
      } else {
        setConnectError(res?.error ?? "Failed to connect mailbox");
      }
    } catch (e: any) {
      setConnectError(e?.message ?? "Failed to connect mailbox");
    } finally {
      setConnecting(false);
    }
  };

  // ── Reset filters ─────────────────────────────────────────────────────────
  const hasActiveFilters =
    searchTerm !== "" || providerFilter !== "all" || statusFilter !== "all";

  const clearFilters = () => {
    setSearchTerm("");
    setProviderFilter("all");
    setStatusFilter("all");
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 h-full overflow-y-auto bg-[color:var(--t-bg)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-wider font-display mb-1 flex items-center gap-3">
            <Mail className="text-[#00ff88]" />
            MAILBOXES
          </h1>
          <p className="text-sm text-[#00ff88]/60 font-mono">
            Connect and manage the email accounts used by your Sales Assistant.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchMailboxes}
            className="bg-[color:var(--t-panel)] text-gray-300 border border-gray-700 px-4 py-2 rounded font-mono text-sm hover:bg-gray-800 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="bg-[color:var(--t-panel)] text-gray-300 border border-gray-700 px-4 py-2 rounded font-mono text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Settings size={16} /> Settings
          </button>
          <button
            onClick={() => {
              setConnectError(null);
              setShowConnectModal(true);
            }}
            className="bg-[#00ff88] text-[color:var(--t-bg)] px-4 py-2 rounded font-bold font-mono text-sm hover:bg-[#00cfff] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.4)]"
          >
            <Plus size={16} /> CONNECT MAILBOX
          </button>
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="mb-6 bg-red-900/20 border border-red-500/40 rounded-lg p-4 flex items-center gap-3 font-mono text-sm text-red-400">
          <AlertTriangle size={16} />
          {error}
          <button
            onClick={fetchMailboxes}
            className="ml-auto text-red-300 hover:text-white underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4 mb-8 font-mono">
        {[
          { label: "Total Mailboxes", value: stats.total, color: "text-white", border: "border-[#00ff88]/20" },
          { label: "Connected", value: stats.connected, color: "text-[#00ff88]", border: "border-[#00ff88]/20" },
          { label: "Attention Required", value: stats.attention, color: "text-red-400", border: "border-red-400/20" },
          { label: "Paused", value: stats.paused, color: "text-yellow-400", border: "border-yellow-400/20" },
        ].map(({ label, value, color, border }) => (
          <div
            key={label}
            className={`bg-[color:var(--t-panel)] border ${border} p-4 rounded-lg text-center`}
          >
            <div className={`text-3xl font-bold ${color} mb-1`}>{value}</div>
            <div className="text-xs text-[#00ff88]/60 uppercase">{label}</div>
          </div>
        ))}
      </div>

      {/* Table container */}
      <div className="bg-[color:var(--t-panel)] border border-[#00ff88]/20 rounded-lg overflow-hidden flex flex-col min-h-[500px]">
        {/* Filter bar */}
        <div className="p-4 border-b border-[#00ff88]/10 flex flex-wrap gap-3 items-center bg-[color:var(--t-bg2)]">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88]/40"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mailbox..."
              className="w-full bg-[color:var(--t-bg)] border border-[#00ff88]/20 rounded-md py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 font-mono"
            />
          </div>

          {/* Provider filter */}
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-[color:var(--t-bg)] border border-[#00ff88]/20 rounded-md py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 font-mono"
          >
            <option value="all">Provider: All</option>
            <option value="google">Google Workspace</option>
            <option value="microsoft">Microsoft 365</option>
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[color:var(--t-bg)] border border-[#00ff88]/20 rounded-md py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 font-mono"
          >
            <option value="all">Status: All</option>
            <option value="connected">Connected</option>
            <option value="paused">Paused</option>
            <option value="error">Error / Disconnected</option>
          </select>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs text-[#00ff88]/60 hover:text-[#00ff88] font-mono transition-colors"
            >
              <XCircle size={14} /> Clear
            </button>
          )}

          <div className="ml-auto text-xs text-gray-500 font-mono">
            {filteredMailboxes.length} of {mailboxes.length} mailbox
            {mailboxes.length !== 1 ? "es" : ""}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[color:var(--t-bg2)] border-b border-[#00ff88]/10 font-mono text-xs text-[#00ff88]/60 uppercase tracking-wider">
                <th className="p-4 font-normal">Mailbox</th>
                <th className="p-4 font-normal">Provider</th>
                <th className="p-4 font-normal">Health</th>
                <th className="p-4 font-normal">Usage</th>
                <th className="p-4 font-normal">Sequences</th>
                <th className="p-4 font-normal">Reply Rate</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                /* Skeleton rows */
                [1, 2, 3].map((i) => (
                  <tr key={i} className="border-b border-[#00ff88]/5">
                    {[1, 2, 3, 4, 5, 6, 7].map((j) => (
                      <td key={j} className="p-4">
                        <div className="h-4 bg-[#00ff88]/5 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filteredMailboxes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-12 text-center text-[#00ff88]/40 font-mono"
                  >
                    {hasActiveFilters
                      ? "No mailboxes match the current filters."
                      : "No mailboxes connected yet. Click CONNECT MAILBOX to get started."}
                  </td>
                </tr>
              ) : (
                filteredMailboxes.map((mb) => (
                  <tr
                    key={mb.id}
                    className="border-b border-[#00ff88]/5 hover:bg-[#00ff88]/5 transition-colors font-mono text-sm"
                  >
                    <td className="p-4">
                      <Link
                        href={`/sales-assistant/mailboxes/${mb.id}`}
                        className="font-bold text-white hover:text-[#00ff88] transition-colors block"
                      >
                        {mb.display_name || mb.email.split("@")[0]}
                      </Link>
                      <div className="text-xs text-gray-400 mt-1">
                        {mb.email}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300 capitalize">
                      {mb.provider ?? "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(mb.status)}
                        <span className={`capitalize ${getStatusColor(mb.status)}`}>
                          {mb.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {mb.stats?.used_today ?? 0} / {mb.daily_cap ?? "—"}
                    </td>
                    <td className="p-4 text-gray-400">
                      {mb.stats?.sequences ?? 0}
                    </td>
                    <td className="p-4 font-bold text-[#00cfff]">
                      {mb.stats?.reply_rate ?? "0.0"}%
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/sales-assistant/mailboxes/${mb.id}`}
                          className="p-1.5 bg-[#00ff88]/10 text-[#00ff88] rounded hover:bg-[#00ff88]/20 transition-colors text-xs font-bold uppercase px-3"
                        >
                          Open
                        </Link>
                        <button className="p-1.5 text-gray-400 hover:text-white transition-colors">
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Connect modal */}
      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[color:var(--t-panel)] border border-[#00ff88]/30 rounded-lg w-full max-w-lg p-6 font-mono relative">
            <h2 className="text-xl font-bold text-white mb-2">
              Connect your mailbox
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Choose your email provider
            </p>

            {connectError && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-500/40 rounded text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle size={14} />
                {connectError}
              </div>
            )}

            <div className="flex flex-col gap-4">
              {[
                {
                  id: "google",
                  label: "Google Workspace",
                  sub: "Gmail / Google Workspace",
                  icon: "G",
                  iconBg: "bg-white text-blue-500",
                },
                {
                  id: "microsoft",
                  label: "Microsoft 365",
                  sub: "Outlook / Microsoft 365",
                  icon: "M",
                  iconBg: "bg-blue-600 text-white",
                },
              ].map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => handleConnect(provider.id)}
                  disabled={connecting}
                  className="flex items-center justify-between p-4 border border-gray-700 hover:border-[#00ff88]/50 rounded-lg bg-[color:var(--t-bg)] transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded ${provider.iconBg} flex items-center justify-center font-sans font-bold text-lg`}
                    >
                      {connecting ? (
                        <RefreshCw size={18} className="animate-spin" />
                      ) : (
                        provider.icon
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-white font-bold group-hover:text-[#00ff88] transition-colors">
                        {provider.label}
                      </div>
                      <div className="text-xs text-gray-500">{provider.sub}</div>
                    </div>
                  </div>
                  <LinkIcon
                    size={16}
                    className="text-gray-500 group-hover:text-[#00ff88]"
                  />
                </button>
              ))}

              <button
                disabled
                className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-[color:var(--t-bg)]/50 opacity-50 cursor-not-allowed"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-gray-800 flex items-center justify-center font-sans font-bold text-lg text-gray-500">
                    @
                  </div>
                  <div className="text-left">
                    <div className="text-gray-400 font-bold">Other SMTP</div>
                    <div className="text-xs text-gray-600">Coming soon</div>
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setShowConnectModal(false)}
              className="mt-6 w-full py-2 text-center text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
