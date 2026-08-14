"use client";

import { useState, useEffect } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Wrench, Plus, Check, X, ShieldAlert, Zap, Globe, Trash2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

export default function ToolsSettingsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tools, setTools] = useState<any[]>([]);

  useEffect(() => {
    // Basic API fetch without auth headers as requested
    fetch("http://localhost:3001/tools")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setTools(data.tools);
        } else {
          setTools([
            {
              id: '1',
              name: 'check_order_status',
              description: 'Get the status of an order by ID.',
              endpoint: 'https://api.example.com/orders',
              requiresConfirmation: false,
              isActive: true
            },
            {
              id: '2',
              name: 'create_ticket',
              description: 'Create a support ticket for escalation in Zendesk.',
              endpoint: 'https://api.example.com/tickets',
              requiresConfirmation: true,
              isActive: true
            }
          ]);
        }
      })
      .catch(() => {
        setTools([
          {
            id: '1',
            name: 'check_order_status',
            description: 'Get the status of an order by ID.',
            endpoint: 'https://api.example.com/orders',
            requiresConfirmation: false,
            isActive: true
          },
          {
            id: '2',
            name: 'create_ticket',
            description: 'Create a support ticket for escalation in Zendesk.',
            endpoint: 'https://api.example.com/tickets',
            requiresConfirmation: true,
            isActive: true
          }
        ]);
      });
  }, []);

  const handleTest = () => {
    setTestResult(null);
    setTimeout(() => {
      setTestResult(JSON.stringify({ status: 200, data: { ticket_id: 'ZD-8842', url: 'https://zendesk.com/tickets/8842' } }, null, 2));
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Tool Plugins</h1>
          <p className="text-muted-foreground mt-1">Configure external tools the AI can use to take action.</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-gradient-to-r from-[#D122E3] to-[#00F2FE] hover:opacity-90 text-white border-0 shadow-lg">
          <Plus className="w-4 h-4 mr-2" /> Add Tool
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {tools.map(tool => (
          <Card key={tool.id} className="bg-[#1E1E2E] border-[#3F3F5A] text-white shadow-lg transition-all hover:border-[#00F2FE]">
            <CardHeader className="flex flex-row justify-between items-start space-y-0 pb-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#2A2A3C]">
                    <Wrench className="w-4 h-4 text-[#00F2FE]" />
                  </div>
                  {tool.name}
                </CardTitle>
                <CardDescription className="text-gray-400 mt-2">{tool.description}</CardDescription>
              </div>
              <Badge variant="outline" className="text-emerald-400 border-emerald-500/50 bg-emerald-500/10">Active</Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-[#2A2A3C] p-3 rounded-lg border border-[#3F3F5A] flex items-center gap-2 text-sm text-gray-300">
                <Globe className="w-4 h-4 text-gray-500 shrink-0" />
                <span className="truncate font-mono">{tool.endpoint}</span>
              </div>
              
              <div className="flex items-center justify-between pt-2 border-t border-[#3F3F5A]">
                <div className="flex items-center gap-2 text-sm">
                  {tool.requiresConfirmation ? (
                    <span className="text-amber-400 flex items-center"><ShieldAlert className="w-4 h-4 mr-1" /> Requires Confirmation</span>
                  ) : (
                    <span className="text-gray-400 flex items-center"><Zap className="w-4 h-4 mr-1" /> Auto-Execute</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsTestModalOpen(true)} className="border-[#3F3F5A] text-[#00F2FE] hover:text-[#D122E3] hover:bg-[#3F3F5A] h-8">
                    Test
                  </Button>
                  <Button variant="ghost" size="icon" className="text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 h-8 w-8">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add Tool Modal */}
      {isAddModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl w-full max-w-2xl p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Register New Tool</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Tool Name</label>
                  <Input placeholder="e.g. process_refund" className="bg-[#2A2A3C] border-[#3F3F5A] text-white focus-visible:ring-[#D122E3]" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">Endpoint URL</label>
                  <Input placeholder="https://api.example.com/v1/..." className="bg-[#2A2A3C] border-[#3F3F5A] text-white focus-visible:ring-[#D122E3]" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Description (Instructions for AI)</label>
                <Input placeholder="Describe what this tool does and when the AI should use it." className="bg-[#2A2A3C] border-[#3F3F5A] text-white focus-visible:ring-[#D122E3]" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Authorization Header</label>
                <Input placeholder="Bearer sk_test_..." type="password" className="bg-[#2A2A3C] border-[#3F3F5A] text-white focus-visible:ring-[#D122E3]" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300 flex justify-between">
                  JSON Schema (Parameters)
                  <span className="text-[#00F2FE] text-xs cursor-pointer hover:underline">View Example</span>
                </label>
                <Textarea 
                  placeholder={`{ \n  "type": "object",\n  "properties": {}\n}`}
                  className="bg-[#2A2A3C] border-[#3F3F5A] text-gray-300 font-mono text-sm h-32 focus-visible:ring-[#D122E3]"
                />
              </div>

              <div className="flex items-center gap-3 p-4 bg-[#2A2A3C] border border-[#3F3F5A] rounded-lg mt-2">
                <div className="flex-1">
                  <h4 className="font-medium text-white text-sm flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-amber-400" /> Require Agent Confirmation</h4>
                  <p className="text-xs text-gray-400 mt-1">If enabled, the AI will pause and wait for a human agent to approve the tool execution. Recommended for write actions.</p>
                </div>
                <div className="shrink-0">
                  {/* Fake toggle switch */}
                  <div className="w-10 h-6 bg-gradient-to-r from-[#D122E3] to-[#00F2FE] rounded-full relative cursor-pointer shadow-[0_0_10px_rgba(209,34,227,0.3)]">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-[#3F3F5A]">
              <Button variant="outline" onClick={() => setIsAddModalOpen(false)} className="border-[#3F3F5A] text-gray-300 hover:text-white hover:bg-[#2A2A3C]">
                Cancel
              </Button>
              <Button onClick={() => setIsAddModalOpen(false)} className="bg-gradient-to-r from-[#D122E3] to-[#00F2FE] hover:opacity-90 text-white border-0">
                Register Tool
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Test Tool Modal */}
      {isTestModalOpen && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl w-full max-w-lg p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" /> Test: create_ticket
              </h2>
              <Button variant="ghost" size="icon" onClick={() => { setIsTestModalOpen(false); setTestResult(null); }} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Test Payload (JSON)</label>
                <Textarea 
                  defaultValue={`{\n  "title": "Customer needs help",\n  "description": "System error"\n}`}
                  className="bg-[#2A2A3C] border-[#3F3F5A] text-[#00F2FE] font-mono text-sm h-32 focus-visible:ring-[#D122E3]"
                />
              </div>

              {testResult && (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <label className="text-sm font-medium text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" /> Execution Result
                  </label>
                  <div className="bg-[#1A1A24] p-4 rounded-lg font-mono text-xs text-[#00F2FE] overflow-x-auto border border-emerald-500/20 shadow-inner">
                    <pre>{testResult}</pre>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#3F3F5A]">
              <Button variant="outline" onClick={() => { setIsTestModalOpen(false); setTestResult(null); }} className="border-[#3F3F5A] text-gray-300 hover:text-white hover:bg-[#2A2A3C]">
                Close
              </Button>
              <Button onClick={handleTest} className="bg-gradient-to-r from-[#D122E3] to-[#00F2FE] hover:opacity-90 text-white border-0">
                Run Test
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
