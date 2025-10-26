'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, MessageSquare, Send, Loader2, Sparkles, ExternalLink, History, FileText } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'
import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { queryAIWithContext } from '@/app/actions/chat'
import { toast } from 'sonner'
import Link from 'next/link'
import { getRecentDocuments, DocumentWithDetails } from '@/app/actions/documents'
import { getRecentChatSessions } from '@/app/actions/chat'

interface ChatMessage {
  role: 'user' | 'ai'
  content: string
  sources?: {
    file_name: string
    page?: number
  }[]
  isError?: boolean
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  return date.toLocaleDateString()
}

export function SidebarRight() {
  const { rightSidebarOpen, toggleRightSidebar, rightSidebarMode, setRightSidebarMode, currentClassId, currentClassName } = useUIStore()
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentDocs, setRecentDocs] = useState<DocumentWithDetails[]>([])
  const [isLoadingRecent, setIsLoadingRecent] = useState(false)

  // Fetch recent documents when switching to recent mode
  useEffect(() => {
    const fetchRecent = async () => {
      if (rightSidebarMode === 'recent' && rightSidebarOpen) {
        setIsLoadingRecent(true)
        try {
          const docs = await getRecentDocuments(10)
          setRecentDocs(docs)
        } catch (error) {
          console.error('Failed to fetch recent items:', error)
        } finally {
          setIsLoadingRecent(false)
        }
      }
    }
    fetchRecent()
  }, [rightSidebarMode, rightSidebarOpen])

  const handleSendMessage = async () => {
    if (!message.trim() || isLoading) return

    // Check if class is selected
    if (!currentClassId) {
      toast.error('No class selected', {
        description: 'Please open a class page to use the AI assistant'
      })
      return
    }

    const userMessage = message.trim()
    setMessage('')
    
    // Add user message
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoading(true)

    try {
      const result = await queryAIWithContext(currentClassId, userMessage)

      if (!result.success) {
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          content: result.error || 'Failed to get AI response',
          isError: true
        }])
        toast.error('AI Query Failed', {
          description: result.error
        })
      } else {
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          content: result.answer,
          sources: result.sources
        }])
      }
    } catch (error) {
      console.error('Error in sidebar AI chat:', error)
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'An unexpected error occurred. Please try again.',
        isError: true
      }])
      toast.error('Connection Error', {
        description: 'Unable to reach AI service'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AnimatePresence mode="wait">
      {rightSidebarOpen && (
        <motion.aside
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 320, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed right-0 top-0 h-screen bg-white/10 backdrop-blur-xl border-l border-orange-500/20 overflow-hidden z-40"
        >
          <div className="flex flex-col h-full p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRightSidebarMode('recent')}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    rightSidebarMode === 'recent' ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-slate-400'
                  )}
                  aria-label="Recent"
                  title="Recent"
                >
                  <History className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRightSidebarMode('ai-chat')}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    rightSidebarMode === 'ai-chat' ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-slate-400'
                  )}
                  aria-label="AI Chat"
                  title="AI Chat"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={toggleRightSidebar}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Content based on mode */}
            {rightSidebarMode === 'recent' ? (
              <>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <History className="w-5 h-5 text-orange-400" />
                  Recent Activity
                </h2>
                {/* Recent Documents */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {isLoadingRecent ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
                    </div>
                  ) : recentDocs.length === 0 ? (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-slate-500" />
                      <p className="text-sm text-slate-400 mb-1">No recent activity</p>
                      <p className="text-xs text-slate-500">
                        Upload documents to see them here
                      </p>
                    </div>
                  ) : (
                    recentDocs.map((doc) => (
                      <Link
                        key={doc.id}
                        href={`/docs/${doc.id}`}
                        className="block p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-all group border border-white/10"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-orange-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-white text-sm mb-1 truncate group-hover:text-orange-400 transition-colors">
                              {doc.title}
                            </h4>
                            <p className="text-xs text-slate-400 mb-1 truncate">
                              {doc.class_name || 'No class'}
                            </p>
                            <p className="text-xs text-slate-500">
                              {formatDate(doc.updated_at || doc.created_at)}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-orange-400" />
                    AI Assistant
                  </h2>
                  {currentClassId && (
                    <Link
                      href={`/classes/${currentClassId}/documents`}
                      className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                      title="Open full chat"
                    >
                      <ExternalLink className="w-4 h-4 text-slate-400" />
                    </Link>
                  )}
                </div>

                {/* Class Context Display */}
                {currentClassName && (
                  <div className="mb-3 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                    <p className="text-xs text-orange-300 truncate">
                      📚 {currentClassName}
                    </p>
                  </div>
                )}

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                  {!currentClassId ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-orange-400/50" />
                      <p className="mb-2">No class selected</p>
                      <p className="text-xs text-slate-500">
                        Open a class page to start chatting with AI
                      </p>
                    </div>
                  ) : chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <Sparkles className="w-12 h-12 mx-auto mb-3 text-orange-400/50" />
                      <p className="mb-2">Ask me anything!</p>
                      <p className="text-xs text-slate-500">
                        I can help with your course materials
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-xl text-sm",
                          msg.role === 'user' 
                            ? 'bg-orange-500/20 border border-orange-500/30 ml-4' 
                            : msg.isError
                            ? 'bg-red-500/20 border border-red-500/30 mr-4'
                            : 'bg-white/10 border border-white/10 mr-4'
                        )}
                      >
                        <p className="text-white whitespace-pre-wrap">{msg.content}</p>
                        {msg.sources && msg.sources.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-white/10">
                            <p className="text-xs text-slate-400 mb-1">Sources:</p>
                            {msg.sources.slice(0, 2).map((source, i) => (
                              <p key={i} className="text-xs text-slate-500">
                                📄 {source.file_name}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))
                  )}

                  {isLoading && (
                    <div className="flex items-center gap-2 p-3 rounded-xl bg-white/5 text-sm text-slate-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Thinking...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-orange-500/30">
                    <Input
                      type="text"
                      placeholder={currentClassId ? "Ask a question..." : "Select a class first..."}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      disabled={!currentClassId || isLoading}
                      className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-slate-400 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || !currentClassId || isLoading}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
                    >
                      {isLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    {currentClassId 
                      ? 'AI responses based on class materials' 
                      : 'Open a class to enable AI chat'
                    }
                  </p>
                </div>
              </>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
