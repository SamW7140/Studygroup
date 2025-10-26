'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { FileText, Download, Share2, Trash2 } from 'lucide-react'
import { documents } from '@/app/_data/documents'
import { formatDate, getInitials } from '@/lib/utils'
import { notFound } from 'next/navigation'

export default function DocumentPage({ params }: { params: { id: string } }) {
  const document = documents.find(d => d.id === params.id)
  
  if (!document) {
    notFound()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Main Content - Document Preview */}
      <div className="lg:col-span-2 space-y-6">
        <div className="glass-panel rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold text-white">{document.title}</h1>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="glass-panel">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" size="sm" className="glass-panel">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Document Preview Placeholder */}
          <div className="bg-white/5 rounded-xl aspect-[8.5/11] flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-24 h-24 text-slate-400 mx-auto mb-4" />
              <p className="text-slate-400">Document preview will appear here</p>
              <p className="text-sm text-slate-500 mt-2">
                {document.type.toUpperCase()} • {document.size}
              </p>
            </div>
          </div>
        </div>

        {/* AI Chat Section */}
        <div className="glass-panel rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Ask AI about this document</h2>
          <div className="bg-white/5 rounded-lg p-4 min-h-[200px]">
            <p className="text-slate-400 text-sm">
              AI chat interface will appear here with document context...
            </p>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Metadata */}
      <div className="space-y-6">
        <Card className="glass-panel border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4">Document Info</h3>
          
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-500 mb-1">Class</p>
              <p className="text-white font-medium">{document.className}</p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Owner</p>
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-white/10">
                    {getInitials(document.owner)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-white">{document.owner}</span>
              </div>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Last Updated</p>
              <p className="text-white">{formatDate(document.lastEdited)}</p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">File Type</p>
              <p className="text-white uppercase">{document.type}</p>
            </div>

            <div>
              <p className="text-slate-500 mb-1">Size</p>
              <p className="text-white">{document.size}</p>
            </div>

            {document.tags && document.tags.length > 0 && (
              <div>
                <p className="text-slate-500 mb-2">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {document.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 rounded-lg bg-white/10 text-xs text-white"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card className="glass-panel border-white/10 p-6">
          <h3 className="font-semibold text-white mb-4">Actions</h3>
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start glass-panel">
              <Share2 className="w-4 h-4 mr-2" />
              Share with class
            </Button>
            <Button variant="outline" className="w-full justify-start glass-panel text-red-400 hover:text-red-300">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete document
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
