import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface UIState {
  // Sidebar states
  leftSidebarOpen: boolean
  rightSidebarOpen: boolean
  rightSidebarMode: 'upcoming' | 'ai-chat'
  
  // View preferences
  viewMode: 'grid' | 'list'
  sortBy: 'recent' | 'name' | 'date'
  filterOwner: 'all' | 'me'
  
  // Theme
  theme: 'dark' | 'light'
  
  // Actions
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  openAIChat: () => void
  setRightSidebarMode: (mode: 'upcoming' | 'ai-chat') => void
  setViewMode: (mode: 'grid' | 'list') => void
  setSortBy: (sort: 'recent' | 'name' | 'date') => void
  setFilterOwner: (filter: 'all' | 'me') => void
  setTheme: (theme: 'dark' | 'light') => void
}

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      // Initial states
      leftSidebarOpen: true,
      rightSidebarOpen: true,
      rightSidebarMode: 'upcoming',
      viewMode: 'grid',
      sortBy: 'recent',
      filterOwner: 'all',
      theme: 'dark',
      
      // Actions
      toggleLeftSidebar: () => set((state) => ({ leftSidebarOpen: !state.leftSidebarOpen })),
      toggleRightSidebar: () => set((state) => ({ rightSidebarOpen: !state.rightSidebarOpen })),
      openAIChat: () => set({ rightSidebarOpen: true, rightSidebarMode: 'ai-chat' }),
      setRightSidebarMode: (mode) => set({ rightSidebarMode: mode }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setSortBy: (sort) => set({ sortBy: sort }),
      setFilterOwner: (filter) => set({ filterOwner: filter }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'study-group-ui-storage',
    }
  )
)
