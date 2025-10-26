'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, Clock, AlertCircle, MessageSquare, Send } from 'lucide-react'
import { useUIStore } from '@/store/ui-store'
import { upcomingItems } from '@/app/_data/upcoming'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const priorityColors = {
  low: 'bg-slate-500',
  medium: 'bg-yellow-500',
  high: 'bg-red-500',
}

const typeIcons = {
  assignment: '📝',
  exam: '📚',
  quiz: '❓',
  project: '🎯',
  reading: '📖',
}

export function SidebarRight() {
  const { rightSidebarOpen, toggleRightSidebar, rightSidebarMode, setRightSidebarMode } = useUIStore()
  const [message, setMessage] = useState('')
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai', content: string }>>([])

  const sortedItems = [...upcomingItems].sort(
    (a, b) => a.dueDate.getTime() - b.dueDate.getTime()
  )

  const formatDueDate = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24))

    if (days < 0) return 'Overdue'
    if (days === 0) return 'Today'
    if (days === 1) return 'Tomorrow'
    if (days <= 7) return `In ${days} days`
    return date.toLocaleDateString()
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, { role: 'user', content: message }])
      setMessage('')
      
      // Simulate AI response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: 'ai', 
          content: 'I can help you understand the course materials. What would you like to know?' 
        }])
      }, 1000)
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
                  onClick={() => setRightSidebarMode('upcoming')}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    rightSidebarMode === 'upcoming' ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-slate-400'
                  )}
                  aria-label="Upcoming"
                >
                  <Clock className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setRightSidebarMode('ai-chat')}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors",
                    rightSidebarMode === 'ai-chat' ? 'bg-orange-500/20 text-orange-400' : 'hover:bg-white/10 text-slate-400'
                  )}
                  aria-label="AI Chat"
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
            {rightSidebarMode === 'upcoming' ? (
              <>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-orange-400" />
                  Upcoming
                </h2>
                {/* Upcoming Items */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {sortedItems.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all group cursor-pointer border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{typeIcons[item.type]}</span>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm mb-1 truncate group-hover:text-orange-400 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-slate-400 mb-2">
                            {item.className}
                          </p>
                          <div className="flex items-center gap-2">
                            <span
                              className={cn(
                                'w-2 h-2 rounded-full',
                                priorityColors[item.priority]
                              )}
                            />
                            <span className="text-xs text-slate-300">
                              {formatDueDate(item.dueDate)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Tips */}
                <div className="mt-4 p-4 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-orange-300 text-sm mb-1">
                        Quick Tip
                      </h4>
                      <p className="text-xs text-slate-300">
                        Use Cmd/Ctrl+K to quickly search across all your classes and
                        documents.
                      </p>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-lg font-semibold flex items-center gap-2 mb-4">
                  <MessageSquare className="w-5 h-5 text-orange-400" />
                  AI Assistant
                </h2>
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 mb-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-sm">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 text-orange-400/50" />
                      <p>Ask me anything about your course materials!</p>
                    </div>
                  ) : (
                    chatMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={cn(
                          "p-3 rounded-xl text-sm",
                          msg.role === 'user' 
                            ? 'bg-orange-500/20 border border-orange-500/30 ml-4' 
                            : 'bg-white/10 border border-white/10 mr-4'
                        )}
                      >
                        <p className="text-white">{msg.content}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Chat Input */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-white/10 border border-orange-500/30">
                    <Input
                      type="text"
                      placeholder="Ask a question..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-slate-400 text-sm"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim()}
                      size="sm"
                      className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    AI responses based on uploaded class materials
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
