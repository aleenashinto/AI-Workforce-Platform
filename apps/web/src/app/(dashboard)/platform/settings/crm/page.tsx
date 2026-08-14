"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Cloud, Link2, CheckCircle2, ArrowRight } from "lucide-react";
import { fetchApi } from "@/lib/api";

export default function CRMSettingsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [settings, setSettings] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showHubspotForm, setShowHubspotForm] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const fetchSettings = async () => {
    try {
      const res = await fetchApi('/crm/settings');
      setSettings(res?.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
    fetchSettings();
  }, []);



  const handleConnect = async (provider: string) => {
    try {
      await fetchApi('/crm/settings', {
        method: "POST",
        body: JSON.stringify({ provider, credentials: { apiKey }, field_mappings: {} })
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      fetchSettings();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/set-state-in-effect
      fetchSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Link2 className="w-8 h-8 text-indigo-400" />
          Connect CRM
        </h1>
        <p className="text-muted-foreground mt-1">Sync your leads and customer data directly with your CRM.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* HubSpot Card */}
        <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 text-orange-500 font-bold text-2xl">
              H
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">HubSpot</CardTitle>
              {settings?.provider === 'hubspot' && settings?.status === 'active' ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mt-1">Connected</Badge>
              ) : (
                <Badge variant="outline" className="border-gray-500/30 text-gray-400 mt-1">Not Connected</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {settings?.provider === 'hubspot' && settings?.status === 'active' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Last sync: {settings?.last_sync_at ? new Date(settings.last_sync_at).toLocaleString() : 'Never'}</p>
                <div className="flex gap-3">
                  <Button onClick={handleSync} disabled={syncing} className="bg-indigo-600 hover:bg-indigo-700">
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {showHubspotForm ? (
                  <div className="space-y-3">
                    <Input 
                      placeholder="HubSpot API Key" 
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="bg-[#2A2A3C] border-[#3F3F5A] text-white" 
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleConnect('hubspot')} className="bg-orange-500 hover:bg-orange-600 flex-1">Connect</Button>
                      <Button variant="outline" onClick={() => setShowHubspotForm(false)} className="border-[#3F3F5A] text-gray-300 hover:text-white">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  <Button onClick={() => setShowHubspotForm(true)} className="w-full bg-orange-500 hover:bg-orange-600">Connect HubSpot</Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Salesforce Card */}
        <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
          <CardHeader className="flex flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <Cloud className="w-6 h-6 text-blue-500" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">Salesforce</CardTitle>
              {settings?.provider === 'salesforce' && settings?.status === 'active' ? (
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 mt-1">Connected</Badge>
              ) : (
                <Badge variant="outline" className="border-gray-500/30 text-gray-400 mt-1">Not Connected</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {settings?.provider === 'salesforce' && settings?.status === 'active' ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-400">Last sync: {settings?.last_sync_at ? new Date(settings.last_sync_at).toLocaleString() : 'Never'}</p>
                <div className="flex gap-3">
                  <Button onClick={handleSync} disabled={syncing} className="bg-blue-600 hover:bg-blue-700">
                    {syncing ? 'Syncing...' : 'Sync Now'}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="outline" className="w-full border-[#3F3F5A] text-gray-300 hover:text-white" onClick={() => alert("Salesforce coming soon!")}>
                Connect Salesforce
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
        <CardHeader>
          <CardTitle>Field Mapping</CardTitle>
          <CardDescription className="text-gray-400">How your AI data maps to CRM fields</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-[#2A2A3C] rounded-lg border border-[#3F3F5A]">
              <div className="flex-1 font-medium text-gray-300">Lead Name</div>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <div className="flex-1 font-medium text-indigo-300 text-right">Contact Name</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-[#2A2A3C] rounded-lg border border-[#3F3F5A]">
              <div className="flex-1 font-medium text-gray-300">Email</div>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <div className="flex-1 font-medium text-indigo-300 text-right">Email</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-[#2A2A3C] rounded-lg border border-[#3F3F5A]">
              <div className="flex-1 font-medium text-gray-300">Company</div>
              <ArrowRight className="w-4 h-4 text-gray-500" />
              <div className="flex-1 font-medium text-indigo-300 text-right">Account</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
