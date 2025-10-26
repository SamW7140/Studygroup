'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { updateUserProfile } from '@/app/actions/auth'
import { Loader2, Save, User as UserIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface SettingsFormProps {
  user: {
    id: string
    email: string | null
    username: string | null
    full_name: string | null
    role: string | null
  }
}

export function SettingsForm({ user }: SettingsFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    const result = await updateUserProfile(formData)

    setIsLoading(false)

    if (result.success) {
      setSuccess('Profile updated successfully!')
      router.refresh()
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null)
      }, 3000)
    } else {
      setError(result.error || 'Failed to update profile')
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {/* Username */}
      <div>
        <label
          htmlFor="username"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Username
        </label>
        <Input
          type="text"
          id="username"
          name="username"
          defaultValue={user.username || ''}
          placeholder="Enter your username"
          disabled={isLoading}
          className="w-full"
          required
        />
        <p className="mt-1 text-xs text-muted-foreground">
          This will be displayed on your profile
        </p>
      </div>

      {/* Full Name */}
      <div>
        <label
          htmlFor="fullName"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Full Name
        </label>
        <Input
          type="text"
          id="fullName"
          name="fullName"
          defaultValue={user.full_name || ''}
          placeholder="Enter your full name"
          disabled={isLoading}
          className="w-full"
          required
        />
      </div>

      {/* Email (read-only) */}
      <div>
        <label
          htmlFor="email"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Email
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          value={user.email || ''}
          disabled
          className="w-full bg-secondary"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Email cannot be changed
        </p>
      </div>

      {/* Role (read-only) */}
      <div>
        <label
          htmlFor="role"
          className="mb-2 block text-sm font-medium text-foreground"
        >
          Account Type
        </label>
        <Input
          type="text"
          id="role"
          name="role"
          value={user.role || 'student'}
          disabled
          className="w-full bg-secondary capitalize"
        />
        <p className="mt-1 text-xs text-muted-foreground">
          Account type cannot be changed
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-500/10 border border-red-500/20 p-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="rounded-md bg-green-500/10 border border-green-500/20 p-3 text-sm text-green-400">
          {success}
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </>
        )}
      </Button>
    </form>
  )
}
