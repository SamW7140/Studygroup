'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { queryAI } from '@/app/actions/ai-query'

interface AISource {
  file_name: string
  page?: number
  relevance_score?: number
}

interface AIResponse {
  answer: string
  sources: AISource[]
  confidence?: number
}

interface ConversationEntry {
  question: string
  response: AIResponse
  timestamp: Date
}

interface AIAssistantProps {
  classId: string
}

export function AIAssistant({ classId }: AIAssistantProps) {
  const [question, setQuestion] = useState('')
  const [history, setHistory] = useState<ConversationEntry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!question.trim()) {
      setError('Please enter a question')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await queryAI({
        classId,
        question: question.trim()
      })
      
      // Add to history
      setHistory([
        {
          question: question.trim(),
          response: result,
          timestamp: new Date()
        },
        ...history
      ])
      
      // Clear input
      setQuestion('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="text-2xl">🤖</div>
          <h2 className="text-xl font-semibold">AI Study Assistant</h2>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="text"
              placeholder="Ask a question about your course materials..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              disabled={isLoading}
              className="w-full"
            />
          </div>
          
          <Button 
            type="submit" 
            disabled={isLoading || !question.trim()}
            className="w-full"
          >
            {isLoading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Thinking...
              </>
            ) : (
              'Ask AI'
            )}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {isLoading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-600">
              Analyzing your documents and generating an answer...
            </p>
          </div>
        )}
      </Card>

      {/* Conversation History */}
      {history.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Questions</h3>
          {history.map((entry, idx) => (
            <Card key={idx} className="p-6">
              {/* Question */}
              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-500 mb-1">
                  {entry.timestamp.toLocaleTimeString()}
                </p>
                <p className="font-semibold text-gray-900">
                  Q: {entry.question}
                </p>
              </div>

              {/* Answer */}
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-semibold">A:</span>
                    <p className="text-gray-700 whitespace-pre-wrap flex-1">
                      {entry.response.answer}
                    </p>
                  </div>
                  
                  {entry.response.confidence !== undefined && (
                    <p className="text-sm text-gray-500 mt-2">
                      Confidence: {(entry.response.confidence * 100).toFixed(0)}%
                    </p>
                  )}
                </div>

                {/* Sources */}
                {entry.response.sources.length > 0 && (
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                    <h4 className="font-semibold text-gray-900 mb-2">Sources:</h4>
                    <ul className="space-y-1">
                      {entry.response.sources.map((source, sourceIdx) => (
                        <li key={sourceIdx} className="text-sm text-gray-600">
                          📄 {source.file_name}
                          {source.page && ` (Page ${source.page})`}
                          {source.relevance_score && 
                            ` - ${(source.relevance_score * 100).toFixed(0)}% relevant`
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
