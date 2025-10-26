'use client'

import { motion } from 'framer-motion'
import { Users, Copy, Clock } from 'lucide-react'
import Link from 'next/link'
import { Class } from '@/app/_data/classes'
import { formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface ClassCardProps {
  classData: Class
}

export function ClassCard({ classData }: ClassCardProps) {
  const copyJoinCode = (e: React.MouseEvent) => {
    e.preventDefault()
    navigator.clipboard.writeText(classData.joinCode)
    toast.success('Join code copied!', {
      description: `Code: ${classData.joinCode}`,
    })
  }

  // Check if class was active in the last 24 hours
  const isRecentlyActive = () => {
    const oneDayAgo = new Date()
    oneDayAgo.setDate(oneDayAgo.getDate() - 1)
    return new Date(classData.lastActivity) > oneDayAgo
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <Link href={`/classes/${classData.id}`}>
        <div className="glass-panel rounded-2xl p-6 hover:bg-white/10 transition-all h-full relative overflow-hidden">
          {/* Gradient border on hover */}
          <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
            style={{
              background: `linear-gradient(135deg, ${classData.color}40 0%, transparent 100%)`,
            }}
          />
          
          {/* New/Active badge */}
          {isRecentlyActive() && (
            <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-green-500/20 border border-green-500/40 flex items-center gap-1">
              <Clock className="w-3 h-3 text-green-400" />
              <span className="text-xs text-green-400 font-medium">Active</span>
            </div>
          )}

          {/* Header */}
          <div className="flex items-start justify-between mb-4 relative z-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg group-hover:shadow-xl transition-shadow duration-300"
              style={{
                background: `linear-gradient(135deg, ${classData.color} 0%, ${classData.color}dd 100%)`,
              }}
            >
              {classData.name.substring(0, 2).toUpperCase()}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white hover:bg-white/10 -mt-2 -mr-2"
              onClick={copyJoinCode}
            >
              <Copy className="w-4 h-4 mr-1" />
              <span className="text-xs">{classData.joinCode}</span>
            </Button>
          </div>

          {/* Content */}
          <div className="space-y-3 relative z-10">
            <div>
              <h3 className="text-xl font-bold text-white mb-1 group-hover:text-cyan-400 transition-colors">
                {classData.name}
              </h3>
              <p className="text-sm text-slate-400">{classData.professor}</p>
            </div>

            <div className="flex items-center gap-4 text-sm text-slate-300">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10">
                <Users className="w-4 h-4 text-cyan-400" />
                <span className="font-medium">{classData.members}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <p className="text-xs text-slate-500">
                Last activity: {formatDate(classData.lastActivity)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
