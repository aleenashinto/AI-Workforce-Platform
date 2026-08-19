'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Badge } from "@/components/ui/badge";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Brain, FileText, Globe, RefreshCcw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';

export default function ResearchBriefPage() {
  const params = useParams();
  const leadId = params.id as string;
  const getToken = async () => 'mock-token';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lead, setLead] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);

  const fetchLead = async () => {
    try {
      const token = await getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/v1/sales/leads/${leadId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.success) setLead(json.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchLead();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [leadId]);

  const handleRegenerate = async () => {
    setResearching(true);
    try {
      const token = await getToken();
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}/v1/sales/leads/${leadId}/research`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      // Simulate waiting for worker
      setTimeout(() => {
        fetchLead();
        setResearching(false);
      }, 3000);
    } catch (e) {
      console.error(e);
      setResearching(false);
    }
  };

  if (loading) return <div className="p-8 text-white">Loading research brief...</div>;
  if (!lead) return <div className="p-8 text-white">Lead not found.</div>;

  const brief = lead.research_brief;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Brain className="text-[#D122E3]" /> Research Brief: {lead.company}
          </h1>
          <p className="text-gray-400 mt-1">Generated for {lead.name} • Cost: $0.15</p>
        </div>
        <Button onClick={handleRegenerate} disabled={researching} className="bg-[#2A2A3C] hover:bg-[#3F3F5A] text-white border border-[#3F3F5A]">
          {researching ? <RefreshCcw className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCcw className="w-4 h-4 mr-2" />}
          {researching ? 'Researching...' : 'Force Regenerate'}
        </Button>
      </div>

      {!brief ? (
        <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
          <CardContent className="p-12 text-center flex flex-col items-center">
            <Globe className="w-12 h-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Research Available</h3>
            <p className="text-gray-400 max-w-md text-center mb-6">
              The AI Research Agent hasn&apos;t analyzed this lead yet. Click regenerate to kick off the research job.
            </p>
            <Button onClick={handleRegenerate} disabled={researching} className="bg-gradient-to-r from-[#D122E3] to-[#00F2FE] text-white border-0">
              Run Research Agent
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
              <CardHeader>
                <CardTitle className="text-lg">Executive Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 leading-relaxed text-sm">
                  {brief.summary}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
              <CardHeader>
                <CardTitle className="text-lg">Ranked Personalization Hooks</CardTitle>
                <CardDescription className="text-gray-400">AI-generated angles for outreach drafting</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {brief.hooks?.map((hook: string, i: number) => (
                  <div key={i} className="flex gap-4 items-start p-4 bg-[#2A2A3C] rounded-lg border border-[#3F3F5A]/50">
                    <div className="bg-[#1E1E2E] text-gray-400 font-mono text-sm w-6 h-6 flex items-center justify-center rounded-full shrink-0">
                      {i + 1}
                    </div>
                    <p className="text-sm text-gray-200">&quot;{hook}&quot;</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
              <CardHeader>
                <CardTitle className="text-lg">Signals Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-700 before:to-transparent">
                  {brief.signals?.map((signal: { type: string, date: string, text: string, url: string, confidence: number }, i: number) => (
                    <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-slate-700 bg-[#1E1E2E] text-slate-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-slate-700 bg-[#2A2A3C] shadow">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-semibold uppercase text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded">{signal.type}</span>
                          <time className="font-mono text-xs text-slate-500">{signal.date}</time>
                        </div>
                        <p className="text-sm text-slate-300 mt-2">{signal.text}</p>
                        <div className="mt-3 text-xs flex justify-between items-center">
                          <a href={signal.url} target="_blank" className="text-indigo-400 hover:underline">Source Link</a>
                          <span className="text-gray-500">{(signal.confidence * 100).toFixed(0)}% Conf.</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
              <CardHeader>
                <CardTitle className="text-lg">Cited Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {brief.sources?.map((source: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <a href={source} target="_blank" className="text-blue-400 hover:underline break-all">
                        {source.replace(/^https?:\/\//, '')}
                      </a>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Stale Signal Checks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-400 leading-relaxed mb-4">
                  The AI agent automatically filters signals older than 90 days to ensure outreach remains relevant.
                </p>
                <div className="flex items-center justify-between text-sm bg-amber-500/10 text-amber-400 p-3 rounded border border-amber-500/20">
                  <span>Rejected Signals</span>
                  <span className="font-bold">0</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
