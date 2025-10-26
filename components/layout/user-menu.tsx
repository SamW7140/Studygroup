'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { signOut } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

interface UserMenuProps {
  user: {
    id: string
    email: string | null
    username: string | null
    full_name: string | null
    role: string | null
  }
}

export function UserMenu({ user }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSigningOut, setIsSigningOut] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    if (!confirm('Are you sure you want to sign out?')) {
      return
    }

    setIsSigningOut(true)
    const result = await signOut()

    if (result.success) {
      router.push('/auth/login')
      router.refresh()
    } else {
      alert(result.error || 'Failed to sign out')
      setIsSigningOut(false)
    }
  }

  const getInitials = (name: string | null) => {
    if (!name) return '?'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
      >
        {/* Avatar */}
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-pink-500 text-white text-sm font-semibold">
          {getInitials(user.full_name || user.username)}
        </div>
        
        {/* User Info */}
        <div className="flex flex-col items-start">
          <span className="text-sm font-medium text-white">
            {user.full_name || user.username || 'User'}
          </span>
          <span className="text-xs text-slate-400 capitalize">
            {user.role || 'student'}
          </span>
        </div>

        <ChevronDown
          className={`h-4 w-4 text-slate-400 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg border border-white/10 bg-slate-900/95 backdrop-blur-xl shadow-xl">
          {/* User Info Header */}
          <div className="border-b border-white/10 p-4">
            <p className="text-sm font-medium text-white">
              {user.full_name || user.username}
            </p>
            <p className="text-xs text-slate-400">{user.email}</p>
            <p className="mt-1 text-xs text-slate-500 capitalize">
              {user.role || 'Student'} Account
            </p>
          </div>

          {/* Menu Items */}
          <div className="p-2">
            <Link
              href="/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>

            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50"
            >
              <LogOut className="h-4 w-4" />
              {isSigningOut ? 'Signing out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
