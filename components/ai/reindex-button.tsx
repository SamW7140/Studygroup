'use client'

import { useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { triggerDocumentIndexing } from '@/app/actions/chat'
import { toast } from 'sonner'

interface ReindexButtonProps {
  classId: string
  variant?: 'default' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  showLabel?: boolean
}

export function ReindexButton({ 
  classId, 
  variant = 'outline', 
  size = 'sm',
  showLabel = true 
}: ReindexButtonProps) {
  const [isReindexing, setIsReindexing] = useState(false)

  const handleReindex = async () => {
    setIsReindexing(true)
    
    try {
      const result = await triggerDocumentIndexing(classId)
      
      if (result.success) {
        toast.success('AI Reindexing Triggered', {
          description: 'Documents will be reindexed on your next AI query.',
          duration: 4000
        })
      } else {
        toast.error('Failed to trigger reindexing', {
          description: 'Please try again or contact support.'
        })
      }
    } catch (error) {
      console.error('Error triggering reindex:', error)
      toast.error('Failed to trigger reindexing', {
        description: error instanceof Error ? error.message : 'Unknown error'
      })
    } finally {
      setIsReindexing(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleReindex}
      disabled={isReindexing}
      className="gap-2"
    >
      <RefreshCw className={`w-4 h-4 ${isReindexing ? 'animate-spin' : ''}`} />
      {showLabel && (isReindexing ? 'Reindexing...' : 'Reindex AI')}
    </Button>
  )
}
