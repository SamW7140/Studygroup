'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Loader2, Bot, User, FileText, AlertCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { queryAIWithContext } from '@/app/actions/chat'
import { toast } from 'sonner'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  sources?: {
    file_name: string
    page?: number
    relevance_score?: number
  }[]
  timestamp: Date
}

interface ChatInterfaceProps {
  classId: string
  className: string
}

export function ChatInterface({ classId, className }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      console.log('📤 Sending query to AI:', {
        classId,
        question: userMessage.content.substring(0, 50) + '...'
      })
      
      const result = await queryAIWithContext(classId, userMessage.content)

      console.log('📥 Received result:', {
        success: result.success,
        error: result.error,
        answerLength: result.answer?.length || 0,
        sourcesCount: result.sources?.length || 0
      })

      if (!result.success) {
        // Show error toast
        toast.error('AI Query Failed', {
          description: result.error
        })
        
        // Add error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: `❌ ${result.error}`,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, errorMessage])
      } else {
        // Add assistant response
        const assistantMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.answer,
          sources: result.sources,
          timestamp: new Date()
        }
        setMessages(prev => [...prev, assistantMessage])
        
        // Show success toast with confidence
        if (result.confidence !== undefined) {
          toast.success('Answer Generated', {
            description: `Confidence: ${(result.confidence * 100).toFixed(0)}%`
          })
        }
      }
    } catch (error) {
      console.error('❌ Error sending message:', error)
      
      // Log detailed error info
      if (error instanceof Error) {
        console.error('Error details:', {
          name: error.name,
          message: error.message,
          stack: error.stack
        })
      }
      
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      
      toast.error('Failed to send message', {
        description: errorMsg
      })
      
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `❌ Failed to get AI response: ${errorMsg}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }

  const handleClearChat = () => {
    setMessages([])
    toast.success('Chat cleared')
  }

  return (
    <div className="flex flex-col h-full max-h-[600px]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Study Assistant</h3>
            <p className="text-sm text-slate-300">{className}</p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleClearChat}
            className="text-slate-300 hover:text-white"
          >
            Clear Chat
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400/20 to-orange-600/20 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-orange-400" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">
              Ask me anything about your course materials!
            </h4>
            <p className="text-slate-400 max-w-md">
              I can help you understand concepts, summarize documents, and answer questions based on your uploaded study materials.
            </p>
          </div>
        )}

        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <MessageBubble message={message} />
            </motion.div>
          ))}
        </AnimatePresence>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col gap-3 p-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
            {messages.length <= 1 && (
              <div className="ml-11 text-xs text-slate-500">
                💡 First query may take 30-60 seconds while indexing documents. Subsequent queries will be much faster!
              </div>
            )}
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-white/10">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Ask a question about your course materials..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
          />
          <Button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </form>
        <p className="text-xs text-slate-500 mt-2">
          💡 Tip: Ask specific questions for better results
        </p>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'
  const isError = message.content.startsWith('❌')

  return (
    <div className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-white" />
        </div>
      )}
      
      <div className={`flex flex-col gap-2 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
              : isError
              ? 'bg-red-500/10 border border-red-500/20 text-red-300'
              : 'bg-white/10 border border-white/10 text-white'
          }`}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Sources */}
        {message.sources && message.sources.length > 0 && (
          <Card className="p-3 bg-white/5 border-white/10">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-3 h-3 text-slate-400" />
              <span className="text-xs font-semibold text-slate-300">Sources</span>
            </div>
            <div className="space-y-1">
              {message.sources.map((source, idx) => (
                <div key={idx} className="text-xs text-slate-400 flex items-start gap-2">
                  <span className="text-orange-400">•</span>
                  <span>
                    {source.file_name}
                    {source.page && ` (Page ${source.page})`}
                    {source.relevance_score && 
                      ` - ${(source.relevance_score * 100).toFixed(0)}% match`
                    }
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        <span className="text-xs text-slate-500">
          {message.timestamp.toLocaleTimeString()}
        </span>
      </div>

      {isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  )
}
