"use client";

import { useState, useEffect } from "react";
import { Cloud, Link2, CheckCircle2, ArrowRight, RefreshCw, AlertTriangle, Key } from "lucide-react";
import { apiClient } from "@/lib/api/client";

interface Integration {
  id: string;
  provider: string;
  category: string;
  sync_status: string;
  last_sync_at: string | null;
}

export default function CRMSettingsPage() {
  const [integrationsList, setIntegrationsList] = useState<Integration[]>([]);
  const [loading, setLoading]         = useState(true);
  const [syncing, setSyncing]         = useState<string | null>(null);
  const [connecting, setConnecting]   = useState<string | null>(null);
  const [error, setError]             = useState<string | null>(null);

  const [showHubspotForm,    setShowHubspotForm]    = useState(false);
  const [hubspotKey,         setHubspotKey]         = useState("");
  const [showSalesforceForm, setShowSalesforceForm] = useState(false);
  const [salesforceKey,      setSalesforceKey]      = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = (await apiClient.get("/crm/settings?category=crm")) as {
        success: boolean;
        data: Integration[];
      };
      if (res?.success) setIntegrationsList(res.data ?? []);
    } catch (e: any) {
      setError(e?.message ?? "Failed to load CRM settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const getIntegration = (provider: string) =>
    integrationsList.find((i) => i.provider === provider);

  const isConnected = (provider: string) =>
    getIntegration(provider)?.sync_status === "active";

  const handleConnect = async (provider: string, apiKey: string) => {
    setConnecting(provider);
    setError(null);
    try {
      const res = (await apiClient.post("/crm/settings", {
        category: "crm",
        provider,
        credentials: { apiKey },
        config: {},
      })) as { success: boolean; error?: string };
      if (res?.success) {
        setShowHubspotForm(false);
        setShowSalesforceForm(false);
        setHubspotKey("");
        setSalesforceKey("");
        fetchSettings();
      } else {
        setError(res?.error ?? "Connection failed");
      }
    } catch (e: any) {
      setError(e?.message ?? "Connection failed");
    } finally {
      setConnecting(null);
    }
  };

  const handleSync = async (provider: string) => {
    setSyncing(provider);
    try {
      await apiClient.post("/crm/sync", { provider });
      fetchSettings();
    } catch (e: any) {
      setError(e?.message ?? "Sync failed");
    } finally {
      setSyncing(null);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Link2 className="w-8 h-8 text-indigo-400" />
          Connect CRM
        </h1>
        <p className="text-gray-400 mt-1">
          Sync your leads and customer data directly with your CRM.
        </p>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-900/20 border border-red-500/40 rounded-lg text-red-400 text-sm">
          <AlertTriangle size={16} /> {error}
          <button onClick={fetchSettings} className="ml-auto underline text-red-300 hover:text-white">
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {/* ─── HubSpot Card ─────────────────────────────────────── */}
          <div className="bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 font-bold text-2xl">
                H
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold">HubSpot</div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-mono mt-1 inline-block ${isConnected("hubspot") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "text-gray-400 border-gray-600"}`}>
                  {isConnected("hubspot") ? "● Connected" : "Not Connected"}
                </span>
              </div>
            </div>

            {isConnected("hubspot") ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Last sync: {getIntegration("hubspot")?.last_sync_at
                    ? new Date(getIntegration("hubspot")!.last_sync_at!).toLocaleString()
                    : "Never"}
                </p>
                <button
                  onClick={() => handleSync("hubspot")}
                  disabled={syncing === "hubspot"}
                  className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncing === "hubspot" ? "animate-spin" : ""} />
                  {syncing === "hubspot" ? "Syncing…" : "Sync Now"}
                </button>
              </div>
            ) : showHubspotForm ? (
              <div className="space-y-3">
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={hubspotKey}
                    onChange={(e) => setHubspotKey(e.target.value)}
                    placeholder="HubSpot Private App Token"
                    className="w-full bg-[#2A2A3C] border border-[#3F3F5A] text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConnect("hubspot", hubspotKey)}
                    disabled={!hubspotKey || connecting === "hubspot"}
                    className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {connecting === "hubspot" ? "Connecting…" : "Connect"}
                  </button>
                  <button
                    onClick={() => setShowHubspotForm(false)}
                    className="px-4 py-2 border border-[#3F3F5A] text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowHubspotForm(true)}
                className="w-full px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Connect HubSpot
              </button>
            )}
          </div>

          {/* ─── Salesforce Card ──────────────────────────────────── */}
          <div className="bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                <Cloud className="w-6 h-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="text-xl font-semibold">Salesforce</div>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-mono mt-1 inline-block ${isConnected("salesforce") ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" : "text-gray-400 border-gray-600"}`}>
                  {isConnected("salesforce") ? "● Connected" : "Not Connected"}
                </span>
              </div>
            </div>

            {isConnected("salesforce") ? (
              <div className="space-y-3">
                <p className="text-sm text-gray-400 flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-emerald-400" />
                  Last sync: {getIntegration("salesforce")?.last_sync_at
                    ? new Date(getIntegration("salesforce")!.last_sync_at!).toLocaleString()
                    : "Never"}
                </p>
                <button
                  onClick={() => handleSync("salesforce")}
                  disabled={syncing === "salesforce"}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw size={14} className={syncing === "salesforce" ? "animate-spin" : ""} />
                  {syncing === "salesforce" ? "Syncing…" : "Sync Now"}
                </button>
              </div>
            ) : showSalesforceForm ? (
              <div className="space-y-3">
                <div className="relative">
                  <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    value={salesforceKey}
                    onChange={(e) => setSalesforceKey(e.target.value)}
                    placeholder="Salesforce Connected App Token"
                    className="w-full bg-[#2A2A3C] border border-[#3F3F5A] text-white rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleConnect("salesforce", salesforceKey)}
                    disabled={!salesforceKey || connecting === "salesforce"}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors"
                  >
                    {connecting === "salesforce" ? "Connecting…" : "Connect"}
                  </button>
                  <button
                    onClick={() => setShowSalesforceForm(false)}
                    className="px-4 py-2 border border-[#3F3F5A] text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setShowSalesforceForm(true)}
                className="w-full px-4 py-2 border border-[#3F3F5A] text-gray-300 hover:text-white rounded-lg text-sm transition-colors"
              >
                Connect Salesforce
              </button>
            )}
          </div>
        </div>
      )}

      {/* ─── Field Mapping ────────────────────────────────────────── */}
      <div className="bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl p-6 text-white">
        <div className="mb-4">
          <div className="text-lg font-semibold">Field Mapping</div>
          <div className="text-sm text-gray-400 mt-1">How your AI data maps to CRM fields</div>
        </div>
        <div className="space-y-3">
          {[
            { from: "Lead Name",  to: "Contact Name" },
            { from: "Email",      to: "Email"         },
            { from: "Company",    to: "Account"       },
            { from: "AI Score",   to: "Lead Score"    },
            { from: "Status",     to: "Lead Status"   },
          ].map(({ from, to }) => (
            <div key={from} className="flex items-center gap-4 p-3 bg-[#2A2A3C] rounded-lg border border-[#3F3F5A]">
              <div className="flex-1 text-sm font-medium text-gray-300">{from}</div>
              <ArrowRight className="w-4 h-4 text-gray-500 shrink-0" />
              <div className="flex-1 text-sm font-medium text-indigo-300 text-right">{to}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
