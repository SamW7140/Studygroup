'use client'

import { motion } from 'framer-motion'
import {
  Upload,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useRef } from 'react'

const actions = [
  { 
    icon: Upload, 
    label: 'Upload Notes', 
    description: 'Share your study materials',
    color: 'from-orange-400 to-orange-500',
    action: 'upload-doc'
  },
]

export function ActionTiles() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleAction = (actionType: string) => {
    switch (actionType) {
      case 'upload-doc':
        fileInputRef.current?.click()
        break
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      toast.success('Document selected!', {
        description: `${files[0].name} ready to upload`
      })
      // Future: Handle actual file upload to class
    }
  }

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
        onChange={handleFileUpload}
        multiple
      />
      
      <div className="mb-12">
        <h2 className="text-xl font-semibold text-white mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6">
          {actions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleAction(action.action)}
                className="group relative overflow-hidden p-6 rounded-2xl bg-white/10 backdrop-blur-xl border border-orange-500/20 hover:border-orange-500/50 hover:bg-white/15 transition-all hover:shadow-[0_0_25px_rgba(249,115,22,0.2)]"
              >
                <div className="flex flex-col items-start gap-4">
                  <div
                    className={`
                      w-16 h-16 rounded-xl bg-gradient-to-br ${action.color}
                      flex items-center justify-center
                      shadow-lg
                      group-hover:shadow-orange-500/30
                      transition-all duration-300
                    `}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-white group-hover:text-orange-200 transition-colors mb-1">
                      {action.label}
                    </h3>
                    <p className="text-sm text-slate-300 group-hover:text-slate-200 transition-colors">
                      {action.description}
                    </p>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 to-orange-500/0 group-hover:from-orange-500/10 group-hover:to-orange-500/20 transition-all duration-300 rounded-2xl" />
              </motion.button>
            )
          })}
        </div>
      </div>
    </>
  )
}
