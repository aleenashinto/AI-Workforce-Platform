"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { PlusCircle, FileText, Globe, MessageSquare, X } from "lucide-react";
import { Input } from "@/components/ui/input";
// import { useAuth } from "@clerk/nextjs";

export default function SourcesPage() {
  const getToken = async () => 'mock-token';
  const orgId = '00000000-0000-0000-0000-000000000001';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sourceType, setSourceType] = useState('file');
  const [sourceName, setSourceName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  
  const fetchSources = async () => {
    try {
      const token = await getToken();
      // Added dummy org_id if not present for local dev
      const currentOrgId = orgId || 'org_123';
      const res = await fetch(`http://localhost:3001/v1/sources?org_id=${currentOrgId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.sources) {
        setSources(json.sources);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchSources();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddSource = async () => {
    try {
      const token = await getToken();
      const currentOrgId = orgId || 'org_123';
      const payload = {
        org_id: currentOrgId,
        type: sourceType,
        name: sourceName || (sourceType === 'file' ? 'Uploaded File' : sourceUrl),
        config: sourceType === 'file' ? { filename: sourceName, contentType: 'application/pdf' } : { url: sourceUrl }
      };

      await fetch(`http://localhost:3001/v1/sources`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      setIsModalOpen(false);
      setSourceName('');
      setSourceUrl('');
      fetchSources();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Knowledge Sources</h1>
          <p className="text-muted-foreground mt-1">Manage the data your AI agents use to answer questions.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-gradient-to-r from-[#D122E3] to-[#00F2FE] hover:opacity-90 text-white shadow-lg border-0">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Source
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <div className="text-gray-400">Loading sources...</div>
        ) : sources.length === 0 ? (
          <div className="text-gray-400">No sources found. Add one to get started.</div>
        ) : (
          sources.map((source) => (
            <Link href={`/knowledge/sources/${source.id}`} key={source.id}>
              <Card className="p-5 bg-[#1E1E2E] border-[#3F3F5A] hover:border-[#D122E3] transition-all cursor-pointer group shadow-lg h-full flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-[#2A2A3C] rounded-lg text-[#00F2FE] group-hover:scale-110 transition-transform">
                      {source.type === 'file' ? <FileText className="h-5 w-5" /> : 
                       source.type === 'website' ? <Globe className="h-5 w-5" /> : 
                       <MessageSquare className="h-5 w-5" />}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-200 truncate max-w-[200px]">{source.name}</h3>
                      <p className="text-xs text-gray-500">{new Date(source.created_at || 0).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="outline" className={
                    source.status === 'ready' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' :
                    source.status === 'processing' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                    source.status === 'pending' ? 'border-blue-500/50 text-blue-400 bg-blue-500/10' :
                    'border-rose-500/50 text-rose-400 bg-rose-500/10'
                  }>
                    {source.status ? source.status.charAt(0).toUpperCase() + source.status.slice(1) : 'Unknown'}
                  </Badge>
                  <span className="text-xs text-gray-400 capitalize">{source.type}</span>
                </div>
              </Card>
            </Link>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">Add Knowledge Source</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Source Type</label>
                <select 
                  className="w-full bg-[#2A2A3C] border border-[#3F3F5A] text-white rounded p-2 focus:outline-none focus:border-[#D122E3]"
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value)}
                >
                  <option value="file">File Upload</option>
                  <option value="website">Website URL</option>
                  <option value="text">Raw Text</option>
                </select>
              </div>

              {sourceType === 'file' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">File Name</label>
                  <Input 
                    value={sourceName} 
                    onChange={(e) => setSourceName(e.target.value)} 
                    placeholder="e.g. employee_handbook.pdf" 
                    className="bg-[#2A2A3C] border-[#3F3F5A] text-white focus-visible:ring-[#D122E3]" 
                  />
                </div>
              )}

              {sourceType === 'website' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Website URL</label>
                  <Input 
                    value={sourceUrl} 
                    onChange={(e) => setSourceUrl(e.target.value)} 
                    placeholder="https://example.com/docs" 
                    className="bg-[#2A2A3C] border-[#3F3F5A] text-white focus-visible:ring-[#D122E3]" 
                  />
                </div>
              )}

              {sourceType === 'text' && (
                <div>
                  <label className="text-sm text-gray-400 mb-1 block">Source Name</label>
                  <Input 
                    value={sourceName} 
                    onChange={(e) => setSourceName(e.target.value)} 
                    placeholder="e.g. FAQ" 
                    className="bg-[#2A2A3C] border-[#3F3F5A] text-white focus-visible:ring-[#D122E3] mb-3" 
                  />
                  <label className="text-sm text-gray-400 mb-1 block">Content</label>
                  <textarea 
                    className="w-full h-32 bg-[#2A2A3C] border border-[#3F3F5A] text-white rounded p-2 focus:outline-none focus:border-[#D122E3]"
                    placeholder="Paste text here..."
                  ></textarea>
                </div>
              )}

              <Button onClick={handleAddSource} className="w-full bg-gradient-to-r from-[#D122E3] to-[#00F2FE] hover:opacity-90 text-white mt-4 border-0">
                Add Source
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
