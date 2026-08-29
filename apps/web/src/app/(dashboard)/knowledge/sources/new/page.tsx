"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import {
  UploadCloud,
  Link as LinkIcon,
  Type,
  KeySquare,
  CheckCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewSourcePage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Dummy submit logic
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/knowledge/sources");
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Add Knowledge Source
        </h1>
        <p className="text-[color:var(--t-text)] mt-1">
          Ingest new data into your AI workforce knowledge base.
        </p>
      </div>

      <Tabs defaultValue="file" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-[#2A2A3C] p-1 h-12">
          <TabsTrigger
            value="file"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <UploadCloud className="w-4 h-4 mr-2" />
            File Upload
          </TabsTrigger>
          <TabsTrigger
            value="website"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <LinkIcon className="w-4 h-4 mr-2" />
            Website
          </TabsTrigger>
          <TabsTrigger
            value="text"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <Type className="w-4 h-4 mr-2" />
            Text Paste
          </TabsTrigger>
          <TabsTrigger
            value="integrations"
            className="data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
          >
            <KeySquare className="w-4 h-4 mr-2" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="file" className="mt-6">
          <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
              <CardDescription className="text-[color:var(--t-text)]">
                Support PDF, DOCX, TXT. Max file size 50MB.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-[#3F3F5A] hover:border-indigo-500 rounded-lg p-12 text-center transition-colors">
                <UploadCloud className="w-12 h-12 text-[color:var(--t-text)] mx-auto mb-4" />
                <h3 className="text-lg font-medium">
                  Drag & drop your files here
                </h3>
                <p className="text-[color:var(--t-text)] mt-2 mb-6">
                  or click to browse from your computer
                </p>
                <Button className="bg-[#1E1E2E] hover:bg-gray-800 text-white">
                  Select Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="website" className="mt-6">
          <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Website Crawl</CardTitle>
                <CardDescription className="text-[color:var(--t-text)]">
                  Provide a URL and we will extract the content.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL</label>
                  <Input
                    required
                    placeholder="https://example.com/docs"
                    className="bg-[#1E1E2E] border-[#3F3F5A]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Crawl Depth</label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    defaultValue="1"
                    className="bg-[#1E1E2E] border-[#3F3F5A]"
                  />
                </div>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 w-full mt-4"
                >
                  {isSubmitting ? "Starting Crawl..." : "Start Crawl"}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="text" className="mt-6">
          <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Direct Text Input</CardTitle>
                <CardDescription className="text-[color:var(--t-text)]">
                  Paste FAQs or snippets directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    required
                    placeholder="e.g. Return Policy 2024"
                    className="bg-[#1E1E2E] border-[#3F3F5A]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Content</label>
                  <Textarea
                    required
                    placeholder="Paste text here..."
                    className="bg-[#1E1E2E] border-[#3F3F5A] min-h-[200px]"
                  />
                </div>
                <Button
                  disabled={isSubmitting}
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 w-full mt-4"
                >
                  Save Text
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="mt-6">
          <Card className="bg-[#2A2A3C] border-[#3F3F5A] text-white">
            <CardHeader>
              <CardTitle>Third-Party Integrations</CardTitle>
              <CardDescription className="text-[color:var(--t-text)]">
                Connect your existing tools to automatically sync data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-[#3F3F5A] rounded-lg p-6 flex flex-col items-center justify-center text-center opacity-50 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                      Phase 2
                    </Badge>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center mb-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png"
                      alt="Notion"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <h3 className="font-medium text-lg">Notion Workspace</h3>
                  <p className="text-sm text-[color:var(--t-text)] mt-2 mb-4">
                    Sync pages and databases
                  </p>
                  <Button
                    disabled
                    variant="outline"
                    className="border-[#3F3F5A]"
                  >
                    Coming Soon
                  </Button>
                </div>

                <div className="border border-[#3F3F5A] rounded-lg p-6 flex flex-col items-center justify-center text-center opacity-50 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-indigo-600/20 text-indigo-400 border border-indigo-500/20">
                      Phase 2
                    </Badge>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center mb-4">
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg"
                      alt="Google Drive"
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                  <h3 className="font-medium text-lg">Google Drive</h3>
                  <p className="text-sm text-[color:var(--t-text)] mt-2 mb-4">
                    Sync docs and spreadsheets
                  </p>
                  <Button
                    disabled
                    variant="outline"
                    className="border-[#3F3F5A]"
                  >
                    Coming Soon
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
