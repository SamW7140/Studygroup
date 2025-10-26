'use client'

import { useState } from 'react'
import { KeyRound, Loader2, Check, AlertCircle } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { enrollByClassCode } from '@/app/actions/enrollments'
import { useRouter } from 'next/navigation'

export function HeroSearch() {
  const [classCode, setClassCode] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleJoinClass = async () => {
    if (!classCode.trim()) {
      setError('Please enter a class code')
      return
    }

    setIsJoining(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await enrollByClassCode(classCode.trim())

      if (result.success) {
        setSuccess(`Successfully joined "${result.className}"!`)
        setClassCode('')
        
        // Redirect to classes page after a short delay
        setTimeout(() => {
          router.push('/classes')
          router.refresh()
        }, 1500)
      } else {
        setError(result.error || 'Failed to join class')
      }
    } catch (err) {
      setError('An unexpected error occurred')
      console.error('Join class error:', err)
    } finally {
      setIsJoining(false)
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto mb-12">
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-orange-300 via-orange-400 to-orange-500 bg-clip-text text-transparent">
          Study Group
        </h1>
        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
          Join your class, upload study materials, and access AI-powered insights from shared notes
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative"
      >
        <div
          className={`
            relative flex items-center gap-2 p-1.5 rounded-2xl
            bg-white/10 backdrop-blur-xl border border-orange-500/30
            transition-all duration-300
            ${isFocused ? 'shadow-[0_0_30px_rgba(249,115,22,0.3)] ring-2 ring-orange-500/50 border-orange-500/60' : 'shadow-[0_0_15px_rgba(249,115,22,0.15)]'}
          `}
        >
          <div className="flex items-center flex-1 px-4">
            <KeyRound className="w-5 h-5 text-orange-400 mr-3" />
            <Input
              type="text"
              placeholder="Enter your class code..."
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === 'Enter' && handleJoinClass()}
              className="flex-1 bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-white placeholder:text-slate-400 uppercase tracking-wider font-semibold"
              maxLength={8}
            />
          </div>
          <Button
            onClick={handleJoinClass}
            disabled={!classCode.trim() || isJoining}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 rounded-xl shadow-lg hover:shadow-orange-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none font-semibold"
          >
            {isJoining ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Joining...
              </>
            ) : (
              'Join Class'
            )}
          </Button>
        </div>

        {/* Success Message */}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-green-500/20 border border-green-500/30 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-green-400">
              <Check className="w-5 h-5" />
              <p className="font-medium">{success}</p>
            </div>
          </motion.div>
        )}

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-xl bg-red-500/20 border border-red-500/30 backdrop-blur-xl"
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-5 h-5" />
              <p className="font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Helper Text */}
        {!success && !error && (
          <div className="text-center mt-4 text-sm text-slate-500">
            Get your class code from your professor to get started
          </div>
        )}
      </motion.div>
    </div>
  )
}
