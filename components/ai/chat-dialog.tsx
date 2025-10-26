'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChatInterface } from './chat-interface'

interface ChatDialogProps {
  isOpen: boolean
  onClose: () => void
  classId: string
  className: string
}

export function ChatDialog({ isOpen, onClose, classId, className }: ChatDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh] p-0 bg-slate-900 border-white/10">
        <ChatInterface classId={classId} className={className} />
      </DialogContent>
    </Dialog>
  )
}
