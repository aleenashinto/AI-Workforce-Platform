"use client";

import React, { useState, useEffect } from "react";
import {
  Mail,
  Plus,
  Search,
  CheckCircle,
  AlertTriangle,
  Pause,
  Link as LinkIcon,
  MailWarning,
  Settings,
  MoreHorizontal,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

export default function MailboxesPage() {
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    connected: 0,
    attention: 0,
    paused: 0,
  });
  const [showConnectModal, setShowConnectModal] = useState(false);

  useEffect(() => {
    fetchMailboxes();
  }, []);

  const fetchMailboxes = async () => {
    setLoading(true);
    try {
      // The sequences API was mounted on /sequences
      // Mailboxes API is likely mounted on /mailboxes based on `apps/api/server.ts` checking
      // Wait, let me double check where mailboxesRoutes is mounted if it is standard, probably `/mailboxes`.
      const response = (await apiClient.get("/mailboxes")) as {
        success: boolean;
        data: any[];
      };
      if (response?.success) {
        setMailboxes(response.data);

        let t = 0,
          c = 0,
          a = 0,
          p = 0;
        response.data.forEach((m) => {
          t++;
          if (
            m.status === "connected" ||
            m.status === "healthy" ||
            m.status === "warmup"
          )
            c++;
          if (m.status === "error" || m.status === "disconnected") a++;
          if (m.status === "paused") p++;
        });
        setStats({ total: t, connected: c, attention: a, paused: p });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: string) => {
    try {
      const res = (await apiClient.post("/mailboxes/connect", {
        provider,
        email: `demo.${Date.now()}@${provider === "google" ? "gmail.com" : "outlook.com"}`,
        display_name: "Demo User",
      })) as { success: boolean; data: any };

      if (res?.success) {
        setShowConnectModal(false);
        fetchMailboxes();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusIcon = (status: string) => {
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
  };

  const filteredMailboxes = mailboxes.filter(
    (m) =>
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.display_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="p-8 h-full overflow-y-auto bg-[#040810]">
      <div className="flex justify-between items-center mb-8">
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
          <button className="bg-[#0a1628] text-gray-300 border border-gray-700 px-4 py-2 rounded font-mono text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
            <Settings size={16} /> Settings
          </button>
          <button
            onClick={() => setShowConnectModal(true)}
            className="bg-[#00ff88] text-[#040810] px-4 py-2 rounded font-bold font-mono text-sm hover:bg-[#00cfff] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(0,255,136,0.4)]"
          >
            <Plus size={16} /> CONNECT MAILBOX
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 font-mono">
        <div className="bg-[#0a1628] border border-[#00ff88]/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {stats.total}
          </div>
          <div className="text-xs text-[#00ff88]/60 uppercase">
            Total Mailboxes
          </div>
        </div>
        <div className="bg-[#0a1628] border border-[#00ff88]/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-[#00ff88] mb-1">
            {stats.connected}
          </div>
          <div className="text-xs text-[#00ff88]/60 uppercase">Connected</div>
        </div>
        <div className="bg-[#0a1628] border border-red-400/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-red-400 mb-1">
            {stats.attention}
          </div>
          <div className="text-xs text-red-400/60 uppercase">
            Attention Required
          </div>
        </div>
        <div className="bg-[#0a1628] border border-yellow-400/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-yellow-400 mb-1">
            {stats.paused}
          </div>
          <div className="text-xs text-yellow-400/60 uppercase">Paused</div>
        </div>
      </div>

      <div className="bg-[#0a1628] border border-[#00ff88]/20 rounded-lg overflow-hidden flex flex-col min-h-[500px]">
        <div className="p-4 border-b border-[#00ff88]/10 flex gap-4 items-center bg-[#070e1a]">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#00ff88]/40"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search mailbox..."
              className="w-full bg-[#040810] border border-[#00ff88]/20 rounded-md py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 font-mono"
            />
          </div>
          <select className="bg-[#040810] border border-[#00ff88]/20 rounded-md py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 font-mono">
            <option>Provider: All</option>
            <option>Google Workspace</option>
            <option>Microsoft 365</option>
          </select>
          <select className="bg-[#040810] border border-[#00ff88]/20 rounded-md py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[#00ff88]/50 font-mono">
            <option>Status: All</option>
            <option>Connected</option>
            <option>Paused</option>
            <option>Error</option>
          </select>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#070e1a] border-b border-[#00ff88]/10 font-mono text-xs text-[#00ff88]/60 uppercase tracking-wider">
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
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[#00ff88]/50 font-mono"
                  >
                    Loading mailboxes...
                  </td>
                </tr>
              ) : filteredMailboxes.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[#00ff88]/50 font-mono"
                  >
                    No mailboxes found.
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
                      {mb.provider}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(mb.status)}
                        <span
                          className={`capitalize ${mb.status === "connected" || mb.status === "healthy" ? "text-[#00ff88]" : mb.status === "error" ? "text-red-400" : "text-yellow-400"}`}
                        >
                          {mb.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">
                      {mb.stats?.used_today || 0} / {mb.daily_cap}
                    </td>
                    <td className="p-4 text-gray-400">
                      {mb.stats?.sequences || 0}
                    </td>
                    <td className="p-4 font-bold text-[#00cfff]">
                      {mb.stats?.reply_rate || "0.0"}%
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

      {showConnectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a1628] border border-[#00ff88]/30 rounded-lg w-full max-w-lg p-6 font-mono relative">
            <h2 className="text-xl font-bold text-white mb-2">
              Connect your mailbox
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Choose your email provider
            </p>

            <div className="flex flex-col gap-4">
              <button
                onClick={() => handleConnect("google")}
                className="flex items-center justify-between p-4 border border-gray-700 hover:border-[#00ff88]/50 rounded-lg bg-[#040810] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center font-sans font-bold text-lg text-blue-500">
                    G
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold group-hover:text-[#00ff88] transition-colors">
                      Google Workspace
                    </div>
                    <div className="text-xs text-gray-500">
                      Gmail / Google Workspace
                    </div>
                  </div>
                </div>
                <LinkIcon
                  size={16}
                  className="text-gray-500 group-hover:text-[#00ff88]"
                />
              </button>

              <button
                onClick={() => handleConnect("microsoft")}
                className="flex items-center justify-between p-4 border border-gray-700 hover:border-[#00ff88]/50 rounded-lg bg-[#040810] transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center font-sans font-bold text-lg text-white">
                    M
                  </div>
                  <div className="text-left">
                    <div className="text-white font-bold group-hover:text-[#00ff88] transition-colors">
                      Microsoft 365
                    </div>
                    <div className="text-xs text-gray-500">
                      Outlook / Microsoft 365
                    </div>
                  </div>
                </div>
                <LinkIcon
                  size={16}
                  className="text-gray-500 group-hover:text-[#00ff88]"
                />
              </button>

              <button
                disabled
                className="flex items-center justify-between p-4 border border-gray-800 rounded-lg bg-[#040810]/50 opacity-50 cursor-not-allowed"
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
