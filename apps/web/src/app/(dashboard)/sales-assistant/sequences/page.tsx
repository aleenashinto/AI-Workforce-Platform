"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Plus,
  Search,
  Play,
  Pause,
  CheckCircle,
  Archive,
  MoreHorizontal,
  FileText,
  BarChart3,
  Edit3,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SequencesPage() {
  const router = useRouter();
  const [sequences, setSequences] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    paused: 0,
    completed: 0,
    enrolled: 0,
  });

  useEffect(() => {
    fetchSequences();
  }, []);

  const fetchSequences = async () => {
    setLoading(true);
    try {
      const response = (await apiClient.get("/sequences")) as {
        success: boolean;
        data: any[];
      };
      if (response?.success) {
        setSequences(response.data);

        let t = 0,
          a = 0,
          p = 0,
          c = 0,
          e = 0;
        response.data.forEach((s) => {
          t++;
          if (s.status === "active") a++;
          if (s.status === "paused") p++;
          if (s.status === "completed") c++;
          e += s.stats?.enrolled || 0;
        });
        setStats({ total: t, active: a, paused: p, completed: c, enrolled: e });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const res = (await apiClient.post("/sequences", {
        name: "New Sequence",
        steps: [{ name: "Initial Email", type: "email", day_offset: 0 }],
      })) as { success: boolean; data: any };
      if (res?.success) {
        router.push(`/sales-assistant/sequences/${res.data.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Play size={14} className="text-[color:var(--t-g)]" />;
      case "paused":
        return <Pause size={14} className="text-yellow-400" />;
      case "completed":
        return <CheckCircle size={14} className="text-blue-400" />;
      case "draft":
        return <Edit3 size={14} className="text-gray-400" />;
      default:
        return <Archive size={14} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "text-[color:var(--t-g)]";
      case "paused":
        return "text-yellow-400";
      case "completed":
        return "text-blue-400";
      default:
        return "text-gray-400";
    }
  };

  const filteredSequences = sequences.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8 h-full overflow-y-auto bg-[color:var(--t-bg)]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold font-display tracking-wider text-white flex items-center gap-3">
            <Send className="text-[color:var(--t-g)]" />
            SEQUENCES
          </h1>
          <p className="text-sm text-[color:var(--t-g)]/60 font-mono">
            Automate personalized sales outreach and follow-ups.
          </p>
        </div>
        <div className="flex gap-3">
          <button className="bg-[color:var(--t-panel)] text-gray-300 border border-gray-700 px-4 py-2 rounded font-mono text-sm hover:bg-gray-800 transition-colors flex items-center gap-2">
            <FileText size={16} /> Templates
          </button>
          <button
            onClick={handleCreate}
            className="bg-[color:var(--t-g)] text-[color:var(--t-bg)] px-4 py-2 rounded font-bold font-mono text-sm hover:bg-[color:var(--t-g2)] transition-colors flex items-center gap-2 shadow-[0_0_15px_rgba(var(--t-g-rgb), )]"
          >
            <Plus size={16} /> CREATE SEQUENCE
          </button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-4 mb-8 font-mono">
        <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {stats.total}
          </div>
          <div className="text-xs text-[color:var(--t-g)]/60 uppercase">Total</div>
        </div>
        <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-[color:var(--t-g)] mb-1">
            {stats.active}
          </div>
          <div className="text-xs text-[color:var(--t-g)]/60 uppercase">Active</div>
        </div>
        <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-gray-400 mb-1">
            {stats.paused}
          </div>
          <div className="text-xs text-[color:var(--t-g)]/60 uppercase">Paused</div>
        </div>
        <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-[color:var(--t-g2)] mb-1">
            {stats.completed}
          </div>
          <div className="text-xs text-[color:var(--t-g)]/60 uppercase">Completed</div>
        </div>
        <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 p-4 rounded-lg text-center">
          <div className="text-3xl font-bold text-[#ff3355] mb-1">
            {stats.completed > 0 ? "3.2%" : "0.0%"}
          </div>
          <div className="text-xs text-[color:var(--t-g)]/60 uppercase">Bounce Rate</div>
        </div>
      </div>

      <div className="bg-[color:var(--t-panel)] rounded-xl border border-[color:var(--t-g)]/20 overflow-hidden flex flex-col h-[calc(100vh-300px)]">
        <div className="p-4 border-b border-[color:var(--t-g)]/20 flex justify-between items-center bg-[color:var(--t-bg)]">
          <div className="relative w-96">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--t-g)]/40"
              size={16}
            />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search sequences..."
              className="w-full bg-[color:var(--t-bg)] border border-[color:var(--t-g)]/20 rounded-md py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[color:var(--t-g)]/50 font-mono"
            />
          </div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[color:var(--t-bg)] border border-[color:var(--t-g)]/20 rounded-md py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[color:var(--t-g)]/50 font-mono"
          >
            <option value="All">Status: All</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="draft">Draft</option>
          </select>
        </div>

        <div className="overflow-x-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[color:var(--t-bg2)] border-b border-[color:var(--t-g)]/10 font-mono text-xs text-[color:var(--t-g)]/60 uppercase tracking-wider">
                <th className="p-4 font-normal">Sequence Name</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal text-right">Enrolled</th>
                <th className="p-4 font-normal text-right">Active</th>
                <th className="p-4 font-normal text-right">Completed</th>
                <th className="p-4 font-normal text-right">Reply Rate</th>
                <th className="p-4 font-normal text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[color:var(--t-g)]/50 font-mono"
                  >
                    Loading sequences...
                  </td>
                </tr>
              ) : filteredSequences.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[color:var(--t-g)]/50 font-mono"
                  >
                    No sequences found.
                  </td>
                </tr>
              ) : (
                filteredSequences.map((seq) => (
                  <tr
                    key={seq.id}
                    className="border-b border-[color:var(--t-g)]/5 hover:bg-[color:var(--t-g)]/5 transition-colors font-mono text-sm"
                  >
                    <td className="p-4">
                      <Link
                        href={`/sales-assistant/sequences/${seq.id}`}
                        className="text-white hover:text-[color:var(--t-g)] font-semibold flex items-center gap-2"
                      >
                        {seq.name}
                      </Link>
                      <div className="text-xs text-gray-500 mt-1">
                        Updated {new Date(seq.updated_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4">
                      <div
                        className={`flex items-center gap-1.5 uppercase text-xs font-bold ${getStatusColor(seq.status)}`}
                      >
                        {getStatusIcon(seq.status)} {seq.status}
                      </div>
                    </td>
                    <td className="p-4 text-right text-gray-300">
                      {seq.stats?.enrolled || 0}
                    </td>
                    <td className="p-4 text-right text-[color:var(--t-g)]">
                      {seq.stats?.active || 0}
                    </td>
                    <td className="p-4 text-right text-gray-400">
                      {seq.stats?.completed || 0}
                    </td>
                    <td className="p-4 text-right text-[color:var(--t-g2)] font-bold">
                      {seq.stats?.reply_rate || "0.0"}%
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/sales-assistant/sequences/${seq.id}`}
                          className="p-1.5 bg-[color:var(--t-g)]/10 text-[color:var(--t-g)] rounded hover:bg-[color:var(--t-g)]/20 transition-colors text-xs font-bold uppercase px-3"
                        >
                          Open
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
