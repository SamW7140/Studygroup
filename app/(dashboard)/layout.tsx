'use client'

import { useUIStore } from '@/store/ui-store'
import { SidebarLeft } from '@/components/layout/sidebar-left'
import { SidebarRight } from '@/components/layout/sidebar-right'
import { motion } from 'framer-motion'
import { useEffect } from 'react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { leftSidebarOpen, rightSidebarOpen, toggleLeftSidebar, toggleRightSidebar } = useUIStore()

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '[' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleLeftSidebar()
      }
      if (e.key === ']' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        toggleRightSidebar()
      }
      // Add Cmd/Ctrl+K for search later
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        // Open search modal
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [toggleLeftSidebar, toggleRightSidebar])

  return (
    <div className="min-h-screen bg-hero-gradient">
      <div className="flex relative">
        {/* Left Sidebar */}
        <SidebarLeft />

        {/* Main Content */}
        <motion.main
          initial={false}
          animate={{
            marginLeft: leftSidebarOpen ? 280 : 64,
            marginRight: rightSidebarOpen ? 320 : 0,
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="flex-1 min-h-screen"
        >
          <div className="max-w-[1600px] mx-auto p-8">
            {children}
          </div>
        </motion.main>

        {/* Right Sidebar */}
        <SidebarRight />
      </div>
    </div>
  )
}
