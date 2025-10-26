'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

// Force dynamic rendering
export const dynamic = 'force-dynamic'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

type UserRole = 'student' | 'professor'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [role, setRole] = useState<UserRole>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      console.log('Signing up with role:', role) // Debug log
      
      // Sign up the user - the database trigger will handle profile creation
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
            full_name: fullName,
            role,
          },
        },
      })

      if (signUpError) throw signUpError

      console.log('Signup successful, user created with metadata') // Debug log

      // Verify the profile was created with correct role (for debugging)
      if (data.user) {
        const { data: profile, error: profileError } = await supabase
          .from('Profiles')
          .select('role, full_name, username')
          .eq('id', data.user.id)
          .single()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
        } else {
          console.log('Profile created with role:', profile?.role) // Debug log
          
          // If role doesn't match, there's a trigger issue
          if (profile?.role !== role) {
            console.error('Role mismatch! Expected:', role, 'Got:', profile?.role)
            setError(`Warning: Account created but role may be incorrect. Please contact support.`)
          }
        }
      }

      // Redirect to dashboard
      router.push('/')
      router.refresh()
    } catch (error: any) {
      console.error('Signup error:', error) // Debug log
      setError(error.message || 'Failed to sign up')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 py-12 relative overflow-hidden">
      {/* Gradient Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-600/5 pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10">
        {/* Studygroup Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <BookOpen className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Studygroup
          </h1>
        </div>

        {/* Auth Card with Gradient Fade */}
        <div className="relative">
          {/* Orange Gradient Glow Behind Card */}
          <div className="absolute -inset-0.5 bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent rounded-lg blur-xl opacity-75" />
          
          <Card className="relative w-full p-8 bg-gradient-to-br from-[#2d2d2d] via-[#2d2d2d] to-[#2d2d2d]/95 border-[#3d3d3d] shadow-2xl backdrop-blur-sm">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white">Create Account</h2>
            <p className="text-gray-400 mt-2">Join Studygroup today</p>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-2">
                I am a...
              </label>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`flex-1 p-4 rounded-lg border-2 transition ${
                    role === 'student'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-[#3d3d3d] hover:border-[#4d4d4d] text-gray-300'
                  }`}
                >
                  <div className="text-lg font-semibold">🎓 Student</div>
                  <div className="text-sm text-gray-400 mt-1">Looking to learn</div>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('professor')}
                  className={`flex-1 p-4 rounded-lg border-2 transition ${
                    role === 'professor'
                      ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                      : 'border-[#3d3d3d] hover:border-[#4d4d4d] text-gray-300'
                  }`}
                >
                  <div className="text-lg font-semibold">👨‍🏫 Professor</div>
                  <div className="text-sm text-gray-400 mt-1">Teaching a class</div>
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                disabled={loading}
                className="bg-[#1a1a1a] border-[#3d3d3d] text-white placeholder:text-gray-500 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="bg-[#1a1a1a] border-[#3d3d3d] text-white placeholder:text-gray-500 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="bg-[#1a1a1a] border-[#3d3d3d] text-white placeholder:text-gray-500 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
                className="bg-[#1a1a1a] border-[#3d3d3d] text-white placeholder:text-gray-500 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/30 transition-all duration-200 hover:shadow-orange-500/50" 
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </Card>
        </div>
      </div>
    </div>
  )
}
