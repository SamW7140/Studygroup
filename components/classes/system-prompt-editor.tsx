'use client'

import { useState } from 'react'
import { updateClassSystemPrompt } from '@/app/actions/classes'
import { Button } from '@/components/ui/button'
import { Loader2, Save, RotateCcw, AlertCircle, CheckCircle2 } from 'lucide-react'

interface SystemPromptEditorProps {
  classId: string
  initialSystemPrompt: string
}

const DEFAULT_SYSTEM_PROMPT = `You are a helpful AI teaching assistant for a university course.
Use the following context from class materials to answer the student's question.
If you cannot find the answer in the context, say so honestly.
Be concise and accurate in your response.`

export function SystemPromptEditor({ classId, initialSystemPrompt }: SystemPromptEditorProps) {
  const [systemPrompt, setSystemPrompt] = useState(initialSystemPrompt || DEFAULT_SYSTEM_PROMPT)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  const handleChange = (value: string) => {
    setSystemPrompt(value)
    setHasChanges(value !== initialSystemPrompt)
    setMessage(null)
  }

  const handleSave = async () => {
    setIsLoading(true)
    setMessage(null)

    try {
      const result = await updateClassSystemPrompt(classId, systemPrompt)

      if (result.success) {
        setMessage({ type: 'success', text: 'System prompt saved successfully!' })
        setHasChanges(false)
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to save system prompt' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'An unexpected error occurred' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    setSystemPrompt(DEFAULT_SYSTEM_PROMPT)
    setHasChanges(DEFAULT_SYSTEM_PROMPT !== initialSystemPrompt)
    setMessage(null)
  }

  const charCount = systemPrompt.length
  const maxChars = 2000
  const isOverLimit = charCount > maxChars

  return (
    <div className="space-y-4">
      {/* Guidelines */}
      <div className="rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
        <h3 className="mb-2 text-sm font-semibold text-blue-400">Guidelines for System Prompts</h3>
        <ul className="space-y-1 text-sm text-blue-300">
          <li>• Be clear about the AI's role and purpose</li>
          <li>• Set expectations for response style (e.g., concise, detailed, formal)</li>
          <li>• Specify any constraints or limitations</li>
          <li>• Consider your students' needs and learning objectives</li>
        </ul>
      </div>

      {/* Textarea */}
      <div>
        <label htmlFor="system-prompt" className="mb-2 block text-sm font-medium text-foreground">
          System Prompt
        </label>
        <textarea
          id="system-prompt"
          value={systemPrompt}
          onChange={(e) => handleChange(e.target.value)}
          rows={10}
          className={`w-full rounded-lg border px-4 py-3 font-mono text-sm bg-background text-foreground focus:outline-none focus:ring-2 ${
            isOverLimit
              ? 'border-red-500/50 focus:ring-red-500'
              : 'border-border focus:ring-blue-500'
          }`}
          placeholder="Enter your custom system prompt..."
        />
        <div className="mt-2 flex items-center justify-between">
          <p className={`text-sm ${isOverLimit ? 'text-red-400' : 'text-muted-foreground'}`}>
            {charCount} / {maxChars} characters
            {isOverLimit && <span className="ml-2 font-semibold">⚠️ Over limit</span>}
          </p>
        </div>
      </div>

      {/* Example Prompts */}
      <details className="rounded-lg border border-border bg-card p-4">
        <summary className="cursor-pointer text-sm font-medium text-foreground">
          View Example Prompts
        </summary>
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-xs font-semibold text-foreground">Strict Academic Style:</p>
            <p className="mt-1 rounded bg-secondary p-2 text-xs text-muted-foreground font-mono">
              "You are a formal academic assistant. Provide detailed, scholarly responses with proper terminology. 
              Always cite sources from the course materials. If uncertain, explicitly state limitations."
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Friendly Tutor Style:</p>
            <p className="mt-1 rounded bg-secondary p-2 text-xs text-muted-foreground font-mono">
              "You are a friendly study buddy helping students understand course concepts. Use simple language, 
              provide examples, and encourage learning. Be supportive and approachable."
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold text-foreground">Socratic Method:</p>
            <p className="mt-1 rounded bg-secondary p-2 text-xs text-muted-foreground font-mono">
              "Guide students to discover answers through questions rather than direct answers. 
              Help them think critically about the course materials. Ask probing questions to deepen understanding."
            </p>
          </div>
        </div>
      </details>

      {/* Status Message */}
      {message && (
        <div
          className={`flex items-center gap-2 rounded-lg p-3 ${
            message.type === 'success'
              ? 'bg-green-500/10 border border-green-500/20 text-green-400'
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : (
            <AlertCircle className="h-5 w-5" />
          )}
          <p className="text-sm font-medium">{message.text}</p>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button
          onClick={handleSave}
          disabled={isLoading || !hasChanges || isOverLimit}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>

        <Button
          onClick={handleReset}
          variant="outline"
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Default
        </Button>
      </div>

      {hasChanges && !message && (
        <p className="text-sm text-amber-400">
          ⚠️ You have unsaved changes
        </p>
      )}
    </div>
  )
}
