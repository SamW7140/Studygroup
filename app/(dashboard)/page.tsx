'use client'

import { HeroSearch } from '@/components/dashboard/hero-search'
import { ActionTiles } from '@/components/dashboard/action-tiles'
import { DocumentCard } from '@/components/dashboard/document-card'
import { documents } from '@/app/_data/documents'
import { motion } from 'framer-motion'

export default function DashboardPage() {
  // Show most recent documents
  const recentDocuments = documents.slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Hero Section with Class Code Entry */}
      <HeroSearch />

      {/* Action Tiles - Simplified to core features */}
      <ActionTiles />

      {/* Class Materials Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Class Materials</h2>
            <p className="text-sm text-slate-400">Shared notes and documents from your classmates</p>
          </div>
        </div>

        {/* Documents Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          {recentDocuments.map((doc, index) => (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * index }}
            >
              <DocumentCard document={doc} />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty State - shown when no documents */}
        {recentDocuments.length === 0 && (
          <div className="text-center py-16 glass-panel rounded-2xl">
            <p className="text-slate-400 text-lg mb-2">No materials yet</p>
            <p className="text-slate-500 text-sm">
              Upload your first document or join a class to see shared materials
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
