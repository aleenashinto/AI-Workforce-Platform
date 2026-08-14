'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Mail, Activity, Play, Pause, AlertTriangle } from 'lucide-react';

type Mailbox = {
  id: string;
  email: string;
  provider: string;
  status: string;
  health_score: number;
  daily_cap: number;
  metrics: { bounces: number, complaints: number, opens: number };
};

export default function MailboxesPage() {
  const [mailboxes, setMailboxes] = useState<Mailbox[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3001/mailboxes')
      .then(res => res.json())
      .then(data => {
        if (data.success) setMailboxes(data.data);
        setLoading(false);
      });
  }, []);

  const togglePause = async (id: string, currentlyPaused: boolean) => {
    const res = await fetch(`http://localhost:3001/mailboxes/${id}/pause`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ paused: !currentlyPaused })
    });
    
    if (res.ok) {
      setMailboxes(mailboxes.map(m => m.id === id ? { ...m, status: currentlyPaused ? 'active' : 'paused' } : m));
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="p-8 space-y-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Mailboxes</h1>
          <p className="text-gray-400 mt-2">Manage your sending infrastructure and monitor deliverability.</p>
        </div>
        <Button className="bg-gradient-to-r from-[#D122E3] to-[#00F2FE] hover:opacity-90 text-white border-0">
          <Plus className="h-4 w-4 mr-2" /> Connect Mailbox
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-[#1E1E2E] border-[#3F3F5A] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-5 w-5 text-indigo-400" />
              <h3 className="font-semibold text-gray-400">Total Connected</h3>
            </div>
            <p className="text-3xl font-bold mt-4 text-white">{mailboxes.length}</p>
          </CardContent>
        </Card>
        
        <Card className="bg-[#1E1E2E] border-[#3F3F5A] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              <h3 className="font-semibold text-gray-400">Avg Health Score</h3>
            </div>
            <p className="text-3xl font-bold mt-4 text-emerald-400">
              {mailboxes.length ? Math.round(mailboxes.reduce((acc, m) => acc + (m.health_score || 100), 0) / mailboxes.length) : 0}%
            </p>
          </CardContent>
        </Card>

        <Card className="bg-[#1E1E2E] border-[#3F3F5A] shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-400" />
              <h3 className="font-semibold text-gray-400">Issues Detected</h3>
            </div>
            <p className="text-3xl font-bold mt-4 text-amber-400">
              {mailboxes.filter(m => (m.health_score || 100) < 80).length}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm border-[#3F3F5A] bg-[#1E1E2E]">
        <CardHeader className="bg-[#2A2A3C] border-b border-[#3F3F5A]">
          <CardTitle className="text-lg text-white">Connected Accounts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading mailboxes...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-[#3F3F5A]">
                  <TableHead className="text-gray-400">Email Account</TableHead>
                  <TableHead className="text-gray-400">Provider</TableHead>
                  <TableHead className="text-gray-400">Status</TableHead>
                  <TableHead className="text-gray-400">Health Score</TableHead>
                  <TableHead className="text-gray-400">Bounces</TableHead>
                  <TableHead className="text-right text-gray-400">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mailboxes.length === 0 ? (
                  <TableRow className="border-[#3F3F5A]">
                    <TableCell colSpan={6} className="h-32 text-center text-gray-400">
                      No mailboxes connected yet.
                    </TableCell>
                  </TableRow>
                ) : mailboxes.map((mailbox) => (
                  <TableRow key={mailbox.id} className="hover:bg-[#2A2A3C] transition-colors border-[#3F3F5A]">
                    <TableCell className="font-medium text-white">{mailbox.email}</TableCell>
                    <TableCell className="capitalize text-gray-400">{mailbox.provider}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        mailbox.status === 'active' ? 'bg-green-900/30 text-green-400' :
                        mailbox.status === 'warmup' ? 'bg-blue-900/30 text-blue-400' :
                        'bg-red-900/30 text-red-400'
                      }`}>
                        {mailbox.status}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <div className={`font-semibold ${getHealthColor(mailbox.health_score || 100)}`}>
                          {mailbox.health_score || 100}%
                        </div>
                        <div className="w-16 h-2 bg-[#2A2A3C] rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${mailbox.health_score >= 90 ? 'bg-green-500' : mailbox.health_score >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                            style={{ width: `${mailbox.health_score || 100}%` }}
                          />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400">{mailbox.metrics?.bounces || 0}</TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => togglePause(mailbox.id, mailbox.status === 'paused')}
                        className={`bg-[#2A2A3C] border-[#3F3F5A] ${mailbox.status === 'paused' ? 'text-green-400 hover:text-green-300 hover:bg-[#3F3F5A]' : 'text-amber-400 hover:text-amber-300 hover:bg-[#3F3F5A]'}`}
                      >
                        {mailbox.status === 'paused' ? (
                          <><Play className="h-4 w-4 mr-1" /> Resume</>
                        ) : (
                          <><Pause className="h-4 w-4 mr-1" /> Pause</>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
