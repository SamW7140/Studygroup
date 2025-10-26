import { getCurrentUser } from '@/app/actions/auth'
import { redirect } from 'next/navigation'
import { SettingsForm } from '@/components/settings/settings-form'
import { SignOutButton } from '@/components/settings/sign-out-button'
import { Settings, User, LogOut } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/auth/login')
  }

  // Ensure user has proper types
  const userProfile = {
    id: user.id,
    email: user.email || null,
    username: user.username || null,
    full_name: user.full_name || null,
    role: user.role || null,
  }

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white">
            <Settings className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Profile Section */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-card-foreground">Profile Information</h2>
          </div>
          <SettingsForm user={userProfile} />
        </div>

        {/* Account Actions */}
        <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <LogOut className="h-5 w-5 text-red-400" />
            <h2 className="text-xl font-semibold text-card-foreground">Account Actions</h2>
          </div>
          
          <div className="space-y-4">
            {/* Account Info */}
            <div className="rounded-md bg-secondary p-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Account Type:</span>
                  <span className="capitalize text-foreground">{userProfile.role || 'Student'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">User ID:</span>
                  <span className="font-mono text-xs text-muted-foreground">{userProfile.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-muted-foreground">Email:</span>
                  <span className="text-foreground">{userProfile.email}</span>
                </div>
              </div>
            </div>

            {/* Sign Out */}
            <div className="border-t border-border pt-4">
              <p className="mb-4 text-sm text-muted-foreground">
                Sign out of your account on this device. You&apos;ll need to sign in again to access your account.
              </p>
              <SignOutButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
