'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { signOut } from '@/app/actions/auth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface UserProfile {
  id: string
  email?: string | null
  username?: string | null
  full_name?: string | null
  role?: string | null
}

export function UserProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data: profileData } = await supabase
        .from('Profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile({
        id: user.id,
        email: user.email,
        ...profileData
      })
      setLoading(false)
    }

    loadProfile()
  }, [supabase, router])

  const handleSignOut = async () => {
    await signOut()
  }

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
        </div>
      </Card>
    )
  }

  if (!profile) {
    return null
  }

  const roleIcon = profile.role === 'professor' ? '👨‍🏫' : '🎓'
  const roleLabel = profile.role === 'professor' ? 'Professor' : 'Student'

  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{roleIcon}</span>
            <div>
              <h3 className="font-semibold text-gray-900">
                {profile.full_name || profile.username || 'User'}
              </h3>
              <p className="text-sm text-gray-500">{roleLabel}</p>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">{profile.email}</p>
          {profile.username && (
            <p className="text-xs text-gray-500 mt-1">@{profile.username}</p>
          )}
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOut}
          className="ml-4"
        >
          Sign Out
        </Button>
      </div>
    </Card>
  )
}
