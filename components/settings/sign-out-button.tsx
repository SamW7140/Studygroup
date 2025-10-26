'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'
import { LogOut, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function SignOutButton() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSignOut() {
    if (!confirm('Are you sure you want to sign out?')) {
      return
    }

    setIsLoading(true)
    const result = await signOut()

    if (result.success) {
      router.push('/auth/login')
      router.refresh()
    } else {
      alert(result.error || 'Failed to sign out')
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleSignOut}
      disabled={isLoading}
      variant="destructive"
      className="w-full"
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Signing out...
        </>
      ) : (
        <>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </>
      )}
    </Button>
  )
}
