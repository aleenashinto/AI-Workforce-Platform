'use client';

export default function DocsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0F0F1A] text-white">
      <header className="border-b border-[#3F3F5A] bg-[#1E1E2E] p-4 flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#D122E3] to-[#00F2FE]">
            AI Workforce
          </span> API Documentation
        </h1>
        <div className="flex gap-4 text-sm">
          <a href="#" className="text-white hover:text-[#00F2FE]">Introduction</a>
          <a href="#" className="text-gray-400 hover:text-white">Authentication</a>
          <a href="#" className="text-gray-400 hover:text-white">Webhooks</a>
        </div>
      </header>
      
      <main className="flex-1 p-8 max-w-5xl mx-auto w-full">
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Quick Start</h2>
          <p className="text-gray-400 mb-4">
            Integrate AI Workforce into your own applications. All API requests require a Bearer token.
            Base URL: <code className="bg-[#1E1E2E] border border-[#3F3F5A] text-[#00F2FE] p-1 px-2 rounded">https://api.aiworkforce.com/v1</code>
          </p>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-4">Widget Installation</h2>
          <p className="text-gray-400 mb-4">Embed our AI chat widget on your website by adding this code snippet before the closing &lt;/body&gt; tag.</p>
          <pre className="bg-[#1E1E2E] border border-[#3F3F5A] p-4 rounded-lg overflow-x-auto text-[#00F2FE] font-mono text-sm shadow-inner">
{`<!-- AI Workforce Widget -->
<script src="https://cdn.aiworkforce.com/widget.js" data-org-id="YOUR_ORG_ID"></script>`}
          </pre>
        </div>

        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-6">API Reference</h2>
          {/* Mock Swagger UI Blocks */}
          <div className="space-y-6">
            <div className="border border-[#3F3F5A] bg-[#1E1E2E] rounded-lg overflow-hidden shadow-lg">
              <div className="bg-[#2A2A3C] p-4 flex items-center gap-4 cursor-pointer hover:bg-[#3F3F5A]/50 transition-colors">
                <span className="bg-blue-600/20 border border-blue-500/50 text-blue-400 px-2 py-1 rounded font-bold text-sm min-w-[60px] text-center shadow-[0_0_10px_rgba(59,130,246,0.2)]">GET</span>
                <span className="font-mono font-semibold text-gray-200">/chat/conversations</span>
                <span className="text-gray-400 text-sm ml-auto">List active conversations</span>
              </div>
            </div>

            <div className="border border-[#3F3F5A] bg-[#1E1E2E] rounded-lg overflow-hidden shadow-lg">
              <div className="bg-[#2A2A3C] p-4 flex items-center gap-4 cursor-pointer hover:bg-[#3F3F5A]/50 transition-colors">
                <span className="bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 px-2 py-1 rounded font-bold text-sm min-w-[60px] text-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">POST</span>
                <span className="font-mono font-semibold text-gray-200">/chat/conversations</span>
                <span className="text-gray-400 text-sm ml-auto">Create a new conversation</span>
              </div>
            </div>

            <div className="border border-[#3F3F5A] bg-[#1E1E2E] rounded-lg overflow-hidden shadow-lg">
              <div className="bg-[#2A2A3C] p-4 flex items-center gap-4 cursor-pointer">
                <span className="bg-emerald-600/20 border border-emerald-500/50 text-emerald-400 px-2 py-1 rounded font-bold text-sm min-w-[60px] text-center shadow-[0_0_10px_rgba(16,185,129,0.2)]">POST</span>
                <span className="font-mono font-semibold text-gray-200">/chat/conversations/{'{id}'}/messages</span>
                <span className="text-gray-400 text-sm ml-auto">Send a message to a conversation</span>
              </div>
              <div className="p-4 border-t border-[#3F3F5A] bg-[#1A1A24]">
                <h4 className="font-semibold mb-2 text-gray-300">Request Body</h4>
                <pre className="bg-[#1E1E2E] border border-[#3F3F5A] p-4 rounded text-sm font-mono overflow-x-auto text-[#00F2FE]">
{`{
  "role": "user",
  "content": "I need help with my account."
}`}
                </pre>
              </div>
            </div>
            
            <div className="border border-[#3F3F5A] bg-[#1E1E2E] rounded-lg overflow-hidden shadow-lg">
              <div className="bg-[#2A2A3C] p-4 flex items-center gap-4 cursor-pointer hover:bg-[#3F3F5A]/50 transition-colors">
                <span className="bg-amber-600/20 border border-amber-500/50 text-amber-400 px-2 py-1 rounded font-bold text-sm min-w-[60px] text-center shadow-[0_0_10px_rgba(245,158,11,0.2)]">PATCH</span>
                <span className="font-mono font-semibold text-gray-200">/leads/{'{id}'}</span>
                <span className="text-gray-400 text-sm ml-auto">Update a sales lead</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
