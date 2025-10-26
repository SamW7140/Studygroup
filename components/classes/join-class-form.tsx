'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { enrollByClassCode } from '@/app/actions/enrollments'
import { Loader2, Key, Check } from 'lucide-react'

interface JoinClassFormProps {
  onClassJoined?: () => void
}

export function JoinClassForm({ onClassJoined }: JoinClassFormProps) {
  const [joining, setJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [classCode, setClassCode] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!classCode.trim()) {
      setError('Please enter a class code')
      return
    }

    setJoining(true)
    setError(null)
    setSuccess(null)

    const result = await enrollByClassCode(classCode.trim())

    setJoining(false)

    if (result.success) {
      setSuccess(`Successfully joined "${result.className}"!`)
      setShowForm(false)
      setClassCode('')

      // Call callback
      if (onClassJoined) {
        onClassJoined()
      }

      // Clear success message after 5 seconds
      setTimeout(() => setSuccess(null), 5000)
    } else {
      setError(result.error || 'Failed to join class')
    }
  }

  if (!showForm) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Key className="mr-2 h-4 w-4" />
          Join Class with Code
        </Button>

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              <p className="font-medium">{success}</p>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Join a Class</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowForm(false)
            setError(null)
            setClassCode('')
          }}
        >
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="classCode"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Class Code
          </label>
          <Input
            type="text"
            id="classCode"
            name="classCode"
            placeholder="e.g., ABC123"
            value={classCode}
            onChange={(e) => setClassCode(e.target.value.toUpperCase())}
            required
            disabled={joining}
            className="w-full font-mono text-lg tracking-wider"
            maxLength={10}
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter the 6-character code provided by your professor
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={joining}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          {joining ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Joining...
            </>
          ) : (
            <>
              <Key className="mr-2 h-4 w-4" />
              Join Class
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
