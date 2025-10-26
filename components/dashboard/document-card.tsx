'use client'

import { motion } from 'framer-motion'
import { FileText, File, Image as ImageIcon, FileSpreadsheet, MoreVertical } from 'lucide-react'
import Link from 'next/link'
import { Document } from '@/app/_data/documents'
import { formatDate, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const typeIcons = {
  pdf: FileText,
  pptx: File,
  docx: FileText,
  png: ImageIcon,
  jpg: ImageIcon,
  xlsx: FileSpreadsheet,
}

const typeColors = {
  pdf: 'from-orange-500 to-orange-600',
  pptx: 'from-orange-400 to-orange-500',
  docx: 'from-orange-600 to-orange-700',
  png: 'from-orange-500 to-orange-600',
  jpg: 'from-orange-500 to-orange-600',
  xlsx: 'from-orange-400 to-orange-500',
}

interface DocumentCardProps {
  document: Document
}

export function DocumentCard({ document }: DocumentCardProps) {
  const Icon = typeIcons[document.type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group"
    >
      <Link href={`/docs/${document.id}`}>
        <div className="bg-white/10 backdrop-blur-xl border border-orange-500/20 rounded-2xl p-4 hover:border-orange-500/50 hover:bg-white/15 transition-all hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]">
          {/* Thumbnail/Icon */}
          <div
            className={`
              w-full aspect-[4/3] rounded-xl mb-4
              bg-gradient-to-br ${typeColors[document.type]}
              flex items-center justify-center
              shadow-lg
              group-hover:shadow-orange-500/30
              transition-all
            `}
          >
            <Icon className="w-16 h-16 text-white" />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <h3 className="font-semibold text-white truncate group-hover:text-orange-300 transition-colors">
              {document.title}
            </h3>
            
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-xs bg-white/10">
                  {getInitials(document.owner)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{document.owner}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{formatDate(document.lastEdited)}</span>
              <span className="uppercase font-medium">{document.type}</span>
            </div>
          </div>

          {/* Quick Actions (visible on hover) */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 right-4">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 backdrop-blur-sm hover:bg-black/70"
              onClick={(e) => {
                e.preventDefault()
                // Handle more actions
              }}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
