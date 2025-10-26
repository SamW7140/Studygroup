'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Sparkles } from 'lucide-react'
import { ChatDialog } from './chat-dialog'

interface FloatingChatButtonProps {
  classId: string
  className: string
}

export function FloatingChatButton({ classId, className }: FloatingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg hover:shadow-orange-500/50 flex items-center justify-center z-50 group"
          >
            <Sparkles className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            
            {/* Pulse effect */}
            <span className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-20" />
          </motion.button>
        )}
      </AnimatePresence>

      <ChatDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        classId={classId}
        className={className}
      />
    </>
  )
}
