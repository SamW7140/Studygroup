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

interface AIAssistantProps {
  classId: string
}

export function AIAssistant({ classId }: AIAssistantProps) {
  const [question, setQuestion] = useState('')
  const [response, setResponse] = useState<AIResponse | null>(null)
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
    setResponse(null)

    try {
      const result = await queryAI({
        classId,
        question: question.trim()
      })
      
      setResponse(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get AI response')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">AI Study Assistant</h2>
        
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
            {isLoading ? 'Thinking...' : 'Ask AI'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {response && (
          <div className="mt-6 space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h3 className="font-semibold text-blue-900 mb-2">Answer:</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{response.answer}</p>
              
              {response.confidence !== undefined && (
                <p className="text-sm text-gray-500 mt-2">
                  Confidence: {(response.confidence * 100).toFixed(0)}%
                </p>
              )}
            </div>

            {response.sources.length > 0 && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <h3 className="font-semibold text-gray-900 mb-2">Sources:</h3>
                <ul className="space-y-1">
                  {response.sources.map((source, idx) => (
                    <li key={idx} className="text-sm text-gray-600">
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
        )}
      </Card>
    </div>
  )
}
