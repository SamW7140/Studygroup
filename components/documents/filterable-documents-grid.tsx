'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { DocumentWithDetails } from '@/app/actions/documents'
import { DocumentCard } from '@/components/dashboard/document-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FilterableDocumentsGridProps {
  documents: DocumentWithDetails[]
  classes?: Array<{ class_id: string; class_name: string }>
}

type SortOption = 'newest' | 'oldest' | 'title' | 'type'

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF', color: 'bg-red-500/20 text-red-300 hover:bg-red-500/30' },
  { value: 'docx', label: 'DOCX', color: 'bg-blue-500/20 text-blue-300 hover:bg-blue-500/30' },
  { value: 'pptx', label: 'PPTX', color: 'bg-orange-500/20 text-orange-300 hover:bg-orange-500/30' },
  { value: 'xlsx', label: 'XLSX', color: 'bg-green-500/20 text-green-300 hover:bg-green-500/30' },
  { value: 'png', label: 'PNG', color: 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' },
  { value: 'jpg', label: 'JPG', color: 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' },
  { value: 'jpeg', label: 'JPEG', color: 'bg-purple-500/20 text-purple-300 hover:bg-purple-500/30' },
]

export function FilterableDocumentsGrid({ documents, classes = [] }: FilterableDocumentsGridProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [selectedClass, setSelectedClass] = useState<string>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(true)

  // Get unique classes from documents if not provided
  const availableClasses = useMemo(() => {
    if (classes.length > 0) return classes
    
    const uniqueClasses = new Map<string, string>()
    documents.forEach((doc) => {
      if (doc.class_id && doc.class_name) {
        uniqueClasses.set(doc.class_id, doc.class_name)
      }
    })
    
    return Array.from(uniqueClasses.entries()).map(([class_id, class_name]) => ({
      class_id,
      class_name,
    }))
  }, [documents, classes])

  // Filter and sort documents
  const filteredDocuments = useMemo(() => {
    let filtered = [...documents]

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim()
      filtered = filtered.filter((doc) =>
        doc.title.toLowerCase().includes(search)
      )
    }

    // Apply file type filter
    if (selectedTypes.length > 0) {
      filtered = filtered.filter((doc) =>
        selectedTypes.includes(doc.file_type)
      )
    }

    // Apply class filter
    if (selectedClass !== 'all') {
      filtered = filtered.filter((doc) => doc.class_id === selectedClass)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'title':
          return a.title.localeCompare(b.title)
        case 'type':
          return a.file_type.localeCompare(b.file_type)
        case 'newest':
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })

    return filtered
  }, [documents, searchTerm, selectedTypes, selectedClass, sortBy])

  const toggleFileType = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.filter((t) => t !== type)
        : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedTypes([])
    setSelectedClass('all')
    setSortBy('newest')
  }

  const hasActiveFilters =
    searchTerm.trim() !== '' ||
    selectedTypes.length > 0 ||
    selectedClass !== 'all' ||
    sortBy !== 'newest'

  return (
    <div className="space-y-6">
      {/* Filter Controls */}
      <div className="space-y-4">
        {/* Top Bar */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-400"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Class Filter */}
          {availableClasses.length > 0 && (
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[200px] bg-white/5 border-white/10 text-white">
                <SelectValue placeholder="All Classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {availableClasses.map((cls) => (
                  <SelectItem key={cls.class_id} value={cls.class_id}>
                    {cls.class_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Sort */}
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[160px] bg-white/5 border-white/10 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="title">A-Z</SelectItem>
              <SelectItem value="type">By Type</SelectItem>
            </SelectContent>
          </Select>

          {/* Toggle Filters */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="bg-white/5 border-white/10 text-white hover:bg-white/10"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* File Type Chips */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-sm text-slate-400">Filter by type:</span>
                {FILE_TYPES.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => toggleFileType(type.value)}
                    className={`
                      px-3 py-1 rounded-full text-xs font-medium
                      transition-all duration-200
                      ${
                        selectedTypes.includes(type.value)
                          ? type.color + ' ring-2 ring-offset-2 ring-offset-slate-900 ring-current'
                          : 'bg-white/5 text-slate-400 hover:bg-white/10'
                      }
                    `}
                  >
                    {type.label}
                  </button>
                ))}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="ml-2 text-xs text-orange-400 hover:text-orange-300 underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            {filteredDocuments.length === documents.length ? (
              <>
                <span className="font-semibold text-white">{documents.length}</span> document
                {documents.length !== 1 ? 's' : ''}
              </>
            ) : (
              <>
                <span className="font-semibold text-white">{filteredDocuments.length}</span> of{' '}
                <span className="font-semibold text-white">{documents.length}</span> document
                {documents.length !== 1 ? 's' : ''}
              </>
            )}
          </span>
        </div>
      </div>

      {/* Documents Grid */}
      <AnimatePresence mode="popLayout">
        {filteredDocuments.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-16 glass-panel rounded-2xl"
          >
            <p className="text-slate-400 text-lg mb-2">No documents found</p>
            <p className="text-slate-500 text-sm">
              {hasActiveFilters
                ? 'Try adjusting your filters'
                : 'Upload your first document or join a class to see shared materials'}
            </p>
            {hasActiveFilters && (
              <Button
                onClick={clearFilters}
                variant="outline"
                className="mt-4 bg-white/5 border-white/10 text-white hover:bg-white/10"
              >
                Clear Filters
              </Button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            layout
          >
            {filteredDocuments.map((doc, index) => (
              <motion.div
                key={doc.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2, delay: index * 0.02 }}
              >
                <DocumentCard document={doc} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
