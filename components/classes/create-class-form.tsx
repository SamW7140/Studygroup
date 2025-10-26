'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClass } from '@/app/actions/classes'
import { Plus, Loader2, Copy, Check } from 'lucide-react'

interface CreateClassFormProps {
  onClassCreated?: () => void
}

export function CreateClassForm({ onClassCreated }: CreateClassFormProps) {
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [createdClassCode, setCreatedClassCode] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [copied, setCopied] = useState(false)

  async function handleSubmit(formData: FormData) {
    setCreating(true)
    setError(null)
    setSuccess(null)
    setCreatedClassCode(null)

    const result = await createClass(formData)

    setCreating(false)

    if (result.success) {
      setSuccess(`Class "${result.class?.class_name}" created successfully!`)
      setCreatedClassCode(result.class?.class_code || null)
      setShowForm(false)
      
      // Reset form
      const form = document.getElementById('create-class-form') as HTMLFormElement | null
      form?.reset()

      // Call callback
      if (onClassCreated) {
        onClassCreated()
      }

      // Clear success message after 10 seconds (longer to show class code)
      setTimeout(() => {
        setSuccess(null)
        setCreatedClassCode(null)
      }, 10000)
    } else {
      setError(result.error || 'Failed to create class')
    }
  }

  function handleCopyClassCode() {
    if (createdClassCode) {
      navigator.clipboard.writeText(createdClassCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!showForm) {
    return (
      <div className="space-y-4">
        <Button
          onClick={() => setShowForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Class
        </Button>

        {success && (
          <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
            <p className="font-medium">{success}</p>
            {createdClassCode && (
              <div className="mt-3 space-y-2">
                <p className="text-xs font-semibold text-green-700">
                  Class Code (share with students):
                </p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 rounded bg-green-100 px-3 py-2 font-mono text-lg font-bold tracking-wider text-green-900">
                    {createdClassCode}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCopyClassCode}
                    className="shrink-0 border-green-300 hover:bg-green-100"
                  >
                    {copied ? (
                      <>
                        <Check className="mr-1 h-3 w-3" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-1 h-3 w-3" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Create New Class</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setShowForm(false)
            setError(null)
          }}
        >
          Cancel
        </Button>
      </div>

      <form id="create-class-form" action={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="className"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Class Name
          </label>
          <Input
            type="text"
            id="className"
            name="className"
            placeholder="e.g., CMPSC 461 - Algorithms"
            required
            disabled={creating}
            className="w-full"
          />
          <p className="mt-1 text-xs text-gray-500">
            Enter a descriptive name for your class
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={creating}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {creating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="mr-2 h-4 w-4" />
              Create Class
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
