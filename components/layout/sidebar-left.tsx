'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Home, BookOpen, FileText, MessageSquare, Settings, ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUIStore } from '@/store/ui-store'
import { cn } from '@/lib/utils'
import { UserMenu } from '@/components/layout/user-menu'
import { useEffect, useState } from 'react'
import { getRecentDocuments, DocumentWithDetails } from '@/app/actions/documents'

interface UserProfile {
  id: string
  email: string | null
  username: string | null
  full_name: string | null
  role: string | null
}

interface NavItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string | null
  action?: string
}

const navItems: NavItem[] = [
  { icon: Home, label: 'Home', href: '/' },
  { icon: BookOpen, label: 'Classes', href: '/classes' },
  { icon: FileText, label: 'Documents', href: '/docs' },
  { icon: MessageSquare, label: 'AI Chat', href: null, action: 'ai-chat' },
  { icon: Settings, label: 'Settings', href: '/settings' },
]

const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Unknown'
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))
  
  if (diffInDays === 0) return 'Today'
  if (diffInDays === 1) return 'Yesterday'
  if (diffInDays < 7) return `${diffInDays}d ago`
  if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}w ago`
  return date.toLocaleDateString()
}

export function SidebarLeft() {
  const pathname = usePathname()
  const { leftSidebarOpen, toggleLeftSidebar, openAIChat } = useUIStore()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [recentDocs, setRecentDocs] = useState<DocumentWithDetails[]>([])
  const [isLoadingDocs, setIsLoadingDocs] = useState(true)

  useEffect(() => {
    // Fetch user data
    fetch('/api/user')
      .then(res => res.json())
      .then(data => setUser(data))
      .catch(err => console.error('Failed to fetch user:', err))
  }, [])

  useEffect(() => {
    // Fetch recent documents
    const fetchRecentDocs = async () => {
      setIsLoadingDocs(true)
      try {
        const docs = await getRecentDocuments(6)
        setRecentDocs(docs)
      } catch (error) {
        console.error('Failed to fetch recent documents:', error)
      } finally {
        setIsLoadingDocs(false)
      }
    }

    if (leftSidebarOpen) {
      fetchRecentDocs()
    }
  }, [leftSidebarOpen])

  return (
    <AnimatePresence mode="wait">
      {leftSidebarOpen ? (
        <motion.aside
          key="sidebar-full"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 280, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed left-0 top-0 h-screen glass-panel border-r border-white/10 overflow-hidden z-40"
        >
          <div className="flex flex-col h-full p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400" />
                <h1 className="text-xl font-bold">Study Group</h1>
              </div>
              <button
                onClick={toggleLeftSidebar}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Collapse sidebar"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            </div>

            {/* Navigation */}
            <nav className="space-y-1 mb-8">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                // Handle AI Chat button with action
                if (item.action === 'ai-chat') {
                  return (
                    <button
                      key={item.label}
                      onClick={openAIChat}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left',
                        'text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{item.label}</span>
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                )
              })}
            </nav>

            {/* Recent Documents */}
            <div className="flex-1 overflow-hidden">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Recent
              </h3>
              <div className="space-y-2 overflow-y-auto max-h-[400px] pr-2">
                {isLoadingDocs ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400" />
                  </div>
                ) : recentDocs.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <p className="text-xs text-slate-500">No recent documents</p>
                  </div>
                ) : (
                  recentDocs.map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/docs/${doc.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">
                          {doc.title}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          {doc.class_name || 'No class'} • {formatDate(doc.updated_at || doc.created_at)}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* User Menu */}
            {user && (
              <div className="mt-4 pt-4 border-t border-white/10">
                <UserMenu user={user} />
              </div>
            )}
          </div>
        </motion.aside>
      ) : (
        <motion.aside
          key="sidebar-collapsed"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 64, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="fixed left-0 top-0 h-screen glass-panel border-r border-white/10 overflow-hidden z-40"
        >
          <div className="flex flex-col h-full p-3 items-center">
            {/* Header */}
            <button
              onClick={toggleLeftSidebar}
              className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 mb-8 flex items-center justify-center"
              aria-label="Expand sidebar"
            >
              <span className="text-white font-bold text-lg">S</span>
            </button>

            {/* Navigation Icons */}
            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                // Handle AI Chat button with action
                if (item.action === 'ai-chat') {
                  return (
                    <button
                      key={item.label}
                      onClick={openAIChat}
                      className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                        'text-slate-300 hover:bg-white/5 hover:text-white'
                      )}
                      title={item.label}
                    >
                      <Icon className="w-5 h-5" />
                    </button>
                  )
                }
                
                return (
                  <Link
                    key={item.href}
                    href={item.href!}
                    className={cn(
                      'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300 hover:bg-white/5 hover:text-white'
                    )}
                    title={item.label}
                  >
                    <Icon className="w-5 h-5" />
                  </Link>
                )
              })}
            </nav>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  )
}
