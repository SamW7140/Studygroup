'use client'

import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ChatInterface } from '@/components/ai/chat-interface'
import { FloatingChatButton } from '@/components/ai/floating-chat-button'
import { ReindexButton } from '@/components/ai/reindex-button'
import { Sparkles, FileText, Zap } from 'lucide-react'

interface ClassAIPageProps {
  classId: string
  className: string
}

/**
 * Example page showing how to integrate the AI chat system
 * 
 * This page demonstrates:
 * 1. Full-page chat interface
 * 2. Floating chat button (can be added to any class page)
 * 3. Manual reindex button
 * 4. Documents tab
 */
export function ClassAIPage({ classId, className }: ClassAIPageProps) {
  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-orange-500" />
            AI Study Assistant
          </h1>
          <p className="text-slate-400">{className}</p>
        </div>
        <ReindexButton classId={classId} />
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">RAG-Powered</h3>
              <p className="text-sm text-slate-400">
                Answers are generated from your uploaded course materials
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Source Citations</h3>
              <p className="text-sm text-slate-400">
                Every answer includes references to specific documents
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white/5 border-white/10">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Zap className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-1">Auto-Updated</h3>
              <p className="text-sm text-slate-400">
                New documents are automatically indexed for AI
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <Card className="bg-slate-900 border-white/10 overflow-hidden">
        <Tabs defaultValue="chat" className="w-full">
          <TabsList className="w-full bg-white/5 border-b border-white/10 rounded-none">
            <TabsTrigger value="chat" className="flex-1">
              <Sparkles className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="info" className="flex-1">
              <FileText className="w-4 h-4 mr-2" />
              How to Use
            </TabsTrigger>
          </TabsList>

          <TabsContent value="chat" className="p-0">
            <div className="h-[600px]">
              <ChatInterface classId={classId} className={className} />
            </div>
          </TabsContent>

          <TabsContent value="info" className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">How to Use the AI Assistant</h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold text-white mb-2">1. Upload Documents</h4>
                  <p className="text-sm text-slate-400">
                    First, make sure you have uploaded study materials (PDFs, DOCX, PPTX) to this class. 
                    The AI can only answer questions about documents that have been uploaded.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold text-white mb-2">2. Ask Questions</h4>
                  <p className="text-sm text-slate-400">
                    Type your question in the chat. Be specific for better results. 
                    For example: &quot;What is the main topic of chapter 3?&quot; or &quot;Explain the concept of recursion&quot;
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold text-white mb-2">3. First Query Processing</h4>
                  <p className="text-sm text-slate-400">
                    The first query after uploading documents may take 10-15 seconds while the AI indexes your files. 
                    Subsequent queries will be much faster (2-5 seconds).
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold text-white mb-2">4. Review Sources</h4>
                  <p className="text-sm text-slate-400">
                    Each answer includes source citations showing which documents were used. 
                    This helps you verify the information and find related content.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-lg border border-white/10">
                  <h4 className="font-semibold text-white mb-2">5. Reindex if Needed</h4>
                  <p className="text-sm text-slate-400">
                    If you&apos;ve added new documents and want to force a reindex, click the &quot;Reindex AI&quot; button above. 
                    Otherwise, documents are automatically reindexed on your next query.
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h3 className="text-lg font-semibold text-white mb-3">Tips for Better Results</h3>
              <ul className="space-y-2 text-sm text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Ask specific questions rather than broad topics</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Reference specific chapters or sections when possible</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Upload clear, text-based documents (scanned images may not work well)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>Check the source citations to verify information</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500">•</span>
                  <span>The AI works best with educational content like lecture notes, textbooks, and slides</span>
                </li>
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Example of Floating Chat Button (commented out since we have full page chat) */}
      {/* <FloatingChatButton classId={classId} className={className} /> */}
    </div>
  )
}
