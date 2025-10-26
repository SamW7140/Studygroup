'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { BookOpen } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      router.push('/') // Redirect to dashboard
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4 relative overflow-hidden">
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
            <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
            <p className="text-gray-400 mt-2">Sign in to your Studygroup account</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

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
                disabled={loading}
                className="bg-[#1a1a1a] border-[#3d3d3d] text-white placeholder:text-gray-500 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg shadow-orange-500/30 transition-all duration-200 hover:shadow-orange-500/50" 
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-400">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="text-orange-500 hover:text-orange-400 font-medium transition-colors">
                Sign up
              </Link>
            </p>
          </div>
        </Card>
        </div>
      </div>
    </div>
  )
}
