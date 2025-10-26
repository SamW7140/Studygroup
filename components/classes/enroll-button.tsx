'use client'

import { useState } from 'react'
import { enrollInClass } from '@/app/actions/enrollments'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface EnrollButtonProps {
  classId: string
}

export function EnrollButton({ classId }: EnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleEnroll = async () => {
    setIsLoading(true)
    const result = await enrollInClass(classId)

    if (result.success) {
      router.refresh()
    } else {
      alert(result.error || 'Failed to enroll in class')
    }
    setIsLoading(false)
  }

  return (
    <Button
      onClick={handleEnroll}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700"
    >
      {isLoading ? 'Enrolling...' : 'Enroll in Class'}
    </Button>
  )
}
