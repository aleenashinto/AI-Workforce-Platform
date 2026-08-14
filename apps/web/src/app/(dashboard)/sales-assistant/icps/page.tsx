"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Target, CheckCircle2, ChevronRight, Wand2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api/client";

export default function ICPsPage() {
  const [icps, setIcps] = useState<{id?: string, name?: string, status?: string, lastRun?: string, leads?: number}[]>([]);
  const [loading, setLoading] = useState(true);
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [aiInput, setAiInput] = useState("");
  const [icpName, setIcpName] = useState("Custom AI Target");

  const fetchIcps = async () => {
    try {
      const data = await apiClient.get('/icps');
      setIcps(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchIcps();
  }, []);

  const handleAiGenerate = () => {
    setIcpName(aiInput || "Custom AI Target");
    setStep(5);
  };

  const handleSave = async () => {
    try {
      const res = await apiClient.post('/icps', {
        name: icpName,
        status: 'active',
        leads: 0,
        lastRun: 'Just now'
      });
      setIcps([...icps, res]);
      setIsWizardOpen(false);
      setStep(1);
      setAiInput("");
      setIcpName("Custom AI Target");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            <Target className="w-8 h-8 text-indigo-400" />
            Ideal Customer Profiles (ICPs)
          </h1>
          <p className="text-muted-foreground mt-1">Define who you want to target and let the AI find them.</p>
        </div>
        <Button onClick={() => setIsWizardOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">
          <Plus className="w-4 h-4 mr-2" /> Create ICP
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-400">Loading ICPs...</div>
      ) : icps.length === 0 ? (
        <div className="text-center py-8 text-gray-400 border-2 border-dashed border-[#3F3F5A] rounded-xl bg-[#1E1E2E]">
          <Target className="w-12 h-12 text-[#3F3F5A] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No ICPs Yet</h3>
          <p className="text-gray-400">Create your first ICP to start discovering leads.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {icps.map(icp => (
            <Card key={icp.id} className="bg-[#1E1E2E] border-[#3F3F5A] text-white">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg">{icp.name}</CardTitle>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                    {icp.status || 'Active'}
                  </Badge>
                </div>
                <CardDescription className="text-gray-400">Last run: {icp.lastRun || 'Never'}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-1">
                    <Users className="w-4 h-4" /> {(icp.leads || 0).toLocaleString()} leads discovered
                  </span>
                  <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-indigo-300">
                    View Leads <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ICP Builder Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1E1E2E] border border-[#3F3F5A] rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="p-4 border-b border-[#3F3F5A] flex justify-between items-center bg-[#2A2A3C]">
              <h2 className="text-lg font-semibold text-white">ICP Builder - Step {step} of 5</h2>
              <Button variant="ghost" size="icon" onClick={() => { setIsWizardOpen(false); setStep(1); }} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex gap-2 mb-8">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${step >= i ? 'bg-indigo-500' : 'bg-[#3F3F5A]'}`} />
                ))}
              </div>

              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-lg flex gap-4 items-start">
                    <div className="bg-indigo-600/20 p-2 rounded-lg"><Wand2 className="w-5 h-5 text-indigo-400" /></div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Generate with AI</h3>
                      <p className="text-sm text-gray-400 mb-3">Paste your website URL and a few customer domains, and we&apos;ll automatically determine the best criteria.</p>
                      <div className="flex gap-2">
                        <Input 
                          placeholder="e.g. acme.com, techflow.io..." 
                          className="bg-[#1E1E2E] border-[#3F3F5A] text-white flex-1"
                          value={aiInput}
                          onChange={(e) => setAiInput(e.target.value)}
                        />
                        <Button onClick={handleAiGenerate} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                          Auto-Generate
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="relative py-4">
                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#3F3F5A]"></span></div>
                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1E1E2E] px-2 text-gray-500">Or build manually</span></div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-white">Target Industries</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Software / SaaS', 'Fintech', 'Healthcare', 'E-commerce', 'Manufacturing', 'Retail'].map(ind => (
                        <div key={ind} className="border border-[#3F3F5A] rounded-lg p-3 hover:bg-[#2A2A3C] cursor-pointer text-sm text-gray-300">
                          {ind}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-medium text-white">Company Size & Geography</h3>
                  <div className="space-y-4">
                    <label className="text-sm text-gray-400">Employee Count Range (Min - Max)</label>
                    <div className="flex items-center gap-4">
                      <Input type="number" defaultValue={50} className="bg-[#2A2A3C] border-[#3F3F5A] text-white w-24" />
                      <span className="text-gray-500">to</span>
                      <Input type="number" defaultValue={500} className="bg-[#2A2A3C] border-[#3F3F5A] text-white w-24" />
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm text-gray-400">Target Regions</label>
                    <div className="flex flex-wrap gap-2">
                      {['North America', 'EMEA', 'APAC', 'LATAM'].map(reg => (
                        <Badge key={reg} variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 px-3 py-1 cursor-pointer">
                          {reg}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-medium text-white">Buyer Persona</h3>
                  <div className="space-y-4">
                    <label className="text-sm text-gray-400">Job Titles</label>
                    <Input placeholder="CTO, VP Engineering, Engineering Manager" className="bg-[#2A2A3C] border-[#3F3F5A] text-white" />
                  </div>
                  <div className="space-y-4">
                    <label className="text-sm text-gray-400">Seniority Levels</label>
                    <div className="flex flex-wrap gap-2">
                      {['C-Level', 'VP', 'Director', 'Manager'].map(sen => (
                        <Badge key={sen} variant="outline" className="border-indigo-500/30 text-indigo-300 bg-indigo-500/10 px-3 py-1 cursor-pointer">
                          {sen}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <h3 className="text-lg font-medium text-white">Buying Signals</h3>
                  <div className="grid gap-3">
                    {[
                      { title: 'Recent Funding', desc: 'Raised capital in the last 6 months' },
                      { title: 'Hiring Spree', desc: 'High volume of open roles matching persona' },
                      { title: 'Leadership Change', desc: 'New C-level or VP in the last 90 days' },
                    ].map(sig => (
                      <div key={sig.title} className="flex items-center justify-between p-4 border border-[#3F3F5A] rounded-lg hover:bg-[#2A2A3C]">
                        <div>
                          <div className="text-gray-200 text-sm font-medium">{sig.title}</div>
                          <div className="text-gray-500 text-xs">{sig.desc}</div>
                        </div>
                        <div className="w-10 h-6 bg-indigo-600 rounded-full relative cursor-pointer">
                          <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6 text-center py-8 animate-in fade-in slide-in-from-right-4">
                  <div className="mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">ICP Ready</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    We&apos;ve saved your ICP criteria. The discovery engine is ready to find matching leads.
                  </p>
                  <div className="bg-[#2A2A3C] border border-[#3F3F5A] p-4 rounded-lg inline-block text-left mt-4 text-sm text-gray-300">
                    <div className="mb-2">
                      <label className="text-xs text-gray-500">ICP Name</label>
                      <Input value={icpName} onChange={e => setIcpName(e.target.value)} className="bg-[#1E1E2E] border-[#3F3F5A] text-white mt-1 h-8" />
                    </div>
                    <ul className="space-y-2 list-disc list-inside">
                      <li>Industries: Software, Fintech</li>
                      <li>Size: 50 - 500</li>
                      <li>Persona: CTO, VP Engineering</li>
                      <li>Signals: Funding, Hiring</li>
                    </ul>
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-[#3F3F5A] bg-[#2A2A3C] flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => step > 1 ? setStep(step - 1) : setIsWizardOpen(false)} 
                className="border-[#3F3F5A] text-gray-300 hover:text-white bg-[#1E1E2E]"
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </Button>
              <Button 
                onClick={() => {
                  if (step < 5) setStep(step + 1);
                  else handleSave();
                }} 
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {step === 5 ? 'Save & Start Discovery' : 'Continue'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
