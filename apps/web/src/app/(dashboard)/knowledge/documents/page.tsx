import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, FileText, Calendar } from "lucide-react";
import Link from "next/link";

export default function DocumentsPage() {
  // In a real app, fetch from GET /v1/documents
  const dummyDocs = [
    { id: '1', title: 'Product Manual.pdf', source_name: 'Product Manual.pdf', sync_status: 'ready', updated_at: '2024-03-10T10:02:30Z', chunks: 45 },
    { id: '2', title: 'API Documentation', source_name: 'https://docs.company.com', sync_status: 'ready', updated_at: '2024-03-09T14:20:00Z', chunks: 120 },
    { id: '3', title: 'Return Policy 2024', source_name: 'Internal FAQs', sync_status: 'processing', updated_at: '2024-03-11T09:15:00Z', chunks: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Ingested Documents</h1>
          <p className="text-muted-foreground mt-1">Search and view all parsed documents across your sources.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            placeholder="Search documents..." 
            className="w-full pl-9 bg-[#2A2A3C] border-[#3F3F5A] text-white placeholder:text-gray-500"
          />
        </div>
      </div>

      <Card className="bg-[#2A2A3C] border-[#3F3F5A] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-400 uppercase bg-[#1E1E2E] border-b border-[#3F3F5A]">
              <tr>
                <th scope="col" className="px-6 py-4">Title</th>
                <th scope="col" className="px-6 py-4">Source</th>
                <th scope="col" className="px-6 py-4">Chunks</th>
                <th scope="col" className="px-6 py-4">Status</th>
                <th scope="col" className="px-6 py-4">Updated</th>
              </tr>
            </thead>
            <tbody>
              {dummyDocs.map((doc) => (
                <tr key={doc.id} className="border-b border-[#3F3F5A]/50 hover:bg-[#3F3F5A]/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-white flex items-center gap-3">
                    <FileText className="w-4 h-4 text-indigo-400" />
                    {doc.title}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <Link href={`/knowledge/sources/1`} className="hover:text-indigo-400 hover:underline">
                      {doc.source_name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{doc.chunks}</td>
                  <td className="px-6 py-4">
                    <Badge variant="outline" className={
                      doc.sync_status === 'ready' ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' :
                      doc.sync_status === 'processing' ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' :
                      'border-rose-500/50 text-rose-400 bg-rose-500/10'
                    }>
                      {doc.sync_status.charAt(0).toUpperCase() + doc.sync_status.slice(1)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-gray-400 flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
              {dummyDocs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No documents found. Try adding a new knowledge source.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
