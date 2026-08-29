"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  Search,
  Mail,
  Bot,
  FileSearch,
  Trash2,
  Send,
  CheckCircle,
  Clock,
} from "lucide-react";
import { apiClient } from "@/lib/api/client";
import Link from "next/link";

export default function DraftsWorkspacePage() {
  const [drafts, setDrafts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    fetchDrafts();
  }, [filterType]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const qs = filterType !== "all" ? `?type=${filterType}` : "";
      const response = await apiClient.get(`/drafts${qs}`);
      if (response?.success) {
        setDrafts(response.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const deleteDraft = async (id: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      await apiClient.delete(`/drafts/${id}`);
      fetchDrafts();
    } catch (e) {
      console.error(e);
    }
  };

  const getIconForType = (type: string) => {
    switch (type) {
      case "email":
        return <Mail size={16} className="text-[color:var(--t-g)]" />;
      case "research_report":
        return <FileSearch size={16} className="text-[color:var(--t-g2)]" />;
      case "support_response":
        return <Bot size={16} className="text-orange-400" />;
      default:
        return <FileText size={16} className="text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 border border-gray-700">
            Draft
          </span>
        );
      case "approved":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-green-900/30 text-green-400 border border-green-800/50">
            Approved
          </span>
        );
      case "in_review":
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-yellow-900/30 text-yellow-400 border border-yellow-800/50">
            In Review
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-xs bg-gray-800 text-gray-300 border border-gray-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-8 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-wider font-display mb-1 flex items-center gap-3">
            <FileText className="text-[color:var(--t-g)]" />
            DRAFTS WORKSPACE
          </h1>
          <p className="text-sm text-[color:var(--t-g)]/60 font-mono">
            AI ASSISTS. HUMAN APPROVES. SYSTEM EXECUTES.
          </p>
        </div>
        <button
          className="bg-[color:var(--t-g)]/10 text-[color:var(--t-g)] border border-[color:var(--t-g)]/30 px-4 py-2 rounded font-mono text-sm hover:bg-[color:var(--t-g)]/20 transition-colors"
          onClick={() => {
            // Mock generate new draft
            apiClient
              .post("/drafts", {
                title: "New Untitled Draft",
                type: "email",
                source_type: "manual",
                status: "draft",
                subject: "",
                body: "AI generated content goes here...",
              })
              .then(() => fetchDrafts());
          }}
        >
          + NEW DRAFT
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8 font-mono">
        <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-[color:var(--t-g)]/10 rounded text-[color:var(--t-g)]">
            <FileText size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">{drafts.length}</div>
            <div className="text-xs text-[color:var(--t-g)]/60 uppercase">
              Total Drafts
            </div>
          </div>
        </div>
        <div className="bg-[color:var(--t-panel)] border border-orange-500/20 p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-orange-500/10 rounded text-orange-400">
            <Clock size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {
                drafts.filter(
                  (d) => d.status === "draft" || d.status === "in_review",
                ).length
              }
            </div>
            <div className="text-xs text-orange-400/60 uppercase">
              Needs Review
            </div>
          </div>
        </div>
        <div className="bg-[color:var(--t-panel)] border border-green-500/20 p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-green-500/10 rounded text-green-400">
            <CheckCircle size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {drafts.filter((d) => d.status === "approved").length}
            </div>
            <div className="text-xs text-green-400/60 uppercase">Approved</div>
          </div>
        </div>
        <div className="bg-[color:var(--t-panel)] border border-blue-500/20 p-4 rounded-lg flex items-center gap-4">
          <div className="p-3 bg-blue-500/10 rounded text-blue-400">
            <Send size={24} />
          </div>
          <div>
            <div className="text-2xl font-bold">
              {drafts.filter((d) => d.status === "sent").length}
            </div>
            <div className="text-xs text-blue-400/60 uppercase">
              Sent / Executed
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[color:var(--t-panel)] border border-[color:var(--t-g)]/20 rounded-lg overflow-hidden flex flex-col">
        <div className="p-4 border-b border-[color:var(--t-g)]/10 flex gap-4 items-center bg-[color:var(--t-bg2)]">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--t-g)]/40"
              size={16}
            />
            <input
              type="text"
              placeholder="Search drafts..."
              className="w-full bg-[color:var(--t-bg)] border border-[color:var(--t-g)]/20 rounded-md py-1.5 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-[color:var(--t-g)]/50 font-mono"
            />
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[color:var(--t-bg)] border border-[color:var(--t-g)]/20 rounded-md py-1.5 px-3 text-sm text-white focus:outline-none focus:border-[color:var(--t-g)]/50 font-mono"
          >
            <option value="all">All Types</option>
            <option value="email">Email</option>
            <option value="research_report">Research Report</option>
            <option value="support_response">Support Response</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[color:var(--t-bg2)] border-b border-[color:var(--t-g)]/10 font-mono text-xs text-[color:var(--t-g)]/60 uppercase tracking-wider">
                <th className="p-4 w-10"></th>
                <th className="p-4 font-normal">Type</th>
                <th className="p-4 font-normal">Title / Subject</th>
                <th className="p-4 font-normal">Status</th>
                <th className="p-4 font-normal">Source</th>
                <th className="p-4 font-normal">Last Updated</th>
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
                    Loading drafts...
                  </td>
                </tr>
              ) : drafts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="p-8 text-center text-[color:var(--t-g)]/50 font-mono"
                  >
                    No drafts found.
                  </td>
                </tr>
              ) : (
                drafts.map((draft) => (
                  <tr
                    key={draft.id}
                    className="border-b border-[color:var(--t-g)]/5 hover:bg-[color:var(--t-g)]/5 transition-colors font-mono text-sm"
                  >
                    <td className="p-4 text-center">
                      <div className="w-8 h-8 rounded bg-[color:var(--t-bg)] border border-[color:var(--t-g)]/20 flex items-center justify-center">
                        {getIconForType(draft.type)}
                      </div>
                    </td>
                    <td className="p-4 text-gray-400 capitalize">
                      {draft.type?.replace("_", " ") || "Unknown"}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/drafts/${draft.id}`}
                        className="text-white hover:text-[color:var(--t-g)] font-semibold truncate block max-w-[300px]"
                      >
                        {draft.title || draft.subject || "Untitled Draft"}
                      </Link>
                    </td>
                    <td className="p-4">{getStatusBadge(draft.status)}</td>
                    <td className="p-4 text-[color:var(--t-g)]/70 capitalize">
                      {draft.source_type || "-"}
                    </td>
                    <td className="p-4 text-gray-500 text-xs">
                      {new Date(draft.updated_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/drafts/${draft.id}`}
                          className="p-1.5 hover:bg-[color:var(--t-g)]/10 rounded text-gray-400 hover:text-[color:var(--t-g)] transition-colors"
                        >
                          <FileText size={16} />
                        </Link>
                        <button
                          onClick={() => deleteDraft(draft.id)}
                          className="p-1.5 hover:bg-red-500/10 rounded text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 size={16} />
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
    </div>
  );
}
