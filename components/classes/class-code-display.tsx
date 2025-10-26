'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Copy, Check, Key } from 'lucide-react'

interface ClassCodeDisplayProps {
  classCode: string
}

export function ClassCodeDisplay({ classCode }: ClassCodeDisplayProps) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(classCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2">
            <Key className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-blue-900">
              Class Code
            </h3>
          </div>
          <p className="mb-3 text-sm text-blue-700">
            Share this code with students so they can join your class
          </p>
          <div className="flex items-center gap-3">
            <code className="rounded-lg bg-white px-4 py-3 font-mono text-2xl font-bold tracking-wider text-blue-900 shadow-sm">
              {classCode}
            </code>
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="border-blue-300 hover:bg-blue-100"
            >
              {copied ? (
                <>
                  <Check className="mr-1.5 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="mr-1.5 h-4 w-4" />
                  Copy Code
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
